import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface ProjectEmails {
  client?: string;
  artisans?: string[];
  courtier?: string;
  vendor?: string;
}

/**
 * Récupère tous les emails liés à un projet : client, artisans, courtier, vendor.
 * @param projectId string
 * @returns { client, artisans, courtier, vendor }
 */
export async function fetchProjectEmails(projectId?: string): Promise<ProjectEmails> {
  if (!projectId) throw new Error('projectId requis');
  // 1. Récupère le projet
  const projectRef = doc(db, 'projects', projectId);
  const snap = await getDoc(projectRef);
  if (!snap.exists()) throw new Error('Projet introuvable');
  const data = snap.data();

  // 2. Email du client
  let clientEmail: string | undefined = undefined;
  if (data.client_id) {
    const clientQuery = query(collection(db, 'users'), where('uid', '==', data.client_id));
    const clientSnap = await getDocs(clientQuery);
    if (!clientSnap.empty) {
      clientEmail = clientSnap.docs[0].data().email;
    }
  }

  // 3. Email du courtier
  let courtierEmail: string | undefined = undefined;
  if (data.broker?.id) {
    const brokerQuery = query(collection(db, 'users'), where('uid', '==', data.broker.id));
    const brokerSnap = await getDocs(brokerQuery);
    if (!brokerSnap.empty) {
      courtierEmail = brokerSnap.docs[0].data().email;
    }
  }

  // 4. Emails des artisans (depuis artisan_projet)
  const artisansEmails: string[] = [];
  const artisanProjetQuery = query(
    collection(db, 'artisan_projet'),
    where('projetId', '==', projectId), 
    where('status', '==', 'accepté') 
  );
  const artisanProjetSnaps = await getDocs(artisanProjetQuery);
  for (const docSnap of artisanProjetSnaps.docs) {
    const artisanId = docSnap.data().artisanId;
    if (artisanId) {
      const artisanQuery = query(collection(db, 'users'), where('uid', '==', artisanId));
      const artisanSnap = await getDocs(artisanQuery);
      if (!artisanSnap.empty) {
        const email = artisanSnap.docs[0].data().email;
        if (email) artisansEmails.push(email);
      }
    }
  }

  // 5. Email du vendor (optionnel)
  let vendorEmail: string | undefined = undefined;
  if (data.vendor_id) {
    const vendorQuery = query(collection(db, 'users'), where('uid', '==', data.vendor_id));
    const vendorSnap = await getDocs(vendorQuery);
    if (!vendorSnap.empty) {
      vendorEmail = vendorSnap.docs[0].data().email;
    }
  }

  return {
    client: clientEmail,
    artisans: artisansEmails,
    courtier: courtierEmail,
    vendor: vendorEmail,
  };
}
