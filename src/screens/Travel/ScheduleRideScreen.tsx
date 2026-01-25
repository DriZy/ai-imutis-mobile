import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, ScrollView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { theme } from '../../styles/theme';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import { setRideSchedules, setVehicles } from '../../store/slices/travelSlice';
import travelAPI from '../../services/api/travelAPI';
import { Vehicle, City } from '../../types';

type Props = NativeStackScreenProps<RootStackParamList, 'ScheduleRide'>;

export default function ScheduleRideScreen({ navigation }: Props): React.JSX.Element {
  const dispatch = useDispatch();
  const vehicles = useSelector((s: RootState) => s.travel.vehicles);
  const [loadingVehicles, setLoadingVehicles] = useState(false);

  const [selectedVehicleId, setSelectedVehicleId] = useState<string>('');
  const [origin, setOrigin] = useState<City | null>(null);
  const [destination, setDestination] = useState<City | null>(null);
  const [departure, setDeparture] = useState<Date>(new Date(Date.now() + 60 * 60 * 1000));
  const [showPicker, setShowPicker] = useState(false);
  const [seats, setSeats] = useState('');
  const [price, setPrice] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const ensureVehicles = async () => {
      if (!vehicles || vehicles.length === 0) {
        try {
          setLoadingVehicles(true);
          const list = await travelAPI.getMyVehicles();
          dispatch(setVehicles(list));
        } catch (e) {
          // noop; Alert on demand
        } finally {
          setLoadingVehicles(false);
        }
      }
    };
    ensureVehicles();
  }, []);

  const selectedVehicle: Vehicle | undefined = useMemo(() => vehicles.find(v => v.id === selectedVehicleId), [vehicles, selectedVehicleId]);

  useEffect(() => {
    if (selectedVehicle && !seats) {
      setSeats(String(selectedVehicle.seats));
    }
  }, [selectedVehicleId]);

  const handleSubmit = async () => {
    if (!selectedVehicleId) {
      Alert.alert('Validation', 'Please select a vehicle.');
      return;
    }
    if (!origin || !destination) {
      Alert.alert('Validation', 'Please select origin and destination.');
      return;
    }
    const seatsNum = parseInt(seats, 10);
    if (Number.isNaN(seatsNum) || seatsNum <= 0) {
      Alert.alert('Validation', 'Please enter a valid seat count.');
      return;
    }
    const priceNum = parseFloat(price);
    if (Number.isNaN(priceNum) || priceNum <= 0) {
      Alert.alert('Validation', 'Please enter a valid price per seat.');
      return;
    }

    try {
      setSubmitting(true);
      await travelAPI.createRideSchedule({
        vehicle_id: selectedVehicleId,
        origin: origin.name,
        destination: destination.name,
        departure_time: departure.toISOString(),
        total_seats: seatsNum,
        price_per_seat: priceNum,
        notes: notes.trim() || undefined,
      });
      const schedules = await travelAPI.getMyRideSchedules();
      dispatch(setRideSchedules(schedules));
      Alert.alert('Success', 'Ride scheduled successfully.');
      navigation.goBack();
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'Failed to schedule ride.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={28} color={theme.colors.primary.main} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Schedule a Ride</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.label}>Vehicle</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.vehicleRow}>
          {vehicles.map((v) => (
            <TouchableOpacity
              key={v.id}
              style={[styles.vehicleCard, selectedVehicleId === v.id && styles.vehicleCardActive]}
              onPress={() => setSelectedVehicleId(v.id)}
            >
              <Ionicons name={v.type === 'taxi' ? 'car' : 'bus'} size={18} color={selectedVehicleId === v.id ? '#fff' : theme.colors.primary.main} />
              <Text style={[styles.vehicleText, selectedVehicleId === v.id && styles.vehicleTextActive]}>{v.plateNumber || 'Plate'}</Text>
              <Text style={[styles.vehicleSub, selectedVehicleId === v.id && styles.vehicleTextActive]}>{v.seats} seats</Text>
            </TouchableOpacity>
          ))}
          {(!vehicles || vehicles.length === 0) && (
            <View style={styles.emptyVehicleBox}>
              <Ionicons name="car" size={20} color={theme.colors.neutral[400]} />
              <Text style={styles.emptyVehicleText}>{loadingVehicles ? 'Loading vehicles...' : 'No vehicles yet'}</Text>
            </View>
          )}
        </ScrollView>

        {/* Origin/Destination selection like SearchScreen */}
        <View style={styles.locationSection}>
          <TouchableOpacity
            style={styles.locationInput}
            onPress={() => navigation.navigate('CityPicker', { type: 'origin', onSelect: setOrigin })}
          >
            <Ionicons name="location" size={24} color={theme.colors.primary.main} />
            <View style={styles.locationTextContainer}>
              <Text style={styles.locationLabel}>From</Text>
              <Text style={styles.locationValue}>
                {origin ? origin.name : 'Select origin city'}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.colors.neutral[400]} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.locationInput}
            onPress={() => navigation.navigate('CityPicker', { type: 'destination', onSelect: setDestination })}
          >
            <Ionicons name="location" size={24} color={theme.colors.secondary.main} />
            <View style={styles.locationTextContainer}>
              <Text style={styles.locationLabel}>To</Text>
              <Text style={styles.locationValue}>
                {destination ? destination.name : 'Select destination city'}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.colors.neutral[400]} />
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>Departure</Text>
        <TouchableOpacity style={styles.dateInput} onPress={() => setShowPicker(true)}>
          <Ionicons name="calendar" size={20} color={theme.colors.primary.main} />
          <Text style={styles.dateText}>{departure.toLocaleString()}</Text>
          <Ionicons name="chevron-forward" size={18} color={theme.colors.neutral[400]} />
        </TouchableOpacity>
        {showPicker && (
          <DateTimePicker
            value={departure}
            mode="datetime"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={(e, d) => {
              setShowPicker(Platform.OS === 'ios');
              if (d) setDeparture(d);
            }}
            minimumDate={new Date()}
          />)
        }

        <Text style={styles.label}>Seats Available</Text>
        <TextInput style={styles.input} value={seats} onChangeText={setSeats} placeholder="e.g., 4" keyboardType="number-pad" />

        <Text style={styles.label}>Price Per Seat</Text>
        <TextInput style={styles.input} value={price} onChangeText={setPrice} placeholder="e.g., 2500" keyboardType="decimal-pad" />

        <Text style={styles.label}>Notes (optional)</Text>
        <TextInput style={[styles.input, { minHeight: 80 }]} value={notes} onChangeText={setNotes} placeholder="Any useful info for passengers" multiline />

        <TouchableOpacity style={[styles.submitBtn, submitting && styles.submitDisabled]} disabled={submitting} onPress={handleSubmit}>
          <Ionicons name="checkmark-circle" size={20} color="#fff" />
          <Text style={styles.submitText}>{submitting ? 'Submitting...' : 'Create Schedule'}</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background.default },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.neutral[200],
  },
  headerTitle: { ...theme.typography.styles.heading2, marginLeft: theme.spacing.md, color: theme.colors.text.primary },
  content: { padding: theme.spacing.md },
  label: { ...theme.typography.styles.bodySmall, fontWeight: '600', color: theme.colors.text.primary, marginBottom: 8, marginTop: 12 },
  input: {
    backgroundColor: theme.colors.background.paper,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    ...theme.shadows.md,
  },
  locationSection: { marginTop: theme.spacing.lg },
  locationInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background.paper,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.sm,
    ...theme.shadows.md,
  },
  locationTextContainer: { flex: 1, marginLeft: theme.spacing.md },
  locationLabel: { ...theme.typography.styles.caption, color: theme.colors.text.secondary, marginBottom: 2 },
  locationValue: { ...theme.typography.styles.body, color: theme.colors.text.primary },
  dateInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background.paper,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    ...theme.shadows.md,
  },
  dateText: { ...theme.typography.styles.body, color: theme.colors.text.primary, flex: 1, marginLeft: theme.spacing.md },
  vehicleRow: { gap: 8 },
  vehicleCard: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: theme.colors.primary.light,
    marginRight: 8,
    minWidth: 120,
  },
  vehicleCardActive: { backgroundColor: theme.colors.primary.main },
  vehicleText: { ...theme.typography.styles.bodySmall, color: theme.colors.primary.main, fontWeight: '700' },
  vehicleTextActive: { color: '#fff' },
  vehicleSub: { ...theme.typography.styles.caption, color: theme.colors.primary.main },
  emptyVehicleBox: {
    backgroundColor: theme.colors.background.paper,
    borderRadius: 12,
    padding: theme.spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 160,
  },
  emptyVehicleText: { ...theme.typography.styles.bodySmall, color: theme.colors.text.secondary, marginTop: 6 },
  submitBtn: {
    marginTop: theme.spacing.lg,
    backgroundColor: theme.colors.primary.main,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  submitDisabled: { opacity: 0.7 },
  submitText: { ...theme.typography.styles.body, color: '#fff', fontWeight: '700' },
});
