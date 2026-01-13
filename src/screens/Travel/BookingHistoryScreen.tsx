import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { theme } from '../../styles/theme';
import { Booking } from '../../types';
import travelAPI from '../../services/api/travelAPI';
import { formatCurrency, formatDateTime } from '../../utils/formatting';

type Props = NativeStackScreenProps<RootStackParamList, 'BookingHistory'>;

export default function BookingHistoryScreen({ navigation }: Props): React.JSX.Element {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'completed' | 'cancelled'>('all');

  useEffect(() => {
    loadBookings();
  }, []);

  useEffect(() => {
    applyFilter();
  }, [bookings, filter]);

  const loadBookings = async () => {
    try {
      setLoading(true);
      const response = await travelAPI.getBookingHistory();
      setBookings(response);
    } catch (error) {
      console.error('Error loading bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadBookings();
    setRefreshing(false);
  };

  const applyFilter = () => {
    const now = new Date();
    let results = bookings;

    switch (filter) {
      case 'upcoming':
        results = bookings.filter(b => new Date(b.trip.departureTime) > now && b.status !== 'cancelled');
        break;
      case 'completed':
        results = bookings.filter(b => new Date(b.trip.departureTime) <= now || b.status === 'completed');
        break;
      case 'cancelled':
        results = bookings.filter(b => b.status === 'cancelled');
        break;
      default:
        results = bookings;
    }

    setFilteredBookings(results);
  };

  const handleCancelBooking = async (bookingId: string) => {
    Alert.alert('Cancel Booking', 'Are you sure you want to cancel this booking?', [
      { text: 'No', onPress: () => {} },
      {
        text: 'Yes, Cancel',
        onPress: async () => {
          try {
            await travelAPI.cancelBooking(bookingId);
            setBookings(bookings.map(b => 
              b.id === bookingId ? { ...b, status: 'cancelled' as const } : b
            ));
            Alert.alert('Success', 'Booking cancelled successfully');
          } catch (error) {
            console.error('Error cancelling booking:', error);
            Alert.alert('Error', 'Failed to cancel booking');
          }
        },
        style: 'destructive',
      },
    ]);
  };

  const handleDownloadTicket = async (bookingId: string) => {
    try {
      const url = await travelAPI.downloadTicket(bookingId);
      Alert.alert('Success', 'Ticket downloaded successfully');
    } catch (error) {
      console.error('Error downloading ticket:', error);
      Alert.alert('Error', 'Failed to download ticket');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return theme.colors.status.success;
      case 'pending':
        return theme.colors.status.warning;
      case 'cancelled':
        return theme.colors.status.error;
      case 'completed':
        return theme.colors.primary.main;
      default:
        return theme.colors.neutral[500];
    }
  };

  const renderBooking = ({ item }: { item: Booking }) => (
    <TouchableOpacity
      style={styles.bookingCard}
      onPress={() => navigation.navigate('BookingDetails', { bookingId: item.id })}
    >
      <View style={styles.bookingHeader}>
        <View style={styles.routeInfo}>
          <Text style={styles.city}>{item.trip.route.origin.name}</Text>
          <Ionicons name="arrow-forward" size={16} color={theme.colors.neutral[400]} />
          <Text style={styles.city}>{item.trip.route.destination.name}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
          <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
            {item.status.toUpperCase()}
          </Text>
        </View>
      </View>

      <View style={styles.bookingDetails}>
        <View style={styles.detailItem}>
          <Ionicons name="calendar" size={16} color={theme.colors.primary.main} />
          <View style={styles.detailText}>
            <Text style={styles.detailLabel}>Date</Text>
            <Text style={styles.detailValue}>
              {formatDateTime(new Date(item.trip.departureTime)).split(' ')[0]}
            </Text>
          </View>
        </View>

        <View style={styles.detailItem}>
          <Ionicons name="time" size={16} color={theme.colors.primary.main} />
          <View style={styles.detailText}>
            <Text style={styles.detailLabel}>Departure</Text>
            <Text style={styles.detailValue}>
              {formatDateTime(new Date(item.trip.departureTime)).split(' ')[1]}
            </Text>
          </View>
        </View>

        <View style={styles.detailItem}>
          <Ionicons name="people" size={16} color={theme.colors.primary.main} />
          <View style={styles.detailText}>
            <Text style={styles.detailLabel}>Passengers</Text>
            <Text style={styles.detailValue}>{item.passengers.length}</Text>
          </View>
        </View>
      </View>

      <View style={styles.bookingFooter}>
        <View>
          <Text style={styles.priceLabel}>Total Amount</Text>
          <Text style={styles.price}>{formatCurrency(item.totalPrice)}</Text>
        </View>
        <View style={styles.actionButtons}>
          {item.status !== 'cancelled' && (
            <TouchableOpacity
              style={[styles.actionButton, styles.downloadButton]}
              onPress={() => handleDownloadTicket(item.id)}
            >
              <Ionicons name="download" size={16} color="#FFFFFF" />
            </TouchableOpacity>
          )}
          {item.status === 'confirmed' && new Date(item.trip.departureTime) > new Date() && (
            <TouchableOpacity
              style={[styles.actionButton, styles.cancelButton]}
              onPress={() => handleCancelBooking(item.id)}
            >
              <Ionicons name="close" size={16} color="#FFFFFF" />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Bookings</Text>
        <Text style={styles.headerSubtitle}>View and manage your trips</Text>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterTabs}>
        {(['all', 'upcoming', 'completed', 'cancelled'] as const).map(tab => (
          <TouchableOpacity
            key={tab}
            style={[styles.filterTab, filter === tab && styles.filterTabActive]}
            onPress={() => setFilter(tab)}
          >
            <Text style={[styles.filterTabText, filter === tab && styles.filterTabTextActive]}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Bookings List */}
      {loading ? (
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={theme.colors.primary.main} />
        </View>
      ) : (
        <FlatList
          data={filteredBookings}
          renderItem={renderBooking}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          onRefresh={handleRefresh}
          refreshing={refreshing}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="ticket" size={48} color={theme.colors.neutral[300]} />
              <Text style={styles.emptyText}>No bookings found</Text>
              <TouchableOpacity
                style={styles.searchButton}
                onPress={() => navigation.navigate('Travel')}
              >
                <Text style={styles.searchButtonText}>Search for Trips</Text>
              </TouchableOpacity>
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
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.lg,
    backgroundColor: theme.colors.primary.main,
  },
  headerTitle: {
    ...theme.typography.styles.heading2,
    color: '#FFFFFF',
    marginBottom: theme.spacing.xs,
  },
  headerSubtitle: {
    ...theme.typography.styles.body,
    color: theme.colors.primary.light,
  },
  filterTabs: {
    flexDirection: 'row',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    backgroundColor: '#FFFFFF',
    gap: theme.spacing.sm,
  },
  filterTab: {
    flex: 1,
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
    alignItems: 'center',
  },
  filterTabActive: {
    borderBottomColor: theme.colors.primary.main,
  },
  filterTabText: {
    ...theme.typography.styles.caption,
    color: theme.colors.text.secondary,
    fontWeight: '600',
  },
  filterTabTextActive: {
    color: theme.colors.primary.main,
  },
  listContent: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
  },
  bookingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.md,
    overflow: 'hidden',
    ...theme.shadows.md,
  },
  bookingHeader: {
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
  statusBadge: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.sm,
  },
  statusText: {
    ...theme.typography.styles.caption,
    fontWeight: '600',
  },
  bookingDetails: {
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
  bookingFooter: {
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
  actionButtons: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: theme.borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  downloadButton: {
    backgroundColor: theme.colors.primary.main,
  },
  cancelButton: {
    backgroundColor: theme.colors.status.error,
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
    paddingVertical: theme.spacing.xl,
  },
  emptyText: {
    ...theme.typography.styles.body,
    color: theme.colors.text.secondary,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  searchButton: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.primary.main,
    borderRadius: theme.borderRadius.lg,
  },
  searchButtonText: {
    ...theme.typography.styles.body,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
