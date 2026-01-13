import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { theme } from '../../styles/theme';
import { DeviceSession } from '../../types';
import userAPI from '../../services/api/userAPI';
import { formatDateTime } from '../../utils/formatting';

type Props = NativeStackScreenProps<RootStackParamList, 'SessionManager'>;

export default function SessionManagerScreen({ navigation }: Props): React.JSX.Element {
  const [sessions, setSessions] = useState<DeviceSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      setLoading(true);
      const response = await userAPI.getSessions();
      setSessions(response.sessions);
    } catch (error) {
      console.error('Error loading sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadSessions();
    setRefreshing(false);
  };

  const handleRevokeSession = async (sessionId: string) => {
    Alert.alert('Revoke Session', 'Are you sure you want to revoke this session?', [
      { text: 'Cancel', onPress: () => {} },
      {
        text: 'Revoke',
        onPress: async () => {
          try {
            await userAPI.revokeSession(sessionId);
            setSessions(prev => prev.filter(s => s.sessionId !== sessionId));
            Alert.alert('Success', 'Session revoked successfully');
          } catch (error) {
            console.error('Error revoking session:', error);
            Alert.alert('Error', 'Failed to revoke session');
          }
        },
        style: 'destructive',
      },
    ]);
  };

  const handleRevokeAllOtherSessions = async () => {
    Alert.alert(
      'Revoke All Other Sessions',
      'Are you sure you want to revoke all other sessions?',
      [
        { text: 'Cancel', onPress: () => {} },
        {
          text: 'Revoke All',
          onPress: async () => {
            try {
              // Keep only current session
              const currentSession = sessions.find(s => s.isActive);
              await Promise.all(
                sessions
                  .filter(s => !s.isActive)
                  .map(s => userAPI.revokeSession(s.sessionId))
              );
              if (currentSession) {
                setSessions([currentSession]);
              }
              Alert.alert('Success', 'All other sessions revoked');
            } catch (error) {
              console.error('Error revoking sessions:', error);
              Alert.alert('Error', 'Failed to revoke sessions');
            }
          },
          style: 'destructive',
        },
      ]
    );
  };

  const renderSession = ({ item, index }: { item: DeviceSession; index: number }) => (
    <View style={styles.sessionCard}>
      <View style={styles.sessionContent}>
        <View style={styles.sessionHeader}>
          <View style={styles.deviceInfo}>
            <Ionicons
              name={item.deviceType === 'iPhone' ? 'phone-portrait' : 'phone-portrait'}
              size={24}
              color={theme.colors.primary.main}
            />
            <View style={styles.deviceText}>
              <Text style={styles.deviceType}>{item.deviceType}</Text>
              {item.isActive && (
                <View style={styles.activeBadge}>
                  <Text style={styles.activeBadgeText}>Current Device</Text>
                </View>
              )}
            </View>
          </View>
          {!item.isActive && (
            <TouchableOpacity
              style={styles.revokeIcon}
              onPress={() => handleRevokeSession(item.sessionId)}
            >
              <Ionicons name="trash" size={20} color={theme.colors.status.error} />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.sessionDetails}>
          <View style={styles.detailRow}>
            <Ionicons name="hardware-chip" size={16} color={theme.colors.neutral[500]} />
            <Text style={styles.detailLabel}>Device OS</Text>
            <Text style={styles.detailValue}>{item.deviceOS}</Text>
          </View>

          <View style={styles.detailRow}>
            <Ionicons name="globe" size={16} color={theme.colors.neutral[500]} />
            <Text style={styles.detailLabel}>IP Address</Text>
            <Text style={styles.detailValue}>{item.deviceIP}</Text>
          </View>

          <View style={styles.detailRow}>
            <Ionicons name="time" size={16} color={theme.colors.neutral[500]} />
            <Text style={styles.detailLabel}>Last Active</Text>
            <Text style={styles.detailValue}>
              {formatDateTime(new Date(item.lastActivity))}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Ionicons
              name={item.isActive ? 'checkmark-circle' : 'close-circle'}
              size={16}
              color={item.isActive ? theme.colors.status.success : theme.colors.status.error}
            />
            <Text style={styles.detailLabel}>Status</Text>
            <Text style={[styles.detailValue, { color: item.isActive ? theme.colors.status.success : theme.colors.status.error }]}>
              {item.isActive ? 'Active' : 'Inactive'}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={28} color={theme.colors.primary.main} />
        </TouchableOpacity>
        <View style={styles.headerText}>
          <Text style={styles.headerTitle}>Active Sessions</Text>
          <Text style={styles.headerSubtitle}>Manage your logged-in devices</Text>
        </View>
      </View>

      {loading ? (
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={theme.colors.primary.main} />
        </View>
      ) : (
        <>
          {sessions.length > 1 && (
            <TouchableOpacity
              style={styles.revokeAllButton}
              onPress={handleRevokeAllOtherSessions}
            >
              <Ionicons name="warning" size={16} color={theme.colors.status.warning} />
              <Text style={styles.revokeAllText}>Revoke All Other Sessions</Text>
            </TouchableOpacity>
          )}

          <FlatList
            data={sessions}
            renderItem={renderSession}
            keyExtractor={item => item.sessionId}
            contentContainerStyle={styles.listContent}
            onRefresh={handleRefresh}
            refreshing={refreshing}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons name="lock-closed" size={48} color={theme.colors.neutral[300]} />
                <Text style={styles.emptyText}>No active sessions</Text>
              </View>
            }
          />
        </>
      )}
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
  headerText: {
    flex: 1,
    marginLeft: theme.spacing.md,
  },
  headerTitle: {
    ...theme.typography.styles.heading2,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  headerSubtitle: {
    ...theme.typography.styles.bodySmall,
    color: theme.colors.text.secondary,
  },
  revokeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: theme.spacing.md,
    marginVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    backgroundColor: '#FEF3C7',
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.status.warning,
  },
  revokeAllText: {
    ...theme.typography.styles.bodySmall,
    color: '#92400E',
    fontWeight: '600',
    marginLeft: theme.spacing.sm,
  },
  listContent: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
  },
  sessionCard: {
    marginBottom: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
    ...theme.shadows.md,
  },
  sessionContent: {
    padding: theme.spacing.md,
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.md,
  },
  deviceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  deviceText: {
    marginLeft: theme.spacing.md,
    flex: 1,
  },
  deviceType: {
    ...theme.typography.styles.body,
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginBottom: 4,
  },
  activeBadge: {
    backgroundColor: theme.colors.status.success + '20',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.sm,
    alignSelf: 'flex-start',
  },
  activeBadgeText: {
    ...theme.typography.styles.caption,
    color: theme.colors.status.success,
    fontWeight: '600',
  },
  revokeIcon: {
    padding: theme.spacing.sm,
  },
  sessionDetails: {
    borderTopWidth: 1,
    borderTopColor: theme.colors.neutral[200],
    paddingTop: theme.spacing.md,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  detailLabel: {
    ...theme.typography.styles.caption,
    color: theme.colors.text.secondary,
    fontWeight: '600',
    width: 100,
    marginLeft: theme.spacing.sm,
  },
  detailValue: {
    ...theme.typography.styles.caption,
    color: theme.colors.text.primary,
    fontFamily: 'monospace',
    flex: 1,
    textAlign: 'right',
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: theme.spacing.xl,
  },
  emptyText: {
    ...theme.typography.styles.body,
    color: theme.colors.text.secondary,
    marginTop: theme.spacing.md,
  },
});
