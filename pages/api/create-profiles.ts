// pages/api/create-profiles.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { initializeApp, cert, getApps } from 'firebase-admin/app';

// Debug: Vérifiez que la clé est bien chargée
console.log('FIREBASE_SERVICE_ACCOUNT_KEY exists:', !!process.env.FIREBASE_SERVICE_ACCOUNT_KEY);

const initFirebaseAdmin = () => {
  if (getApps().length === 0) {
    try {
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY as string);
      initializeApp({
        credential: cert(serviceAccount)
      });
      console.log('Firebase Admin initialized successfully');
    } catch (error) {
      console.error('Firebase init error:', error);
      throw new Error('Failed to initialize Firebase Admin');
    }
  }
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  console.log('Request method:', req.method);
  
  try {
    // Initialisation Firebase
    console.log('Initializing Firebase...');
    initFirebaseAdmin();
    
    // Validation des données
    console.log('Request body:', req.body);
    const { email, password, name, role, company, postalCode, city, geographicArea } = req.body;

    if (!email || !password || !name || !role) {
      console.log('Validation failed - missing fields');
      return res.status(400).json({
        success: false,
        error: 'Champs obligatoires manquants'
      });
    }

    // Création de l'utilisateur
    console.log('Creating user in Firebase Auth...');
    const auth = getAuth();
    const userRecord = await auth.createUser({
      email,
      password,
      displayName: name
    });
    console.log('User created:', userRecord.uid);

    // Enregistrement dans Firestore
    console.log('Saving to Firestore...');
    const db = getFirestore();
    await db.collection('users').doc(userRecord.uid).set({
      email,
      name,
      role,
      ...(role === 'courtier' && { company, postalCode, city, geographicArea }),
      createdAt: new Date().toISOString()
    });

    return res.status(201).json({
      success: true,
      userId: userRecord.uid
    });

  } catch (error: any) {
    console.error('API Error Details:', {
      message: error.message,
      code: error.code,
      stack: error.stack
    });

    const errorMap: Record<string, { status: number; message: string }> = {
      'auth/email-already-exists': {
        status: 409,
        message: 'Email déjà utilisé'
      },
      'auth/invalid-email': {
        status: 400,
        message: 'Email invalide'
      },
      'auth/weak-password': {
        status: 400,
        message: 'Mot de passe trop faible (min 6 caractères)'
      }
    };

    const knownError = error.code ? errorMap[error.code] : null;
    
    return res.status(knownError?.status || 500).json({
      success: false,
      error: knownError?.message || 'Erreur serveur',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}