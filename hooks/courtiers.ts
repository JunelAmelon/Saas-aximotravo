import { auth, db } from "@/firebase/ClientApp";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import admin from "firebase-admin";

// Structure for a courtier
export interface Courtier {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  departement: string;
  ville: string;
  lien: string;
  experience: string;
  specialite: string;
  certifications: string;
  nb_projets: number;
  nb_chantiers: number;
  nb_litiges: number;
}

// Parse the raw TSV data into Courtier objects
export function parseCourtiers(tsv: string): Courtier[] {
  const lines = tsv.trim().split(/\r?\n/);
  return lines.map(line => {
    const [id, nomPrenom, email, telephone, departement, ville, lien, experience, specialite, certifications, nb_projets, nb_chantiers, nb_litiges] = line.split("\t");
    const [prenom, ...nomParts] = nomPrenom.split(" ");
    const nom = nomParts.join(" ");
    return {
      id,
      nom: nom.trim(),
      prenom: prenom.trim(),
      email,
      telephone,
      departement,
      ville,
      lien,
      experience,
      specialite,
      certifications,
      nb_projets: Number(nb_projets),
      nb_chantiers: Number(nb_chantiers),
      nb_litiges: Number(nb_litiges),
    };
  });
}

// --- UTILISATION DE FIREBASE ADMIN ---
// Ce fichier doit être exécuté côté Node.js (script ou API). Il nécessite une clé de service Firebase.
// Place ton fichier serviceAccount.json à la racine ou configure GOOGLE_APPLICATION_CREDENTIALS.

const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY as string);

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as admin.ServiceAccount), // ou .cert(require("../serviceAccount.json"))
  });
}

// Add courtiers to Firestore and Auth (via firebase-admin)
import { sendEmail } from "../lib/email";

export async function addCourtiersToFirebase(courtiers: Courtier[]) {
  const year = new Date().getFullYear();
  for (const courtier of courtiers) {
    try {
      const password = `${courtier.nom.replace(/\s/g, "")}@${year}`;
      // Création du compte utilisateur via admin
      const userRecord = await admin.auth().createUser({
        email: courtier.email,
        password,
        displayName: `${courtier.prenom} ${courtier.nom}`,
        emailVerified: false,
        disabled: false,
      });
      // Ajout dans Firestore (collection users)
      await admin.firestore().doc(`users/${userRecord.uid}`).set({
        uid: userRecord.uid,
        firstName: courtier.prenom,
        lastName: courtier.nom,
        displayName: `${courtier.prenom} ${courtier.nom}`,
        email: courtier.email,
        phone: courtier.telephone,
        departement: courtier.departement,
        companyName: "Aximotravo",
        ville: courtier.ville,
        image: courtier.lien,
        experience: courtier.experience,
        specialties: courtier.specialite,
        certifications: courtier.certifications,
        projectsCount: courtier.nb_projets,
        nb_chantiers: courtier.nb_chantiers,
        nb_litiges: courtier.nb_litiges,
        role: "courtier",
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      console.log(`Courtier ajouté : ${courtier.email}`);

      // Envoi de l'email avec identifiants
      const subject = "Bienvenue chez Aximotravo : vos accès courtier";
      const html = `
        <p>Bonjour ${courtier.prenom} ${courtier.nom},</p>
        <p>Votre compte courtier vient d'être créé sur la plateforme <b>Aximotravo</b>.</p>
        <p>Voici vos identifiants de connexion :</p>
        <ul>
          <li><b>Email :</b> ${courtier.email}</li>
          <li><b>Mot de passe :</b> ${password}</li>
        </ul>
        <p>Vous pouvez vous connecter dès maintenant sur <a href="https://app.aximotravo.com">https://app.aximotravo.com</a>.</p>
        <p>Pour des raisons de sécurité, pensez à modifier votre mot de passe dès votre première connexion.</p>
        <br>
        <p>L'équipe Aximotravo</p>
      `;
      try {
        await sendEmail({
          to: courtier.email,
          subject,
          html
        });
        console.log(`Email envoyé à ${courtier.email}`);
      } catch (emailErr) {
        console.error(`Erreur lors de l'envoi de l'email à ${courtier.email}:`, emailErr);
      }
    } catch (e: any) {
      console.error(`Erreur pour ${courtier.email}:`, e.message);
    }
  }
}

// Exemple d'utilisation :
// import { parseCourtiers, addCourtiersToFirebase } from "./hooks/courtiers";
// const courtiers = parseCourtiers(`...TSV...`);
// addCourtiersToFirebase(courtiers);
