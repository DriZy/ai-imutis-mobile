import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator, NativeStackScreenProps } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '../../firebaseConfig';
import { theme } from '../styles/theme';

// Import screens
import SplashScreen from '../screens/SplashScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import AuthScreen from '../screens/AuthScreen';
import EmailAuthScreen from '../screens/EmailAuthScreen';
import PhoneAuthScreen from '../screens/PhoneAuthScreen';
import GoogleAuthScreen from '../screens/GoogleAuthScreen';
import DashboardScreen from '../screens/DashboardScreen';
import SearchScreen from '../screens/Travel/SearchScreen';

export type RootStackParamList = {
  Splash: undefined;
  Onboarding: undefined;
  Auth: undefined;
  EmailAuth: undefined;
  PhoneAuth: undefined;
  GoogleAuth: undefined;
  MainTabs: undefined;
  Dashboard: undefined;
  TravelSearch: undefined;
  TravelResults: { searchQuery: any };
  TravelDetails: { tripId: string };
  Booking: { tripId: string };
  BookingHistory: undefined;
  CitiesScreen: undefined;
  AttractionsScreen: { cityId: string };
  AttractionDetail: { attractionId: string };
  SavedAttractions: undefined;
  ProfileScreen: undefined;
  SettingsScreen: undefined;
  SessionManager: undefined;
  NotificationsScreen: undefined;
  CityPicker: { type: 'origin' | 'destination'; onSelect: (city: any) => void };

  // Common keys used by various screens (keeps navigation typings permissive)
  Login?: undefined;
  Settings?: undefined;
  SavedAddresses?: undefined;
  PaymentMethods?: undefined;
  BookingDetails?: { bookingId: string };
  Tourism?: undefined;
  Travel?: undefined;
};

export type TabParamList = {
  Travel: undefined;
  Tourism: undefined;
  Notifications: undefined;
  Profile: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: theme.colors.primary.main,
        tabBarInactiveTintColor: theme.colors.neutral[400],
        headerShown: false,
        tabBarStyle: {
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
      }}
    >
      <Tab.Screen
        name="Travel"
        component={SearchScreen as any}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="bus" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Tourism"
        component={DashboardScreen as any} // Temporary - will be replaced with CitiesScreen
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="map" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Notifications"
        component={DashboardScreen as any} // Temporary - will be replaced with NotificationsScreen
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="notifications" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={DashboardScreen as any} // Temporary - will be replaced with ProfileScreen
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export default function AppNavigator(): React.JSX.Element {
  const [user, setUser] = useState<User | null>(null);
  const [initializing, setInitializing] = useState<boolean>(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      if (initializing) setInitializing(false);
    });

    return unsubscribe;
  }, []);

  if (initializing) {
    return <></>;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          animation: 'fade',
        }}
      >
        {user ? (
          <>
            <Stack.Screen name="MainTabs" component={MainTabs} />
            <Stack.Screen name="Dashboard" component={DashboardScreen} />
            <Stack.Screen name="TravelSearch" component={SearchScreen} />
          </>
        ) : (
          <>
            <Stack.Screen name="Splash" component={SplashScreen} />
            <Stack.Screen name="Onboarding" component={OnboardingScreen} />
            <Stack.Screen name="Auth" component={AuthScreen} />
            <Stack.Screen name="EmailAuth" component={EmailAuthScreen} />
            <Stack.Screen name="PhoneAuth" component={PhoneAuthScreen} />
            <Stack.Screen name="GoogleAuth" component={GoogleAuthScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
