import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { LocationState, LocationData, DeviceInfo, DeviceSession } from '../../types';

const initialState: LocationState = {
  currentLocation: null,
  deviceInfo: null,
  sessions: [],
  isTrackingEnabled: false,
  error: null,
};

const locationSlice = createSlice({
  name: 'location',
  initialState,
  reducers: {
    setCurrentLocation: (state, action: PayloadAction<LocationData>) => {
      state.currentLocation = action.payload;
      state.error = null;
    },
    setDeviceInfo: (state, action: PayloadAction<DeviceInfo>) => {
      state.deviceInfo = action.payload;
    },
    setSessions: (state, action: PayloadAction<DeviceSession[]>) => {
      state.sessions = action.payload;
    },
    setTrackingEnabled: (state, action: PayloadAction<boolean>) => {
      state.isTrackingEnabled = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    clearLocation: (state) => {
      state.currentLocation = null;
    },
  },
});

export const {
  setCurrentLocation,
  setDeviceInfo,
  setSessions,
  setTrackingEnabled,
  setError,
  clearLocation,
} = locationSlice.actions;

export default locationSlice.reducer;
