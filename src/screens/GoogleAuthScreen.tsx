import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import { auth } from '../../firebaseConfig';
import Constants from 'expo-constants';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';

WebBrowser.maybeCompleteAuthSession();

type Props = NativeStackScreenProps<RootStackParamList, 'GoogleAuth'>;

export default function GoogleAuthScreen({ navigation }: Props): React.JSX.Element {
  const [loading, setLoading] = useState<boolean>(false);

  const handleGoogleSignIn = async (): Promise<void> => {
    setLoading(true);
    try {
      const clientId = Constants.expoConfig?.extra?.googleWebClientId;

      if (!clientId) {
        Alert.alert('Error', 'Google Client ID not configured. Please add it to your .env file.');
        return;
      }

      const redirectUri = AuthSession.makeRedirectUri();

      const request = new AuthSession.AuthRequest({
        clientId,
        scopes: ['openid', 'profile', 'email'],
        redirectUri,
      });

      const result = await request.promptAsync({
        authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
      });

      if (result.type === 'success') {
        const { id_token } = result.params as { id_token?: string };
        if (id_token) {
          const credential = GoogleAuthProvider.credential(id_token);
          await signInWithCredential(auth, credential);
          navigation.navigate('Dashboard');
        }
      } else {
        Alert.alert('Cancelled', 'Google sign-in was cancelled');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to sign in with Google. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={['#1E3A8A', '#3B82F6']} style={styles.container}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
      </TouchableOpacity>

      <View style={styles.content}>
        <View style={styles.header}>
          <Ionicons name="logo-google" size={80} color="#FFFFFF" />
          <Text style={styles.title}>Sign in with Google</Text>
          <Text style={styles.subtitle}>
            Use your Google account to continue
          </Text>
        </View>

        <TouchableOpacity
          style={styles.googleButton}
          onPress={handleGoogleSignIn}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <Ionicons name="logo-google" size={24} color="#FFFFFF" />
              <Text style={styles.buttonText}>Continue with Google</Text>
            </>
          )}
        </TouchableOpacity>

        <View style={styles.infoBox}>
          <Ionicons name="information-circle-outline" size={20} color="#E0E7FF" />
          <Text style={styles.infoText}>
            Your Google account will be securely linked to AI-IMUTIS
          </Text>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 30,
  },
  backButton: {
    marginTop: 50,
    marginBottom: 20,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 60,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 24,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#E0E7FF',
    textAlign: 'center',
  },
  googleButton: {
    backgroundColor: '#DB4437',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 12,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
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
