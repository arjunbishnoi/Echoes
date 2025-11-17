# Echoes

A time capsule app built with Expo and Firebase. Create, share, and unlock memories with friends.

## Features

- Secure Authentication - Google Sign-In with Firebase Auth
- Rich Media - Photos, videos, audio, and documents
- Collaborative Echoes - Share time capsules with friends
- Time Locks - Set dates to lock and unlock memories
- Cross-Platform - Works on iOS, Android, and Web
- Real-time Sync - Live updates with Firestore
- Beautiful UI - Modern design with smooth animations

## Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Expo CLI (optional, but recommended)
- Firebase account

### Installation

```bash
# Clone and install dependencies
npm install

# Copy environment template
cp env.example .env

# Configure your Firebase credentials in .env

# Start development server
npm start

# Or run on specific platform
npm run ios        # iOS
npm run android    # Android  
npm run web        # Web
```

## Firebase Setup

1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com)
2. Enable Authentication (Google Sign-In)
3. Create Firestore Database
4. Enable Firebase Storage
5. Get your Firebase config and add to `.env` file

## Google OAuth Setup

1. In [Google Cloud Console](https://console.cloud.google.com/apis/credentials), create **OAuth Client IDs**:
   - Web client – used by Expo Go / dev builds (`EXPO_PUBLIC_GOOGLE_EXPO_CLIENT_ID` or `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`)
   - iOS client – bundle ID `com.arjunbishnoi.echoes`
   - Android client – package `com.arjunbishnoi.echoes`
2. Add the authorized redirect URI `https://auth.expo.dev/@arjunbishnoi/echoes` to the Web client.
3. Copy the generated client IDs into `.env` (see `env.example`).
4. Restart Expo (`npx expo start --clear`) so the new environment variables flow into `app.config.ts`.

## Project Structure

```
echoes/
├── app/                    # Expo Router screens
│   ├── (auth)/            # Auth screens (sign-in)
│   ├── (main)/            # Main app screens (home)
│   ├── echo/              # Echo detail screens
│   └── friend/            # Friend profile screens
├── components/            # Reusable UI components
│   ├── drawer/            # Drawer components
│   ├── echo/              # Echo-specific components
│   └── ui/                # Generic UI components
├── config/                # Configuration files
│   └── firebase.config.ts # Firebase initialization
├── lib/                   # Business logic and utilities
│   ├── services/          # Firebase services
│   │   ├── authService.ts   # Authentication
│   │   ├── userService.ts   # User management
│   │   ├── echoService.ts   # Echo/capsule operations
│   │   └── storageService.ts # File uploads
│   ├── authContext.tsx    # Auth state management
│   └── homeEchoContext.tsx # Home echo filtering
├── hooks/                 # Custom React hooks
├── screens/               # Screen components
├── theme/                 # Theme and styling
└── types/                 # TypeScript type definitions
```

## Available Scripts

```bash
npm start          # Start Expo dev server
npm run android    # Run on Android
npm run ios        # Run on iOS
npm run web        # Run on web
npm run lint       # Run ESLint
npm run check-env  # Validate environment variables
```

## Tech Stack

- **Framework**: Expo SDK 54 / React Native
- **Navigation**: Expo Router v6
- **Backend**: Firebase (Auth, Firestore, Storage)
- **State Management**: React Context + Hooks
- **Animations**: React Native Reanimated
- **Styling**: React Native StyleSheet
- **Type Safety**: TypeScript

## Development

### Environment Variables

All Firebase and OAuth credentials are stored in `.env` (not committed to git). See `.env.example` for the template.

### Authentication Flow

1. User clicks "Sign in with Google"
2. Expo AuthSession opens OAuth flow
3. Firebase verifies the Google token
4. User document created/updated in Firestore
5. User redirected to home screen

### Data Structure

**Users Collection** (`users/{userId}`)
- Profile information
- Settings and preferences
- Friend IDs array

**Echoes Collection** (`echoes/{echoId}`)
- Echo/capsule metadata
- Media array
- Collaborator IDs

**Activities Subcollection** (`echoes/{echoId}/activities/{activityId}`)
- Activity history for each echo

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run `npm run lint` to check for issues
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For issues and questions:
- Check Firebase documentation
- Review the TypeScript types in `/types`
- See inline code comments

## Maintenance

- Cleanup: Removed unused dependencies `lodash`, `react-native-calendars`, `react-native-worklets`.
- Cleanup: Deleted unused assets `assets/images/react-logo.png`, `assets/images/react-logo@2x.png`, `assets/images/react-logo@3x.png`, `assets/images/partial-react-logo.png`.
- Cleanup: Removed non-official plan `fix-expo-package-versions-and-font-error.plan.md`.
- TypeScript: Enabled `noUnusedLocals`, `noUnusedParameters`, `noFallthroughCasesInSwitch`.
