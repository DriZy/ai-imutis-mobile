require('dotenv').config();

export default {
  expo: {
    name: "AI-IMUTIS",
    slug: "ai-imutis",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "dark",
    scheme: "aiimutis",
    // newArchEnabled: false, // Explicitly disabled to avoid conflict with Expo Go where it's always enabled
    splash: {
      image: "./assets/splash-icon.png",
      resizeMode: "contain",
      backgroundColor: "#1E3A8A"
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.aiimutis.mobile"
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#1E3A8A"
      },
      edgeToEdgeEnabled: true,
      package: "com.aiimutis.mobile",
      // googleServicesFile: "./google-services.json" // Temporarily commented out
    },
    web: {
      favicon: "./assets/favicon.png"
    },
    extra: {
      firebaseApiKey: process.env.FIREBASE_API_KEY,
      firebaseAuthDomain: process.env.FIREBASE_AUTH_DOMAIN,
      firebaseProjectId: process.env.FIREBASE_PROJECT_ID,
      firebaseStorageBucket: process.env.FIREBASE_STORAGE_BUCKET,
      firebaseMessagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
      firebaseAppId: process.env.FIREBASE_APP_ID,
      googleWebClientId: process.env.GOOGLE_WEB_CLIENT_ID,
      eas: {
        projectId: "7d76f6eb-9200-45d2-ab95-c354b301aafd" // Placeholder or env var
      }
    }
  }
};
