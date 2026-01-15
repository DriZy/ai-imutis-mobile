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
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { theme } from '../../styles/theme';
import { TravelDetail } from '../../types';
import travelAPI from '../../services/api/travelAPI';
import { formatCurrency, formatTime } from '../../utils/formatting';
import { watchLocation } from '../../services/location/locationService';
import { MAP_CONFIG } from '../../utils/constants';
import OpenStreetMap from '../../components/OpenStreetMap';

type Props = NativeStackScreenProps<RootStackParamList, 'TravelDetails'>;

export default function TravelDetailsScreen({ route, navigation }: Props): React.JSX.Element {
  const { tripId } = route.params;
  const [detail, setDetail] = useState<TravelDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [userCoord, setUserCoord] = useState<{ latitude: number; longitude: number } | null>(null);
  const [pathCoords, setPathCoords] = useState<{ latitude: number; longitude: number }[]>([]);

  useEffect(() => {
    loadTripDetails();
  }, [tripId]);

  useEffect(() => {
    // Start tracking user location once screen mounts
    const stop = watchLocation('current-user', (loc) => {
      setUserCoord({ latitude: loc.latitude, longitude: loc.longitude });
    });
    return () => stop();
  }, []);

  const loadTripDetails = async () => {
    try {
      setLoading(true);
      const data = await travelAPI.getTripDetails(tripId);
      setDetail(data);
      if (data.route_geometry) {
        setPathCoords(parseLineString(String(data.route_geometry)));
      }
    } catch (error) {
      console.error('Error loading trip details:', error);
    } finally {
      setLoading(false);
    }
  };

  function parseLineString(line: string): { latitude: number; longitude: number }[] {
    const coords: { latitude: number; longitude: number }[] = [];
    const match = line.match(/LINESTRING\(([^)]+)\)/i);
    const body = match ? match[1] : line;
    body.split(',').forEach(pair => {
      const nums = pair.trim().split(/\s+/).map(Number);
      if (nums.length >= 2 && nums.every(n => !isNaN(n))) {
        coords.push({ latitude: nums[1], longitude: nums[0] });
      }
    });
    return coords;
  }

  if (loading || !detail) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={theme.colors.primary.main} />
        </View>
      </SafeAreaView>
    );
  }

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
                <Text style={styles.routeName}>{detail.origin}</Text>
              </View>
            </View>

            <View style={styles.routeLine} />

            <View style={styles.routePoint}>
              <View style={styles.routeMarker}>
                <Ionicons name="location" size={20} color={theme.colors.secondary.main} />
              </View>
              <View style={styles.routeInfo}>
                <Text style={styles.routeLabel}>To</Text>
                <Text style={styles.routeName}>{detail.destination}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Map */}
        <View style={styles.mapContainer}>
          <OpenStreetMap
            centerLat={pathCoords.length > 0 ? pathCoords[0].latitude : MAP_CONFIG.DEFAULT_LATITUDE}
            centerLng={pathCoords.length > 0 ? pathCoords[0].longitude : MAP_CONFIG.DEFAULT_LONGITUDE}
            zoom={13}
            markers={[
              {
                id: 'origin',
                latitude: pathCoords[0]?.latitude || MAP_CONFIG.DEFAULT_LATITUDE,
                longitude: pathCoords[0]?.longitude || MAP_CONFIG.DEFAULT_LONGITUDE,
                title: detail.origin,
                description: 'Departure',
                color: theme.colors.primary.main,
              },
              ...(pathCoords.length > 1 ? [{
                id: 'destination',
                latitude: pathCoords[pathCoords.length - 1].latitude,
                longitude: pathCoords[pathCoords.length - 1].longitude,
                title: detail.destination,
                description: 'Destination',
                color: theme.colors.secondary.main,
              }] : []),
            ]}
            routes={pathCoords.length >= 2 ? [{ id: 'route', path: pathCoords }] : []}
            height={300}
            showUserLocation={!!userCoord}
            userLocation={userCoord || undefined}
          />
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
              <Text style={styles.infoValue}>{new Date(detail.departure_time).toLocaleTimeString()}</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.infoRow}>
              <View style={styles.infoLeft}>
                <Ionicons name="hourglass" size={20} color={theme.colors.primary.main} />
                <Text style={styles.infoLabel}>Duration</Text>
              </View>
              <Text style={styles.infoValue}>~{Math.round((detail.duration_minutes || 0) / 60)} hours</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.infoRow}>
              <View style={styles.infoLeft}>
                <Ionicons name="timer" size={20} color={theme.colors.primary.main} />
                <Text style={styles.infoLabel}>Arrival</Text>
              </View>
              <Text style={styles.infoValue}>{new Date(detail.estimated_arrival).toLocaleTimeString()}</Text>
            </View>
          </View>
        </View>

        {/* Vehicle Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Vehicle Details</Text>
          
          <View style={styles.vehicleCard}>
            <View style={styles.vehicleHeader}>
              <View>
                <Text style={styles.vehicleType}>Vehicle</Text>
                <Text style={styles.vehicleReg}>Seats: {detail.available_seats}</Text>
              </View>
              <View style={styles.seatsInfo}>
                <Ionicons name="seat" size={24} color={theme.colors.primary.main} />
                <Text style={styles.seatsText}>{detail.available_seats}</Text>
              </View>
            </View>

            <View style={styles.vehicleDetails}>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Confidence</Text>
                <Text style={styles.detailValue}>{Math.round((detail.confidence || 0) * 100)}%</Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Distance</Text>
                <Text style={styles.detailValue}>{detail.distance_km ? `${detail.distance_km} km` : 'N/A'}</Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Price per Seat</Text>
                <Text style={styles.detailValue}>{detail.price_per_seat}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* AI Departure Prediction */}
        {/* Prediction section omitted; backend format differs */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>AI Departure Prediction</Text>
            
            <View style={styles.predictionCard}>
              <View style={styles.predictionIcon}>
                <Ionicons name="bulb" size={32} color="#FFB800" />
              </View>
              <View style={styles.predictionContent}>
                <Text style={styles.predictionTitle}>Estimated Departure</Text>
                <Text style={styles.predictionTime}>
                  {formatTime(new Date(trip.depturePrediction.estimatedDepartureTime))}
                </Text>
                <View style={styles.confidenceBar}>
                  <View
                    style={[
                      styles.confidenceFill,
                      { width: `${trip.depturePrediction.confidence * 100}%` },
                    ]}
                  />
                </View>
                <Text style={styles.confidenceText}>
                  {Math.round(trip.depturePrediction.confidence * 100)}% confidence
                </Text>
              </View>
            </View>

            <View style={styles.factorsContainer}>
              {Object.entries(trip.depturePrediction.factors).map(([key, value]) => (
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
