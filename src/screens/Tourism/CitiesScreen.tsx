import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { theme } from '../../styles/theme';
import { City } from '../../types';
import { useDispatch, useSelector } from 'react-redux';
import { setCities, setSelectedCity, setLoading } from '../../store/slices/tourismSlice';
import { RootState } from '../../store/store';
import tourismAPI from '../../services/api/tourismAPI';
import storageService from '../../services/storage/storageService';
import { STORAGE_KEYS, CACHE_CONFIG } from '../../utils/constants';

type Props = NativeStackScreenProps<RootStackParamList, 'CitiesScreen'>;

export default function CitiesScreen({ navigation }: Props): React.JSX.Element {
  const dispatch = useDispatch();
  const { cities, isLoading } = useSelector((state: RootState) => state.tourism);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadCities();
  }, []);

  const loadCities = async () => {
    try {
      // Try cache first
      const cached = await storageService.getCached<City[]>(STORAGE_KEYS.CACHED_CITIES);
      if (cached) {
        dispatch(setCities(cached));
        return;
      }

      // Fetch from API
      dispatch(setLoading(true));
      const apiCities = await tourismAPI.getCities();
      dispatch(setCities(apiCities));
      
      // Cache for 24 hours
      await storageService.cacheWithTTL(
        STORAGE_KEYS.CACHED_CITIES,
        apiCities,
        CACHE_CONFIG.CITIES_TTL
      );
    } catch (error) {
      console.error('Error loading cities:', error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadCities();
    setRefreshing(false);
  };

  const handleCityPress = (city: City) => {
    dispatch(setSelectedCity(city));
    navigation.navigate('AttractionsScreen', { cityId: city.id });
  };

  const renderCity = ({ item }: { item: City }) => (
    <TouchableOpacity
      style={styles.cityCard}
      onPress={() => handleCityPress(item)}
    >
      <Image
        source={{ uri: item.imageUrl || 'https://via.placeholder.com/300x200' }}
        style={styles.cityImage}
      />
      <View style={styles.cityOverlay}>
        <View style={styles.cityInfo}>
          <Text style={styles.cityName}>{item.name}</Text>
          <Text style={styles.cityRegion}>{item.region}</Text>
          <Text style={styles.cityDescription} numberOfLines={2}>
            {item.description}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={24} color="#FFFFFF" />
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Explore Cameroon</Text>
        <Text style={styles.headerSubtitle}>Discover amazing cities and attractions</Text>
      </View>

      {isLoading && cities.length === 0 ? (
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={theme.colors.primary.main} />
        </View>
      ) : (
        <FlatList
          data={cities}
          renderItem={renderCity}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          onRefresh={handleRefresh}
          refreshing={refreshing}
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
  listContent: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
  },
  cityCard: {
    marginBottom: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
    ...theme.shadows.lg,
  },
  cityImage: {
    width: '100%',
    height: 200,
    backgroundColor: theme.colors.neutral[200],
  },
  cityOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'space-between',
    padding: theme.spacing.md,
    flexDirection: 'row',
  },
  cityInfo: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  cityName: {
    ...theme.typography.styles.heading3,
    color: '#FFFFFF',
    marginBottom: theme.spacing.xs,
  },
  cityRegion: {
    ...theme.typography.styles.bodySmall,
    color: theme.colors.primary.light,
    marginBottom: theme.spacing.sm,
  },
  cityDescription: {
    ...theme.typography.styles.bodySmall,
    color: theme.colors.neutral[100],
    lineHeight: 18,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
