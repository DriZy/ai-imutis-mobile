import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../styles/theme';

interface Marker {
  id: string;
  latitude: number;
  longitude: number;
  title: string;
  description?: string;
}

interface Route {
  id: string;
  path: { latitude: number; longitude: number }[];
}

interface CustomMapProps {
  centerLat: number;
  centerLng: number;
  zoomLevel: number;
  markers: Marker[];
  routes: Route[];
  height?: number;
}

export default function CustomMap({
  centerLat,
  centerLng,
  zoomLevel,
  markers,
  routes,
  height = 300,
}: CustomMapProps): React.JSX.Element {
  const { width } = Dimensions.get('window');

  // Convert latitude/longitude to pixel coordinates on the map view
  const latLngToPixel = (lat: number, lng: number): { x: number; y: number } => {
    const mapWidth = width - 32; // Minus padding
    const mapHeight = height;

    // Simple mercator projection approximation
    const scale = Math.pow(2, zoomLevel);
    const x = ((lng - centerLng) * scale) + mapWidth / 2;
    const y = ((centerLat - lat) * scale) + mapHeight / 2;

    return { x, y };
  };

  // Render route lines
  const routeElements = useMemo(() => {
    return routes.map(route => {
      if (route.path.length < 2) return null;

      return (
        <View key={route.id} style={styles.routeContainer}>
          {route.path.map((point, idx) => {
            if (idx === 0) return null;
            const prevPoint = route.path[idx - 1];
            const prev = latLngToPixel(prevPoint.latitude, prevPoint.longitude);
            const curr = latLngToPixel(point.latitude, point.longitude);

            const dx = curr.x - prev.x;
            const dy = curr.y - prev.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const angle = Math.atan2(dy, dx) * (180 / Math.PI);

            return (
              <View
                key={`segment-${route.id}-${idx}`}
                style={[
                  styles.routeLine,
                  {
                    width: distance,
                    transform: [
                      { translateX: prev.x },
                      { translateY: prev.y },
                      { rotate: `${angle}deg` },
                      { translateX: -distance / 2 },
                    ],
                  },
                ]}
              />
            );
          })}
        </View>
      );
    });
  }, [routes, zoomLevel, centerLat, centerLng]);

  // Render markers
  const markerElements = useMemo(() => {
    return markers.map(marker => {
      const pos = latLngToPixel(marker.latitude, marker.longitude);
      return (
        <View
          key={marker.id}
          style={[
            styles.markerContainer,
            {
              left: pos.x - 12,
              top: pos.y - 12,
            },
          ]}
        >
          <View style={styles.marker}>
            <Ionicons name="location" size={20} color="#FFFFFF" />
          </View>
          <View style={styles.markerLabel}>
            <Text style={styles.markerTitle} numberOfLines={1}>
              {marker.title}
            </Text>
            {marker.description && (
              <Text style={styles.markerDesc} numberOfLines={1}>
                {marker.description}
              </Text>
            )}
          </View>
        </View>
      );
    });
  }, [markers, zoomLevel, centerLat, centerLng]);

  return (
    <View style={[styles.mapContainer, { height }]}>
      {/* Map background grid */}
      <View style={styles.mapBackground}>
        <Text style={styles.gridText}>Map View</Text>
      </View>

      {/* Routes */}
      {routeElements}

      {/* Markers */}
      {markerElements}

      {/* Zoom info */}
      <View style={styles.zoomInfo}>
        <Text style={styles.zoomText}>Zoom: {zoomLevel}x</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  mapContainer: {
    backgroundColor: '#E8F4F8',
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 1,
    borderColor: theme.colors.neutral[200],
  },
  mapBackground: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(200, 230, 240, 0.3)',
  },
  gridText: {
    fontSize: 12,
    color: theme.colors.neutral[300],
    fontWeight: '300',
  },
  routeContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    pointerEvents: 'none',
  },
  routeLine: {
    position: 'absolute',
    height: 3,
    backgroundColor: theme.colors.primary.main,
    opacity: 0.7,
  },
  markerContainer: {
    position: 'absolute',
    alignItems: 'center',
    zIndex: 10,
  },
  marker: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.primary.main,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    ...theme.shadows.md,
  },
  markerLabel: {
    backgroundColor: '#FFFFFF',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginTop: 8,
    borderWidth: 1,
    borderColor: theme.colors.neutral[200],
    ...theme.shadows.sm,
    maxWidth: 120,
  },
  markerTitle: {
    ...theme.typography.styles.caption,
    fontWeight: '600',
    color: theme.colors.text.primary,
  },
  markerDesc: {
    ...theme.typography.styles.caption,
    fontSize: 10,
    color: theme.colors.text.secondary,
    marginTop: 2,
  },
  zoomInfo: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: theme.colors.neutral[200],
  },
  zoomText: {
    ...theme.typography.styles.caption,
    color: theme.colors.text.secondary,
    fontWeight: '500',
  },
});
