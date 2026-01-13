import * as Device from 'expo-device';
import * as Network from 'expo-network';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DeviceInfo } from '../../types';
import { STORAGE_KEYS } from '../../utils/constants';
import Constants from 'expo-constants';

// Generate Device Fingerprint
const generateDeviceFingerprint = async (): Promise<string> => {
  const deviceName = await Device.deviceName;
  const brand = Device.brand || 'unknown';
  const modelName = Device.modelName || 'unknown';
  const osName = Device.osName || 'unknown';
  const osVersion = Device.osVersion || 'unknown';
  
  const fingerprint = `${brand}-${modelName}-${osName}-${osVersion}-${deviceName}`.replace(/\s/g, '_');
  return fingerprint;
};

// Get Device Type
const getDeviceType = (): DeviceInfo['type'] => {
  if (Device.osName === 'iOS' || Device.osName === 'iPadOS') {
    return Device.deviceType === Device.DeviceType.TABLET ? 'iPad' : 'iPhone';
  } else if (Device.osName === 'Android') {
    return Device.deviceType === Device.DeviceType.TABLET ? 'Android Tablet' : 'Android Phone';
  }
  return 'Android Phone'; // default
};

// Get Device IP Address
const getDeviceIP = async (): Promise<string> => {
  try {
    const ipAddress = await Network.getIpAddressAsync();
    return ipAddress || 'unknown';
  } catch (error) {
    console.error('Error getting device IP:', error);
    return 'unknown';
  }
};

// Get or Create Device Info
export const getDeviceInfo = async (): Promise<DeviceInfo & { currentIP: string }> => {
  try {
    // Check if device info is already cached
    const cachedInfo = await AsyncStorage.getItem(STORAGE_KEYS.DEVICE_INFO);
    
    let deviceInfo: DeviceInfo;
    
    if (cachedInfo) {
      deviceInfo = JSON.parse(cachedInfo);
    } else {
      // Generate new device info
      const fingerprint = await generateDeviceFingerprint();
      
      deviceInfo = {
        id: fingerprint,
        type: getDeviceType(),
        model: Device.modelName || 'unknown',
        os: Device.osName || 'unknown',
        osVersion: Device.osVersion || 'unknown',
        appVersion: Constants.expoConfig?.version || '1.0.0',
        fingerprint,
      };
      
      // Cache device info
      await AsyncStorage.setItem(STORAGE_KEYS.DEVICE_INFO, JSON.stringify(deviceInfo));
    }
    
    // Get current IP (always fetch fresh)
    const currentIP = await getDeviceIP();
    
    return {
      ...deviceInfo,
      currentIP,
    };
  } catch (error) {
    console.error('Error getting device info:', error);
    // Return minimal info on error
    return {
      id: 'unknown',
      type: 'Android Phone',
      model: 'unknown',
      os: 'unknown',
      osVersion: 'unknown',
      appVersion: '1.0.0',
      fingerprint: 'unknown',
      currentIP: 'unknown',
    };
  }
};

// Clear Device Info (for logout/reset)
export const clearDeviceInfo = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(STORAGE_KEYS.DEVICE_INFO);
  } catch (error) {
    console.error('Error clearing device info:', error);
  }
};

// Get Network Info
export const getNetworkInfo = async () => {
  try {
    const networkState = await Network.getNetworkStateAsync();
    return {
      isConnected: networkState.isConnected,
      isInternetReachable: networkState.isInternetReachable,
      type: networkState.type,
    };
  } catch (error) {
    console.error('Error getting network info:', error);
    return {
      isConnected: false,
      isInternetReachable: false,
      type: 'UNKNOWN',
    };
  }
};
