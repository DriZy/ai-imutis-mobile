import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Segmented,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { theme } from '../../styles/theme';
import { Trip } from '../../types';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import travelAPI from '../../services/api/travelAPI';
import { formatCurrency, formatTime } from '../../utils/formatting';

type Props = NativeStackScreenProps<RootStackParamList, 'TravelResults'>;

export default function TravelResultsScreen({ route, navigation }: Props): React.JSX.Element {
  const { searchQuery } = route.params;
  const [trips, setTrips] = useState<Trip[]>([]);
  const [filteredTrips, setFilteredTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [sortBy, setSortBy] = useState<'time' | 'price' | 'rating'>('time');
  const [filterVehicle, setFilterVehicle] = useState<string | null>(null);

  useEffect(() => {
    loadTrips();
  }, [searchQuery]);

  useEffect(() => {
    applyFiltersAndSort();
  }, [trips, sortBy, filterVehicle]);

  const loadTrips = async () => {
    try {
      setLoading(true);
      const response = await travelAPI.searchTrips(searchQuery);
      setTrips(response.trips);
    } catch (error) {
      console.error('Error loading trips:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadTrips();
    setRefreshing(false);
  };

  const applyFiltersAndSort = () => {
    let results = [...trips];

    // Apply vehicle filter
    if (filterVehicle) {
      results = results.filter(t => t.vehicleType === filterVehicle);
    }

    // Apply sorting
    switch (sortBy) {
      case 'price':
        results.sort((a, b) => a.pricePerSeat - b.pricePerSeat);
        break;
      case 'rating':
        results.sort((a, b) => (b.driverRating || 0) - (a.driverRating || 0));
        break;
      case 'time':
      default:
        results.sort((a, b) => new Date(a.departureTime).getTime() - new Date(b.departureTime).getTime());
    }

    setFilteredTrips(results);
  };

  const renderTripCard = ({ item }: { item: Trip }) => (
    <TouchableOpacity
      style={styles.tripCard}
      onPress={() => navigation.navigate('TravelDetails', { tripId: item.id })}
    >
      <View style={styles.tripHeader}>
        <View style={styles.routeInfo}>
          <Text style={styles.city}>{item.route.origin}</Text>
          <Ionicons name="arrow-forward" size={16} color={theme.colors.neutral[400]} />
          <Text style={styles.city}>{item.route.destination}</Text>
        </View>
        {item.depturePrediction && (
          <View style={styles.predictionBadge}>
            <Ionicons name="bulb" size={14} color="#FFB800" />
            <Text style={styles.predictionText}>AI Prediction</Text>
          </View>
        )}
      </View>

      <View style={styles.tripDetails}>
        <View style={styles.detailItem}>
          <Ionicons name="time" size={16} color={theme.colors.primary.main} />
          <View style={styles.detailText}>
            <Text style={styles.detailLabel}>Departure</Text>
            <Text style={styles.detailValue}>{formatTime(new Date(item.departureTime))}</Text>
          </View>
        </View>

        <View style={styles.detailItem}>
          <Ionicons name="hourglass" size={16} color={theme.colors.primary.main} />
          <View style={styles.detailText}>
            <Text style={styles.detailLabel}>Duration</Text>
            <Text style={styles.detailValue}>~{item.estimatedDuration} hrs</Text>
          </View>
        </View>

        <View style={styles.detailItem}>
          <Ionicons name="car" size={16} color={theme.colors.primary.main} />
          <View style={styles.detailText}>
            <Text style={styles.detailLabel}>{item.vehicleType}</Text>
            <Text style={styles.detailValue}>{item.availableSeats}/{item.totalSeats} seats</Text>
          </View>
        </View>
      </View>

      <View style={styles.tripFooter}>
        <View>
          <Text style={styles.priceLabel}>Price per seat</Text>
          <Text style={styles.price}>{formatCurrency(item.pricePerSeat)}</Text>
        </View>
        <TouchableOpacity style={styles.selectButton}>
          <Text style={styles.selectButtonText}>Select</Text>
        </TouchableOpacity>
      </View>

      {item.currentTraffic && (
        <View style={[styles.trafficAlert, { backgroundColor: getTrafficColor(item.currentTraffic.status) }]}>
          <Ionicons name="warning" size={14} color="#FFFFFF" />
          <Text style={styles.trafficText}>Traffic: {item.currentTraffic.status}</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  const getTrafficColor = (status: string) => {
    switch (status) {
      case 'light':
        return theme.colors.status.success;
      case 'moderate':
        return theme.colors.status.warning;
      case 'heavy':
        return theme.colors.status.error;
      default:
        return theme.colors.neutral[500];
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={28} color={theme.colors.primary.main} />
        </TouchableOpacity>
        <View style={styles.headerText}>
          <Text style={styles.headerTitle}>Available Trips</Text>
          <Text style={styles.headerSubtitle}>
            {`${searchQuery.origin.name} → ${searchQuery.destination.name}`}
          </Text>
        </View>
      </View>

      {/* Filters */}
      <View style={styles.filterBar}>
        <Text style={styles.filterLabel}>Sort by:</Text>
        <View style={styles.sortButtons}>
          {(['time', 'price', 'rating'] as const).map(option => (
            <TouchableOpacity
              key={option}
              style={[
                styles.sortButton,
                sortBy === option && styles.sortButtonActive,
              ]}
              onPress={() => setSortBy(option)}
            >
              <Text
                style={[
                  styles.sortButtonText,
                  sortBy === option && styles.sortButtonTextActive,
                ]}
              >
                {option.charAt(0).toUpperCase() + option.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Vehicle Filter */}
      <View style={styles.vehicleFilter}>
        {['minibus', 'bus', 'taxi'].map(vehicle => (
          <TouchableOpacity
            key={vehicle}
            style={[
              styles.vehicleTag,
              filterVehicle === vehicle && styles.vehicleTagActive,
            ]}
            onPress={() => setFilterVehicle(filterVehicle === vehicle ? null : vehicle)}
          >
            <Text
              style={[
                styles.vehicleTagText,
                filterVehicle === vehicle && styles.vehicleTagTextActive,
              ]}
            >
              {vehicle.charAt(0).toUpperCase() + vehicle.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Trips List */}
      {loading ? (
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={theme.colors.primary.main} />
        </View>
      ) : (
        <FlatList
          data={filteredTrips}
          renderItem={renderTripCard}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          onRefresh={handleRefresh}
          refreshing={refreshing}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="search" size={48} color={theme.colors.neutral[300]} />
              <Text style={styles.emptyText}>No trips found</Text>
              <Text style={styles.emptySubtext}>Try adjusting your search filters</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.default,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.neutral[200],
  },
  headerText: {
    flex: 1,
    marginLeft: theme.spacing.md,
  },
  headerTitle: {
    ...theme.typography.styles.heading2,
    color: theme.colors.text.primary,
  },
  headerSubtitle: {
    ...theme.typography.styles.bodySmall,
    color: theme.colors.text.secondary,
  },
  filterBar: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.neutral[200],
  },
  filterLabel: {
    ...theme.typography.styles.bodySmall,
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.sm,
  },
  sortButtons: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  sortButton: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.neutral[100],
    borderWidth: 1,
    borderColor: theme.colors.neutral[300],
  },
  sortButtonActive: {
    backgroundColor: theme.colors.primary.main,
    borderColor: theme.colors.primary.main,
  },
  sortButtonText: {
    ...theme.typography.styles.caption,
    color: theme.colors.text.primary,
    fontWeight: '600',
  },
  sortButtonTextActive: {
    color: '#FFFFFF',
  },
  vehicleFilter: {
    flexDirection: 'row',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    gap: theme.spacing.sm,
  },
  vehicleTag: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.neutral[100],
    borderWidth: 1,
    borderColor: theme.colors.neutral[300],
  },
  vehicleTagActive: {
    backgroundColor: theme.colors.secondary.main,
    borderColor: theme.colors.secondary.main,
  },
  vehicleTagText: {
    ...theme.typography.styles.caption,
    color: theme.colors.text.primary,
    fontWeight: '600',
  },
  vehicleTagTextActive: {
    color: '#FFFFFF',
  },
  listContent: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
  },
  tripCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.md,
    overflow: 'hidden',
    ...theme.shadows.md,
  },
  tripHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  routeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  city: {
    ...theme.typography.styles.body,
    fontWeight: '700',
    color: theme.colors.text.primary,
  },
  predictionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.sm,
    gap: 4,
  },
  predictionText: {
    ...theme.typography.styles.caption,
    color: '#92400E',
    fontWeight: '600',
  },
  tripDetails: {
    backgroundColor: theme.colors.background.paper,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    marginLeft: theme.spacing.md,
    flex: 1,
  },
  detailLabel: {
    ...theme.typography.styles.caption,
    color: theme.colors.text.secondary,
  },
  detailValue: {
    ...theme.typography.styles.bodySmall,
    fontWeight: '600',
    color: theme.colors.text.primary,
  },
  tripFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.neutral[200],
  },
  priceLabel: {
    ...theme.typography.styles.caption,
    color: theme.colors.text.secondary,
  },
  price: {
    ...theme.typography.styles.heading3,
    color: theme.colors.primary.main,
  },
  selectButton: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.primary.main,
    borderRadius: theme.borderRadius.lg,
  },
  selectButtonText: {
    ...theme.typography.styles.bodySmall,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  trafficAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    gap: theme.spacing.sm,
  },
  trafficText: {
    ...theme.typography.styles.caption,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    ...theme.typography.styles.heading3,
    color: theme.colors.text.primary,
    marginTop: theme.spacing.md,
  },
  emptySubtext: {
    ...theme.typography.styles.bodySmall,
    color: theme.colors.text.secondary,
    marginTop: theme.spacing.sm,
  },
});
