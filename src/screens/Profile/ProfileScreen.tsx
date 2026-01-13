import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { theme } from '../../styles/theme';
import { UserProfile } from '../../types';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import { logout, updateProfile } from '../../store/slices/authSlice';
import userAPI from '../../services/api/userAPI';
import { auth } from '../../firebaseConfig';

type Props = NativeStackScreenProps<RootStackParamList, 'Profile'>;

export default function ProfileScreen({ navigation }: Props): React.JSX.Element {
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<UserProfile>>({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phoneNumber: user?.phoneNumber || '',
  });

  const handleUpdateProfile = async () => {
    if (!formData.firstName || !formData.lastName) {
      Alert.alert('Error', 'First and last name are required');
      return;
    }

    try {
      setLoading(true);
      await userAPI.updateProfile(formData);
      dispatch(updateProfile(formData));
      setIsEditing(false);
      Alert.alert('Success', 'Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', onPress: () => {} },
      {
        text: 'Logout',
        onPress: async () => {
          try {
            await auth.signOut();
            dispatch(logout());
            navigation.navigate('Login');
          } catch (error) {
            console.error('Logout error:', error);
          }
        },
        style: 'destructive',
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.profileSection}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
              </Text>
            </View>
            <View style={styles.userInfo}>
              <Text style={styles.userName}>
                {user?.firstName} {user?.lastName}
              </Text>
              <Text style={styles.userEmail}>{user?.email}</Text>
            </View>
            {!isEditing && (
              <TouchableOpacity onPress={() => setIsEditing(true)}>
                <Ionicons name="pencil" size={24} color={theme.colors.primary.main} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Profile Form */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Personal Information</Text>
          
          <View style={styles.formGroup}>
            <Text style={styles.label}>First Name</Text>
            <TextInput
              style={[styles.input, !isEditing && styles.inputDisabled]}
              placeholder="First name"
              placeholderTextColor={theme.colors.neutral[400]}
              value={formData.firstName}
              onChangeText={text => setFormData({ ...formData, firstName: text })}
              editable={isEditing}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Last Name</Text>
            <TextInput
              style={[styles.input, !isEditing && styles.inputDisabled]}
              placeholder="Last name"
              placeholderTextColor={theme.colors.neutral[400]}
              value={formData.lastName}
              onChangeText={text => setFormData({ ...formData, lastName: text })}
              editable={isEditing}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={[styles.input, styles.inputDisabled]}
              placeholder="Email"
              placeholderTextColor={theme.colors.neutral[400]}
              value={formData.email}
              editable={false}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Phone Number</Text>
            <TextInput
              style={[styles.input, !isEditing && styles.inputDisabled]}
              placeholder="Phone number"
              placeholderTextColor={theme.colors.neutral[400]}
              value={formData.phoneNumber}
              onChangeText={text => setFormData({ ...formData, phoneNumber: text })}
              editable={isEditing}
            />
          </View>

          {isEditing && (
            <View style={styles.buttonGroup}>
              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleUpdateProfile}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <>
                    <Ionicons name="checkmark" size={20} color="#FFFFFF" />
                    <Text style={styles.saveButtonText}>Save Changes</Text>
                  </>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  setIsEditing(false);
                  setFormData({
                    firstName: user?.firstName || '',
                    lastName: user?.lastName || '',
                    email: user?.email || '',
                    phoneNumber: user?.phoneNumber || '',
                  });
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Menu Items */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate('Settings')}
          >
            <Ionicons name="settings" size={24} color={theme.colors.primary.main} />
            <Text style={styles.menuText}>Settings</Text>
            <Ionicons name="chevron-forward" size={24} color={theme.colors.neutral[400]} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate('SessionManager')}
          >
            <Ionicons name="lock" size={24} color={theme.colors.primary.main} />
            <Text style={styles.menuText}>Active Sessions</Text>
            <Ionicons name="chevron-forward" size={24} color={theme.colors.neutral[400]} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate('SavedAddresses')}
          >
            <Ionicons name="location" size={24} color={theme.colors.primary.main} />
            <Text style={styles.menuText}>Saved Addresses</Text>
            <Ionicons name="chevron-forward" size={24} color={theme.colors.neutral[400]} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate('PaymentMethods')}
          >
            <Ionicons name="card" size={24} color={theme.colors.primary.main} />
            <Text style={styles.menuText}>Payment Methods</Text>
            <Ionicons name="chevron-forward" size={24} color={theme.colors.neutral[400]} />
          </TouchableOpacity>
        </View>

        {/* App Info */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.menuItem}>
            <Ionicons name="help-circle" size={24} color={theme.colors.primary.main} />
            <Text style={styles.menuText}>Help & Support</Text>
            <Ionicons name="chevron-forward" size={24} color={theme.colors.neutral[400]} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <Ionicons name="document" size={24} color={theme.colors.primary.main} />
            <Text style={styles.menuText}>Privacy Policy</Text>
            <Ionicons name="chevron-forward" size={24} color={theme.colors.neutral[400]} />
          </TouchableOpacity>
        </View>

        {/* Logout Button */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleLogout}
          >
            <Ionicons name="log-out" size={20} color={theme.colors.status.error} />
            <Text style={styles.logoutButtonText}>Logout</Text>
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
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.lg,
    backgroundColor: theme.colors.primary.main,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: theme.colors.primary.light,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  avatarText: {
    ...theme.typography.styles.heading2,
    color: '#FFFFFF',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    ...theme.typography.styles.body,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: theme.spacing.xs,
  },
  userEmail: {
    ...theme.typography.styles.bodySmall,
    color: theme.colors.primary.light,
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
  inputDisabled: {
    backgroundColor: theme.colors.background.paper,
    color: theme.colors.text.secondary,
  },
  buttonGroup: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginTop: theme.spacing.lg,
  },
  saveButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary.main,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    gap: theme.spacing.sm,
  },
  saveButtonText: {
    ...theme.typography.styles.body,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  cancelButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.neutral[300],
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
  },
  cancelButtonText: {
    ...theme.typography.styles.body,
    fontWeight: '700',
    color: theme.colors.text.primary,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    backgroundColor: '#FFFFFF',
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.sm,
    ...theme.shadows.sm,
  },
  menuText: {
    ...theme.typography.styles.body,
    color: theme.colors.text.primary,
    flex: 1,
    marginHorizontal: theme.spacing.md,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 2,
    borderColor: theme.colors.status.error,
    gap: theme.spacing.sm,
  },
  logoutButtonText: {
    ...theme.typography.styles.body,
    fontWeight: '700',
    color: theme.colors.status.error,
  },
});
