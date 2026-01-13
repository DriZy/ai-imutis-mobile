import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { theme } from '../../styles/theme';
import { Trip } from '../../types';
import travelAPI from '../../services/api/travelAPI';
import { formatCurrency, formatTime } from '../../utils/formatting';

type Props = NativeStackScreenProps<RootStackParamList, 'TravelDetails'>;

export default function TravelDetailsScreen({ route, navigation }: Props): React.JSX.Element {
  const { tripId } = route.params;
  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTripDetails();
  }, [tripId]);

  const loadTripDetails = async () => {
    try {
      setLoading(true);
      const data = await travelAPI.getTripDetails(tripId);
      setTrip(data);
    } catch (error) {
      console.error('Error loading trip details:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !trip) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={theme.colors.primary.main} />
        </View>
      </SafeAreaView>
    );
  }

  const originCoords = trip.route.originCoordinates;
  const destCoords = trip.route.destinationCoordinates;

  const mapRegion = originCoords && destCoords ? {
    latitude: (originCoords.latitude + destCoords.latitude) / 2,
    longitude: (originCoords.longitude + destCoords.longitude) / 2,
    latitudeDelta: 0.5,
    longitudeDelta: 0.5,
  } : {
    latitude: trip.route.origin.coordinates.latitude,
    longitude: trip.route.origin.coordinates.longitude,
    latitudeDelta: 1,
    longitudeDelta: 1,
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={28} color={theme.colors.primary.main} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Trip Details</Text>
        </View>

        {/* Route Summary */}
        <View style={styles.section}>
          <View style={styles.routeContainer}>
            <View style={styles.routePoint}>
              <View style={styles.routeMarker}>
                <Ionicons name="location" size={20} color={theme.colors.primary.main} />
              </View>
              <View style={styles.routeInfo}>
                <Text style={styles.routeLabel}>From</Text>
                <Text style={styles.routeName}>{trip.route.origin.name}</Text>
              </View>
            </View>

            <View style={styles.routeLine} />

            <View style={styles.routePoint}>
              <View style={styles.routeMarker}>
                <Ionicons name="location" size={20} color={theme.colors.secondary.main} />
              </View>
              <View style={styles.routeInfo}>
                <Text style={styles.routeLabel}>To</Text>
                <Text style={styles.routeName}>{trip.route.destination.name}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Map */}
        <View style={styles.mapContainer}>
          <MapView style={styles.map} region={mapRegion} scrollEnabled={false}>
            {originCoords && (
              <Marker
                coordinate={originCoords as any}
                title={trip.route.origin.name}
                pinColor={theme.colors.primary.main}
              />
            )}
            {destCoords && (
              <Marker
                coordinate={destCoords as any}
                title={trip.route.destination.name}
                pinColor={theme.colors.secondary.main}
              />
            )}
            {originCoords && destCoords && (
              <Polyline
                coordinates={[originCoords as any, destCoords as any]}
                strokeColor={theme.colors.primary.main}
                strokeWidth={3}
              />
            )}
          </MapView>
        </View>

        {/* Trip Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Trip Information</Text>
          
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <View style={styles.infoLeft}>
                <Ionicons name="time" size={20} color={theme.colors.primary.main} />
                <Text style={styles.infoLabel}>Departure</Text>
              </View>
              <Text style={styles.infoValue}>{formatTime(new Date(trip.departureTime))}</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.infoRow}>
              <View style={styles.infoLeft}>
                <Ionicons name="hourglass" size={20} color={theme.colors.primary.main} />
                <Text style={styles.infoLabel}>Duration</Text>
              </View>
              <Text style={styles.infoValue}>~{trip.estimatedDuration} hours</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.infoRow}>
              <View style={styles.infoLeft}>
                <Ionicons name="timer" size={20} color={theme.colors.primary.main} />
                <Text style={styles.infoLabel}>Arrival</Text>
              </View>
              <Text style={styles.infoValue}>{formatTime(new Date(trip.estimatedArrivalTime))}</Text>
            </View>
          </View>
        </View>

        {/* Vehicle Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Vehicle Details</Text>
          
          <View style={styles.vehicleCard}>
            <View style={styles.vehicleHeader}>
              <View>
                <Text style={styles.vehicleType}>{trip.vehicleType.toUpperCase()}</Text>
                <Text style={styles.vehicleReg}>{trip.vehicleRegistration}</Text>
              </View>
              <View style={styles.seatsInfo}>
                <Ionicons name={'seat' as any} size={24} color={theme.colors.primary.main} />
                <Text style={styles.seatsText}>{trip.availableSeats}/{trip.totalSeats}</Text>
              </View>
            </View>

            <View style={styles.vehicleDetails}>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Driver</Text>
                <Text style={styles.detailValue}>{trip.driverName}</Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Rating</Text>
                <Text style={styles.detailValue}>
                  <Ionicons name="star" size={14} color="#FFB800" />
                  {' '}{trip.driverRating?.toFixed(1) || 'N/A'}
                </Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Price per Seat</Text>
                <Text style={styles.detailValue}>{formatCurrency(trip.pricePerSeat)}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* AI Departure Prediction */}
        {trip.departurePrediction && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>AI Departure Prediction</Text>
            
            <View style={styles.predictionCard}>
              <View style={styles.predictionIcon}>
                <Ionicons name="bulb" size={32} color="#FFB800" />
              </View>
              <View style={styles.predictionContent}>
                <Text style={styles.predictionTitle}>Estimated Departure</Text>
                <Text style={styles.predictionTime}>
                  {formatTime(new Date(trip.departurePrediction.estimatedDepartureTime))}
                </Text>
                <View style={styles.confidenceBar}>
                  <View
                    style={[
                      styles.confidenceFill,
                      { width: `${trip.departurePrediction.confidence * 100}%` },
                    ]}
                  />
                </View>
                <Text style={styles.confidenceText}>
                  {Math.round(trip.departurePrediction.confidence * 100)}% confidence
                </Text>
              </View>
            </View>

            <View style={styles.factorsContainer}>
              {Object.entries(trip.departurePrediction.factors).map(([key, value]) => (
                <View key={key} style={styles.factorItem}>
                  <Text style={styles.factorLabel}>{key.replace(/([A-Z])/g, ' $1').trim()}</Text>
                  <Text style={styles.factorValue}>{value}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Real-time Traffic */}
        {trip.currentTraffic && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Current Traffic</Text>
            
            <View style={[
              styles.trafficCard,
              { backgroundColor: getTrafficColor(trip.currentTraffic.status) + '20' }
            ]}>
              <Ionicons
                name="warning"
                size={24}
                color={getTrafficColor(trip.currentTraffic.status)}
              />
              <View style={styles.trafficContent}>
                <Text style={styles.trafficStatus}>{trip.currentTraffic.status.toUpperCase()}</Text>
                <Text style={styles.trafficDescription}>
                  {trip.currentTraffic.description || 'Monitor route conditions'}
                </Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Book Button */}
      <View style={styles.actionBar}>
        <TouchableOpacity
          style={styles.bookButton}
          onPress={() => navigation.navigate('Booking', { tripId: trip.id })}
        >
          <Ionicons name="ticket" size={20} color="#FFFFFF" />
          <Text style={styles.bookButtonText}>Book Now</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.default,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.neutral[200],
  },
  headerTitle: {
    ...theme.typography.styles.heading2,
    color: theme.colors.text.primary,
    marginLeft: theme.spacing.md,
    flex: 1,
  },
  section: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.lg,
  },
  sectionTitle: {
    ...theme.typography.styles.heading3,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
  },
  routeContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    ...theme.shadows.md,
  },
  routePoint: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  routeMarker: {
    width: 40,
    height: 40,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.primary.light + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  routeInfo: {
    marginLeft: theme.spacing.md,
    flex: 1,
  },
  routeLabel: {
    ...theme.typography.styles.caption,
    color: theme.colors.text.secondary,
  },
  routeName: {
    ...theme.typography.styles.body,
    fontWeight: '700',
    color: theme.colors.text.primary,
  },
  routeLine: {
    width: 2,
    height: 40,
    backgroundColor: theme.colors.neutral[300],
    marginLeft: 18,
    marginVertical: theme.spacing.sm,
  },
  mapContainer: {
    marginHorizontal: theme.spacing.md,
    marginVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
  },
  map: {
    width: '100%',
    height: 250,
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    ...theme.shadows.md,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
  },
  infoLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoLabel: {
    ...theme.typography.styles.bodySmall,
    color: theme.colors.text.secondary,
    marginLeft: theme.spacing.md,
  },
  infoValue: {
    ...theme.typography.styles.body,
    fontWeight: '700',
    color: theme.colors.text.primary,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.neutral[200],
  },
  vehicleCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
    ...theme.shadows.md,
  },
  vehicleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: theme.colors.primary.light + '10',
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.neutral[200],
  },
  vehicleType: {
    ...theme.typography.styles.heading3,
    color: theme.colors.text.primary,
  },
  vehicleReg: {
    ...theme.typography.styles.bodySmall,
    color: theme.colors.text.secondary,
  },
  seatsInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  seatsText: {
    ...theme.typography.styles.body,
    fontWeight: '700',
    color: theme.colors.text.primary,
  },
  vehicleDetails: {
    padding: theme.spacing.md,
  },
  detailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
  },
  detailLabel: {
    ...theme.typography.styles.bodySmall,
    color: theme.colors.text.secondary,
  },
  detailValue: {
    ...theme.typography.styles.body,
    fontWeight: '600',
    color: theme.colors.text.primary,
  },
  predictionCard: {
    backgroundColor: '#FEF3C7',
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  predictionIcon: {
    marginRight: theme.spacing.md,
  },
  predictionContent: {
    flex: 1,
  },
  predictionTitle: {
    ...theme.typography.styles.bodySmall,
    color: '#92400E',
  },
  predictionTime: {
    ...theme.typography.styles.heading3,
    color: '#92400E',
    marginVertical: theme.spacing.xs,
  },
  confidenceBar: {
    height: 4,
    backgroundColor: '#E5D68D',
    borderRadius: 2,
    marginVertical: theme.spacing.sm,
    overflow: 'hidden',
  },
  confidenceFill: {
    height: '100%',
    backgroundColor: '#FFB800',
  },
  confidenceText: {
    ...theme.typography.styles.caption,
    color: '#92400E',
  },
  factorsContainer: {
    gap: theme.spacing.sm,
  },
  factorItem: {
    backgroundColor: '#FFFFFF',
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
  },
  factorLabel: {
    ...theme.typography.styles.caption,
    color: theme.colors.text.secondary,
    marginBottom: 4,
  },
  factorValue: {
    ...theme.typography.styles.bodySmall,
    fontWeight: '600',
    color: theme.colors.text.primary,
  },
  trafficCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.md,
  },
  trafficContent: {
    marginLeft: theme.spacing.md,
    flex: 1,
  },
  trafficStatus: {
    ...theme.typography.styles.body,
    fontWeight: '700',
    color: theme.colors.text.primary,
  },
  trafficDescription: {
    ...theme.typography.styles.bodySmall,
    color: theme.colors.text.secondary,
  },
  actionBar: {
    padding: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.neutral[200],
  },
  bookButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary.main,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    gap: theme.spacing.sm,
  },
  bookButtonText: {
    ...theme.typography.styles.body,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
