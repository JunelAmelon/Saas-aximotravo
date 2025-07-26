// Script Node.js pour importer les courtiers en utilisant hooks/courtiers.ts
// Usage : node import_courtiers.js <fichier.tsv>

const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Support ESModule import for .ts file
const { parseCourtiers, addCourtiersToFirebase } = require('./hooks/courtiers');

async function main() {
  const tsvPath = process.argv[2];
  if (!tsvPath) {
    console.error('Usage: node import_courtiers.js <fichier.tsv>');
    process.exit(1);
  }

  const absPath = path.resolve(tsvPath);
  if (!fs.existsSync(absPath)) {
    console.error('Fichier TSV introuvable:', absPath);
    process.exit(1);
  }

  const tsv = fs.readFileSync(absPath, 'utf-8');
  const courtiers = parseCourtiers(tsv);
  console.log(`Import de ${courtiers.length} courtiers...`);
  await addCourtiersToFirebase(courtiers);
  console.log('Import terminé.');
}

main().catch(e => {
  console.error('Erreur lors de l\'import:', e);
  process.exit(1);
});
