const forge = require('node-forge');
const fs = require('fs');

const pki = forge.pki;
const keys = pki.rsa.generateKeyPair(2048);
const cert = pki.createCertificate();

cert.publicKey = keys.publicKey;
cert.serialNumber = '01';
cert.validity.notBefore = new Date();
cert.validity.notAfter = new Date();
cert.validity.notAfter.setFullYear(cert.validity.notBefore.getFullYear() + 5);

const attrs = [
  { name: 'commonName', value: 'aximotravo.com' },
  { name: 'countryName', value: 'BJ' },
  { shortName: 'ST', value: 'Benin' },
  { name: 'localityName', value: 'Cotonou' },
  { name: 'organizationName', value: 'Aximotravo' },
  { shortName: 'OU', value: 'Dev' },
];

cert.setSubject(attrs);
cert.setIssuer(attrs);

cert.setExtensions([
  { name: 'basicConstraints', cA: true },
  { name: 'keyUsage', keyCertSign: true, digitalSignature: true },
  { name: 'subjectKeyIdentifier' },
]);

cert.sign(keys.privateKey, forge.md.sha256.create());

fs.writeFileSync('privatecert.pem', pki.privateKeyToPem(keys.privateKey));
fs.writeFileSync('publiccert.cer', pki.certificateToPem(cert));

console.log('✅ Certificat et clé générés !');
