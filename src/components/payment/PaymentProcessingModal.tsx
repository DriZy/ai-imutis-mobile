import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    ActivityIndicator,
    Animated,
    Easing,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../styles/theme';

interface PaymentProcessingModalProps {
    visible: boolean;
    status: 'processing' | 'success' | 'failed';
    message: string;
    onClose?: () => void;
}

export const PaymentProcessingModal: React.FC<PaymentProcessingModalProps> = ({
    visible,
    status,
    message,
}) => {
    const [iconScale] = useState(new Animated.Value(0));

    useEffect(() => {
        if (status === 'success' || status === 'failed') {
            Animated.spring(iconScale, {
                toValue: 1,
                friction: 5,
                tension: 40,
                useNativeDriver: true,
            }).start();
        } else {
            iconScale.setValue(0);
        }
    }, [status]);

    return (
        <Modal transparent visible={visible} animationType="fade">
            <View style={styles.overlay}>
                <View style={styles.container}>
                    {status === 'processing' && (
                        <View style={styles.content}>
                            <ActivityIndicator size="large" color={theme.colors.primary.main} style={styles.loader} />
                            <Text style={styles.title}>Processing Payment</Text>
                            <Text style={styles.message}>{message}</Text>
                        </View>
                    )}

                    {status === 'success' && (
                        <View style={styles.content}>
                            <Animated.View style={[styles.iconContainer, { transform: [{ scale: iconScale }] }]}>
                                <View style={[styles.circle, { backgroundColor: '#DCFCE7' }]}>
                                    <Ionicons name="checkmark" size={40} color="#16A34A" />
                                </View>
                            </Animated.View>
                            <Text style={styles.title}>Payment Successful!</Text>
                            <Text style={styles.message}>{message}</Text>
                        </View>
                    )}

                    {status === 'failed' && (
                        <View style={styles.content}>
                            <Animated.View style={[styles.iconContainer, { transform: [{ scale: iconScale }] }]}>
                                <View style={[styles.circle, { backgroundColor: '#FEE2E2' }]}>
                                    <Ionicons name="close" size={40} color="#DC2626" />
                                </View>
                            </Animated.View>
                            <Text style={[styles.title, { color: '#DC2626' }]}>Payment Failed</Text>
                            <Text style={styles.message}>{message}</Text>
                        </View>
                    )}
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: theme.spacing.xl,
    },
    container: {
        backgroundColor: '#FFFFFF',
        borderRadius: theme.borderRadius.xl,
        padding: theme.spacing.xl,
        width: '100%',
        maxWidth: 340,
        alignItems: 'center',
        ...theme.shadows.lg,
    },
    content: {
        alignItems: 'center',
        width: '100%',
    },
    loader: {
        marginBottom: theme.spacing.lg,
        transform: [{ scale: 1.5 }],
    },
    iconContainer: {
        marginBottom: theme.spacing.lg,
    },
    circle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        ...theme.typography.styles.heading2,
        color: theme.colors.text.primary,
        marginBottom: theme.spacing.sm,
        textAlign: 'center',
    },
    message: {
        ...theme.typography.styles.body,
        color: theme.colors.text.secondary,
        textAlign: 'center',
    },
});
