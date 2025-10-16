# Echoes

A beautiful time capsule app built with Expo and Firebase. Create, share, and unlock memories with friends.

## Features

- 🔐 **Secure Authentication** - Google Sign-In with Firebase Auth
- 📸 **Rich Media** - Photos, videos, audio, and documents
- 👥 **Collaborative Echoes** - Share time capsules with friends
- 🔒 **Time Locks** - Set dates to lock and unlock memories
- 📱 **Cross-Platform** - Works on iOS, Android, and Web
- ⚡ **Real-time Sync** - Live updates with Firestore
- 🎨 **Beautiful UI** - Modern design with smooth animations

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
cp .env.example .env

# Configure your Firebase credentials in .env
# See FIREBASE.md for detailed setup instructions

# Start development server
npm start

# Or run on specific platform
npm run ios        # iOS
npm run android    # Android  
npm run web        # Web
```

## Firebase Setup

See [`FIREBASE.md`](./FIREBASE.md) for detailed Firebase configuration instructions including:
- Creating a Firebase project
- Configuring Google OAuth
- Setting up Firestore and Storage
- Firestore security rules

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
- Check `FIREBASE.md` for Firebase setup help
- Review the TypeScript types in `/types`
- See inline code documentation
