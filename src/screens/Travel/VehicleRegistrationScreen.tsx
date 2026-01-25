import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { theme } from '../../styles/theme';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import { setVehicles } from '../../store/slices/travelSlice';
import travelAPI from '../../services/api/travelAPI';

type Props = NativeStackScreenProps<RootStackParamList, 'VehicleRegistration'>;

const VEHICLE_TYPES: Array<{ key: 'minibus' | 'bus' | 'taxi'; label: string; icon: keyof typeof Ionicons.glyphMap }> = [
  { key: 'taxi', label: 'Taxi', icon: 'car' },
  { key: 'minibus', label: 'Minibus', icon: 'bus' },
  { key: 'bus', label: 'Bus', icon: 'bus' },
];

export default function VehicleRegistrationScreen({ navigation }: Props): React.JSX.Element {
  const dispatch = useDispatch();
  const [type, setType] = useState<'minibus' | 'bus' | 'taxi'>('taxi');
  const [plate, setPlate] = useState('');
  const [seats, setSeats] = useState('4');
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [color, setColor] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!plate.trim()) {
      Alert.alert('Validation', 'Please enter a plate number.');
      return;
    }
    const seatsNum = parseInt(seats, 10);
    if (Number.isNaN(seatsNum) || seatsNum <= 0) {
      Alert.alert('Validation', 'Please enter a valid seat count.');
      return;
    }

    try {
      setSubmitting(true);
      await travelAPI.registerVehicle({
        type,
        plate_number: plate.trim(),
        seats: seatsNum,
        make: make.trim() || undefined,
        model: model.trim() || undefined,
        color: color.trim() || undefined,
      });
      const vehicles = await travelAPI.getMyVehicles();
      dispatch(setVehicles(vehicles));
      Alert.alert('Success', 'Vehicle registered successfully.');
      navigation.goBack();
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'Failed to register vehicle.');
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
        <Text style={styles.headerTitle}>Register Vehicle</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.label}>Vehicle Type</Text>
        <View style={styles.typeRow}>
          {VEHICLE_TYPES.map((t) => (
            <TouchableOpacity
              key={t.key}
              style={[styles.typeChip, type === t.key && styles.typeChipActive]}
              onPress={() => setType(t.key)}
            >
              <Ionicons name={t.icon} size={18} color={type === t.key ? '#fff' : theme.colors.primary.main} />
              <Text style={[styles.typeChipText, type === t.key && styles.typeChipTextActive]}>{t.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Plate Number</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., CE-123-AB"
          value={plate}
          autoCapitalize="characters"
          onChangeText={setPlate}
        />

        <Text style={styles.label}>Seats</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., 4"
          value={seats}
          onChangeText={setSeats}
          keyboardType="number-pad"
        />

        <Text style={styles.label}>Make (optional)</Text>
        <TextInput style={styles.input} placeholder="e.g., Toyota" value={make} onChangeText={setMake} />

        <Text style={styles.label}>Model (optional)</Text>
        <TextInput style={styles.input} placeholder="e.g., Corolla" value={model} onChangeText={setModel} />

        <Text style={styles.label}>Color (optional)</Text>
        <TextInput style={styles.input} placeholder="e.g., White" value={color} onChangeText={setColor} />

        <TouchableOpacity style={[styles.submitBtn, submitting && styles.submitDisabled]} disabled={submitting} onPress={handleSubmit}>
          <Ionicons name="save" size={20} color="#fff" />
          <Text style={styles.submitText}>{submitting ? 'Submitting...' : 'Register Vehicle'}</Text>
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
  typeRow: { flexDirection: 'row', gap: 8 },
  typeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 24,
    backgroundColor: theme.colors.primary.light,
  },
  typeChipActive: {
    backgroundColor: theme.colors.primary.main,
  },
  typeChipText: { ...theme.typography.styles.bodySmall, color: theme.colors.primary.main, fontWeight: '600' },
  typeChipTextActive: { color: '#fff' },
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
