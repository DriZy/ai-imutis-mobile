import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import travelReducer from './slices/travelSlice';
import tourismReducer from './slices/tourismSlice';
import locationReducer from './slices/locationSlice';
import notificationReducer from './slices/notificationSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    travel: travelReducer,
    tourism: tourismReducer,
    location: locationReducer,
    notifications: notificationReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
