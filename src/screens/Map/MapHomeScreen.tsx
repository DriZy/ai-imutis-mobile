import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView, Alert, Dimensions, Animated, PanResponder, TouchableOpacity } from 'react-native';
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

  const requestLocationPermissions = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      setPermissionChecked(true);
      if (status !== 'granted') Alert.alert('Permission Denied', 'Location access is required.');
    } catch (error) {
      setPermissionChecked(true);
    }
  };

  useEffect(() => { requestLocationPermissions(); }, []);

  // UPDATE: Logic to snap sheet to specific positions
  const snapTo = (value: number) => {
    Animated.spring(pan, {
      toValue: { x: 0, y: value },
      useNativeDriver: false,
      friction: 8,
    }).start();
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (e, gestureState) => {
        const newY = Math.max(0, Math.min(SHEET_HEIGHT - PEEK_HEIGHT, gestureState.dy));
        pan.y.setValue(newY);
      },
      onPanResponderRelease: (e, gestureState) => {
        if (gestureState.vy > 0.5 || gestureState.dy > SHEET_HEIGHT / 2) {
          snapTo(SHEET_HEIGHT - PEEK_HEIGHT);
        } else {
          snapTo(0);
        }
      },
    })
  ).current;

  useEffect(() => {
    const loadData = async () => {
      if (!permissionChecked) return;
      try {
        setLoading(true);
        const cities = await tourismAPI.getCities();
        if (cities.length > 0) {
          const cityAttractions = await tourismAPI.getAttractionsByCity(cities[0].id);
          setAttractions(cityAttractions.slice(0, 20));
        }
        const travels = await travelAPI.listTravels();
        const details = await Promise.all(
          travels.slice(0, 5).map(t => travelAPI.getTripDetails(t.id).catch(() => null))
        );
        const parsed = details
          .filter((d): d is TravelDetail => !!d && !!d.route_geometry)
          .map(d => ({ id: d.id, path: parseLineString(String(d.route_geometry)) }));
        setRoutes(parsed);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [permissionChecked]);

  // UPDATE: Handle marker interaction
  const handleMarkerPress = (markerId: string) => {
    const selected = attractions.find(a => a.id === markerId);
    if (selected) {
      snapTo(0); // Open sheet to show details
      Alert.alert(selected.name, selected.description);
    }
  };

  const renderAttractionCard = ({ item }: { item: Attraction }) => (
    <TouchableOpacity
      style={styles.cardContainer}
      onPress={() => Alert.alert(item.name, item.description)}
    >
      <View style={styles.card}>
        <Ionicons name="pin" size={24} color={theme.colors.primary.main} />
        <View style={styles.cardContent}>
          <Text style={styles.cardTitle}>{item.name}</Text>
          <Text style={styles.cardDesc} numberOfLines={2}>{item.description}</Text>
          {item.coordinates && (
            <Text style={styles.cardLocation}>
              📍 {item.coordinates.latitude.toFixed(4)}, {item.coordinates.longitude.toFixed(4)}
            </Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
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
              latitude: a.coordinates?.latitude || MAP_CONFIG.DEFAULT_LATITUDE,
              longitude: a.coordinates?.longitude || MAP_CONFIG.DEFAULT_LONGITUDE,
              title: a.name,
              description: a.description,
            }))}
            routes={routes}
            height={screenHeight}
            onMarkerPress={handleMarkerPress} // UPDATE: Pass the handler
          />
        )}
      </View>

      <Animated.View style={[styles.bottomSheet, { transform: [{ translateY: pan.y }] }]} {...panResponder.panHandlers}>
        <View style={styles.bottomSheetHeader}>
          <View style={styles.handle} />
        </View>
        <ScrollView style={styles.bottomSheetContent}>
          <Text style={styles.sectionHeader}>Nearby Attractions</Text>
          {attractions.length > 0 ? (
            attractions.map(a => <View key={a.id}>{renderAttractionCard({ item: a })}</View>)
          ) : (
            <Text style={styles.emptyText}>No attractions found in this area.</Text>
          )}
        </ScrollView>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  mapContainer: { ...StyleSheet.absoluteFillObject },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: SHEET_HEIGHT,
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  bottomSheetHeader: { alignItems: 'center', paddingVertical: 12 },
  handle: { width: 40, height: 4, borderRadius: 2, backgroundColor: '#ccc' },
  bottomSheetContent: { padding: 16 },
  sectionHeader: { fontSize: 18, fontWeight: '700', marginBottom: 15, color: theme.colors.neutral[900] },
  cardContainer: { marginBottom: 10 },
  card: { flexDirection: 'row', backgroundColor: '#f9f9f9', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: '#eee' },
  cardContent: { flex: 1, marginLeft: 12 },
  cardTitle: { fontSize: 14, fontWeight: '600', color: theme.colors.neutral[900] },
  cardDesc: { fontSize: 12, color: theme.colors.neutral[500] },
  cardLocation: { fontSize: 11, color: theme.colors.primary.main },
  emptyText: { textAlign: 'center', color: theme.colors.neutral[500], marginTop: 20 },
});