import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Switch,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { CompositeNavigationProp, useFocusEffect } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, TabParamList } from '../../navigation/AppNavigator';
import { theme } from '../../styles/theme';
import { auth } from '../../../firebaseConfig';
import { signOut } from 'firebase/auth';
import { useToast } from '../../context/ToastContext';

type ProfileScreenNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<TabParamList, 'Profile'>,
  NativeStackNavigationProp<RootStackParamList>
>;

type Props = {
  navigation: ProfileScreenNavigationProp;
};

export default function ProfileTabScreen({ navigation }: Props): React.JSX.Element {
  const { showToast } = useToast();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [userData, setUserData] = useState({
    displayName: auth.currentUser?.displayName || 'User',
    email: auth.currentUser?.email || '',
    initial: (auth.currentUser?.displayName || 'U')[0].toUpperCase(),
  });

  // Refresh user data when screen focuses (in case they edited profile)
  useFocusEffect(
    useCallback(() => {
      if (auth.currentUser) {
        setUserData({
          displayName: auth.currentUser.displayName || 'User',
          email: auth.currentUser.email || '',
          initial: (auth.currentUser.displayName || 'U')[0].toUpperCase(),
        });
      }
    }, [])
  );

  const handleSignOut = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut(auth);
              // Navigation to Auth handled by AppNavigator auth state listener
              showToast('Signed out successfully', 'success');
            } catch (error: any) {
              showToast('Failed to sign out', 'error');
            }
          },
        },
      ]
    );
  };

  const menuItems = [
    {
      icon: 'person-outline',
      label: 'Edit Profile',
      value: null,
      onPress: () => navigation.navigate('EditProfile'),
    },
    {
      icon: 'card-outline',
      label: 'Payment Methods',
      value: null,
      onPress: () => showToast('Payment methods management coming soon', 'info'),
    },
    {
      icon: 'time-outline',
      label: 'Booking History',
      value: null,
      onPress: () => navigation.navigate('BookingHistory'),
    },
    {
      icon: 'heart-outline',
      label: 'Saved Places',
      value: null,
      onPress: () => showToast('Saved places coming soon', 'info'),
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Profile</Text>
          <TouchableOpacity style={styles.settingsButton}>
            <Ionicons name="settings-outline" size={24} color={theme.colors.text.primary} />
          </TouchableOpacity>
        </View>

        <View style={styles.profileCard}>
          <LinearGradient
            colors={[theme.colors.primary.light, theme.colors.primary.main]}
            style={styles.avatarContainer}
          >
            <Text style={styles.avatarText}>{userData.initial}</Text>
          </LinearGradient>
          <Text style={styles.userName}>{userData.displayName}</Text>
          <Text style={styles.userEmail}>{userData.email}</Text>

          <TouchableOpacity
            style={styles.editButton}
            onPress={() => navigation.navigate('EditProfile')}
          >
            <Text style={styles.editButtonText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>0</Text>
            <Text style={styles.statLabel}>Trips</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>0</Text>
            <Text style={styles.statLabel}>Reviews</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>0</Text>
            <Text style={styles.statLabel}>Points</Text>
          </View>
        </View>

        <View style={styles.menuSection}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.menuItem}
              onPress={item.onPress}
            >
              <View style={styles.menuIconContainer}>
                <Ionicons name={item.icon as any} size={22} color={theme.colors.primary.main} />
              </View>
              <Text style={styles.menuLabel}>{item.label}</Text>
              <Ionicons name="chevron-forward" size={20} color={theme.colors.neutral[400]} />
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.menuSection}>
          <View style={styles.menuItem}>
            <View style={[styles.menuIconContainer, { backgroundColor: '#F0FDF4' }]}>
              <Ionicons name="notifications-outline" size={22} color="#16A34A" />
            </View>
            <Text style={styles.menuLabel}>Notifications</Text>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: theme.colors.neutral[300], true: theme.colors.primary.main }}
            />
          </View>
          <View style={styles.menuItem}>
            <View style={[styles.menuIconContainer, { backgroundColor: '#F3E8FF' }]}>
              <Ionicons name="moon-outline" size={22} color="#9333EA" />
            </View>
            <Text style={styles.menuLabel}>Dark Mode</Text>
            <Switch
              value={darkMode}
              onValueChange={setDarkMode}
              trackColor={{ false: theme.colors.neutral[300], true: theme.colors.primary.main }}
            />
          </View>
        </View>

        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
          <Ionicons name="log-out-outline" size={20} color="#DC2626" />
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>

        <Text style={styles.versionText}>Version 1.0.0</Text>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
  },
  headerTitle: {
    ...theme.typography.styles.heading1,
    color: theme.colors.text.primary,
  },
  settingsButton: {
    padding: 4,
  },
  profileCard: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xl,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
    shadowColor: theme.colors.primary.main,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  avatarText: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  userName: {
    ...theme.typography.styles.heading2,
    color: theme.colors.text.primary,
    marginBottom: 4,
  },
  userEmail: {
    ...theme.typography.styles.body,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.lg,
  },
  editButton: {
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.primary.main,
    borderRadius: theme.borderRadius.full,
  },
  editButtonText: {
    ...theme.typography.styles.bodySmall,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.lg,
    backgroundColor: '#FFFFFF',
    borderRadius: theme.borderRadius.xl,
    ...theme.shadows.sm,
    marginBottom: theme.spacing.xl,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
    marginBottom: 4,
  },
  statLabel: {
    ...theme.typography.styles.caption,
    color: theme.colors.text.secondary,
  },
  statDivider: {
    width: 1,
    height: '60%',
    backgroundColor: theme.colors.neutral[200],
    alignSelf: 'center',
  },
  menuSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: theme.borderRadius.xl,
    marginHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    ...theme.shadows.sm,
    marginBottom: theme.spacing.lg,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: theme.colors.primary.light + '15', // 15% opacity
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  menuLabel: {
    flex: 1,
    ...theme.typography.styles.body,
    fontWeight: '500',
    color: theme.colors.text.primary,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    backgroundColor: '#FEF2F2',
    borderRadius: theme.borderRadius.lg,
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.xl,
  },
  signOutText: {
    ...theme.typography.styles.body,
    fontWeight: '600',
    color: '#DC2626',
  },
  versionText: {
    textAlign: 'center',
    ...theme.typography.styles.caption,
    color: theme.colors.neutral[400],
    marginBottom: theme.spacing.xl,
  },
});