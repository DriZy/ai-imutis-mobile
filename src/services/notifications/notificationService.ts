import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

// Configure how notifications behave when the app is in foreground
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
    }),
});

export async function registerForPushNotificationsAsync() {
    let token;

    if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
            name: 'default',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#FF231F7C',
        });
    }

    if (Device.isDevice) {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;

        if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }

        if (finalStatus !== 'granted') {
            console.log('Failed to get push token for push notification!');
            return undefined;
        }

        try {
            const projectId =
                Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;

            token = (await Notifications.getExpoPushTokenAsync({
                projectId,
            })).data;

            console.log('Expo Push Token:', token);
        } catch (e) {
            console.error('Error getting push token:', e);
        }
    } else {
        console.log('Must use physical device for Push Notifications');
    }

    return token;
}

export async function schedulePushNotification(
    title: string,
    body: string,
    data: any = {},
    trigger: any = null
) {
    await Notifications.scheduleNotificationAsync({
        content: {
            title,
            body,
            data,
        },
        trigger,
    });
}

// Mock notifications data for the UI
export const MOCK_NOTIFICATIONS = [
    {
        id: '1',
        title: 'Booking Confirmed',
        body: 'Your trip to Kribi has been successfully booked.',
        time: '2 hours ago',
        read: false,
        type: 'booking',
    },
    {
        id: '2',
        title: 'Trip Reminder',
        body: 'Your trip to Douala starts tomorrow at 8:00 AM.',
        time: '1 day ago',
        read: true,
        type: 'reminder',
    },
    {
        id: '3',
        title: 'Welcome to Ai-Imutis',
        body: 'Explore Cameroon like never before. Start your journey!',
        time: '2 days ago',
        read: true,
        type: 'info',
    },
];
