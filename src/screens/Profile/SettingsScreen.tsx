import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { theme } from '../../styles/theme';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import userAPI from '../../services/api/userAPI';

type Props = NativeStackScreenProps<RootStackParamList, 'SettingsScreen'>;

export default function SettingsScreen({ navigation }: Props): React.JSX.Element {
  const { user } = useSelector((state: RootState) => state.auth);
  const [preferences, setPreferences] = useState({
    pushNotifications: true,
    locationTracking: true,
    deviceIPTracking: true,
    darkMode: false,
    autoRefreshLocation: true,
  });

  const handlePreferenceChange = async (key: string, value: boolean) => {
    setPreferences({ ...preferences, [key]: value });
    try {
      await userAPI.updatePreferences({ [key]: value });
    } catch (error) {
      console.error('Error updating preference:', error);
    }
  };

  const SettingItem = ({
    icon,
    title,
    description,
    value,
    onToggle,
  }: {
    icon: string;
    title: string;
    description: string;
    value: boolean;
    onToggle: (val: boolean) => void;
  }) => (
    <View style={styles.settingItem}>
      <View style={styles.settingLeft}>
        <View style={styles.iconContainer}>
          <Ionicons name={icon as any} size={20} color={theme.colors.primary.main} />
        </View>
        <View style={styles.settingText}>
          <Text style={styles.settingTitle}>{title}</Text>
          <Text style={styles.settingDescription}>{description}</Text>
        </View>
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{
          false: theme.colors.neutral[300],
          true: theme.colors.primary.light,
        }}
        thumbColor={value ? theme.colors.primary.main : theme.colors.neutral[400]}
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={28} color={theme.colors.primary.main} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Settings</Text>
        </View>

        {/* Notifications */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          <SettingItem
            icon="notifications"
            title="Push Notifications"
            description="Receive booking and travel updates"
            value={preferences.pushNotifications}
            onToggle={val => handlePreferenceChange('pushNotifications', val)}
          />
        </View>

        {/* Location & Tracking */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Location & Privacy</Text>
          <SettingItem
            icon="location"
            title="Location Tracking"
            description="Allow app to access your GPS location"
            value={preferences.locationTracking}
            onToggle={val => handlePreferenceChange('locationTracking', val)}
          />
          <SettingItem
            icon="shield"
            title="Device IP Tracking"
            description="Track device IP for session management"
            value={preferences.deviceIPTracking}
            onToggle={val => handlePreferenceChange('deviceIPTracking', val)}
          />
          <SettingItem
            icon="sync"
            title="Auto-Refresh Location"
            description="Automatically update location in background"
            value={preferences.autoRefreshLocation}
            onToggle={val => handlePreferenceChange('autoRefreshLocation', val)}
          />
        </View>

        {/* Display */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Display</Text>
          <SettingItem
            icon="moon"
            title="Dark Mode"
            description="Use dark theme for the app"
            value={preferences.darkMode}
            onToggle={val => handlePreferenceChange('darkMode', val)}
          />
        </View>

        {/* App Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About App</Text>
          <TouchableOpacity style={styles.infoItem}>
            <View style={styles.infoLeft}>
              <Ionicons name="information-circle" size={20} color={theme.colors.primary.main} />
              <View style={styles.infoText}>
                <Text style={styles.infoTitle}>Version</Text>
                <Text style={styles.infoDescription}>1.0.0</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.colors.neutral[400]} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.infoItem}>
            <View style={styles.infoLeft}>
              <Ionicons name="book" size={20} color={theme.colors.primary.main} />
              <View style={styles.infoText}>
                <Text style={styles.infoTitle}>Changelog</Text>
                <Text style={styles.infoDescription}>View recent updates</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.colors.neutral[400]} />
          </TouchableOpacity>
        </View>

        {/* Data & Storage */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data & Storage</Text>
          <TouchableOpacity style={styles.infoItem}>
            <View style={styles.infoLeft}>
              <Ionicons name="trash" size={20} color={theme.colors.status.error} />
              <View style={styles.infoText}>
                <Text style={styles.infoTitle}>Clear Cache</Text>
                <Text style={styles.infoDescription}>~15 MB</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.colors.neutral[400]} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.infoItem}>
            <View style={styles.infoLeft}>
              <Ionicons name="download" size={20} color={theme.colors.primary.main} />
              <View style={styles.infoText}>
                <Text style={styles.infoTitle}>Offline Maps</Text>
                <Text style={styles.infoDescription}>Download for offline use</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.colors.neutral[400]} />
          </TouchableOpacity>
        </View>

        {/* Account */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.infoItem}>
            <View style={styles.infoLeft}>
              <Ionicons name="key" size={20} color={theme.colors.primary.main} />
              <View style={styles.infoText}>
                <Text style={styles.infoTitle}>Change Password</Text>
                <Text style={styles.infoDescription}>Update your password</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.colors.neutral[400]} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.infoItem}>
            <View style={styles.infoLeft}>
              <Ionicons name="trash-bin" size={20} color={theme.colors.status.error} />
              <View style={styles.infoText}>
                <Text style={[styles.infoTitle, { color: theme.colors.status.error }]}>
                  Delete Account
                </Text>
                <Text style={styles.infoDescription}>Permanently delete your account</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.colors.neutral[400]} />
          </TouchableOpacity>
        </View>
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
    paddingVertical: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.neutral[200],
  },
  headerTitle: {
    ...theme.typography.styles.heading2,
    color: theme.colors.text.primary,
    marginLeft: theme.spacing.md,
    flex: 1,
  },
  section: {
    marginHorizontal: theme.spacing.md,
    marginVertical: theme.spacing.lg,
  },
  sectionTitle: {
    ...theme.typography.styles.heading3,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    backgroundColor: '#FFFFFF',
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.sm,
    ...theme.shadows.sm,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.primary.light + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    ...theme.typography.styles.body,
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginBottom: 4,
  },
  settingDescription: {
    ...theme.typography.styles.caption,
    color: theme.colors.text.secondary,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    backgroundColor: '#FFFFFF',
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.sm,
    ...theme.shadows.sm,
  },
  infoLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  infoText: {
    flex: 1,
    marginLeft: theme.spacing.md,
  },
  infoTitle: {
    ...theme.typography.styles.body,
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginBottom: 4,
  },
  infoDescription: {
    ...theme.typography.styles.caption,
    color: theme.colors.text.secondary,
  },
});
