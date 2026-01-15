import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { theme } from '../../styles/theme';
import { TravelSummary, SearchQuery } from '../../types';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import travelAPI from '../../services/api/travelAPI';

type Props = NativeStackScreenProps<RootStackParamList, 'TravelResults'>;

export default function TravelResultsScreen({ route, navigation }: Props): React.JSX.Element {
  const searchQuery = useSelector((state: RootState) => state.travel.searchQuery);
  const [trips, setTrips] = useState<TravelSummary[]>([]);
  const [filteredTrips, setFilteredTrips] = useState<TravelSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [sortBy, setSortBy] = useState<'time' | 'price' | 'rating'>('time');

  useEffect(() => {
    if (searchQuery) {
      loadTrips(searchQuery);
    }
  }, [searchQuery]);

  useEffect(() => {
    applyFiltersAndSort();
  }, [trips, sortBy]);

  const loadTrips = async (query: SearchQuery) => {
    try {
      setLoading(true);
      const results = await travelAPI.searchTrips(query);
      setTrips(results);
    } catch (error) {
      console.error('Error loading trips:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    if (searchQuery) {
      await loadTrips(searchQuery);
    }
    setRefreshing(false);
  };

  const applyFiltersAndSort = () => {
    let results = [...trips];

    switch (sortBy) {
      case 'price':
        results.sort((a, b) => a.price_per_seat - b.price_per_seat);
        break;
      case 'rating':
        // No rating in summary; keep current order
        break;
      case 'time':
      default:
        results.sort((a, b) => new Date(a.departure_time).getTime() - new Date(b.departure_time).getTime());
    }

    setFilteredTrips(results);
  };

  const renderTripCard = ({ item }: { item: TravelSummary }) => (
    <TouchableOpacity
      style={styles.tripCard}
      onPress={() => navigation.navigate('TravelDetails', { tripId: item.id })}
    >
      <View style={styles.tripHeader}>
        <View style={styles.routeInfo}>
          <Text style={styles.city}>{item.origin}</Text>
          <Ionicons name="arrow-forward" size={16} color={theme.colors.neutral[400]} />
          <Text style={styles.city}>{item.destination}</Text>
        </View>
      </View>

      <View style={styles.tripDetails}>
        <View style={styles.detailItem}>
          <Ionicons name="time" size={16} color={theme.colors.primary.main} />
          <View style={styles.detailText}>
            <Text style={styles.detailLabel}>Departure</Text>
            <Text style={styles.detailValue}>{new Date(item.departure_time).toLocaleTimeString()}</Text>
          </View>
        </View>

        <View style={styles.detailItem}>
          <Ionicons name="hourglass" size={16} color={theme.colors.primary.main} />
          <View style={styles.detailText}>
            <Text style={styles.detailLabel}>Arrival</Text>
            <Text style={styles.detailValue}>{new Date(item.estimated_arrival).toLocaleTimeString()}</Text>
          </View>
        </View>

        <View style={styles.detailItem}>
          <Ionicons name="car" size={16} color={theme.colors.primary.main} />
          <View style={styles.detailText}>
            <Text style={styles.detailLabel}>Seats</Text>
            <Text style={styles.detailValue}>{item.available_seats} seats</Text>
          </View>
        </View>
      </View>

      <View style={styles.tripFooter}>
        <View>
          <Text style={styles.priceLabel}>Price per seat</Text>
          <Text style={styles.price}>{item.price_per_seat}</Text>
        </View>
        <TouchableOpacity style={styles.selectButton}>
          <Text style={styles.selectButtonText}>Select</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  if (!searchQuery) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <Text style={styles.emptyText}>No search query.</Text>
        </View>
      </SafeAreaView>
    );
  }

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

      {loading ? (
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={theme.colors.primary.main} />
        </View>
      ) : (
        <FlatList
          data={filteredTrips}
          renderItem={renderTripCard}
          keyExtractor={(item) => item.id}
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
