import React, { useRef, useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import WebView from 'react-native-webview';
import { theme } from '../styles/theme';

interface Marker {
  id: string;
  latitude: number;
  longitude: number;
  title: string;
  description?: string;
  color?: string;
}

interface Route {
  id: string;
  path: { latitude: number; longitude: number }[];
  color?: string;
}

interface OpenStreetMapProps {
  centerLat: number;
  centerLng: number;
  zoom?: number;
  markers?: Marker[];
  routes?: Route[];
  height?: number;
  onMarkerPress?: (markerId: string) => void;
  showUserLocation?: boolean;
  userLocation?: { latitude: number; longitude: number };
}

export default function OpenStreetMap({
  centerLat,
  centerLng,
  zoom = 13,
  markers = [],
  routes = [],
  height = 400,
  onMarkerPress,
  showUserLocation = false,
  userLocation,
}: OpenStreetMapProps): React.JSX.Element {
  const webViewRef = useRef<WebView>(null);

  // Generate HTML with Leaflet map
  const generateMapHTML = () => {
    const markersJSON = JSON.stringify(markers);
    const routesJSON = JSON.stringify(routes);
    const userLocationJSON = JSON.stringify(userLocation);

    return `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>
    body, html {
      margin: 0;
      padding: 0;
      height: 100%;
      overflow: hidden;
    }
    #map {
      width: 100%;
      height: 100%;
    }
    .custom-marker {
      background-color: ${theme.colors.primary.main};
      border: 2px solid white;
      border-radius: 50%;
      width: 30px;
      height: 30px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 18px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
    }
    .user-marker {
      background-color: #4285F4;
      border: 3px solid white;
      border-radius: 50%;
      width: 20px;
      height: 20px;
      box-shadow: 0 0 0 4px rgba(66, 133, 244, 0.3);
    }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    const map = L.map('map', {
      zoomControl: true,
      attributionControl: true,
    }).setView([${centerLat}, ${centerLng}], ${zoom});

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);

    // Parse data from React Native
    const markers = ${markersJSON};
    const routes = ${routesJSON};
    const userLocation = ${userLocationJSON};

    // Add routes (polylines)
    routes.forEach(route => {
      const latLngs = route.path.map(p => [p.latitude, p.longitude]);
      L.polyline(latLngs, {
        color: route.color || '${theme.colors.primary.main}',
        weight: 4,
        opacity: 0.8,
      }).addTo(map);
    });

    // Add markers
    markers.forEach(marker => {
      const icon = L.divIcon({
        className: 'custom-marker',
        html: '📍',
        iconSize: [30, 30],
        iconAnchor: [15, 15],
        popupAnchor: [0, -15]
      });

      const leafletMarker = L.marker([marker.latitude, marker.longitude], { icon })
        .addTo(map);
      
      // Add popup
      const popupContent = \`
        <div style="min-width: 150px;">
          <h3 style="margin: 0 0 8px 0; font-size: 14px; font-weight: 600;">\${marker.title}</h3>
          \${marker.description ? \`<p style="margin: 0; font-size: 12px; color: #666;">\${marker.description}</p>\` : ''}
        </div>
      \`;
      leafletMarker.bindPopup(popupContent);

      // Handle marker click
      leafletMarker.on('click', () => {
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'markerPress',
          markerId: marker.id
        }));
      });
    });

    // Add user location marker if provided
    if (${showUserLocation} && userLocation) {
      const userIcon = L.divIcon({
        className: 'user-marker',
        iconSize: [20, 20],
        iconAnchor: [10, 10]
      });

      L.marker([userLocation.latitude, userLocation.longitude], { icon: userIcon })
        .addTo(map)
        .bindPopup('Your Location');
    }

    // Fit bounds to show all markers and routes
    if (markers.length > 0 || routes.length > 0) {
      const bounds = L.latLngBounds([]);
      
      markers.forEach(m => bounds.extend([m.latitude, m.longitude]));
      routes.forEach(r => r.path.forEach(p => bounds.extend([p.latitude, p.longitude])));
      
      if (bounds.isValid()) {
        map.fitBounds(bounds, { padding: [50, 50] });
      }
    }
  </script>
</body>
</html>
    `;
  };

  // Handle messages from WebView
  const handleMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'markerPress' && onMarkerPress) {
        onMarkerPress(data.markerId);
      }
    } catch (error) {
      console.error('Error parsing WebView message:', error);
    }
  };

  return (
    <View style={[styles.container, { height }]}>
      <WebView
        ref={webViewRef}
        source={{ html: generateMapHTML() }}
        style={styles.webview}
        onMessage={handleMessage}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        renderLoading={() => (
          <View style={styles.loading}>
            <ActivityIndicator size="large" color={theme.colors.primary.main} />
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.colors.neutral[200],
  },
  webview: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  loading: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#E8F4F8',
  },
});
