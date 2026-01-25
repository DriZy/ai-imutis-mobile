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
import CityPickerScreen from '../screens/Travel/CityPickerScreen';
import TravelResultsScreen from '../screens/Travel/TravelResultsScreen';
import MapHomeScreen from '../screens/Map/MapHomeScreen';
import TravelDetailsScreen from '../screens/Travel/TravelDetailsScreen';
import BookingScreen from '../screens/Travel/BookingScreen';
import BookingHistoryScreen from '../screens/Travel/BookingHistoryScreen';
import VehicleRegistrationScreen from '../screens/Travel/VehicleRegistrationScreen';
import ScheduleRideScreen from '../screens/Travel/ScheduleRideScreen';

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
  TravelResults: undefined;
  TravelDetails: { tripId: string };
  Booking: { tripId: string };
  BookingHistory: undefined;
  VehicleRegistration: undefined;
  ScheduleRide: undefined;
  CitiesScreen: undefined;
  AttractionsScreen: { cityId: string };
  AttractionDetail: { attractionId: string };
  SavedAttractions: undefined;
  ProfileScreen: undefined;
  SettingsScreen: undefined;
  SessionManager: undefined;
  NotificationsScreen: undefined;
  CityPicker: { type: 'origin' | 'destination'; onSelect: (city: any) => void };
};

export type TabParamList = {
  Map: undefined;
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
      initialRouteName="Map"
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
        name="Map"
        component={MapHomeScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="map" size={size} color={color} />
          ),
          title: 'Explore',
        }}
      />
      <Tab.Screen
        name="Travel"
        component={SearchScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="bus" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Tourism"
        component={DashboardScreen} // Temporary - will be replaced with CitiesScreen
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="map" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Notifications"
        component={DashboardScreen} // Temporary - will be replaced with NotificationsScreen
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="notifications" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={DashboardScreen} // Temporary - will be replaced with ProfileScreen
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
            <Stack.Screen name="CityPicker" component={CityPickerScreen} />
            <Stack.Screen name="TravelResults" component={TravelResultsScreen} />
            <Stack.Screen name="TravelDetails" component={TravelDetailsScreen} />
            <Stack.Screen name="Booking" component={BookingScreen} />
            <Stack.Screen name="BookingHistory" component={BookingHistoryScreen} />
            <Stack.Screen name="VehicleRegistration" component={VehicleRegistrationScreen} />
            <Stack.Screen name="ScheduleRide" component={ScheduleRideScreen} />
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
