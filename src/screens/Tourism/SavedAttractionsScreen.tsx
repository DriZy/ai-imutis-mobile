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
import { Attraction } from '../../types';
import tourismAPI from '../../services/api/tourismAPI';

type Props = NativeStackScreenProps<RootStackParamList, 'SavedAttractions'>;

export default function SavedAttractionsScreen({ navigation }: Props): React.JSX.Element {
  const [savedAttractions, setSavedAttractions] = useState<Attraction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadSavedAttractions();
  }, []);

  const loadSavedAttractions = async () => {
    try {
      setLoading(true);
      const saved = await tourismAPI.getSavedAttractions();
      // Fetch full attraction details for each saved attraction
      const attractions = await Promise.all(saved.map(sa => tourismAPI.getAttractionDetails(sa.attractionId)));
      setSavedAttractions(attractions);
    } catch (error) {
      console.error('Error loading saved attractions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadSavedAttractions();
    setRefreshing(false);
  };

  const handleRemoveSaved = async (attractionId: string) => {
    try {
      await tourismAPI.removeSavedAttraction(attractionId);
      setSavedAttractions(prev => prev.filter(a => a.id !== attractionId));
    } catch (error) {
      console.error('Error removing saved attraction:', error);
    }
  };

  const handleAttractionPress = (attraction: Attraction) => {
    navigation.navigate('AttractionDetail', { attractionId: attraction.id });
  };

  const renderAttraction = ({ item }: { item: Attraction }) => (
    <TouchableOpacity
      style={styles.attractionCard}
      onPress={() => handleAttractionPress(item)}
    >
      <Image
        source={{ uri: item.imageUrls[0] || 'https://via.placeholder.com/150x150' }}
        style={styles.attractionImage}
      />
      <View style={styles.attractionContent}>
        <View style={styles.headerRow}>
          <Text style={styles.attractionName} numberOfLines={1}>
            {item.name}
          </Text>
          <View style={styles.ratingBadge}>
            <Ionicons name="star" size={14} color="#FFB800" />
            <Text style={styles.rating}>{item.rating.toFixed(1)}</Text>
          </View>
        </View>
        <Text style={styles.category}>{item.category}</Text>
        <Text style={styles.description} numberOfLines={2}>
          {item.description}
        </Text>
      </View>
      <TouchableOpacity
        style={styles.removeButton}
        onPress={() => handleRemoveSaved(item.id)}
      >
        <Ionicons name="trash" size={20} color={theme.colors.status.error} />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Saved Attractions</Text>
        <Text style={styles.headerSubtitle}>Your favorite places to visit</Text>
      </View>

      {loading ? (
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={theme.colors.primary.main} />
        </View>
      ) : (
        <FlatList
          data={savedAttractions}
          renderItem={renderAttraction}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          onRefresh={handleRefresh}
          refreshing={refreshing}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="heart-outline" size={48} color={theme.colors.neutral[300]} />
              <Text style={styles.emptyText}>No saved attractions yet</Text>
              <TouchableOpacity
                style={styles.exploreButton}
                onPress={() => navigation.navigate('Tourism')}
              >
                <Text style={styles.exploreButtonText}>Explore Attractions</Text>
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
  listContent: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
  },
  attractionCard: {
    flexDirection: 'row',
    marginBottom: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
    ...theme.shadows.md,
  },
  attractionImage: {
    width: 120,
    height: 120,
    backgroundColor: theme.colors.neutral[200],
  },
  attractionContent: {
    flex: 1,
    padding: theme.spacing.md,
    justifyContent: 'space-between',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.xs,
  },
  attractionName: {
    ...theme.typography.styles.body,
    fontWeight: '600',
    color: theme.colors.text.primary,
    flex: 1,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3CD',
    paddingHorizontal: theme.spacing.xs,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.sm,
  },
  rating: {
    ...theme.typography.styles.caption,
    color: '#856404',
    marginLeft: 4,
    fontWeight: '600',
  },
  category: {
    ...theme.typography.styles.caption,
    color: theme.colors.primary.main,
    fontWeight: '600',
    marginBottom: theme.spacing.xs,
    textTransform: 'uppercase',
  },
  description: {
    ...theme.typography.styles.bodySmall,
    color: theme.colors.text.secondary,
  },
  removeButton: {
    padding: theme.spacing.md,
    justifyContent: 'center',
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
  exploreButton: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.primary.main,
    borderRadius: theme.borderRadius.lg,
  },
  exploreButtonText: {
    ...theme.typography.styles.body,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
