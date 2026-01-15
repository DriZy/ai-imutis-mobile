import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView, Alert, Dimensions, Animated, PanResponder, Button } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { theme } from '../../styles/theme';
import { MAP_CONFIG } from '../../utils/constants';
import tourismAPI from '../../services/api/tourismAPI';
import travelAPI from '../../services/api/travelAPI';
import OpenStreetMap from '../../components/OpenStreetMap';
import type { Attraction, TravelSummary, TravelDetail } from '../../types';

const { height: screenHeight } = Dimensions.get('window');
const SHEET_HEIGHT = screenHeight * 0.7;
const PEEK_HEIGHT = 100;
const HALF_HEIGHT = screenHeight * 0.5;
const FULL_HEIGHT = screenHeight * 0.9;

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

export default function MapHomeScreen(): React.JSX.Element {
  const [loading, setLoading] = useState(true);
  const [permissionChecked, setPermissionChecked] = useState(false);
  const [attractions, setAttractions] = useState<Attraction[]>([]);
  const [routes, setRoutes] = useState<{ id: string; path: { latitude: number; longitude: number }[] }[]>([]);
  const pan = useRef(new Animated.ValueXY({ x: 0, y: SHEET_HEIGHT - PEEK_HEIGHT })).current;

  // Request location permissions
  const requestLocationPermissions = async () => {
    try {
      // Request foreground location permission
      const foregroundPermission = await Location.requestForegroundPermissionsAsync();
      if (foregroundPermission.status !== 'granted') {
        Alert.alert(
          'Location Permission',
          'Location permission is needed to show your position on the map',
          [{ text: 'OK' }]
        );
        setPermissionChecked(true);
        return;
      }

      // Request precise location permission (Android 12+)
      const accuracyPermission = await Location.requestBackgroundPermissionsAsync();
      if (accuracyPermission.status !== 'granted') {
        // This is optional, don't block the app
        console.log('Background location permission not granted');
      }

      setPermissionChecked(true);
    } catch (error) {
      console.error('Permission request error:', error);
      setPermissionChecked(true);
    }
  };

  // Check and request permissions on mount
  useEffect(() => {
    requestLocationPermissions();
  }, []);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (e, gestureState) => {
        const newY = Math.max(0, Math.min(SHEET_HEIGHT - PEEK_HEIGHT, gestureState.dy));
        pan.y.setValue(newY);
      },
      onPanResponderRelease: (e, gestureState) => {
        const currentY = gestureState.dy;
        const velocity = gestureState.vy;
        
        // Snap to peek state if swiped down or in lower half
        if (velocity > 0.5 || currentY > (SHEET_HEIGHT - PEEK_HEIGHT) * 0.5) {
          Animated.spring(pan, { 
            toValue: { x: 0, y: SHEET_HEIGHT - PEEK_HEIGHT }, 
            useNativeDriver: false,
            speed: 12,
            bounciness: 4,
          }).start();
        }
        // Snap to full open if swiped up strongly
        else if (velocity < -0.5) {
          Animated.spring(pan, { 
            toValue: { x: 0, y: 0 }, 
            useNativeDriver: false,
            speed: 12,
            bounciness: 4,
          }).start();
        }
        // Snap to half open if in middle
        else {
          Animated.spring(pan, { 
            toValue: { x: 0, y: SHEET_HEIGHT - HALF_HEIGHT }, 
            useNativeDriver: false,
            speed: 12,
            bounciness: 4,
          }).start();
        }
      },
    })
  ).current;

  useEffect(() => {
    const load = async () => {
      // Wait for permissions to be checked first
      if (!permissionChecked) {
        return;
      }

      try {
        setLoading(true);
        const cities = await tourismAPI.getCities();
        if (cities.length > 0) {
          const firstCity = cities[0];
          const cityAttractions = await tourismAPI.getAttractionsByCity(firstCity.id);
          setAttractions(cityAttractions.slice(0, 20));
        }
        const travels: TravelSummary[] = await travelAPI.listTravels();
        const sample = travels.slice(0, 5);
        const details: TravelDetail[] = await Promise.all(
          sample.map(t => travelAPI.getTripDetails(t.id).catch(() => null as unknown as TravelDetail))
        );
        const parsed = details
          .filter(d => d && d.route_geometry)
          .map(d => ({ id: d.id, path: parseLineString(String(d.route_geometry)) }))
          .filter(p => p.path.length >= 2);
        setRoutes(parsed);
      } catch (e) {
        console.error('Error loading map data', e);
        setAttractions([
          {
            id: 'mock-1',
            name: 'Douala Beach',
            description: 'Popular beach in Douala',
            location: { latitude: 4.0511, longitude: 9.7679 },
            city_id: 'city-1',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          {
            id: 'mock-2',
            name: 'Mount Cameroon',
            description: 'Scenic mountain viewpoint',
            location: { latitude: 4.2033, longitude: 9.0775 },
            city_id: 'city-1',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ]);
        setRoutes([
          {
            id: 'route-mock-1',
            path: [
              { latitude: 4.0511, longitude: 9.7679 },
              { latitude: 4.1, longitude: 9.8 },
              { latitude: 4.15, longitude: 9.85 },
            ],
          },
        ]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [permissionChecked]);

  const renderAttractionCard = ({ item }: { item: Attraction }) => (
    <View style={styles.cardContainer}>
      <View style={styles.card}>
        <Ionicons name="pin" size={24} color={theme.colors.primary.main} />
        <View style={styles.cardContent}>
          <Text style={styles.cardTitle}>{item.name}</Text>
          <Text style={styles.cardDesc} numberOfLines={2}>{item.description}</Text>
          {item.location && (
            <Text style={styles.cardLocation}>
              📍 {item.location.latitude.toFixed(4)}, {item.location.longitude.toFixed(4)}
            </Text>
          )}
        </View>
      </View>
    </View>
  );

  const renderTravelCard = ({ item }: { item: { id: string; path: { latitude: number; longitude: number }[] } }) => (
    <View style={styles.cardContainer}>
      <View style={styles.card}>
        <Ionicons name="bus" size={24} color={theme.colors.accent.info} />
        <View style={styles.cardContent}>
          <Text style={styles.cardTitle}>Travel Route {item.id}</Text>
          <Text style={styles.cardDesc}>{item.path.length} waypoints</Text>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {!permissionChecked ? (
        /* Permission Request Screen */
        <View style={styles.permissionContainer}>
          <View style={styles.permissionContent}>
            <Ionicons name="location" size={60} color={theme.colors.primary.main} />
            <Text style={styles.permissionTitle}>Location Access Needed</Text>
            <Text style={styles.permissionDescription}>
              We need your location to show your position on the map and provide accurate travel information.
            </Text>
            <View style={styles.permissionFeatures}>
              <View style={styles.featureRow}>
                <Ionicons name="pin" size={20} color={theme.colors.primary.main} />
                <Text style={styles.featureText}>Precise location for better tracking</Text>
              </View>
              <View style={styles.featureRow}>
                <Ionicons name="navigate" size={20} color={theme.colors.primary.main} />
                <Text style={styles.featureText}>Real-time navigation updates</Text>
              </View>
              <View style={styles.featureRow}>
                <Ionicons name="map" size={20} color={theme.colors.primary.main} />
                <Text style={styles.featureText}>Find attractions nearby</Text>
              </View>
            </View>
            <Button
              title="Enable Location"
              onPress={requestLocationPermissions}
              color={theme.colors.primary.main}
            />
          </View>
        </View>
      ) : (
        <>
          {/* Full screen map */}
          <View style={styles.mapContainer}>
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={theme.colors.primary.main} />
              </View>
            ) : (
              <OpenStreetMap
                centerLat={MAP_CONFIG.DEFAULT_LATITUDE}
                centerLng={MAP_CONFIG.DEFAULT_LONGITUDE}
                zoom={MAP_CONFIG.DEFAULT_ZOOM}
                markers={attractions.map(a => ({
                  id: a.id,
                  latitude: a.location?.latitude || MAP_CONFIG.DEFAULT_LATITUDE,
                  longitude: a.location?.longitude || MAP_CONFIG.DEFAULT_LONGITUDE,
                  title: a.name,
                  description: a.description,
                }))}
                routes={routes}
                height={screenHeight}
                onMarkerPress={(markerId) => {
                  const attraction = attractions.find(a => a.id === markerId);
                  if (attraction) {
                    Alert.alert(attraction.name, attraction.description);
                  }
                }}
              />
            )}
          </View>

          {/* Bottom sheet */}
          <Animated.View
            style={[
              styles.bottomSheet,
              {
                transform: [{ translateY: pan.y }],
              },
            ]}
            {...panResponder.panHandlers}
          >
            {/* Handle and header */}
            <View style={styles.bottomSheetHeader}>
              <View style={styles.handle} />
              <Text style={styles.headerTitle}>Explore</Text>
            </View>

            {/* Content */}
            <ScrollView style={styles.bottomSheetContent} showsVerticalScrollIndicator={false}>
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Popular Attractions ({attractions.length})</Text>
                {attractions.length > 0 ? (
                  attractions.map(a => (
                    <View key={a.id}>{renderAttractionCard({ item: a })}</View>
              ))
            ) : (
              <Text style={styles.emptyText}>No attractions found</Text>
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Available Routes ({routes.length})</Text>
            {routes.length > 0 ? (
              routes.map(r => (
                <View key={r.id}>{renderTravelCard({ item: r })}</View>
              ))
            ) : (
              <Text style={styles.emptyText}>No routes available</Text>
            )}
          </View>

          <View style={styles.spacer} />
        </ScrollView>
      </Animated.View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 24,
  },
  permissionContent: {
    alignItems: 'center',
    width: '100%',
  },
  permissionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.neutral.dark,
    marginTop: 20,
    marginBottom: 12,
    textAlign: 'center',
  },
  permissionDescription: {
    fontSize: 14,
    color: theme.colors.neutral.medium,
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 20,
  },
  permissionFeatures: {
    width: '100%',
    marginBottom: 32,
    gap: 12,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  featureText: {
    fontSize: 13,
    color: theme.colors.neutral.dark,
    flex: 1,
  },
  mapContainer: {
    ...StyleSheet.absoluteFillObject,
    height: screenHeight,
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: screenHeight * 0.7,
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
  },
  bottomSheetHeader: {
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#ccc',
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.neutral.dark,
  },
  bottomSheetContent: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    color: theme.colors.neutral.dark,
  },
  cardContainer: {
    marginBottom: 10,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 12,
    alignItems: 'flex-start',
    borderWidth: 1,
    borderColor: '#eee',
  },
  cardContent: {
    flex: 1,
    marginLeft: 12,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.neutral.dark,
    marginBottom: 4,
  },
  cardDesc: {
    fontSize: 12,
    color: theme.colors.neutral.medium,
    marginBottom: 4,
  },
  cardLocation: {
    fontSize: 11,
    color: theme.colors.primary.main,
    fontWeight: '500',
  },
  emptyText: {
    fontSize: 13,
    color: theme.colors.neutral.light,
    textAlign: 'center',
    paddingVertical: 20,
  },
  spacer: {
    height: 20,
  },
});
