import type { NextApiRequest, NextApiResponse } from 'next';
import { getApps, initializeApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

// Initialisation Firebase Admin uniquement si pas déjà fait
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY as string);

if (!getApps().length) {
  initializeApp({
    credential: cert(serviceAccount),
  });
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Méthode non autorisée' });
  }

  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Email et mot de passe requis' });
  }

  try {
    const userRecord = await getAuth().createUser({
      email,
      password,
      emailVerified: false,
      disabled: false,
    });
    return res.status(200).json({ uid: userRecord.uid });
  } catch (error: any) {
    console.error("API create-client error:", error);
    return res.status(500).json({ message: error.message, raw: error });
  }
}