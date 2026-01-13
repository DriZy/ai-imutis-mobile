import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { TourismState, City, Attraction, SavedAttraction } from '../../types';

const initialState: TourismState = {
  cities: [],
  attractions: [],
  selectedCity: null,
  selectedAttraction: null,
  savedAttractions: [],
  isLoading: false,
  error: null,
};

const tourismSlice = createSlice({
  name: 'tourism',
  initialState,
  reducers: {
    setCities: (state, action: PayloadAction<City[]>) => {
      state.cities = action.payload;
      state.isLoading = false;
    },
    setAttractions: (state, action: PayloadAction<Attraction[]>) => {
      state.attractions = action.payload;
      state.isLoading = false;
    },
    setSelectedCity: (state, action: PayloadAction<City | null>) => {
      state.selectedCity = action.payload;
    },
    setSelectedAttraction: (state, action: PayloadAction<Attraction | null>) => {
      state.selectedAttraction = action.payload;
    },
    setSavedAttractions: (state, action: PayloadAction<SavedAttraction[]>) => {
      state.savedAttractions = action.payload;
    },
    addSavedAttraction: (state, action: PayloadAction<SavedAttraction>) => {
      state.savedAttractions.push(action.payload);
    },
    removeSavedAttraction: (state, action: PayloadAction<string>) => {
      state.savedAttractions = state.savedAttractions.filter(
        sa => sa.attractionId !== action.payload
      );
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.isLoading = false;
    },
  },
});

export const {
  setCities,
  setAttractions,
  setSelectedCity,
  setSelectedAttraction,
  setSavedAttractions,
  addSavedAttraction,
  removeSavedAttraction,
  setLoading,
  setError,
} = tourismSlice.actions;

export default tourismSlice.reducer;
