# Migration de Revolut vers Qonto

## Vue d'ensemble

Ce document décrit la migration de l'intégration Revolut vers l'API Qonto pour la gestion des transactions bancaires.

## Changements apportés

### 1. Nouveaux fichiers créés

- `hooks/useQontoTransactions.ts` - Hook React pour récupérer les transactions Qonto
- `pages/api/qonto-transactions.ts` - API route pour l'intégration avec l'API Qonto
- `lib/qonto/types.ts` - Types TypeScript pour les données Qonto
- `.env.example` - Variables d'environnement mises à jour avec les credentials Qonto

### 2. Fichiers modifiés

- `app/admin/transaction/page.tsx` - Remplacé useRevolutTransactions par useQontoTransactions
- Interface utilisateur mise à jour pour afficher les champs spécifiques à Qonto

### 3. Avantages de Qonto vs Revolut

#### Revolut (ancien)
- Authentification OAuth2 complexe avec JWT et certificats
- Nécessite un code d'autorisation et une gestion de tokens
- Configuration complexe avec certificats client

#### Qonto (nouveau)
- Authentification simple par clé API (login:secret-key)
- Pas de gestion de tokens ou d'OAuth
- Configuration simplifiée

## Configuration

### Variables d'environnement requises

Ajoutez ces variables à votre fichier `.env.local` :

```env
QONTO_LOGIN=votre_login_qonto
QONTO_SECRET_KEY=votre_cle_secrete_qonto
QONTO_BANK_ACCOUNT_ID=votre_bank_account_id
```

### Obtenir les credentials Qonto

1. Connectez-vous à votre compte Qonto
2. Allez dans les paramètres API
3. Générez une nouvelle clé API
4. Récupérez le login et la clé secrète
5. **Obtenir le bank_account_id :**
   - Utilisez l'endpoint `/api/qonto-accounts` pour lister vos comptes
   - Récupérez l'ID du compte bancaire que vous souhaitez utiliser
   - Ajoutez cet ID dans la variable `QONTO_BANK_ACCOUNT_ID`

## Structure des données

### Transaction Qonto

```typescript
interface QontoTransaction {
  transaction_id: string;
  amount: number;
  side: "debit" | "credit";
  operation_type: string;
  currency: string;
  label: string;
  settled_at: string;
  status: string;
  reference: string | null;
  // ... autres champs
}
```

### Champs principaux utilisés dans l'UI

- `transaction_id` - Identifiant unique
- `amount` - Montant de la transaction
- `side` - Sens (crédit/débit)
- `operation_type` - Type d'opération
- `currency` - Devise
- `label` - Libellé de la transaction
- `settled_at` - Date de règlement
- `status` - Statut de la transaction
- `reference` - Référence de la transaction

## API Endpoints

### GET /api/qonto-transactions

Récupère la liste des transactions depuis l'API Qonto.

**Paramètres requis :**
- `QONTO_BANK_ACCOUNT_ID` (variable d'environnement)

**Réponse :**
```json
{
  "transactions": [...],
  "meta": {
    "current_page": 1,
    "total_pages": 5,
    "total_count": 100,
    "per_page": 20
  }
}
```

### GET /api/qonto-accounts

Récupère la liste des comptes bancaires disponibles pour identifier le `bank_account_id`.

**Réponse :**
```json
{
  "bank_accounts": [
    {
      "id": "bank_account_id_here",
      "name": "Compte Principal",
      "iban": "FR76...",
      "currency": "EUR",
      "balance": 1000.0
    }
  ]
}
```

## Utilisation

```typescript
import { useQontoTransactions } from "@/hooks/useQontoTransactions";

function TransactionsComponent() {
  const { transactions, loading, error, refetch } = useQontoTransactions();
  
  if (loading) return <div>Chargement...</div>;
  if (error) return <div>Erreur: {error}</div>;
  
  return (
    <div>
      {transactions?.map(tx => (
        <div key={tx.transaction_id}>
          {tx.label} - {tx.amount} {tx.currency}
        </div>
      ))}
    </div>
  );
}
```

## Migration des données existantes

Les anciennes transactions Revolut restent accessibles mais ne sont plus synchronisées. Pour une migration complète :

1. Exportez les données Revolut existantes si nécessaire
2. Configurez les credentials Qonto
3. Testez la nouvelle intégration
4. Supprimez les anciens fichiers Revolut une fois la migration validée

## Fichiers à supprimer après validation

- `hooks/useRevolutTransactions.ts`
- `pages/api/revolut-transactions.ts`
- Variables d'environnement Revolut dans `.env.local`

## Tests

Pour tester l'intégration :

1. Configurez les variables d'environnement Qonto
2. Accédez à `/admin/transaction`
3. Vérifiez que les transactions Qonto s'affichent correctement
4. Testez la fonction de rechargement des données

## Support

En cas de problème avec l'API Qonto :
- Vérifiez les credentials dans les variables d'environnement
- Consultez la documentation officielle Qonto
- Vérifiez les logs de l'API route pour les erreurs détaillées
