import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { theme } from '../../styles/theme';
import { City, SearchQuery } from '../../types';
import { useDispatch } from 'react-redux';
import { setSearchQuery, setLoading } from '../../store/slices/travelSlice';
import travelAPI from '../../services/api/travelAPI';
import { formatDate } from '../../utils/dateTime';

type Props = NativeStackScreenProps<RootStackParamList, 'TravelSearch'>;

export default function SearchScreen({ navigation }: Props): React.JSX.Element {
  const dispatch = useDispatch();
  const [origin, setOrigin] = useState<City | null>(null);
  const [destination, setDestination] = useState<City | null>(null);
  const [departureDate, setDepartureDate] = useState<Date>(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [passengers, setPassengers] = useState<number>(1);
  const [error, setError] = useState<string>('');

  const handleSearch = async () => {
    setError('');

    if (!origin || !destination) {
      setError('Please select both origin and destination');
      return;
    }

    if (origin.id === destination.id) {
      setError('Origin and destination cannot be the same');
      return;
    }

    if (passengers < 1 || passengers > 10) {
      setError('Number of passengers must be between 1 and 10');
      return;
    }

    const query: SearchQuery = {
      origin,
      destination,
      departureDate,
      passengers,
    };

    try {
      dispatch(setLoading(true));
      dispatch(setSearchQuery(query));
      
      // Navigate to results screen immediately while loading
      navigation.navigate('TravelResults');
      
      // API call will be handled in TravelResults screen
    } catch (err) {
      setError('Failed to search trips. Please try again.');
      dispatch(setLoading(false));
    }
  };

  const handleSwapLocations = () => {
    const temp = origin;
    setOrigin(destination);
    setDestination(temp);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Search Travel</Text>
          <Text style={styles.headerSubtitle}>Find your next journey</Text>
        </View>

        {/* Origin/Destination Section */}
        <View style={styles.locationSection}>
          {/* Origin */}
          <TouchableOpacity
            style={styles.locationInput}
            onPress={() => navigation.navigate('CityPicker', { type: 'origin', onSelect: setOrigin })}
          >
            <Ionicons name="location" size={24} color={theme.colors.primary.main} />
            <View style={styles.locationTextContainer}>
              <Text style={styles.locationLabel}>From</Text>
              <Text style={styles.locationValue}>
                {origin ? origin.name : 'Select origin city'}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.colors.neutral[400]} />
          </TouchableOpacity>

          {/* Swap Button */}
          <TouchableOpacity style={styles.swapButton} onPress={handleSwapLocations}>
            <Ionicons name="swap-vertical" size={24} color={theme.colors.primary.main} />
          </TouchableOpacity>

          {/* Destination */}
          <TouchableOpacity
            style={styles.locationInput}
            onPress={() => navigation.navigate('CityPicker', { type: 'destination', onSelect: setDestination })}
          >
            <Ionicons name="location" size={24} color={theme.colors.secondary.main} />
            <View style={styles.locationTextContainer}>
              <Text style={styles.locationLabel}>To</Text>
              <Text style={styles.locationValue}>
                {destination ? destination.name : 'Select destination city'}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.colors.neutral[400]} />
          </TouchableOpacity>
        </View>

        {/* Date Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Departure Date</Text>
          <TouchableOpacity
            style={styles.dateInput}
            onPress={() => setShowDatePicker(true)}
          >
            <Ionicons name="calendar" size={24} color={theme.colors.primary.main} />
            <Text style={styles.dateText}>{formatDate(departureDate)}</Text>
            <Ionicons name="chevron-forward" size={20} color={theme.colors.neutral[400]} />
          </TouchableOpacity>

          {showDatePicker && (
            <DateTimePicker
              value={departureDate}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              minimumDate={new Date()}
              onChange={(event, selectedDate) => {
                setShowDatePicker(Platform.OS === 'ios');
                if (selectedDate) {
                  setDepartureDate(selectedDate);
                }
              }}
            />
          )}
        </View>

        {/* Passengers */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Passengers</Text>
          <View style={styles.passengerControl}>
            <TouchableOpacity
              style={[styles.passengerButton, passengers <= 1 && styles.passengerButtonDisabled]}
              onPress={() => passengers > 1 && setPassengers(passengers - 1)}
              disabled={passengers <= 1}
            >
              <Ionicons name="remove" size={24} color={theme.colors.primary.main} />
            </TouchableOpacity>
            
            <Text style={styles.passengerCount}>{passengers}</Text>
            
            <TouchableOpacity
              style={[styles.passengerButton, passengers >= 10 && styles.passengerButtonDisabled]}
              onPress={() => passengers < 10 && setPassengers(passengers + 1)}
              disabled={passengers >= 10}
            >
              <Ionicons name="add" size={24} color={theme.colors.primary.main} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Error Message */}
        {error ? (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle" size={20} color={theme.colors.status.error} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        {/* Search Button */}
        <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
          <Ionicons name="search" size={24} color="#FFFFFF" />
          <Text style={styles.searchButtonText}>Search Trips</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.default,
  },
  scrollContent: {
    padding: theme.spacing.md,
  },
  header: {
    marginBottom: theme.spacing.xl,
  },
  headerTitle: {
    ...theme.typography.styles.heading1,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  headerSubtitle: {
    ...theme.typography.styles.body,
    color: theme.colors.text.secondary,
  },
  locationSection: {
    marginBottom: theme.spacing.lg,
  },
  locationInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background.paper,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.sm,
    ...theme.shadows.md,
  },
  locationTextContainer: {
    flex: 1,
    marginLeft: theme.spacing.md,
  },
  locationLabel: {
    ...theme.typography.styles.caption,
    color: theme.colors.text.secondary,
    marginBottom: 2,
  },
  locationValue: {
    ...theme.typography.styles.body,
    color: theme.colors.text.primary,
  },
  swapButton: {
    alignSelf: 'center',
    padding: theme.spacing.sm,
    marginVertical: -theme.spacing.sm,
    zIndex: 1,
  },
  section: {
    marginBottom: theme.spacing.lg,
  },
  sectionLabel: {
    ...theme.typography.styles.bodySmall,
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.sm,
  },
  dateInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background.paper,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    ...theme.shadows.md,
  },
  dateText: {
    ...theme.typography.styles.body,
    color: theme.colors.text.primary,
    flex: 1,
    marginLeft: theme.spacing.md,
  },
  passengerControl: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.background.paper,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    ...theme.shadows.md,
  },
  passengerButton: {
    width: 44,
    height: 44,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.primary.light,
    alignItems: 'center',
    justifyContent: 'center',
  },
  passengerButtonDisabled: {
    backgroundColor: theme.colors.neutral[200],
    opacity: 0.5,
  },
  passengerCount: {
    ...theme.typography.styles.heading2,
    color: theme.colors.text.primary,
    marginHorizontal: theme.spacing.xl,
    minWidth: 40,
    textAlign: 'center',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.status.error + '20',
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.lg,
  },
  errorText: {
    ...theme.typography.styles.bodySmall,
    color: theme.colors.status.error,
    marginLeft: theme.spacing.sm,
    flex: 1,
  },
  searchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary.main,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    ...theme.shadows.lg,
  },
  searchButtonText: {
    ...theme.typography.styles.body,
    fontWeight: '700',
    color: '#FFFFFF',
    marginLeft: theme.spacing.sm,
  },
});
