/**
 * Environment Variable Checker
 * 
 * Validates that all required environment variables are set
 * before starting the app. Helps catch configuration issues early.
 */

const requiredEnvVars = [
  'EXPO_PUBLIC_FIREBASE_API_KEY',
  'EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN',
  'EXPO_PUBLIC_FIREBASE_PROJECT_ID',
  'EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET',
  'EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
  'EXPO_PUBLIC_FIREBASE_APP_ID',
];

const optionalEnvVars = [
  'EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID',
  'EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID',
  'EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID',
  'EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID',
  'EXPO_PUBLIC_ENV',
];

console.log('🔍 Checking environment variables...\n');

// Check required variables
const missing = requiredEnvVars.filter(
  (varName) => !process.env[varName]
);

if (missing.length > 0) {
  console.error('❌ Missing required environment variables:\n');
  missing.forEach((varName) => console.error(`  - ${varName}`));
  console.error('\n📝 To fix this:');
  console.error('  1. Copy .env.example to .env');
  console.error('  2. Fill in your Firebase credentials');
  console.error('  3. Restart the development server\n');
  console.error('See FIREBASE_SETUP_SECURE.md for detailed instructions.\n');
  process.exit(1);
}

console.log('✅ All required environment variables are set\n');

// Check optional variables
const missingOptional = optionalEnvVars.filter(
  (varName) => !process.env[varName]
);

if (missingOptional.length > 0) {
  console.warn('⚠️  Optional environment variables not set:\n');
  missingOptional.forEach((varName) => console.warn(`  - ${varName}`));
  console.warn('\n💡 These are optional but recommended for full functionality.\n');
}

// Show environment
const env = process.env.EXPO_PUBLIC_ENV || 'development';
console.log(`🌍 Environment: ${env}\n`);

console.log('✨ Environment check complete!\n');

