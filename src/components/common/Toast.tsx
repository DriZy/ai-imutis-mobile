import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../styles/theme';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastProps {
    message: string;
    type?: ToastType;
    onHide: () => void;
    duration?: number;
}

const { width } = Dimensions.get('window');

export const Toast: React.FC<ToastProps> = ({
    message,
    type = 'info',
    onHide,
    duration = 4000
}) => {
    const translateY = useRef(new Animated.Value(-100)).current;
    const opacity = useRef(new Animated.Value(0)).current;

    // Colors based on type
    const getColors = () => {
        switch (type) {
            case 'success':
                return { bg: '#ECFDF5', border: '#059669', text: '#064E3B', icon: 'checkmark-circle' };
            case 'error':
                return { bg: '#FEF2F2', border: '#DC2626', text: '#7F1D1D', icon: 'alert-circle' };
            case 'warning':
                return { bg: '#FFFBEB', border: '#D97706', text: '#78350F', icon: 'warning' };
            case 'info':
            default:
                return { bg: '#EFF6FF', border: '#2563EB', text: '#1E3A8A', icon: 'information-circle' };
        }
    };

    const colors = getColors();

    useEffect(() => {
        // Show animation
        Animated.parallel([
            Animated.spring(translateY, {
                toValue: 50, // Top safe area offset
                useNativeDriver: true,
                friction: 8,
            }),
            Animated.timing(opacity, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
            }),
        ]).start();

        // Auto hide
        const timer = setTimeout(() => {
            hide();
        }, duration);

        return () => clearTimeout(timer);
    }, []);

    const hide = () => {
        Animated.parallel([
            Animated.timing(translateY, {
                toValue: -100,
                duration: 300,
                useNativeDriver: true,
            }),
            Animated.timing(opacity, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
            }),
        ]).start(() => {
            onHide();
        });
    };

    return (
        <Animated.View
            style={[
                styles.container,
                {
                    transform: [{ translateY }],
                    opacity,
                    backgroundColor: colors.bg,
                    borderLeftColor: colors.border,
                },
            ]}
        >
            <View style={styles.content}>
                <Ionicons name={colors.icon as any} size={24} color={colors.border} />
                <Text style={[styles.message, { color: colors.text }]}>{message}</Text>
            </View>
            <TouchableOpacity onPress={hide} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <Ionicons name="close" size={20} color={colors.text} />
            </TouchableOpacity>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 0,
        left: 20,
        right: 20,
        zIndex: 9999,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderRadius: 12,
        borderLeftWidth: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 8,
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        gap: 12,
    },
    message: {
        fontSize: 14,
        fontWeight: '500',
        flex: 1,
    },
});
