# Firebase Cleanup Guide

This guide shows you how to delete all users, echoes, and data from your Firebase project.

## ⚠️ WARNING
This will **permanently delete** all data. Make sure you have backups if needed!

---

## Option 1: Manual Cleanup via Firebase Console (Recommended for Quick Deletion)

### Step 1: Delete Firestore Collections

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Navigate to **Firestore Database**
4. Delete these collections one by one:
   - **`users`** - Click the collection → Select all → Delete
   - **`echoes`** - Click the collection → Select all → Delete
     - *Note: This will also delete the `activities` subcollection automatically*
   - **`friendRequests`** - Click the collection → Select all → Delete
   - **`friendships`** - Click the collection → Select all → Delete

### Step 2: Delete Firebase Storage Files

1. Navigate to **Storage** in Firebase Console
2. Delete these folders:
   - **`echoes/`** - Right-click folder → Delete (this contains all echo cover images and media)
   - **`users/`** - Right-click folder → Delete (this contains all profile photos)

### Step 3: Delete Firebase Authentication Users

1. Navigate to **Authentication** → **Users**
2. Click the checkbox at the top to select all users
3. Click **Delete** and confirm

---

## Option 2: Quick Firebase Console Method (Fastest)

If you want to delete everything quickly:

1. **Firestore Database**:
   - Go to Firestore Database
   - In the top right, there's a "..." menu → **Delete database**
   - Confirm deletion
   - This will delete ALL collections at once

2. **Storage**:
   - Go to Storage
   - Delete the entire bucket or delete folders one by one
   - Or if you want to reset: Delete all files manually

3. **Authentication**:
   - Authentication → Users → Select all → Delete

---

## Option 3: Programmatic Cleanup Script

If you have many users/echoes, you can use the cleanup script:

### Prerequisites:
```bash
npm install firebase-admin
```

### Setup:
1. Go to Firebase Console → Project Settings → Service Accounts
2. Click "Generate new private key"
3. Save the JSON file somewhere safe
4. Set environment variable:
   ```bash
   export FIREBASE_SERVICE_ACCOUNT_KEY="/path/to/service-account-key.json"
   # OR
   export GOOGLE_APPLICATION_CREDENTIALS="/path/to/service-account-key.json"
   ```

### Run:
```bash
npx tsx scripts/cleanup-firebase.ts
```

Or add to `package.json`:
```json
{
  "scripts": {
    "cleanup-firebase": "tsx scripts/cleanup-firebase.ts"
  }
}
```

---

## What Gets Deleted

### Firestore Collections:
- ✅ `users` - All user documents
- ✅ `echoes` - All echo documents (including `activities` subcollection)
- ✅ `friendRequests` - All friend request documents
- ✅ `friendships` - All friendship documents

### Firebase Storage:
- ✅ `echoes/{echoId}/cover.jpg` - Echo cover images
- ✅ `echoes/{echoId}/photos/` - All photo media
- ✅ `echoes/{echoId}/videos/` - All video media
- ✅ `echoes/{echoId}/audio/` - All audio media
- ✅ `echoes/{echoId}/documents/` - All document media
- ✅ `users/{userId}/profile.jpg` - User profile photos

### Firebase Authentication:
- ✅ All authenticated users

---

## What DOESN'T Get Deleted

- Your Firebase project itself
- Firebase configuration/settings
- Firestore indexes (will be cleaned up automatically over time)
- Storage bucket configuration

---

## After Cleanup

Once cleanup is complete:
1. Your app will work normally with new users
2. Local SQLite database will be cleared on next user login (due to namespace changes)
3. AsyncStorage cache will be cleared on next user login

---

## Need to Revert?

⚠️ **You cannot undo this operation!** Once data is deleted, it's gone forever unless you have backups.

Make sure you're deleting from the correct Firebase project (check your `.env` file for `EXPO_PUBLIC_FIREBASE_PROJECT_ID`).

