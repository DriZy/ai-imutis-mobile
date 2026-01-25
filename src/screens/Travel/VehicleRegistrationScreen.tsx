import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, ScrollView, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { theme } from '../../styles/theme';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import { setVehicles } from '../../store/slices/travelSlice';
import travelAPI from '../../services/api/travelAPI';
import * as ImagePicker from 'expo-image-picker';

type Props = NativeStackScreenProps<RootStackParamList, 'VehicleRegistration'>;

const VEHICLE_TYPES: Array<{ key: 'minibus' | 'bus' | 'taxi'; label: string; icon: keyof typeof Ionicons.glyphMap }> = [
  { key: 'taxi', label: 'Taxi', icon: 'car' },
  { key: 'minibus', label: 'Minibus', icon: 'bus' },
  { key: 'bus', label: 'Bus', icon: 'bus' },
];

export default function VehicleRegistrationScreen({ navigation }: Props): React.JSX.Element {
  const dispatch = useDispatch();
  const [type, setType] = useState<'minibus' | 'bus' | 'taxi' | null>(null);
  const [plate, setPlate] = useState('');
  const [seats, setSeats] = useState('4');
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [color, setColor] = useState('');
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Please allow access to your photos to add a vehicle picture.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
    });

    if (!result.canceled && result.assets?.length) {
      setPhotoUri(result.assets[0].uri);
    }
  };

  const handleSubmit = async () => {
    if (!type) {
      Alert.alert('Validation', 'Please select a vehicle type.');
      return;
    }
    if (!plate.trim()) {
      Alert.alert('Validation', 'Plate number is required.');
      return;
    }
    const seatsNum = parseInt(seats, 10);
    if (Number.isNaN(seatsNum) || seatsNum <= 0) {
      Alert.alert('Validation', 'Please enter a valid seat count.');
      return;
    }

    if (!photoUri) {
      Alert.alert('Validation', 'Please add a photo of the vehicle.');
      return;
    }

    if (!model.trim()) {
      Alert.alert('Validation', 'Model is required.');
      return;
    }

    if (!color.trim()) {
      Alert.alert('Validation', 'Color is required.');
      return;
    }

    try {
      setSubmitting(true);
      await travelAPI.registerVehicle({
        type,
        plate_number: plate.trim(),
        seats: seatsNum,
        make: make.trim() || undefined,
        model: model.trim(),
        color: color.trim(),
      }, photoUri);
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
           <Text style={styles.label}>Vehicle Type *</Text>
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
        {!type && (
          <Text style={styles.placeholderText}>Select a vehicle type</Text>
        )}
        {/* Plate first as required field */}
        <Text style={styles.label}>Plate Number *</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., CE-123-AB"
          value={plate}
          autoCapitalize="characters"
          onChangeText={setPlate}
        />

        <Text style={styles.label}>Seats *</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter seat count"
          value={seats}
          onChangeText={setSeats}
          keyboardType="number-pad"
        />

        <Text style={styles.label}>Vehicle Photo *</Text>
        <TouchableOpacity style={styles.photoPicker} onPress={pickImage}>
          <Ionicons name="camera" size={18} color={theme.colors.primary.main} />
          <Text style={styles.photoPickerText}>{photoUri ? 'Change photo' : 'Tap to add vehicle photo'}</Text>
        </TouchableOpacity>
        {photoUri ? (
          <Image source={{ uri: photoUri }} style={styles.photoPreview} />
        ) : null}

        <Text style={styles.label}>Model *</Text>
        <TextInput style={styles.input} placeholder="e.g., Corolla" value={model} onChangeText={setModel} />

        <Text style={styles.label}>Color *</Text>
        <TextInput style={styles.input} placeholder="e.g., White" value={color} onChangeText={setColor} />

        <Text style={styles.label}>Make (optional)</Text>
        <TextInput style={styles.input} placeholder="e.g., Toyota" value={make} onChangeText={setMake} />

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
  photoPicker: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: theme.colors.background.paper,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    ...theme.shadows.md,
  },
  photoPickerText: { ...theme.typography.styles.bodySmall, color: theme.colors.text.primary, fontWeight: '600' },
  placeholderText: { ...theme.typography.styles.caption, color: theme.colors.text.secondary, marginTop: 4 },
  photoPreview: {
    marginTop: theme.spacing.sm,
    width: '100%',
    height: 180,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.background.paper,
  },
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
