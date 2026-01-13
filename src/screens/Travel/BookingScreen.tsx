import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  FlatList,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { theme } from '../../styles/theme';
import { Trip, Passenger } from '../../types';
import { useDispatch } from 'react-redux';
import travelAPI from '../../services/api/travelAPI';
import { formatCurrency } from '../../utils/formatting';

type Props = NativeStackScreenProps<RootStackParamList, 'Booking'>;

export default function BookingScreen({ route, navigation }: Props): React.JSX.Element {
  const { tripId } = route.params;
  const dispatch = useDispatch();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [passengers, setPassengers] = useState<Passenger[]>([
    { id: '1', name: '', email: '', phoneNumber: '', idNumber: '', seatNumber: 1 },
  ]);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'momo' | 'orange_money'>('momo');
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1); // 1: Passengers, 2: Payment
  const [fetchingTrip, setFetchingTrip] = useState(false);

  React.useEffect(() => {
    const loadTrip = async () => {
      try {
        setFetchingTrip(true);
        const t = await travelAPI.getTripDetails(tripId);
        setTrip(t);
      } catch (error) {
        console.error('Error fetching trip details:', error);
      } finally {
        setFetchingTrip(false);
      }
    };

    loadTrip();
  }, [tripId]);

  const handleAddPassenger = () => {
    if (passengers.length < 4) {
      setPassengers([
        ...passengers,
        {
          id: String(passengers.length + 1),
          name: '',
          email: '',
          phoneNumber: '',
          idNumber: '',
          seatNumber: passengers.length + 1,
        },
      ]);
    }
  };

  const handleRemovePassenger = (id?: string) => {
    if (!id) return;
    setPassengers(passengers.filter(p => p.id !== id));
  };

  const handlePassengerUpdate = (id?: string, field?: string, value?: string) => {
    if (!id || !field) return;
    setPassengers(
      passengers.map(p => (p.id === id ? { ...p, [field]: value } : p))
    );
  };

  const validatePassengers = () => {
    return passengers.every(p => p.name && p.email && p.phoneNumber && p.idNumber);
  };

  const handleCompleteBooking = async () => {
    if (!validatePassengers()) {
      Alert.alert('Error', 'Please fill in all passenger information');
      return;
    }

    try {
      setLoading(true);
      const bookingData = {
        tripId,
        passengers,
        paymentMethod,
      };
      const result = await travelAPI.createBooking(tripId, passengers, paymentMethod);
      
      Alert.alert('Success', 'Booking confirmed! Your e-ticket has been sent to your email.', [
        {
          text: 'View Booking',
          onPress: () => navigation.navigate('BookingHistory'),
        },
      ]);
    } catch (error) {
      console.error('Booking error:', error);
      Alert.alert('Error', 'Failed to complete booking');
    } finally {
      setLoading(false);
    }
  };

  const totalPrice = trip ? passengers.length * trip.pricePerSeat : 0;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={28} color={theme.colors.primary.main} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Booking</Text>
        </View>

        {/* Progress Indicator */}
        <View style={styles.progressContainer}>
          {[1, 2].map(step => (
            <View key={step} style={styles.progressItem}>
              <View
                style={[
                  styles.progressDot,
                  currentStep >= step && styles.progressDotActive,
                ]}
              >
                <Ionicons
                  name={currentStep > step ? ('checkmark' as any) : (String(step) as any)}
                  size={16}
                  color={currentStep >= step ? '#FFFFFF' : theme.colors.neutral[400]}
                />
              </View>
              <Text
                style={[
                  styles.progressLabel,
                  currentStep >= step && styles.progressLabelActive,
                ]}
              >
                {step === 1 ? 'Passengers' : 'Payment'}
              </Text>
            </View>
          ))}
        </View>

        {currentStep === 1 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Passenger Information</Text>

            {passengers.map((passenger, index) => (
              <View key={passenger.id} style={styles.passengerCard}>
                <View style={styles.passengerHeader}>
                  <Text style={styles.passengerLabel}>Passenger {index + 1}</Text>
                  {passengers.length > 1 && (
                    <TouchableOpacity onPress={() => handleRemovePassenger(passenger.id)}>
                      <Ionicons name="trash" size={20} color={theme.colors.status.error} />
                    </TouchableOpacity>
                  )}
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.label}>Full Name *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter full name"
                    placeholderTextColor={theme.colors.neutral[400]}
                    value={passenger.name}
                    onChangeText={text => handlePassengerUpdate(passenger.id, 'name', text)}
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.label}>Email *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter email"
                    placeholderTextColor={theme.colors.neutral[400]}
                    keyboardType="email-address"
                    value={passenger.email}
                    onChangeText={text => handlePassengerUpdate(passenger.id, 'email', text)}
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.label}>Phone Number *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter phone number"
                    placeholderTextColor={theme.colors.neutral[400]}
                    keyboardType="phone-pad"
                    value={passenger.phoneNumber}
                    onChangeText={text => handlePassengerUpdate(passenger.id, 'phoneNumber', text)}
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.label}>ID Number *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="National ID, Passport, etc"
                    placeholderTextColor={theme.colors.neutral[400]}
                    value={passenger.idNumber}
                    onChangeText={text => handlePassengerUpdate(passenger.id, 'idNumber', text)}
                  />
                </View>
              </View>
            ))}

            {passengers.length < 4 && (
              <TouchableOpacity style={styles.addButton} onPress={handleAddPassenger}>
                <Ionicons name="add" size={24} color={theme.colors.primary.main} />
                <Text style={styles.addButtonText}>Add Another Passenger</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={styles.nextButton}
              onPress={() => {
                if (validatePassengers()) {
                  setCurrentStep(2);
                } else {
                  Alert.alert('Error', 'Please fill in all passenger information');
                }
              }}
            >
              <Text style={styles.nextButtonText}>Continue to Payment</Text>
              <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Payment Method</Text>

            <Text style={styles.label}>Select Payment Method</Text>

            {(['momo', 'orange_money', 'card'] as const).map(method => (
              <TouchableOpacity
                key={method}
                style={[
                  styles.paymentOption,
                  paymentMethod === method && styles.paymentOptionActive,
                ]}
                onPress={() => setPaymentMethod(method)}
              >
                <Ionicons
                  name={paymentMethod === method ? 'radio-button-on' : 'radio-button-off'}
                  size={24}
                  color={paymentMethod === method ? theme.colors.primary.main : theme.colors.neutral[400]}
                />
                <View style={styles.paymentInfo}>
                  <Text style={styles.paymentMethodName}>
                    {method === 'momo' ? 'MTN Mobile Money' : method === 'orange_money' ? 'Orange Money' : 'Debit Card'}
                  </Text>
                  <Text style={styles.paymentDescription}>
                    {method === 'momo'
                      ? 'Quick and secure mobile payment'
                      : method === 'orange_money'
                      ? 'Orange Money wallet'
                      : 'Credit/Debit card'}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}

            {/* Booking Summary */}
            <View style={styles.summaryCard}>
              <Text style={styles.summaryTitle}>Booking Summary</Text>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Passengers</Text>
                <Text style={styles.summaryValue}>{passengers.length}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Price per Seat</Text>
                <Text style={styles.summaryValue}>
                  {trip ? formatCurrency(trip.pricePerSeat) : 'N/A'}
                </Text>
              </View>
              <View style={styles.summaryDivider} />
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabelTotal}>Total Amount</Text>
                <Text style={styles.summaryValueTotal}>{formatCurrency(totalPrice)}</Text>
              </View>
            </View>

            <View style={styles.disclaimer}>
              <Ionicons name="information-circle" size={16} color={theme.colors.primary.main} />
              <Text style={styles.disclaimerText}>
                By confirming, you agree to our terms and conditions. E-ticket will be sent to your email.
              </Text>
            </View>

            <View style={styles.buttonGroup}>
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => setCurrentStep(1)}
              >
                <Ionicons name="arrow-back" size={20} color={theme.colors.primary.main} />
                <Text style={styles.backButtonText}>Back</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.confirmButton}
                onPress={handleCompleteBooking}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <>
                    <Ionicons name="checkmark-done" size={20} color="#FFFFFF" />
                    <Text style={styles.confirmButtonText}>Confirm Booking</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
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
  headerTitle: {
    ...theme.typography.styles.heading2,
    color: theme.colors.text.primary,
    marginLeft: theme.spacing.md,
    flex: 1,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.lg,
  },
  progressItem: {
    alignItems: 'center',
  },
  progressDot: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.neutral[200],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  progressDotActive: {
    backgroundColor: theme.colors.primary.main,
  },
  progressLabel: {
    ...theme.typography.styles.caption,
    color: theme.colors.neutral[400],
  },
  progressLabelActive: {
    color: theme.colors.primary.main,
    fontWeight: '600',
  },
  section: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.lg,
  },
  sectionTitle: {
    ...theme.typography.styles.heading3,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
  },
  passengerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    ...theme.shadows.md,
  },
  passengerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
    paddingBottom: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.neutral[200],
  },
  passengerLabel: {
    ...theme.typography.styles.body,
    fontWeight: '600',
    color: theme.colors.text.primary,
  },
  formGroup: {
    marginBottom: theme.spacing.lg,
  },
  label: {
    ...theme.typography.styles.bodySmall,
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.sm,
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.neutral[300],
    borderRadius: theme.borderRadius.lg,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    ...theme.typography.styles.body,
    color: theme.colors.text.primary,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: theme.colors.primary.main,
    borderRadius: theme.borderRadius.lg,
    paddingVertical: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  addButtonText: {
    ...theme.typography.styles.body,
    fontWeight: '700',
    color: theme.colors.primary.main,
    marginLeft: theme.spacing.sm,
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary.main,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    gap: theme.spacing.sm,
  },
  nextButtonText: {
    ...theme.typography.styles.body,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    borderWidth: 2,
    borderColor: theme.colors.neutral[300],
    borderRadius: theme.borderRadius.lg,
    backgroundColor: '#FFFFFF',
  },
  paymentOptionActive: {
    borderColor: theme.colors.primary.main,
    backgroundColor: theme.colors.primary.light + '10',
  },
  paymentInfo: {
    marginLeft: theme.spacing.md,
    flex: 1,
  },
  paymentMethodName: {
    ...theme.typography.styles.body,
    fontWeight: '600',
    color: theme.colors.text.primary,
  },
  paymentDescription: {
    ...theme.typography.styles.bodySmall,
    color: theme.colors.text.secondary,
    marginTop: 4,
  },
  summaryCard: {
    backgroundColor: theme.colors.primary.light + '10',
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginVertical: theme.spacing.lg,
  },
  summaryTitle: {
    ...theme.typography.styles.body,
    fontWeight: '700',
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  summaryLabel: {
    ...theme.typography.styles.bodySmall,
    color: theme.colors.text.secondary,
  },
  summaryValue: {
    ...theme.typography.styles.bodySmall,
    fontWeight: '600',
    color: theme.colors.text.primary,
  },
  summaryDivider: {
    height: 1,
    backgroundColor: theme.colors.neutral[300],
    marginVertical: theme.spacing.md,
  },
  summaryLabelTotal: {
    ...theme.typography.styles.body,
    fontWeight: '700',
    color: theme.colors.text.primary,
  },
  summaryValueTotal: {
    ...theme.typography.styles.heading3,
    color: theme.colors.primary.main,
  },
  disclaimer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FEF3C7',
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.lg,
    gap: theme.spacing.sm,
  },
  disclaimerText: {
    ...theme.typography.styles.bodySmall,
    color: '#92400E',
    flex: 1,
    lineHeight: 16,
  },
  buttonGroup: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  backButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: theme.colors.primary.main,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    gap: theme.spacing.sm,
  },
  backButtonText: {
    ...theme.typography.styles.body,
    fontWeight: '700',
    color: theme.colors.primary.main,
  },
  confirmButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary.main,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    gap: theme.spacing.sm,
  },
  confirmButtonText: {
    ...theme.typography.styles.body,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
