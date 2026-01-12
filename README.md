# AI-IMUTIS - Ride Tracking & Tourism App

A **TypeScript** React Native mobile application built with Expo for ride tracking and tourism, featuring Firebase authentication with multiple sign-in methods.

## Features

- **Splash Screen**: Branded app intro with AI-IMUTIS logo
- **Onboarding**: Interactive carousel showcasing app features
- **Multi-Method Authentication**:
  - Email/Password sign-up and sign-in
  - Phone number verification with OTP
  - Google OAuth sign-in
- **Dashboard**: User home screen with quick actions and stats
- **Firebase Integration**: Secure authentication and data persistence
- **TypeScript**: Full type safety and improved developer experience

## Tech Stack

- **React Native** with **Expo SDK 54**
- **TypeScript**: Fully typed codebase for type safety
- **React Navigation**: Native Stack Navigator with type-safe routing
- **Firebase**: Authentication (Email, Phone, Google)
- **expo-linear-gradient**: Beautiful gradient UI
- **expo-auth-session**: OAuth flows
- **AsyncStorage**: Persistent auth state

## Prerequisites

Before you begin, ensure you have:

- Node.js (v18 or higher)
- npm or yarn
- Expo Go app on your mobile device (for testing)
- Firebase project with Authentication enabled

## Setup Instructions

### 1. Clone and Install Dependencies

```bash
cd mobile
npm install
```

### 2. Configure Firebase

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select an existing one
3. Enable Authentication:
   - Go to **Authentication > Sign-in method**
   - Enable **Email/Password**, **Phone**, and **Google** providers
4. Get your Firebase configuration:
   - Go to **Project Settings > General**
   - Scroll to "Your apps" and click the web icon `</>`
   - Copy the Firebase SDK configuration

### 3. Set Up Environment Variables

1. Copy `.env.sample` to `.env`:
   ```bash
   cp .env.sample .env
   ```

2. Edit `.env` and add your Firebase credentials:
   ```env
   FIREBASE_API_KEY=your_firebase_api_key_here
   FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
   FIREBASE_PROJECT_ID=your_project_id
   FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
   FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   FIREBASE_APP_ID=your_app_id
   GOOGLE_WEB_CLIENT_ID=your_google_web_client_id.apps.googleusercontent.com
   ```

### 4. Configure Google OAuth (Optional)

For Google sign-in to work:

1. In Firebase Console, go to **Authentication > Sign-in method > Google**
2. Enable Google provider
3. Copy the **Web client ID** (from the Web SDK configuration section)
4. Add it to your `.env` file as `GOOGLE_WEB_CLIENT_ID`

### 5. Configure Phone Authentication

For phone auth to work properly:

1. In Firebase Console, ensure Phone authentication is enabled
2. Add your test phone numbers (if needed) in **Authentication > Sign-in method > Phone**
3. Note: Phone auth uses reCAPTCHA verification automatically

### 6. TypeScript Setup

TypeScript is already configured and ready to use. All files are typed with strict mode enabled:

```bash
# Type check without building
npx tsc --noEmit

# The app automatically uses TypeScript during development
npm start
```

## Running the App

Start the Expo development server:

```bash
npm start
```

Then:
- Press `a` for Android emulator
- Press `i` for iOS simulator (macOS only)
- Scan the QR code with Expo Go app on your physical device

### Platform-Specific Commands

```bash
npm run android   # Run on Android
npm run ios       # Run on iOS
npm run web       # Run on web browser
```

## Project Structure

```
mobile/
├── src/
│   ├── screens/
│   │   ├── SplashScreen.js          # App splash/loading screen
│   │   ├── OnboardingScreen.js      # Onboarding carousel
│   │   ├── AuthScreen.js            # Auth method selection
│   │   ├── EmailAuthScreen.js       # Email sign-in/sign-up
│   │   ├── PhoneAuthScreen.js       # Phone OTP verification
│   │   ├── GoogleAuthScreen.js      # Google OAuth
│   │   └── DashboardScreen.js       # Main app dashboard
│   ├── navigation/
│   │   └── AppNavigator.js          # Navigation setup
│   └── components/                   # Reusable components (future)
├── firebaseConfig.js                 # Firebase initialization
├── app.config.js                     # Expo config with env vars
├── App.js                            # Root component
├── .env                              # Environment variables (DO NOT COMMIT)
├── .env.sample                       # Environment template
└── package.json
```

## Authentication Flows

### Email/Password
1. User enters email and password
2. Option to sign up (create account) or sign in
3. Firebase handles authentication
4. Redirects to Dashboard on success

### Phone Number
1. User enters phone number with country code
2. Firebase sends OTP via SMS
3. User enters verification code
4. Redirects to Dashboard on success

### Google OAuth
1. User taps "Continue with Google"
2. Opens Google sign-in web flow
3. Returns with authentication token
4. Firebase verifies and signs in user
5. Redirects to Dashboard

## Troubleshooting

### TypeScript Issues

- **Type errors on build**: Run `npx tsc --noEmit` to check for type errors
- **Module not found**: Make sure all imports use `.ts` or `.tsx` extensions for TypeScript files
- **Firebase types not found**: Install type definitions with `npm install @types/firebase-js-sdk`

### Firebase Issues

- **"Firebase not initialized"**: Check your `.env` file has correct values
- **Phone auth not working**: Ensure Phone provider is enabled in Firebase Console
- **Google sign-in fails**: Verify `GOOGLE_WEB_CLIENT_ID` is correct

### Expo Issues

- **"Cannot find module"**: Run `npm install` again
- **Metro bundler issues**: Clear cache with `npx expo start -c`

### Build Issues

- Check that all dependencies are installed: `npm install`
- Ensure you're using a compatible Node.js version (v18+)
- Delete `node_modules` and reinstall if needed

## Security Notes

- **Never commit `.env`** to version control
- Firebase security rules should be configured for production
- Use environment-specific Firebase projects (dev, staging, prod)
- Enable App Check for additional security in production

## Next Steps

To expand the app:

1. Add actual ride tracking with GPS/location services
2. Implement maps integration (Google Maps / Mapbox)
3. Build tourism features (places, reviews, bookings)
4. Add user profile management
5. Implement real-time ride updates
6. Add push notifications

## License

This project is for educational purposes.

## Support

For issues or questions, please refer to:
- [Expo Documentation](https://docs.expo.dev/)
- [Firebase Documentation](https://firebase.google.com/docs)
- [React Navigation Documentation](https://reactnavigation.org/)
