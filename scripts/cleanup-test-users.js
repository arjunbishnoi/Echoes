// Test user cleanup script
// Run this with: node scripts/cleanup-test-users.js

const admin = require('firebase-admin');

// You'll need to add your Firebase Admin SDK service account key
// Download it from Firebase Console > Project Settings > Service Accounts
// const serviceAccount = require('./path-to-your-service-account-key.json');

// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount)
// });

async function cleanupTestUsers() {
  try {
    console.log('🧹 Starting test user cleanup...');
    
    // Get all users from Authentication
    const listUsersResult = await admin.auth().listUsers();
    console.log(`Found ${listUsersResult.users.length} users in Authentication`);
    
    // Delete users from Authentication
    for (const user of listUsersResult.users) {
      console.log(`Deleting user: ${user.email} (${user.uid})`);
      await admin.auth().deleteUser(user.uid);
      
      // Also delete from Firestore
      await admin.firestore().collection('users').doc(user.uid).delete();
    }
    
    console.log('✅ Cleanup completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during cleanup:', error);
    process.exit(1);
  }
}

// Uncomment the line below to run the cleanup
// cleanupTestUsers();

console.log('⚠️  This script is disabled by default for safety.');
console.log('📝 Please use the Firebase Console method instead, or:');
console.log('1. Set up Firebase Admin SDK credentials');
console.log('2. Uncomment the initialization and cleanup call');
console.log('3. Run: node scripts/cleanup-test-users.js');
