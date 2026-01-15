import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { theme } from '../../styles/theme';
import { typography } from '../../styles/typography';

type CityPickerScreenProps = NativeStackScreenProps<RootStackParamList, 'CityPicker'>;

// Mock cities data - replace with actual API call
const MOCK_CITIES = [
  { id: '1', name: 'Douala', country: 'Cameroon' },
  { id: '2', name: 'Yaoundé', country: 'Cameroon' },
  { id: '3', name: 'Bamenda', country: 'Cameroon' },
  { id: '4', name: 'Garoua', country: 'Cameroon' },
  { id: '5', name: 'Buea', country: 'Cameroon' },
  { id: '6', name: 'Kumba', country: 'Cameroon' },
];

export default function CityPickerScreen({
  route,
  navigation,
}: CityPickerScreenProps): React.JSX.Element {
  const { onSelect } = route.params;
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredCities, setFilteredCities] = useState(MOCK_CITIES);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredCities(MOCK_CITIES);
    } else {
      const filtered = MOCK_CITIES.filter((city) =>
        city.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredCities(filtered);
    }
  }, [searchQuery]);

  const handleCitySelect = (city: (typeof MOCK_CITIES)[0]) => {
    onSelect(city);
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color={theme.colors.neutral[900]} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Select City</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={theme.colors.neutral[500]} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search cities..."
          placeholderTextColor={theme.colors.neutral[400]}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery !== '' && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={20} color={theme.colors.neutral[500]} />
          </TouchableOpacity>
        )}
      </View>

      {/* Cities List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary.main} />
        </View>
      ) : filteredCities.length > 0 ? (
        <FlatList
          data={filteredCities}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.cityItem}
              onPress={() => handleCitySelect(item)}
            >
              <View style={styles.cityContent}>
                <Ionicons name="location" size={20} color={theme.colors.primary.main} />
                <View style={styles.cityInfo}>
                  <Text style={styles.cityName}>{item.name}</Text>
                  <Text style={styles.cityCountry}>{item.country}</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color={theme.colors.neutral[400]} />
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.listContent}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Ionicons name="search-outline" size={48} color={theme.colors.neutral[300]} />
          <Text style={styles.emptyText}>No cities found</Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.neutral[50],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.neutral[200],
  },
  headerTitle: {
    ...typography.styles.heading3,
    color: theme.colors.neutral[900],
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: theme.colors.neutral[100],
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.neutral[300],
  },
  searchInput: {
    flex: 1,
    marginHorizontal: 8,
    color: theme.colors.neutral[900],
    ...typography.styles.body,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  cityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginVertical: 4,
    backgroundColor: theme.colors.neutral[0],
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.neutral[200],
  },
  cityContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  cityInfo: {
    marginLeft: 12,
    flex: 1,
  },
  cityName: {
    ...typography.styles.body,
    fontWeight: typography.fontWeight.semibold,
    color: theme.colors.neutral[900],
  },
  cityCountry: {
    ...typography.styles.bodySmall,
    color: theme.colors.neutral[500],
    marginTop: 2,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    ...typography.styles.body,
    color: theme.colors.neutral[400],
    marginTop: 12,
  },
});
