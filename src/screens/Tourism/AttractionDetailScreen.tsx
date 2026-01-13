import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import MapView, { Marker } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { theme } from '../../styles/theme';
import { Attraction, Review } from '../../types';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import tourismAPI from '../../services/api/tourismAPI';
import { formatRating, formatDistance } from '../../utils/formatting';
import { MAP_CONFIG } from '../../utils/constants';

type Props = NativeStackScreenProps<RootStackParamList, 'AttractionDetail'>;

export default function AttractionDetailScreen({ route, navigation }: Props): React.JSX.Element {
  const { attractionId } = route.params;
  const { selectedAttraction } = useSelector((state: RootState) => state.tourism);
  const [attraction, setAttraction] = useState<Attraction | null>(selectedAttraction || null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isSaved, setIsSaved] = useState(false);
  const [loading, setLoading] = useState(!selectedAttraction);

  useEffect(() => {
    if (!selectedAttraction) {
      loadAttraction();
    } else {
      loadReviews();
    }
  }, [attractionId]);

  const loadAttraction = async () => {
    try {
      setLoading(true);
      const data = await tourismAPI.getAttractionDetails(attractionId);
      setAttraction(data);
      setReviews(data.reviews || []);
    } catch (error) {
      console.error('Error loading attraction:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadReviews = async () => {
    try {
      const response = await tourismAPI.getReviews(attractionId);
      setReviews(response.items);
    } catch (error) {
      console.error('Error loading reviews:', error);
    }
  };

  const handleSaveAttraction = async () => {
    if (!attraction) return;
    try {
      await tourismAPI.saveAttraction(attraction.id);
      setIsSaved(true);
    } catch (error) {
      console.error('Error saving attraction:', error);
    }
  };

  if (loading || !attraction) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={theme.colors.primary.main} />
        </View>
      </SafeAreaView>
    );
  }

  const mapRegion = {
    latitude: attraction.coordinates.latitude,
    longitude: attraction.coordinates.longitude,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero Image */}
        <View style={styles.heroSection}>
          <Image
            source={{ uri: attraction.imageUrls[0] || 'https://via.placeholder.com/400x300' }}
            style={styles.heroImage}
          />
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="chevron-back" size={28} color="#FFFFFF" />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.saveButton, isSaved && styles.saveButtonActive]}
            onPress={handleSaveAttraction}
          >
            <Ionicons
              name={isSaved ? 'heart' : 'heart-outline'}
              size={24}
              color={isSaved ? theme.colors.status.error : '#FFFFFF'}
            />
          </TouchableOpacity>
        </View>

        {/* Title and Rating */}
        <View style={styles.content}>
          <View style={styles.titleSection}>
            <View>
              <Text style={styles.title}>{attraction.name}</Text>
              <Text style={styles.category}>{attraction.category.toUpperCase()}</Text>
            </View>
            <View style={styles.ratingBox}>
              <Ionicons name="star" size={20} color="#FFB800" />
              <Text style={styles.ratingText}>{attraction.rating}</Text>
            </View>
          </View>

          {/* Quick Info */}
          <View style={styles.infoRow}>
            {attraction.estimatedCost && (
              <View style={styles.infoItem}>
                <Ionicons name="pricetag" size={16} color={theme.colors.primary.main} />
                <Text style={styles.infoText}>{attraction.estimatedCost} XAF</Text>
              </View>
            )}
            {attraction.guidedTourAvailable && (
              <View style={styles.infoItem}>
                <Ionicons name="person" size={16} color={theme.colors.primary.main} />
                <Text style={styles.infoText}>Guided Tours Available</Text>
              </View>
            )}
          </View>

          {/* Description */}
          <Text style={styles.description}>{attraction.description}</Text>

          {/* Map */}
          <View style={styles.mapContainer}>
            <Text style={styles.sectionTitle}>Location</Text>
            <MapView style={styles.map} region={mapRegion} scrollEnabled={false}>
              <Marker
                coordinate={attraction.coordinates}
                title={attraction.name}
                pinColor={theme.colors.secondary.main}
              />
            </MapView>
          </View>

          {/* Contact Info */}
          {attraction.contactInfo && (
            <View style={styles.contactSection}>
              <Text style={styles.sectionTitle}>Contact Information</Text>
              {attraction.contactInfo.phone && (
                <TouchableOpacity style={styles.contactItem}>
                  <Ionicons name="call" size={20} color={theme.colors.primary.main} />
                  <Text style={styles.contactText}>{attraction.contactInfo.phone}</Text>
                </TouchableOpacity>
              )}
              {attraction.contactInfo.email && (
                <TouchableOpacity style={styles.contactItem}>
                  <Ionicons name="mail" size={20} color={theme.colors.primary.main} />
                  <Text style={styles.contactText}>{attraction.contactInfo.email}</Text>
                </TouchableOpacity>
              )}
              {attraction.contactInfo.website && (
                <TouchableOpacity style={styles.contactItem}>
                  <Ionicons name="globe" size={20} color={theme.colors.primary.main} />
                  <Text style={styles.contactText}>{attraction.contactInfo.website}</Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          {/* Opening Hours */}
          <View style={styles.hoursSection}>
            <Text style={styles.sectionTitle}>Hours</Text>
            {Object.entries(attraction.openingHours).map(([day, hours]) => (
              <View key={day} style={styles.hourRow}>
                <Text style={styles.dayName}>{day.charAt(0).toUpperCase() + day.slice(1)}</Text>
                <Text style={styles.hourTime}>
                  {hours.closed ? 'Closed' : `${hours.open} - ${hours.close}`}
                </Text>
              </View>
            ))}
          </View>

          {/* Reviews */}
          {reviews.length > 0 && (
            <View style={styles.reviewsSection}>
              <Text style={styles.sectionTitle}>Reviews ({reviews.length})</Text>
              {reviews.slice(0, 3).map(review => (
                <View key={review.id} style={styles.reviewCard}>
                  <View style={styles.reviewHeader}>
                    <Text style={styles.reviewerName}>{review.userName}</Text>
                    <View style={styles.reviewRating}>
                      {[...Array(5)].map((_, i) => (
                        <Ionicons
                          key={i}
                          name={i < review.rating ? 'star' : 'star-outline'}
                          size={14}
                          color="#FFB800"
                        />
                      ))}
                    </View>
                  </View>
                  <Text style={styles.reviewText}>{review.comment}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Action Button */}
      <View style={styles.actionBar}>
        <TouchableOpacity style={styles.bookButton}>
          <Ionicons name="calendar" size={20} color="#FFFFFF" />
          <Text style={styles.bookButtonText}>Book Tour</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

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
  heroSection: {
    height: 300,
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
    backgroundColor: theme.colors.neutral[200],
  },
  backButton: {
    position: 'absolute',
    top: theme.spacing.md,
    left: theme.spacing.md,
    width: 44,
    height: 44,
    borderRadius: theme.borderRadius.full,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButton: {
    position: 'absolute',
    top: theme.spacing.md,
    right: theme.spacing.md,
    width: 44,
    height: 44,
    borderRadius: theme.borderRadius.full,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButtonActive: {
    backgroundColor: 'rgba(239, 68, 68, 0.7)',
  },
  content: {
    padding: theme.spacing.md,
  },
  titleSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.lg,
  },
  title: {
    ...theme.typography.styles.heading2,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  category: {
    ...theme.typography.styles.caption,
    color: theme.colors.primary.main,
    fontWeight: '600',
  },
  ratingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primary.light,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.lg,
  },
  ratingText: {
    ...theme.typography.styles.body,
    fontWeight: '700',
    color: '#FFFFFF',
    marginLeft: theme.spacing.xs,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: theme.spacing.lg,
    flexWrap: 'wrap',
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: theme.spacing.lg,
    marginBottom: theme.spacing.sm,
  },
  infoText: {
    ...theme.typography.styles.bodySmall,
    color: theme.colors.text.secondary,
    marginLeft: theme.spacing.sm,
  },
  description: {
    ...theme.typography.styles.body,
    color: theme.colors.text.primary,
    lineHeight: 24,
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: {
    ...theme.typography.styles.heading3,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
  },
  mapContainer: {
    marginBottom: theme.spacing.lg,
  },
  map: {
    width: '100%',
    height: 200,
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
  },
  contactSection: {
    marginBottom: theme.spacing.lg,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
  },
  contactText: {
    ...theme.typography.styles.body,
    color: theme.colors.primary.main,
    marginLeft: theme.spacing.md,
  },
  hoursSection: {
    marginBottom: theme.spacing.lg,
  },
  hourRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.neutral[200],
  },
  dayName: {
    ...theme.typography.styles.bodySmall,
    fontWeight: '600',
    color: theme.colors.text.primary,
  },
  hourTime: {
    ...theme.typography.styles.bodySmall,
    color: theme.colors.text.secondary,
  },
  reviewsSection: {
    marginBottom: theme.spacing.lg,
  },
  reviewCard: {
    backgroundColor: theme.colors.background.paper,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.md,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  reviewerName: {
    ...theme.typography.styles.bodySmall,
    fontWeight: '600',
    color: theme.colors.text.primary,
  },
  reviewRating: {
    flexDirection: 'row',
  },
  reviewText: {
    ...theme.typography.styles.bodySmall,
    color: theme.colors.text.secondary,
    lineHeight: 18,
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
  },
  bookButtonText: {
    ...theme.typography.styles.body,
    fontWeight: '700',
    color: '#FFFFFF',
    marginLeft: theme.spacing.sm,
  },
});
