import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../styles/theme';

export default function TourismTabScreen(): React.JSX.Element {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Ionicons name="images" size={64} color={theme.colors.primary.main} />
        <Text style={styles.title}>Tourism</Text>
        <Text style={styles.subtitle}>Discover amazing places and attractions</Text>

        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Explore Cities</Text>
          <Ionicons name="chevron-forward" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.default,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
  },
  title: {
    ...theme.typography.styles.heading1,
    color: theme.colors.text.primary,
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.sm,
  },
  subtitle: {
    ...theme.typography.styles.body,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primary.main,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    gap: theme.spacing.sm,
  },
  buttonText: {
    ...theme.typography.styles.body,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});