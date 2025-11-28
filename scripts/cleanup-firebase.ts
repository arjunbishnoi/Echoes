/**
 * Firebase Cleanup Script
 * 
 * WARNING: This will DELETE ALL data from your Firebase project!
 * - All Firestore collections (users, echoes, friendRequests, friendships)
 * - All Firebase Storage files (echoes, users)
 * - All Firebase Authentication users
 * 
 * Usage:
 * 1. Make sure your .env file has the correct Firebase credentials
 * 2. Run: npx tsx scripts/cleanup-firebase.ts
 * 
 * Or use: npm run cleanup-firebase (if added to package.json)
 */

import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";
import { getStorage } from "firebase-admin/storage";
import * as readline from "readline";

// You'll need to install firebase-admin:
// npm install firebase-admin
// And set up a service account key from Firebase Console

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(prompt: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function confirmDeletion(): Promise<boolean> {
  const answer = await question(
    "\n⚠️  WARNING: This will DELETE ALL data from your Firebase project!\n" +
      "Type 'DELETE ALL' (in caps) to confirm: "
  );
  return answer === "DELETE ALL";
}

async function deleteFirestoreCollection(db: FirebaseFirestore.Firestore, collectionName: string) {
  console.log(`\n🗑️  Deleting Firestore collection: ${collectionName}...`);
  const collectionRef = db.collection(collectionName);
  const snapshot = await collectionRef.get();
  
  if (snapshot.empty) {
    console.log(`   ✓ ${collectionName} is already empty`);
    return;
  }

  // Delete in batches of 500 (Firestore limit)
  const batch = db.batch();
  let count = 0;
  let totalDeleted = 0;

  for (const doc of snapshot.docs) {
    // Delete subcollections if they exist
    if (collectionName === "echoes") {
      const activitiesRef = doc.ref.collection("activities");
      const activitiesSnapshot = await activitiesRef.get();
      activitiesSnapshot.docs.forEach((activityDoc) => {
        batch.delete(activityDoc.ref);
      });
    }

    batch.delete(doc.ref);
    count++;

    if (count >= 500) {
      await batch.commit();
      totalDeleted += count;
      console.log(`   ✓ Deleted ${totalDeleted} documents...`);
      count = 0;
    }
  }

  if (count > 0) {
    await batch.commit();
    totalDeleted += count;
  }

  console.log(`   ✓ Deleted ${totalDeleted} documents from ${collectionName}`);
}

async function deleteStorageFolder(bucket: any, folderPath: string) {
  console.log(`\n🗑️  Deleting Storage folder: ${folderPath}...`);
  try {
    const [files] = await bucket.getFiles({ prefix: folderPath });
    
    if (files.length === 0) {
      console.log(`   ✓ ${folderPath} is already empty`);
      return;
    }

    // Delete in batches
    for (const file of files) {
      await file.delete();
    }

    console.log(`   ✓ Deleted ${files.length} files from ${folderPath}`);
  } catch (error: any) {
    if (error.code === 404) {
      console.log(`   ✓ ${folderPath} doesn't exist`);
    } else {
      console.error(`   ✗ Error deleting ${folderPath}:`, error.message);
    }
  }
}

async function deleteAllAuthUsers(auth: any) {
  console.log(`\n🗑️  Deleting all Firebase Auth users...`);
  try {
    let nextPageToken: string | undefined;
    let totalDeleted = 0;

    do {
      const listUsersResult = await auth.listUsers(1000, nextPageToken);
      
      const deletePromises = listUsersResult.users.map((user: any) => 
        auth.deleteUser(user.uid).catch((err: any) => {
          console.error(`   ✗ Failed to delete user ${user.uid}:`, err.message);
        })
      );

      await Promise.all(deletePromises);
      totalDeleted += listUsersResult.users.length;
      console.log(`   ✓ Deleted ${totalDeleted} users...`);

      nextPageToken = listUsersResult.pageToken;
    } while (nextPageToken);

    console.log(`   ✓ Deleted ${totalDeleted} Firebase Auth users`);
  } catch (error: any) {
    console.error(`   ✗ Error deleting auth users:`, error.message);
  }
}

async function main() {
  console.log("🔥 Firebase Cleanup Script\n");

  // Check for service account
  if (!process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
    console.error(
      "❌ Error: FIREBASE_SERVICE_ACCOUNT_KEY environment variable not set.\n" +
      "   You need to:\n" +
      "   1. Go to Firebase Console → Project Settings → Service Accounts\n" +
      "   2. Generate a new private key\n" +
      "   3. Set FIREBASE_SERVICE_ACCOUNT_KEY to the path of the JSON file\n" +
      "   Or set GOOGLE_APPLICATION_CREDENTIALS environment variable"
    );
    process.exit(1);
  }

  const confirmed = await confirmDeletion();
  if (!confirmed) {
    console.log("\n❌ Deletion cancelled. Nothing was deleted.");
    rl.close();
    return;
  }

  try {
    console.log("\n🚀 Initializing Firebase Admin...");
    
    // Initialize Firebase Admin
    const serviceAccount = require(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
    const app = initializeApp({
      credential: cert(serviceAccount),
      storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
    });

    const db = getFirestore(app);
    const auth = getAuth(app);
    const bucket = getStorage(app).bucket();

    console.log("✓ Firebase Admin initialized\n");

    // Delete Firestore collections
    await deleteFirestoreCollection(db, "users");
    await deleteFirestoreCollection(db, "echoes");
    await deleteFirestoreCollection(db, "friendRequests");
    await deleteFirestoreCollection(db, "friendships");

    // Delete Storage folders
    await deleteStorageFolder(bucket, "echoes/");
    await deleteStorageFolder(bucket, "users/");

    // Delete Auth users
    await deleteAllAuthUsers(auth);

    console.log("\n✅ Cleanup complete! All data has been deleted.");
  } catch (error: any) {
    console.error("\n❌ Error during cleanup:", error.message);
    process.exit(1);
  } finally {
    rl.close();
  }
}

main();

