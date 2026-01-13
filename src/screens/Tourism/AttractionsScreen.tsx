import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { theme } from '../../styles/theme';
import { Attraction } from '../../types';
import { useDispatch, useSelector } from 'react-redux';
import { setAttractions, setSelectedAttraction } from '../../store/slices/tourismSlice';
import { RootState } from '../../store/store';
import tourismAPI from '../../services/api/tourismAPI';
import { ATTRACTION_CATEGORIES } from '../../utils/constants';
import { truncateText } from '../../utils/formatting';

type Props = NativeStackScreenProps<RootStackParamList, 'AttractionsScreen'>;

export default function AttractionsScreen({ route, navigation }: Props): React.JSX.Element {
  const { cityId } = route.params;
  const dispatch = useDispatch();
  const { attractions, isLoading, selectedCity } = useSelector(
    (state: RootState) => state.tourism
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadAttractions();
  }, [cityId]);

  const loadAttractions = async () => {
    try {
      const apiAttractions = await tourismAPI.getAttractionsByCity(cityId);
      dispatch(setAttractions(apiAttractions.items));
    } catch (error) {
      console.error('Error loading attractions:', error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadAttractions();
    setRefreshing(false);
  };

  const handleAttractionPress = (attraction: Attraction) => {
    dispatch(setSelectedAttraction(attraction));
    navigation.navigate('AttractionDetail', { attractionId: attraction.id });
  };

  const filteredAttractions = attractions.filter(attr => {
    const matchesSearch = attr.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || attr.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

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
        <Text style={styles.category}>{item.category.toUpperCase()}</Text>
        <Text style={styles.description} numberOfLines={2}>
          {item.description}
        </Text>
        {item.estimatedCost && (
          <Text style={styles.cost}>Est. Cost: {item.estimatedCost} XAF</Text>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={28} color={theme.colors.primary.main} />
        </TouchableOpacity>
        <View style={styles.headerText}>
          <Text style={styles.headerTitle}>{selectedCity?.name || 'Attractions'}</Text>
          <Text style={styles.headerSubtitle}>Things to do and explore</Text>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={theme.colors.neutral[400]} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search attractions..."
          placeholderTextColor={theme.colors.neutral[400]}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery ? (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={20} color={theme.colors.neutral[400]} />
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Category Filter */}
      <FlatList
        horizontal
        data={ATTRACTION_CATEGORIES}
        keyExtractor={item => item.value}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.categoryTag,
              selectedCategory === item.value && styles.categoryTagActive,
            ]}
            onPress={() =>
              setSelectedCategory(selectedCategory === item.value ? null : item.value)
            }
          >
            <Text
              style={[
                styles.categoryTagText,
                selectedCategory === item.value && styles.categoryTagTextActive,
              ]}
            >
              {item.label}
            </Text>
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.categoriesContainer}
        showsHorizontalScrollIndicator={false}
      />

      {/* Attractions List */}
      {isLoading ? (
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={theme.colors.primary.main} />
        </View>
      ) : (
        <FlatList
          data={filteredAttractions}
          renderItem={renderAttraction}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          onRefresh={handleRefresh}
          refreshing={refreshing}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="search" size={48} color={theme.colors.neutral[300]} />
              <Text style={styles.emptyText}>No attractions found</Text>
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: theme.spacing.md,
    marginVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    backgroundColor: theme.colors.background.paper,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1,
    borderColor: theme.colors.neutral[200],
  },
  searchInput: {
    flex: 1,
    paddingVertical: theme.spacing.sm,
    marginHorizontal: theme.spacing.sm,
    ...theme.typography.styles.body,
    color: theme.colors.text.primary,
  },
  categoriesContainer: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  categoryTag: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    marginRight: theme.spacing.sm,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.neutral[100],
    borderWidth: 1,
    borderColor: theme.colors.neutral[300],
  },
  categoryTagActive: {
    backgroundColor: theme.colors.primary.main,
    borderColor: theme.colors.primary.main,
  },
  categoryTagText: {
    ...theme.typography.styles.caption,
    color: theme.colors.text.primary,
    fontWeight: '600',
  },
  categoryTagTextActive: {
    color: '#FFFFFF',
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
  },
  description: {
    ...theme.typography.styles.bodySmall,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.xs,
  },
  cost: {
    ...theme.typography.styles.caption,
    color: theme.colors.status.success,
    fontWeight: '600',
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
  },
});
