import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'Auth'>;

export default function AuthScreen({ navigation }: Props): React.JSX.Element {
  return (
    <LinearGradient colors={['#1E3A8A', '#3B82F6']} style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Welcome to</Text>
        <Text style={styles.appName}>AI-IMUTIS</Text>
        <Text style={styles.subtitle}>Choose your sign-in method</Text>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.authButton}
          onPress={() => navigation.navigate('EmailAuth')}
        >
          <Ionicons name="mail-outline" size={24} color="#1E3A8A" />
          <Text style={styles.buttonText}>Continue with Email</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.authButton}
          onPress={() => navigation.navigate('PhoneAuth')}
        >
          <Ionicons name="call-outline" size={24} color="#1E3A8A" />
          <Text style={styles.buttonText}>Continue with Phone</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.authButton, styles.googleButton]}
          onPress={() => navigation.navigate('GoogleAuth')}
        >
          <Ionicons name="logo-google" size={24} color="#FFFFFF" />
          <Text style={[styles.buttonText, styles.googleButtonText]}>
            Continue with Google
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          By continuing, you agree to our Terms & Privacy Policy
        </Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 30,
  },
  header: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 60,
  },
  title: {
    fontSize: 24,
    color: '#E0E7FF',
    marginBottom: 8,
  },
  appName: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: 2,
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    color: '#E0E7FF',
  },
  buttonContainer: {
    flex: 1,
    justifyContent: 'center',
    gap: 16,
  },
  authButton: {
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 12,
  },
  googleButton: {
    backgroundColor: '#DB4437',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E3A8A',
  },
  googleButtonText: {
    color: '#FFFFFF',
  },
  footer: {
    paddingBottom: 40,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#E0E7FF',
    textAlign: 'center',
  },
});
