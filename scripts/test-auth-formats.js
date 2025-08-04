// Test différents formats d'authentification Qonto
const axios = require('axios');

const QONTO_LOGIN = 'ton-login';
const QONTO_SECRET_KEY = 'ta-secret-key';
const QONTO_BASE_URL = 'https://thirdparty-sandbox.staging.qonto.co';

async function testAuthFormat(authHeader, description) {
  console.log(`🧪 Test ${description}:`);
  console.log(`   Header: ${authHeader}`);
  
  try {
    const response = await axios({
      method: 'GET',
      url: `${QONTO_BASE_URL}/v2/bank_accounts`,
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
      },
      timeout: 10000
    });
    
    console.log(`✅ ${description} - SUCCÈS !`);
    console.log(`   Status: ${response.status}`);
    console.log(`   Comptes: ${response.data.bank_accounts?.length || 0}`);
    return true;
    
  } catch (error) {
    console.log(`❌ ${description} - ÉCHEC`);
    if (error.response) {
      console.log(`   Status: ${error.response.status}`);
      console.log(`   Error: ${JSON.stringify(error.response.data)}`);
    } else {
      console.log(`   Error: ${error.message}`);
    }
    return false;
  }
  
  console.log('');
}

async function main() {
  console.log('🔐 Test des formats d\'authentification Qonto\n');
  console.log(`Base URL: ${QONTO_BASE_URL}`);
  console.log(`Login: ${QONTO_LOGIN}`);
  console.log(`Secret: ${QONTO_SECRET_KEY}\n`);
  
  // Format 1: login:secret (format actuel)
  await testAuthFormat(
    `${QONTO_LOGIN}:${QONTO_SECRET_KEY}`,
    'Format direct login:secret'
  );
  
  // Format 2: Bearer token
  await testAuthFormat(
    `Bearer ${QONTO_LOGIN}:${QONTO_SECRET_KEY}`,
    'Format Bearer login:secret'
  );
  
  // Format 3: Basic avec base64
  const base64Credentials = Buffer.from(`${QONTO_LOGIN}:${QONTO_SECRET_KEY}`).toString('base64');
  await testAuthFormat(
    `Basic ${base64Credentials}`,
    'Format Basic base64'
  );
  
  // Format 4: Bearer avec base64
  await testAuthFormat(
    `Bearer ${base64Credentials}`,
    'Format Bearer base64'
  );
  
  // Format 5: Juste le token
  await testAuthFormat(
    QONTO_SECRET_KEY,
    'Format secret key seul'
  );
  
  // Format 6: Bearer secret key seul
  await testAuthFormat(
    `Bearer ${QONTO_SECRET_KEY}`,
    'Format Bearer secret key'
  );
  
  console.log('\n✨ Test terminé !');
  console.log('👉 Utilise le format qui a fonctionné dans tes APIs');
}

main().catch(console.error);
