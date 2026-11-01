import crypto from 'crypto';

function generateSecrets() {
  const cronSecret = crypto.randomBytes(32).toString('hex');
  const waVerifyToken = crypto.randomBytes(16).toString('hex');
  const dataEncryptionKey = crypto.randomBytes(32).toString('base64');

  console.log('=== GENERATED SECRETS ===');
  console.log(`CRON_SECRET=${cronSecret}`);
  console.log(`WHATSAPP_VERIFY_TOKEN=${waVerifyToken}`);
  console.log(`DATA_ENCRYPTION_KEY=${dataEncryptionKey}`);
  console.log('\nCopy these values to .env.local and your deployment environment.');
}

generateSecrets();

