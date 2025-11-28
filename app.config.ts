import type { ExpoConfig } from "@expo/config";

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY ?? "",
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN ?? "",
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID ?? "",
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET ?? "",
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? "",
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID ?? "",
  measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID ?? "",
};

const googleAuthConfig = {
  expoClientId:
    process.env.EXPO_PUBLIC_GOOGLE_EXPO_CLIENT_ID ??
    process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ??
    "",
  iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID ?? "",
  androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID ?? "",
};

const config: ExpoConfig = {
  name: "Echoes",
  slug: "echoes",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/images/icon.png",
  scheme: "echoes",
  userInterfaceStyle: "automatic",
  newArchEnabled: true,
  ios: {
    icon: "./assets/echoes-ios-light.icon",
    bundleIdentifier: "com.arjunbishnoi.echoes",
    supportsTablet: true,
    infoPlist: {
      NSPhotoLibraryUsageDescription:
        "Allow Echoes to access your photo library to choose images and videos.",
      NSCameraUsageDescription: "Allow Echoes to use your camera to capture photos and videos.",
      NSMicrophoneUsageDescription: "Allow Echoes to record audio for your echoes.",
      UIFileSharingEnabled: true,
      NSAppTransportSecurity: {
        NSAllowsArbitraryLoads: true,
        NSExceptionDomains: {
          localhost: {
            NSExceptionAllowsInsecureHTTPLoads: true,
          },
        },
      },
    },
  },
  android: {
    package: "com.arjunbishnoi.echoes",
    adaptiveIcon: {
      backgroundColor: "#E6F4FE",
      foregroundImage: "./assets/images/android-icon-foreground.png",
      backgroundImage: "./assets/images/android-icon-background.png",
      monochromeImage: "./assets/images/android-icon-monochrome.png",
    },
    edgeToEdgeEnabled: true,
    predictiveBackGestureEnabled: false,
    intentFilters: googleAuthConfig.androidClientId
      ? [
          {
            action: "VIEW",
            category: ["BROWSABLE", "DEFAULT"],
            data: [
              {
                scheme: `com.googleusercontent.apps.${googleAuthConfig.androidClientId}`,
                host: "oauth2redirect",
              },
            ],
          },
        ]
      : [],
    permissions: ["CAMERA", "RECORD_AUDIO", "READ_EXTERNAL_STORAGE", "WRITE_EXTERNAL_STORAGE"],
  },
  web: {
    output: "static",
    favicon: "./assets/images/favicon.png",
  },
  plugins: [
    "expo-router",
    [
      "expo-splash-screen",
      {
        image: "./assets/images/splash-icon.png",
        imageWidth: 200,
        resizeMode: "contain",
        backgroundColor: "#ffffff",
        dark: {
          backgroundColor: "#000000",
        },
      },
    ],
    "expo-web-browser",
    // "expo-apple-authentication", // Removed for personal developer account
    "expo-sqlite",
  ],
  experiments: {
    typedRoutes: true,
    reactCompiler: true,
  },
  extra: {
    router: {},
    eas: {
      projectId: "a57e476a-95af-44f7-aa17-18f2027dbae0",
    },
    auth: {
      google: googleAuthConfig,
    },
    firebase: firebaseConfig,
  },
  owner: "arjunbishnoi",
};

export default config;

