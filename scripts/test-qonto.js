// Script de test pour vérifier l'intégration Qonto via les APIs Next.js
// Usage: node scripts/test-qonto.js

const axios = require('axios');

// Configuration pour tester les APIs Next.js locales
const NEXTJS_BASE_URL = 'http://localhost:3001';
const QONTO_BASE_URL = 'https://thirdparty.qonto.com';

async function testNextJSAPI() {
  console.log('🔐 Test de l\'API Next.js...\n');
  
  console.log('📋 Configuration:');
  console.log('  - Next.js URL:', NEXTJS_BASE_URL);
  console.log('  - Qonto API URL:', QONTO_BASE_URL);
  console.log('  - Variables d\'env: Vérifiées côté serveur');
  console.log('');
  
  return true;
}

async function testBankAccountsAPI() {
  console.log('🏦 Test de l\'API /api/qonto-bank-accounts...\n');
  
  try {
    const response = await axios({
      method: 'GET',
      url: `${NEXTJS_BASE_URL}/api/qonto-bank-accounts`,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 30000 // 30 secondes timeout
    });
    
    const data = response.data;
    const bankAccounts = data.bank_accounts || [];
    const mainAccount = data.main_account;
    console.log('Bank accounts:', bankAccounts);
    console.log('Main account:', mainAccount);
    
    console.log('✅ API Next.js réussie !');
    console.log('📊 Nombre de comptes:', bankAccounts.length);
    console.log('🆔 Main account ID:', data.main_account_id);
    
    if (mainAccount) {
      console.log('🎯 Compte principal:');
      console.log('  - ID:', mainAccount.id);
      console.log('  - Nom:', mainAccount.name);
      console.log('  - IBAN:', mainAccount.iban);
      console.log('  - Devise:', mainAccount.currency);
      console.log('  - Statut:', mainAccount.status);
      console.log('  - Principal:', mainAccount.main);
      console.log('  - Solde:', mainAccount.balance, mainAccount.currency);
    }
    
    return { bankAccounts, mainAccount, success: true };
    
  } catch (error) {
    console.error('❌ Erreur API Next.js:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', JSON.stringify(error.response.data, null, 2));
    } else if (error.code === 'ECONNREFUSED') {
      console.error('❌ Connexion refusée - Assure-toi que ton serveur Next.js tourne sur le port 3000');
      console.error('   Lance: npm run dev ou yarn dev');
    } else {
      console.error('Message:', error.message);
    }
    return { success: false, error: error.message };
  }
}

async function testQontoConnectionAPI() {
  console.log('🔍 Test de l\'API /api/qonto-connection...\n');
  
  try {
    // Test GET (vérifier statut)
    const getResponse = await axios({
      method: 'GET',
      url: `${NEXTJS_BASE_URL}/api/qonto-connection`,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 30000
    });
    
    console.log('✅ GET /api/qonto-connection réussi !');
    console.log('📊 Statut:', getResponse.data.status);
    console.log('🏦 Compte bancaire:', getResponse.data.bank_account_id);
    
    if (getResponse.data.connection_location) {
      console.log('🔗 URL de connexion:', getResponse.data.connection_location);
    }
    
    return getResponse.data;
    
  } catch (error) {
    console.error('❌ Erreur API connexion:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', JSON.stringify(error.response.data, null, 2));
    } else if (error.code === 'ECONNREFUSED') {
      console.error('❌ Connexion refusée - Serveur Next.js non accessible');
    } else {
      console.error('Message:', error.message);
    }
    return null;
  }
}

async function testPaymentLinkAPI() {
  console.log('\n💳 Test de l\'API /api/qonto-payment-link...\n');
  
  const paymentData = {
    amount: 1000, // 10€ en centimes
    currency: 'EUR',
    paymentId: 'test-payment-' + Date.now(),
    description: 'Test de paiement SecureAcompte via API'
  };
  
  try {
    const response = await axios({
      method: 'POST',
      url: `${NEXTJS_BASE_URL}/api/qonto-payment-link`,
      headers: {
        'Content-Type': 'application/json',
      },
      data: paymentData,
      timeout: 30000
    });
    
    console.log('✅ Lien de paiement créé via API Next.js !');
    console.log('🆔 ID:', response.data.qonto_payment_link_id);
    console.log('🔗 URL:', response.data.payment_url);
    console.log('📊 Statut:', response.data.status);
    
    return response.data;
    
  } catch (error) {
    console.error('❌ Erreur API création lien:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', JSON.stringify(error.response.data, null, 2));
    } else if (error.code === 'ECONNREFUSED') {
      console.error('❌ Connexion refusée - Serveur Next.js non accessible');
    } else {
      console.error('Message:', error.message);
    }
    return null;
  }
}

async function main() {
  console.log('🚀 Test d\'intégration Qonto pour SecureAcompte\n');
  console.log('⚠️  Assure-toi d\'avoir configuré QONTO_LOGIN et QONTO_SECRET_KEY\n');
  
  // Test 0: Vérifier la config
  await testNextJSAPI();
  
  // Test 1: Tester l'API Next.js pour les comptes bancaires
  const bankAccountsResult = await testBankAccountsAPI();
  
  if (!bankAccountsResult || !bankAccountsResult.success) {
    console.log('\n❌ Test des comptes bancaires échoué');
    if (bankAccountsResult && bankAccountsResult.error) {
      console.log('Erreur:', bankAccountsResult.error);
    }
    return;
  }
  
  if (!bankAccountsResult.mainAccount) {
    console.log('\n⚠️  Aucun compte principal trouvé, mais l\'API fonctionne');
  }
  
  // Test 2: Vérifier la connexion Qonto
  const connectionStatus = await testQontoConnectionAPI();
  
  if (!connectionStatus) {
    console.log('\n❌ Impossible de continuer sans connexion valide');
    return;
  }
  
  // Test 3: Créer un lien de paiement (seulement si connecté)
  if (connectionStatus && connectionStatus.status === 'enabled') {
    await testPaymentLinkAPI();
  } else if (connectionStatus) {
    console.log(`\n⚠️  Connexion non active (${connectionStatus.status}). Test création de lien ignoré.`);
    if (connectionStatus.connection_location) {
      console.log('👉 Visite cette URL pour activer:', connectionStatus.connection_location);
    }
  } else {
    console.log('\n⚠️  Impossible de tester la création de lien sans statut de connexion');
  }
  
  console.log('\n✨ Test des APIs Next.js terminé !');
  console.log('\n📝 Prochaines étapes:');
  console.log('  1. Si les APIs fonctionnent, teste dans ton app React');
  console.log('  2. Vérifie les logs de ton serveur Next.js pour plus de détails');
  console.log('  3. Assure-toi que tes variables d\'environnement sont correctes');
}

// Exécuter le test
main().catch(console.error);
