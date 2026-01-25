import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../styles/theme';
import {
  registerForPushNotificationsAsync,
  MOCK_NOTIFICATIONS,
  schedulePushNotification
} from '../../services/notifications/notificationService';
import { useToast } from '../../context/ToastContext';

export default function NotificationsTabScreen(): React.JSX.Element {
  const { showToast } = useToast();
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);
  const [refreshing, setRefreshing] = useState(false);
  const [permissionGranted, setPermissionGranted] = useState(false);

  useEffect(() => {
    setupNotifications();
  }, []);

  const setupNotifications = async () => {
    try {
      const token = await registerForPushNotificationsAsync();
      if (token) {
        setPermissionGranted(true);
        console.log('Push token obtained:', token);
      } else {
        // If simulated or failed, we just show UI anyway but logged
        console.log('Push token not obtained (simulator or denied)');
      }
    } catch (error) {
      console.error('Notification setup error:', error);
    }
  };

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      // Add a random new notification for demo purposes
      if (Math.random() > 0.5) {
        const newNotification = {
          id: String(Date.now()),
          title: 'New Price Alert',
          body: 'Prices for trips to Yaoundé have dropped!',
          time: 'Just now',
          read: false,
          type: 'info',
        };
        setNotifications(prev => [newNotification, ...prev]);
        showToast('New notifications available', 'info');

        // Trigger a local notification for fun
        schedulePushNotification(
          newNotification.title,
          newNotification.body
        );
      }
      setRefreshing(false);
    }, 1500);
  }, []);

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    showToast('Notification deleted', 'success');
  };

  const getIconForType = (type: string) => {
    switch (type) {
      case 'booking':
        return { name: 'ticket-outline', color: theme.colors.primary.main, bg: theme.colors.primary.light + '20' };
      case 'reminder':
        return { name: 'alarm-outline', color: '#F59E0B', bg: '#FFFBEB' };
      case 'info':
      default:
        return { name: 'information-circle-outline', color: '#3B82F6', bg: '#EFF6FF' };
    }
  };

  const renderItem = ({ item }: { item: any }) => {
    const iconStyle = getIconForType(item.type);

    return (
      <TouchableOpacity
        style={[styles.notificationCard, !item.read && styles.unreadCard]}
        onPress={() => markAsRead(item.id)}
        activeOpacity={0.7}
      >
        <View style={[styles.iconContainer, { backgroundColor: iconStyle.bg }]}>
          <Ionicons name={iconStyle.name as any} size={24} color={iconStyle.color} />
        </View>
        <View style={styles.contentContainer}>
          <View style={styles.headerRow}>
            <Text style={[styles.cardTitle, !item.read && styles.unreadText]}>{item.title}</Text>
            <Text style={styles.timeText}>{item.time}</Text>
          </View>
          <Text style={styles.cardBody} numberOfLines={2}>{item.body}</Text>
        </View>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => deleteNotification(item.id)}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="close" size={16} color={theme.colors.neutral[400]} />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Notifications</Text>
        <TouchableOpacity onPress={() => setNotifications([])}>
          <Text style={styles.clearAllText}>Clear All</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={notifications}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.primary.main} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="notifications-off-outline" size={64} color={theme.colors.neutral[300]} />
            <Text style={styles.emptyText}>No notifications yet</Text>
            <Text style={styles.emptySubtext}>We'll notify you when something important happens.</Text>

            <TouchableOpacity
              style={styles.simulateButton}
              onPress={() => {
                schedulePushNotification('Test Notification', 'This is a test notification!');
                showToast('Test notification scheduled (check system tray)', 'success');
              }}
            >
              <Text style={styles.simulateButtonText}>Test Push Notification</Text>
            </TouchableOpacity>
          </View>
        }
      />
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
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.neutral[200],
  },
  headerTitle: {
    ...theme.typography.styles.heading2,
    color: theme.colors.text.primary,
  },
  clearAllText: {
    ...theme.typography.styles.bodySmall,
    color: theme.colors.primary.main,
    fontWeight: '600',
  },
  listContent: {
    padding: theme.spacing.md,
    paddingBottom: 80,
    flexGrow: 1,
  },
  notificationCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    ...theme.shadows.sm,
    alignItems: 'flex-start',
  },
  unreadCard: {
    backgroundColor: '#F0F9FF', // Very light blue
    borderLeftWidth: 3,
    borderLeftColor: theme.colors.primary.main,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  contentContainer: {
    flex: 1,
    marginRight: theme.spacing.sm,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  cardTitle: {
    ...theme.typography.styles.body,
    fontWeight: '600',
    color: theme.colors.text.primary,
    flex: 1,
    marginRight: 8,
  },
  unreadText: {
    fontWeight: '700',
    color: theme.colors.primary.main,
  },
  timeText: {
    fontSize: 12,
    color: theme.colors.text.secondary,
  },
  cardBody: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    lineHeight: 20,
  },
  deleteButton: {
    padding: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
    paddingHorizontal: theme.spacing.xl,
  },
  emptyText: {
    ...theme.typography.styles.heading3,
    color: theme.colors.text.primary,
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.sm,
  },
  emptySubtext: {
    ...theme.typography.styles.body,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
  },
  simulateButton: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.primary.main,
    borderRadius: theme.borderRadius.lg,
  },
  simulateButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});