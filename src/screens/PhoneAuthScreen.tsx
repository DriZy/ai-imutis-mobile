import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { FirebaseRecaptchaVerifierModal } from 'expo-firebase-recaptcha';
import { PhoneAuthProvider, signInWithCredential, ApplicationVerifier } from 'firebase/auth';
import { auth, app } from '../../firebaseConfig';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'PhoneAuth'>;

export default function PhoneAuthScreen({ navigation }: Props): React.JSX.Element {
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [verificationId, setVerificationId] = useState<string>('');
  const [verificationCode, setVerificationCode] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const recaptchaVerifier = useRef<FirebaseRecaptchaVerifierModal>(null);

  const handleSendCode = async (): Promise<void> => {
    if (!phoneNumber) {
      Alert.alert('Error', 'Please enter a phone number');
      return;
    }

    setLoading(true);
    try {
      const phoneProvider = new PhoneAuthProvider(auth);
      const verificationId = await phoneProvider.verifyPhoneNumber(
        phoneNumber,
        recaptchaVerifier.current as ApplicationVerifier
      );
      setVerificationId(verificationId);
      Alert.alert('Success', 'Verification code sent!');
    } catch (error) {
      if (error instanceof Object && 'message' in error) {
        Alert.alert('Error', (error as { message: string }).message);
      } else {
        Alert.alert('Error', 'Failed to send code');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (): Promise<void> => {
    if (!verificationCode) {
      Alert.alert('Error', 'Please enter the verification code');
      return;
    }

    setLoading(true);
    try {
      const credential = PhoneAuthProvider.credential(verificationId, verificationCode);
      await signInWithCredential(auth, credential);
      navigation.navigate('Dashboard');
    } catch (error) {
      Alert.alert('Error', 'Invalid verification code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={['#1E3A8A', '#3B82F6']} style={styles.container}>
      <FirebaseRecaptchaVerifierModal
        ref={recaptchaVerifier}
        firebaseConfig={app.options}
        attemptInvisibleVerification={true}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>

          <View style={styles.header}>
            <Text style={styles.title}>Phone Verification</Text>
            <Text style={styles.subtitle}>
              {verificationId
                ? 'Enter the code sent to your phone'
                : 'Enter your phone number to continue'}
            </Text>
          </View>

          <View style={styles.form}>
            {!verificationId ? (
              <>
                <View style={styles.inputContainer}>
                  <Ionicons name="call-outline" size={20} color="#6B7280" />
                  <TextInput
                    style={styles.input}
                    placeholder="+1234567890"
                    placeholderTextColor="#9CA3AF"
                    value={phoneNumber}
                    onChangeText={setPhoneNumber}
                    keyboardType="phone-pad"
                  />
                </View>

                <TouchableOpacity
                  style={styles.authButton}
                  onPress={handleSendCode}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color="#1E3A8A" />
                  ) : (
                    <Text style={styles.authButtonText}>Send Code</Text>
                  )}
                </TouchableOpacity>
              </>
            ) : (
              <>
                <View style={styles.inputContainer}>
                  <Ionicons name="shield-checkmark-outline" size={20} color="#6B7280" />
                  <TextInput
                    style={styles.input}
                    placeholder="Verification Code"
                    placeholderTextColor="#9CA3AF"
                    value={verificationCode}
                    onChangeText={setVerificationCode}
                    keyboardType="number-pad"
                    maxLength={6}
                  />
                </View>

                <TouchableOpacity
                  style={styles.authButton}
                  onPress={handleVerifyCode}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color="#1E3A8A" />
                  ) : (
                    <Text style={styles.authButtonText}>Verify Code</Text>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.resendButton}
                  onPress={handleSendCode}
                  disabled={loading}
                >
                  <Text style={styles.resendText}>Resend Code</Text>
                </TouchableOpacity>
              </>
            )}

            <View style={styles.infoBox}>
              <Ionicons name="information-circle-outline" size={20} color="#E0E7FF" />
              <Text style={styles.infoText}>
                Include country code (e.g., +1 for US)
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 30,
  },
  backButton: {
    marginTop: 50,
    marginBottom: 20,
  },
  header: {
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#E0E7FF',
  },
  form: {
    flex: 1,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 4,
    marginBottom: 16,
    gap: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 12,
    color: '#1F2937',
  },
  authButton: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  authButtonText: {
    color: '#1E3A8A',
    fontSize: 18,
    fontWeight: 'bold',
  },
  resendButton: {
    marginTop: 20,
    alignItems: 'center',
  },
  resendText: {
    color: '#FFFFFF',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 30,
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    gap: 12,
  },
  infoText: {
    flex: 1,
    color: '#E0E7FF',
    fontSize: 14,
  },
});
