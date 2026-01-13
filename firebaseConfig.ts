import Constants from 'expo-constants';
import { initializeApp, FirebaseApp } from 'firebase/app';
import { Auth, initializeAuth } from 'firebase/auth';

// Firebase config from environment variables
const firebaseConfig = {
  apiKey: Constants.expoConfig?.extra?.firebaseApiKey,
  authDomain: Constants.expoConfig?.extra?.firebaseAuthDomain,
  projectId: Constants.expoConfig?.extra?.firebaseProjectId,
  storageBucket: Constants.expoConfig?.extra?.firebaseStorageBucket,
  messagingSenderId: Constants.expoConfig?.extra?.firebaseMessagingSenderId,
  appId: Constants.expoConfig?.extra?.firebaseAppId,
};

// Initialize Firebase
const app: FirebaseApp = initializeApp(firebaseConfig);

// Initialize Auth (React Native persistence handled by Firebase SDK defaults)
const auth: Auth = initializeAuth(app);

export { app, auth }; 
