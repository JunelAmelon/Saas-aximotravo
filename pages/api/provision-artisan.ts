import type { NextApiRequest, NextApiResponse } from "next";
import { db } from "../../lib/firebase/config";
import { doc, getDoc, setDoc, deleteDoc, serverTimestamp, query, where, getDocs, collection } from "firebase/firestore";
import { sendEmail } from "../../lib/email";
import { getApps, initializeApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

// Initialisation Firebase Admin uniquement si pas déjà fait
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY as string);

if (!getApps().length) {
  initializeApp({
    credential: cert(serviceAccount),
  });
}

// Génère un mot de passe sécurisé
function generateRandomPassword(length = 12) {
    return Array.from({ length }, () => Math.random().toString(36).slice(2))
      .join("")
      .slice(0, length);
  }
  
  // Template email de validation pour l'artisan
  function generateValidationEmail(artisanData: any, password: string) {
    return `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Compte Aximotravo Validé</title>
    </head>
    <body style="margin: 0; padding: 0; background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%); font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      <div style="max-width: 680px; margin: 40px auto; background: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);">
        
        <!-- Header avec gradient moderne -->
        <div style="background: linear-gradient(135deg, #f26755 0%, #f21515 50%, #d63384 100%); padding: 48px 40px; text-align: center; position: relative;">
          <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: url('data:image/svg+xml,<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 100 100\"><defs><pattern id=\"grain\" width=\"100\" height=\"100\" patternUnits=\"userSpaceOnUse\"><circle cx=\"50\" cy=\"50\" r=\"1\" fill=\"%23ffffff\" opacity=\"0.1\"/></pattern></defs><rect width=\"100\" height=\"100\" fill=\"url(%23grain)\"/></svg>'); opacity: 0.3;"></div>
          <div style="position: relative; z-index: 1;">
            <div style="width: 80px; height: 80px; background: rgba(255, 255, 255, 0.2); border-radius: 20px; margin: 0 auto 24px; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(10px);">
              <span style="font-size: 36px;">✅</span>
            </div>
            <h1 style="color: #ffffff; margin: 0; font-size: 32px; font-weight: 800; letter-spacing: -0.5px; text-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              Compte Validé !
            </h1>
            <p style="color: rgba(255, 255, 255, 0.9); margin: 12px 0 0; font-size: 18px; font-weight: 500;">
              Bienvenue dans l'équipe Aximotravo
            </p>
          </div>
        </div>
  
        <!-- Contenu principal -->
        <div style="padding: 48px 40px;">
          <div style="text-align: center; margin-bottom: 40px;">
            <h2 style="color: #1e293b; margin: 0 0 16px; font-size: 24px; font-weight: 700;">
              Bonjour ${artisanData.firstName} ${artisanData.lastName} 👋
            </h2>
            <p style="color: #64748b; margin: 0; font-size: 16px; line-height: 1.6;">
              Félicitations ! Votre dossier d'artisan a été validé par notre équipe.<br>
              Vous pouvez maintenant accéder à votre espace professionnel.
            </p>
          </div>
  
          <!-- Carte des identifiants -->
          <div style="background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%); border: 2px solid #e2e8f0; border-radius: 20px; padding: 32px; margin-bottom: 32px; position: relative; overflow: hidden;">
            <div style="position: absolute; top: -50px; right: -50px; width: 100px; height: 100px; background: linear-gradient(135deg, #f26755, #f21515); border-radius: 50%; opacity: 0.1;"></div>
            <div style="position: relative; z-index: 1;">
              <div style="display: flex; align-items: center; margin-bottom: 24px;">
                <div style="width: 48px; height: 48px; background: linear-gradient(135deg, #f26755, #f21515); border-radius: 12px; display: flex; align-items: center; justify-content: center; margin-right: 16px;">
                  <span style="color: white; font-size: 20px; font-weight: bold;">🔑</span>
                </div>
                <h3 style="color: #1e293b; margin: 0; font-size: 20px; font-weight: 700;">
                  Vos identifiants de connexion
                </h3>
              </div>
              
              <div style="space-y: 16px;">
                <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin-bottom: 16px;">
                  <div style="display: flex; justify-content: space-between; align-items: center;">
                    <span style="color: #64748b; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Email</span>
                    <span style="color: #1e293b; font-size: 16px; font-weight: 600;">${artisanData.email}</span>
                  </div>
                </div>
                
                <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px;">
                  <div style="display: flex; justify-content: space-between; align-items: center;">
                    <span style="color: #64748b; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Mot de passe</span>
                    <code style="background: linear-gradient(135deg, #f26755, #f21515); color: white; padding: 8px 16px; border-radius: 8px; font-family: 'SF Mono', Monaco, monospace; font-size: 16px; font-weight: 600; letter-spacing: 1px;">${password}</code>
                  </div>
                </div>
              </div>
            </div>
          </div>
  
          <!-- Bouton d'action -->
          <div style="text-align: center; margin-bottom: 32px;">
            <a href="https://aximobat.com/auth/login" 
               style="display: inline-flex; align-items: center; gap: 12px; background: linear-gradient(135deg, #f26755 0%, #f21515 50%, #d63384 100%); color: white; padding: 16px 32px; text-decoration: none; border-radius: 16px; font-weight: 700; font-size: 16px; box-shadow: 0 10px 25px -5px rgba(242, 103, 85, 0.4); transition: all 0.3s ease;">
              <span>🚀</span>
              <span>Accéder à mon espace</span>
            </a>
          </div>
  
          <!-- Alerte importante -->
          <div style="background: linear-gradient(135deg, #fef3c7 0%, #fee2e2 100%); border: 1px solid #f59e0b; border-radius: 16px; padding: 24px; margin-bottom: 32px;">
            <div style="display: flex; align-items: start; gap: 16px;">
              <div style="width: 40px; height: 40px; background: #f59e0b; border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                <span style="color: white; font-size: 18px;">⚠️</span>
              </div>
              <div>
                <h4 style="color: #92400e; margin: 0 0 8px; font-size: 16px; font-weight: 700;">
                  Sécurité importante
                </h4>
                <p style="color: #92400e; margin: 0; font-size: 14px; line-height: 1.5;">
                  Nous vous recommandons fortement de changer votre mot de passe lors de votre première connexion pour sécuriser votre compte.
                </p>
              </div>
            </div>
          </div>
  
          <!-- Message de bienvenue -->
          <div style="text-align: center; padding: 24px; background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%); border-radius: 16px; border: 1px solid #10b981;">
            <span style="font-size: 24px; margin-bottom: 12px; display: block;">🎉</span>
            <p style="color: #065f46; margin: 0; font-size: 16px; font-weight: 600;">
              Bienvenue dans l'équipe Aximotravo !<br>
              <span style="font-weight: 400; font-size: 14px;">Nous sommes ravis de vous compter parmi nous.</span>
            </p>
          </div>
        </div>
  
        <!-- Footer -->
        <div style="background: #f8fafc; padding: 32px 40px; text-align: center; border-top: 1px solid #e2e8f0;">
          <p style="color: #64748b; margin: 0; font-size: 14px;">
            Cet email a été envoyé automatiquement par <strong style="color: #f26755;">Aximotravo</strong>
          </p>
        </div>
      </div>
    </body>
    </html>`;
  }
  
  // Template email de rejet pour le courtier
  function generateRejectionEmail(artisanData: any, courtierData: any, rejectedReason?: string) {
    return `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Dossier Artisan Rejeté</title>
    </head>
    <body style="margin: 0; padding: 0; background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%); font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      <div style="max-width: 680px; margin: 40px auto; background: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);">
        
        <!-- Header avec gradient rouge -->
        <div style="background: linear-gradient(135deg, #dc2626 0%, #b91c1c 50%, #991b1b 100%); padding: 48px 40px; text-align: center; position: relative;">
          <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: url('data:image/svg+xml,<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 100 100\"><defs><pattern id=\"grain\" width=\"100\" height=\"100\" patternUnits=\"userSpaceOnUse\"><circle cx=\"50\" cy=\"50\" r=\"1\" fill=\"%23ffffff\" opacity=\"0.1\"/></pattern></defs><rect width=\"100\" height=\"100\" fill=\"url(%23grain)\"/></svg>'); opacity: 0.3;"></div>
          <div style="position: relative; z-index: 1;">
            <div style="width: 80px; height: 80px; background: rgba(255, 255, 255, 0.2); border-radius: 20px; margin: 0 auto 24px; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(10px);">
              <span style="font-size: 36px;">❌</span>
            </div>
            <h1 style="color: #ffffff; margin: 0; font-size: 32px; font-weight: 800; letter-spacing: -0.5px; text-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              Dossier Rejeté
            </h1>
            <p style="color: rgba(255, 255, 255, 0.9); margin: 12px 0 0; font-size: 18px; font-weight: 500;">
              Notification administrative
            </p>
          </div>
        </div>
  
        <!-- Contenu principal -->
        <div style="padding: 48px 40px;">
          <div style="text-align: center; margin-bottom: 40px;">
            <h2 style="color: #1e293b; margin: 0 0 16px; font-size: 24px; font-weight: 700;">
              Bonjour ${courtierData.displayName || courtierData.firstName + ' ' + courtierData.lastName} 👋
            </h2>
            <p style="color: #64748b; margin: 0; font-size: 16px; line-height: 1.6;">
              Nous vous informons que le dossier d'artisan suivant a été rejeté<br>
              par notre équipe d'administration.
            </p>
          </div>
  
          <!-- Carte des informations artisan -->
          <div style="background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%); border: 2px solid #fecaca; border-radius: 20px; padding: 32px; margin-bottom: 32px; position: relative; overflow: hidden;">
            <div style="position: absolute; top: -50px; right: -50px; width: 100px; height: 100px; background: linear-gradient(135deg, #dc2626, #b91c1c); border-radius: 50%; opacity: 0.1;"></div>
            <div style="position: relative; z-index: 1;">
              <div style="display: flex; align-items: center; margin-bottom: 24px;">
                <div style="width: 48px; height: 48px; background: linear-gradient(135deg, #dc2626, #b91c1c); border-radius: 12px; display: flex; align-items: center; justify-content: center; margin-right: 16px;">
                  <span style="color: white; font-size: 20px; font-weight: bold;">👤</span>
                </div>
                <h3 style="color: #1e293b; margin: 0; font-size: 20px; font-weight: 700;">
                  Artisan concerné
                </h3>
              </div>
              
              <div style="space-y: 12px;">
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 16px 0; border-bottom: 1px solid #fecaca;">
                  <span style="color: #7f1d1d; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Nom complet</span>
                  <span style="color: #1e293b; font-size: 16px; font-weight: 600;">${artisanData.firstName} ${artisanData.lastName}</span>
                </div>
                
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 16px 0; border-bottom: 1px solid #fecaca;">
                  <span style="color: #7f1d1d; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Email</span>
                  <span style="color: #1e293b; font-size: 16px; font-weight: 600;">${artisanData.email}</span>
                </div>
                
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 16px 0;">
                  <span style="color: #7f1d1d; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Entreprise</span>
                  <span style="color: #1e293b; font-size: 16px; font-weight: 600;">${artisanData.companyName || 'Non renseigné'}</span>
                </div>
              </div>
            </div>
          </div>
  
          ${rejectedReason ? `
          <!-- Motif du rejet -->
          <div style="background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%); border: 2px solid #fbbf24; border-radius: 20px; padding: 32px; margin-bottom: 32px;">
            <div style="display: flex; align-items: start; gap: 16px;">
              <div style="width: 48px; height: 48px; background: #f59e0b; border-radius: 12px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                <span style="color: white; font-size: 20px;">📝</span>
              </div>
              <div style="flex: 1;">
                <h4 style="color: #92400e; margin: 0 0 12px; font-size: 18px; font-weight: 700;">
                  Motif du rejet
                </h4>
                <div style="background: #ffffff; border: 1px solid #fbbf24; border-radius: 12px; padding: 20px;">
                  <p style="color: #1e293b; margin: 0; font-size: 16px; line-height: 1.6; font-weight: 500;">
                    ${rejectedReason}
                  </p>
                </div>
              </div>
            </div>
          </div>
          ` : ''}
  
          <!-- Actions recommandées -->
          <div style="background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%); border: 2px solid #93c5fd; border-radius: 20px; padding: 32px; margin-bottom: 32px;">
            <div style="display: flex; align-items: start; gap: 16px;">
              <div style="width: 48px; height: 48px; background: #3b82f6; border-radius: 12px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                <span style="color: white; font-size: 20px;">💡</span>
              </div>
              <div>
                <h4 style="color: #1e40af; margin: 0 0 12px; font-size: 18px; font-weight: 700;">
                  Prochaines étapes
                </h4>
                <p style="color: #1e40af; margin: 0; font-size: 16px; line-height: 1.6;">
                  Vous pouvez corriger les éléments mentionnés et soumettre un nouveau dossier si nécessaire. Notre équipe reste à votre disposition pour vous accompagner.
                </p>
              </div>
            </div>
          </div>
  
          <!-- Message de clôture -->
          <div style="text-align: center; padding: 24px; background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%); border-radius: 16px; border: 1px solid #e2e8f0;">
            <p style="color: #64748b; margin: 0; font-size: 16px; font-weight: 500;">
              Cordialement,<br>
              <strong style="color: #f26755;">L'équipe Aximotravo</strong>
            </p>
          </div>
        </div>
  
        <!-- Footer -->
        <div style="background: #f8fafc; padding: 32px 40px; text-align: center; border-top: 1px solid #e2e8f0;">
          <p style="color: #64748b; margin: 0; font-size: 14px;">
            Cet email a été envoyé automatiquement par <strong style="color: #f26755;">Aximotravo</strong>
          </p>
        </div>
      </div>
    </body>
    </html>`;
  }

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();

  const { tempId, action, rejectedReason } = req.body;

  if (!tempId || !action || !["validate", "reject"].includes(action)) {
    return res.status(400).json({ 
      success: false, 
      error: "tempId et action (validate/reject) sont requis" 
    });
  }

  try {
    // 1. Récupérer les données de l'artisan en attente
    const pendingDoc = await getDoc(doc(db, "pending_artisans", tempId));
    
    if (!pendingDoc.exists()) {
      return res.status(404).json({ 
        success: false, 
        error: "Artisan en attente non trouvé" 
      });
    }

    const artisanData = pendingDoc.data();

    if (action === "validate") {
      // VALIDATION : Créer compte Auth + migrer données
      
      // 1. Vérifier si l'utilisateur existe déjà AVANT de créer le compte Auth
      const existingUserQuery = query(collection(db, "users"), where("email", "==", artisanData.email));
      const existingUserDocs = await getDocs(existingUserQuery);

      if (existingUserDocs.docs.length > 0) {
        return res.status(400).json({ 
          success: false, 
          error: "Un utilisateur avec cette adresse email existe déjà" 
        });
      }
      
      // 2. Générer mot de passe temporaire
      const tempPassword = generateRandomPassword();
      
      // 3. Créer le compte Auth directement avec Firebase Admin
      const userRecord = await getAuth().createUser({
        email: artisanData.email,
        password: tempPassword,
        emailVerified: false,
        disabled: false,
      });
      
      const uid = userRecord.uid;

      // 4. Migrer les données vers users/{uid}
      const validatedArtisanDoc = {
        ...artisanData,
        uid,
        status: "validated",
        validatedAt: serverTimestamp(),
        authCreated: true,
        // Supprimer les champs temporaires
        tempId: undefined,
        submittedAt: undefined,
      };

      await setDoc(doc(db, "users", uid), validatedArtisanDoc);

      // 5. Envoyer email à l'artisan avec identifiants
      try {
        await sendEmail({
          to: artisanData.email,
          subject: "Votre compte Aximotravo a été validé",
          html: generateValidationEmail(artisanData, tempPassword),
          fromName: "Aximotravo - Validation"
        });
      } catch (emailError) {
        console.error("Erreur envoi email artisan:", emailError);
        // Ne pas faire échouer la validation pour un problème d'email
      }

      // 6. Supprimer de pending_artisans
      await deleteDoc(doc(db, "pending_artisans", tempId));

      res.status(200).json({ 
        success: true, 
        message: "Artisan validé avec succès",
        uid 
      });

    } else if (action === "reject") {
      // REJET : Supprimer + notifier courtier
      
      // 1. Envoyer email au courtier
      if (artisanData.courtierId) {
        try {
          // Récupérer les infos du courtier
          const courtierDoc = await getDoc(doc(db, "users", artisanData.courtierId));
          const courtierData = courtierDoc.exists() ? courtierDoc.data() : null;

          if (courtierData?.email) {
            await sendEmail({
              to: courtierData.email,
              subject: `Dossier artisan rejeté - ${artisanData.firstName} ${artisanData.lastName}`,
              html: generateRejectionEmail(artisanData, courtierData, rejectedReason),
              fromName: "Aximotravo - Administration"
            });
          }
        } catch (emailError) {
          console.error("Erreur envoi email courtier:", emailError);
        }
      }

      // 2. Supprimer de pending_artisans
      await deleteDoc(doc(db, "pending_artisans", tempId));

      res.status(200).json({ 
        success: true, 
        message: "Artisan rejeté avec succès" 
      });
    }

  } catch (error) {
    console.error("Erreur lors du traitement de l'artisan:", error);
    res.status(500).json({ 
      success: false, 
      error: (error as Error).message 
    });
  }
}
