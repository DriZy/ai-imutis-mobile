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
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: ['auth/setUser', 'travel/setSearchResults'],
        // Ignore these field paths in all actions
        ignoredActionPaths: ['meta.arg', 'payload.timestamp'],
        // Ignore these paths in the state
        ignoredPaths: ['travel.searchQuery.departureDate'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
