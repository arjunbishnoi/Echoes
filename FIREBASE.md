# Firebase Setup Guide for Echoes

Complete guide to setting up Firebase for the Echoes time capsule app.

## Overview

This app uses:
- **Firebase Authentication** - Google Sign-In
- **Cloud Firestore** - Real-time database
- **Firebase Storage** - Media file storage

## Prerequisites

- Firebase account (free tier is fine)
- Google Cloud account (automatically created with Firebase)
- Node.js 18+ installed

---

## Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click **Add Project**
3. Project name: `echoes` (or your preferred name)
4. Enable Google Analytics (optional)
5. Click **Create Project**

---

## Step 2: Enable Authentication

1. In Firebase Console, go to **Authentication** → **Sign-in method**
2. Click **Google** provider
3. Toggle **Enable**
4. Set a support email
5. Click **Save**

---

## Step 3: Create Firestore Database

1. Go to **Firestore Database**
2. Click **Create database**
3. Choose **Start in production mode** (we'll add rules later)
4. Select a location close to your users
5. Click **Enable**

---

## Step 4: Enable Firebase Storage

1. Go to **Storage**
2. Click **Get started**
3. Start in **Production mode**
4. Use same location as Firestore
5. Click **Done**

---

## Step 5: Get Firebase Web Config

1. Go to **Project Settings** (gear icon)
2. Scroll to **Your apps**
3. Click the **Web** icon (`</>`)
4. Register app: name it "Echoes Web"
5. **Copy the firebaseConfig values** - you'll need these for `.env`

```javascript
const firebaseConfig = {
  apiKey: "AIza...",              // EXPO_PUBLIC_FIREBASE_API_KEY
  authDomain: "xxx.firebaseapp.com", // EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN
  projectId: "xxx",               // EXPO_PUBLIC_FIREBASE_PROJECT_ID
  storageBucket: "xxx.appspot.com", // EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET
  messagingSenderId: "123...",    // EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
  appId: "1:123...",              // EXPO_PUBLIC_FIREBASE_APP_ID
  measurementId: "G-XXX"          // EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID
};
```

---

## Step 6: Configure Google OAuth

### Get Web Client ID

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Select your Firebase project
3. Go to **APIs & Services** → **Credentials**
4. Find "Web client (auto created by Google Service)" 
5. Copy the **Client ID** - this is your `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`

### Configure OAuth Consent Screen

1. Go to **APIs & Services** → **OAuth consent screen**
2. Choose **External** user type
3. Fill in:
   - App name: `Echoes`
   - Support email: your email
   - Developer contact: your email
4. Add scopes: `email`, `profile`, `openid`
5. Save and continue

### Set Authorized Redirect URIs

1. Back in **Credentials**, click your Web client
2. Under **Authorized redirect URIs**, add **ALL** of these:
   ```
   https://auth.expo.io/@YOUR-EXPO-USERNAME/echoes
   exp://localhost:8081/auth
   echoes://auth
   http://localhost:19006/auth
   ```
   Replace `YOUR-EXPO-USERNAME` with your Expo username (check with `expo whoami`)
3. Click **Save**

> **Note**: Different URIs are needed for:
> - `https://auth.expo.io/...` - Expo Go app
> - `exp://localhost...` - Local development
> - `echoes://auth` - Standalone app builds
> - `http://localhost...` - Web development

---

## Step 7: Create Environment File

Create `.env` in your project root:

```bash
# Firebase Configuration
EXPO_PUBLIC_FIREBASE_API_KEY=AIza...
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012
EXPO_PUBLIC_FIREBASE_APP_ID=1:123456789012:web:abc123
EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX

# Google OAuth (Web Client ID from step 6)
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=123456789012-abc.apps.googleusercontent.com

# Optional: Native client IDs (for future use)
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=
EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=

# Environment
EXPO_PUBLIC_ENV=development
```

⚠️ **Important**: `.env` is gitignored. Never commit credentials!

---

## Step 8: Verify Environment

```bash
npm run check-env
```

You should see:
```
✅ All required environment variables are set
```

---

## Step 9: Configure Firestore Security Rules

1. Go to **Firestore Database** → **Rules**
2. Replace with these production-ready rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper function to check if user is authenticated
    function isAuthenticated() {
      return request.auth != null;
    }
    
    // Helper function to check if user owns the document
    function isOwner(userId) {
      return request.auth.uid == userId;
    }
    
    // Users collection
    match /users/{userId} {
      // Anyone authenticated can read any user profile
      allow read: if isAuthenticated();
      
      // Users can only write to their own profile
      allow write: if isOwner(userId);
    }
    
    // Friend requests collection
    match /friendRequests/{requestId} {
      allow read: if isAuthenticated() && (
        resource.data.fromUserId == request.auth.uid ||
        resource.data.toUserId == request.auth.uid
      );
      allow create: if isAuthenticated() && 
        request.resource.data.fromUserId == request.auth.uid;
      allow update: if isAuthenticated() &&
        resource.data.toUserId == request.auth.uid;
      allow delete: if isAuthenticated() && (
        resource.data.fromUserId == request.auth.uid ||
        resource.data.toUserId == request.auth.uid
      );
    }
    
    // Friendships collection
    match /friendships/{friendshipId} {
      allow read: if isAuthenticated() && (
        resource.data.userId1 == request.auth.uid ||
        resource.data.userId2 == request.auth.uid
      );
      allow create, delete: if isAuthenticated();
    }
    
    // Echoes collection
    match /echoes/{echoId} {
      // Users can read echoes they own or collaborate on
      allow read: if isAuthenticated() && (
        resource.data.ownerId == request.auth.uid ||
        request.auth.uid in resource.data.collaboratorIds
      );
      
      // Any authenticated user can create an echo
      allow create: if isAuthenticated() &&
        request.resource.data.ownerId == request.auth.uid;
      
      // Only owners can update or delete
      allow update, delete: if isAuthenticated() &&
        resource.data.ownerId == request.auth.uid;
      
      // Activities subcollection
      match /activities/{activityId} {
        allow read: if isAuthenticated() && (
          get(/databases/$(database)/documents/echoes/$(echoId)).data.ownerId == request.auth.uid ||
          request.auth.uid in get(/databases/$(database)/documents/echoes/$(echoId)).data.collaboratorIds
        );
        allow create: if isAuthenticated();
      }
    }
  }
}
```

3. Click **Publish**

---

## Step 10: Configure Storage Security Rules

1. Go to **Storage** → **Rules**
2. Replace with:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    
    // User profile photos
    match /users/{userId}/profile.jpg {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == userId;
    }
    
    // Echo media files
    match /echoes/{echoId}/{allPaths=**} {
      allow read: if request.auth != null && (
        firestore.get(/databases/(default)/documents/echoes/$(echoId)).data.ownerId == request.auth.uid ||
        request.auth.uid in firestore.get(/databases/(default)/documents/echoes/$(echoId)).data.collaboratorIds
      );
      allow write: if request.auth != null && (
        firestore.get(/databases/(default)/documents/echoes/$(echoId)).data.ownerId == request.auth.uid ||
        request.auth.uid in firestore.get(/databases/(default)/documents/echoes/$(echoId)).data.collaboratorIds
      );
    }
  }
}
```

3. Click **Publish**

---

## Step 11: Test the Setup

```bash
npm start
```

1. Open the app on a simulator/device
2. Click **Continue with Google**
3. Sign in with your Google account
4. You should see the home screen

Check Firebase Console:
- **Authentication** → **Users** should show your account
- **Firestore** → **users** collection should have your user document

---

## Troubleshooting

### "Missing environment variables"
- Run `npm run check-env` to see which variables are missing
- Double-check your `.env` file against the template above

### "Google Sign-In failed"
- Verify `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` is correct
- Check authorized redirect URIs include all the URIs listed in Step 6
- Ensure Google provider is enabled in Firebase Authentication

### "Error 400: invalid_request" or "nonce required"
This error occurs when Google OAuth requires a nonce parameter. The app now includes this automatically, but you need to:
1. **Update redirect URIs** in Google Cloud Console (see Step 6)
2. Add all redirect URIs for different environments:
   - `https://auth.expo.io/@YOUR-USERNAME/echoes`
   - `exp://localhost:8081/auth`
   - `echoes://auth`
   - `http://localhost:19006/auth`
3. Wait 5 minutes for Google to propagate the changes
4. Clear app cache and try again

### "Redirect URI mismatch"
1. Run `expo whoami` to verify your Expo username
2. Make sure the redirect URI in Google Cloud Console matches exactly
3. Try running `npx expo start --clear` to clear cache
4. Check the console logs for the actual redirect URI being used

### "Permission denied" errors
- Check Firestore and Storage rules are published
- Verify user is authenticated before making requests
- Check console logs for specific permission errors

### TypeScript errors
```bash
npx tsc --noEmit
```

### Lint errors
```bash
npm run lint
```

---

## Production Deployment

Before deploying to production:

1. **Create separate Firebase projects** for dev/staging/prod
2. **Restrict API keys** in Google Cloud Console by platform
3. **Enable App Check** for additional security
4. **Set up Cloud Functions** for server-side operations
5. **Configure backup** for Firestore
6. **Set up monitoring** with Firebase Analytics
7. **Test security rules** thoroughly

---

## Additional Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Expo AuthSession](https://docs.expo.dev/versions/latest/sdk/auth-session/)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
- [Firebase Storage Rules](https://firebase.google.com/docs/storage/security)

---

## Support

If you run into issues:
1. Check the [troubleshooting section](#troubleshooting) above
2. Review Firebase Console logs
3. Check browser/device console logs
4. Verify all environment variables are set correctly

Happy coding! 🚀

