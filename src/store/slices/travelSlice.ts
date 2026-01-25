import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { TravelState, SearchQuery, Trip, Booking, Vehicle, RideSchedule } from '../../types';

const initialState: TravelState = {
  searchQuery: null,
  searchResults: [],
  selectedTrip: null,
  bookings: [],
  vehicles: [],
  rideSchedules: [],
  isLoading: false,
  error: null,
};

const travelSlice = createSlice({
  name: 'travel',
  initialState,
  reducers: {
    setSearchQuery: (state, action: PayloadAction<SearchQuery>) => {
      state.searchQuery = action.payload;
    },
    setSearchResults: (state, action: PayloadAction<Trip[]>) => {
      state.searchResults = action.payload;
      state.isLoading = false;
      state.error = null;
    },
    setSelectedTrip: (state, action: PayloadAction<Trip | null>) => {
      state.selectedTrip = action.payload;
    },
    setBookings: (state, action: PayloadAction<Booking[]>) => {
      state.bookings = action.payload;
    },
    addBooking: (state, action: PayloadAction<Booking>) => {
      state.bookings.unshift(action.payload);
    },
    updateBooking: (state, action: PayloadAction<Booking>) => {
      const index = state.bookings.findIndex(b => b.id === action.payload.id);
      if (index !== -1) {
        state.bookings[index] = action.payload;
      }
    },
    setVehicles: (state, action: PayloadAction<Vehicle[]>) => {
      state.vehicles = action.payload;
    },
    addVehicle: (state, action: PayloadAction<Vehicle>) => {
      state.vehicles.unshift(action.payload);
    },
    setRideSchedules: (state, action: PayloadAction<RideSchedule[]>) => {
      state.rideSchedules = action.payload;
    },
    addRideSchedule: (state, action: PayloadAction<RideSchedule>) => {
      state.rideSchedules.unshift(action.payload);
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.isLoading = false;
    },
    clearSearchResults: (state) => {
      state.searchResults = [];
      state.searchQuery = null;
    },
  },
});

export const {
  setSearchQuery,
  setSearchResults,
  setSelectedTrip,
  setBookings,
  addBooking,
  updateBooking,
  setVehicles,
  addVehicle,
  setRideSchedules,
  addRideSchedule,
  setLoading,
  setError,
  clearSearchResults,
} = travelSlice.actions;

export default travelSlice.reducer;
