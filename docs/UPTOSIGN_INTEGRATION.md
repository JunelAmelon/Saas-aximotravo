# Intégration UpToSign - Signature Électronique

## Vue d'ensemble

Cette documentation décrit l'intégration complète de la signature électronique UpToSign dans le système Saas-aximotravo pour la signature des devis et actes de mission.

## Architecture

### Composants créés

1. **Types TypeScript** (`types/uptosign.ts`)
   - Interfaces pour l'API UpToSign
   - Types pour les signataires, réponses API, configurations

2. **Services** (`lib/services/uptosign-service.ts`)
   - Configuration et constantes UpToSign
   - Fonctions utilitaires pour construire les requêtes
   - Validation de la configuration
   - Gestion des téléchargements PDF

3. **API Endpoints**
   - `pages/api/uptosign-start-process.ts` - Démarrer un processus de signature
   - `pages/api/uptosign-status.ts` - Vérifier le statut d'un processus
   - `pages/api/uptosign-download.ts` - Télécharger un document signé
   - `pages/api/devis-pdf/[devisId].ts` - Servir les PDFs des devis

4. **Composants React**
   - `components/signature/DevisSignatureModal.tsx` - Modal de signature pour devis
   - `components/signature/DevisSignatureStatus.tsx` - Affichage du statut de signature
   - `pages/test-uptosign.tsx` - Page de test de l'intégration

5. **Hooks personnalisés**
   - `hooks/useUpToSign.ts` - Hook générique pour UpToSign
   - `hooks/useDevisSignature.ts` - Hook spécialisé pour les devis

## Configuration

### Variables d'environnement

Ajoutez ces variables dans votre fichier `.env` :

```env
UPTOSIGN_BASE_URL=https://dev.uptosign.com
UPTOSIGN_API_KEY=votre_cle_api_uptosign
```

### Mise à jour des types DevisConfig

Le type `DevisConfig` a été étendu avec les champs UpToSign :

```typescript
type DevisConfig = {
  // ... autres champs existants
  uptoSignProcessId?: string;      // ID du processus UpToSign
  uptoSignStatus?: string;         // Statut de la signature électronique
  uptoSignSignedAt?: Date;         // Date de signature électronique
  uptoSignSignedDocumentUrl?: string; // URL du document signé
}
```

## Utilisation

### 1. Démarrer une signature de devis

```typescript
import { useDevisSignature } from '@/hooks/useDevisSignature';

const { startDevisSignature, isLoading, error } = useDevisSignature();

const handleSignature = async () => {
  try {
    const processId = await startDevisSignature({
      devisId: 'devis-123',
      clientEmail: 'client@example.com',
      clientName: 'Jean Dupont',
      clientPhone: '+33123456789',
      subject: 'Signature du devis',
      message: 'Veuillez signer ce devis pour confirmer votre accord.'
    });
    
    console.log('Processus démarré:', processId);
  } catch (err) {
    console.error('Erreur:', err);
  }
};
```

### 2. Utiliser le composant de signature

```tsx
import DevisSignatureModal from '@/components/signature/DevisSignatureModal';

<DevisSignatureModal
  isOpen={showSignatureModal}
  onClose={() => setShowSignatureModal(false)}
  devisId="devis-123"
  devisPdfUrl="https://example.com/devis.pdf"
  devisTitle="Devis rénovation cuisine"
  clientInfo={{
    email: "client@example.com",
    name: "Jean Dupont",
    phone: "+33123456789"
  }}
  onSignatureComplete={(processId) => {
    console.log('Signature terminée:', processId);
  }}
/>
```

### 3. Afficher le statut de signature

```tsx
import DevisSignatureStatus from '@/components/signature/DevisSignatureStatus';

<DevisSignatureStatus
  processId="process-123"
  devisId="devis-123"
  onStatusChange={(status) => {
    console.log('Nouveau statut:', status);
  }}
/>
```

## Flux de signature

1. **Démarrage du processus**
   - L'utilisateur clique sur "Signature électronique"
   - Le système génère le PDF du devis
   - Une requête est envoyée à l'API UpToSign avec les signataires
   - UpToSign retourne un `processId` et envoie les emails d'invitation

2. **Signature par les clients**
   - Les signataires reçoivent un email avec un lien de signature
   - Ils signent le document via l'interface UpToSign
   - Le statut est mis à jour en temps réel

3. **Finalisation**
   - Une fois toutes les signatures collectées, le document est finalisé
   - Le système peut télécharger le document signé
   - Le statut du devis est mis à jour automatiquement

## API UpToSign

### Endpoints utilisés

1. **POST /api/documents** - Démarrer un processus de signature
   ```json
   {
     "pdf": {
       "title": "Devis rénovation",
       "content": "base64_pdf_content",
       "filename": "devis.pdf",
       "posx": 50,
       "posy": 80,
       "signonpage": 1
     },
     "to": {
       "email": "client@example.com",
       "firstname": "Jean",
       "lastname": "Dupont",
       "mobile": "+33123456789"
     }
   }
   ```

2. **GET /api/status/{processId}** - Vérifier le statut
   ```json
   {
     "id": "process-123",
     "status": "signed",
     "signers": [
       {
         "email": "client@example.com",
         "status": "signed",
         "signedAt": "2024-01-15T10:30:00Z"
       }
     ]
   }
   ```

3. **GET /api/download/{processId}** - Télécharger le document signé

## Sécurité

- **Proxy API** : Le frontend ne communique jamais directement avec UpToSign
- **Authentification** : Toutes les requêtes utilisent le token Bearer
- **Validation** : Validation stricte des paramètres côté serveur
- **Logs** : Traçabilité complète des opérations

## Tests

### Page de test

Accédez à `/test-uptosign` pour tester l'intégration :

1. Configurez les paramètres de test
2. Démarrez un processus de signature
3. Vérifiez le statut en temps réel
4. Téléchargez le document signé

### Tests unitaires

```bash
# Lancer les tests
npm test -- --testPathPattern=uptosign

# Tests d'intégration
npm run test:integration
```

## Dépannage

### Erreurs courantes

1. **"UPTOSIGN_API_KEY manquante"**
   - Vérifiez que la variable d'environnement est définie
   - Redémarrez le serveur après modification

2. **"Impossible de télécharger le PDF"**
   - Vérifiez que l'URL du PDF est accessible
   - Contrôlez les permissions CORS

3. **"Erreur UpToSign (401)"**
   - Vérifiez la validité de votre clé API
   - Contrôlez les limites de votre compte UpToSign

### Logs de débogage

Les logs sont préfixés par `[UpToSign]` :

```
[UpToSign][Start] Démarrage du processus: {...}
[UpToSign][Status] Statut récupéré: {...}
[UpToSign][Download] Document téléchargé: {...}
```

## Limites et considérations

1. **Taille des PDF** : Maximum 10MB par document
2. **Nombre de signataires** : Maximum 10 par document
3. **Expiration** : Les processus expirent après 30 jours
4. **Formats supportés** : PDF uniquement

## Roadmap

- [ ] Support des actes de mission
- [ ] Signature en lot (multiple devis)
- [ ] Templates de signature personnalisés
- [ ] Intégration avec le système de notifications
- [ ] Archivage automatique des documents signés

## Support

Pour toute question ou problème :

1. Consultez les logs de l'application
2. Vérifiez la documentation UpToSign
3. Contactez le support technique
