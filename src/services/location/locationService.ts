import * as Location from 'expo-location';
import { LocationData } from '../../types';
import { LOCATION_CONFIG } from '../../utils/constants';
import { getDeviceInfo } from './deviceInfoService';

// Request Location Permission
export const requestLocationPermission = async (): Promise<boolean> => {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    return status === 'granted';
  } catch (error) {
    console.error('Error requesting location permission:', error);
    return false;
  }
};

// Check if Location Permission is Granted
export const hasLocationPermission = async (): Promise<boolean> => {
  try {
    const { status } = await Location.getForegroundPermissionsAsync();
    return status === 'granted';
  } catch (error) {
    console.error('Error checking location permission:', error);
    return false;
  }
};

// Get Current Location
export const getCurrentLocation = async (userId: string): Promise<LocationData | null> => {
  try {
    const hasPermission = await hasLocationPermission();
    if (!hasPermission) {
      const granted = await requestLocationPermission();
      if (!granted) {
        throw new Error('Location permission denied');
      }
    }

    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
      timeInterval: LOCATION_CONFIG.TIMEOUT,
    });

    const deviceInfo = await getDeviceInfo();

    const locationData: LocationData = {
      userId,
      deviceIP: deviceInfo.currentIP,
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      accuracy: location.coords.accuracy || 0,
      timestamp: new Date(location.timestamp),
      activityType: 'browsing',
    };

    return locationData;
  } catch (error) {
    console.error('Error getting current location:', error);
    return null;
  }
};

// Start Watching Location (for real-time tracking)
export const watchLocation = (
  userId: string,
  onLocationUpdate: (location: LocationData) => void,
  onError?: (error: Error) => void
): (() => void) => {
  let subscription: Location.LocationSubscription | null = null;

  const startWatching = async () => {
    try {
      const hasPermission = await hasLocationPermission();
      if (!hasPermission) {
        const granted = await requestLocationPermission();
        if (!granted) {
          if (onError) {
            onError(new Error('Location permission denied'));
          }
          return;
        }
      }

      subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: LOCATION_CONFIG.UPDATE_INTERVAL,
          distanceInterval: LOCATION_CONFIG.MINIMUM_DISTANCE,
        },
        async (location) => {
          const deviceInfo = await getDeviceInfo();
          
          const locationData: LocationData = {
            userId,
            deviceIP: deviceInfo.currentIP,
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            accuracy: location.coords.accuracy || 0,
            timestamp: new Date(location.timestamp),
            activityType: location.coords.speed && location.coords.speed > 1 ? 'traveling' : 'browsing',
          };

          onLocationUpdate(locationData);
        }
      );
    } catch (error) {
      console.error('Error watching location:', error);
      if (onError) {
        onError(error as Error);
      }
    }
  };

  startWatching();

  // Return cleanup function
  return () => {
    if (subscription) {
      subscription.remove();
    }
  };
};

// Calculate Distance between two coordinates (in meters)
export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
};

// Get Address from Coordinates (Reverse Geocoding)
export const getAddressFromCoordinates = async (
  latitude: number,
  longitude: number
): Promise<string | null> => {
  try {
    const addresses = await Location.reverseGeocodeAsync({ latitude, longitude });
    if (addresses.length > 0) {
      const address = addresses[0];
      return `${address.street || ''}, ${address.city || ''}, ${address.region || ''}, ${address.country || ''}`.trim();
    }
    return null;
  } catch (error) {
    console.error('Error getting address:', error);
    return null;
  }
};
