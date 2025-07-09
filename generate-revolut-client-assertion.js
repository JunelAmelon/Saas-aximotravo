// Script Node.js pour générer dynamiquement un JWT (client assertion) signé pour Revolut B2B
// defaults: PEM clé privée = privatecert.pem, client_id et iss à renseigner

const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');

// === À PERSONNALISER ===
const CLIENT_ID = process.env.REVOLUT_CLIENT_ID || 'VOTRE_CLIENT_ID'; // à remplacer ou à charger depuis .env
const ISS = process.env.REVOLUT_JWT_ISS || 'localhost:3000'; // URI de redirection sans https://
const PRIVATE_KEY_PATH = path.resolve(__dirname, 'privatecert.pem'); // ou privatecerf.pem selon ton fichier
const EXPIRES_IN_SECONDS = 10 * 60; // 10 minutes

// === Génération du JWT ===
const now = Math.floor(Date.now() / 1000);
const payload = {
  iss: ISS,
  sub: CLIENT_ID,
  aud: 'https://revolut.com',
  exp: now + EXPIRES_IN_SECONDS,
};

const privateKey = fs.readFileSync(PRIVATE_KEY_PATH, 'utf8');

const token = jwt.sign(payload, privateKey, { algorithm: 'RS256', header: { alg: 'RS256', typ: 'JWT' } });

console.log(token);
// Pour l'utiliser dans le curl : client_assertion=<ce_token>
