import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    Image,
    ActivityIndicator,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { theme } from '../../styles/theme';
import { auth } from '../../../firebaseConfig';
import { updateProfile } from 'firebase/auth';
import { useToast } from '../../context/ToastContext';

type Props = NativeStackScreenProps<RootStackParamList, 'EditProfile'>;

export default function EditProfileScreen({ navigation }: Props): React.JSX.Element {
    const user = auth.currentUser;
    const { showToast } = useToast();

    const [displayName, setDisplayName] = useState(user?.displayName || '');
    const [email, setEmail] = useState(user?.email || '');
    const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber || '');
    const [photoURL, setPhotoURL] = useState(user?.photoURL || '');
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.5,
        });

        if (!result.canceled) {
            uploadImage(result.assets[0].uri);
        }
    };

    const uploadImage = async (uri: string) => {
        setUploading(true);
        try {
            const response = await fetch(uri);
            const blob = await response.blob();
            const storage = getStorage();
            const fileRef = ref(storage, `avatars/${user?.uid}`);

            await uploadBytes(fileRef, blob);
            const downloadURL = await getDownloadURL(fileRef);

            setPhotoURL(downloadURL);
            showToast('Photo uploaded!', 'success');
        } catch (error) {
            console.error(error);
            showToast('Failed to upload image', 'error');
        } finally {
            setUploading(false);
        }
    };

    const handleSave = async () => {
        if (!displayName.trim()) {
            showToast('Name cannot be empty', 'warning');
            return;
        }

        setLoading(true);
        try {
            if (auth.currentUser) {
                await updateProfile(auth.currentUser, {
                    displayName: displayName,
                    photoURL: photoURL,
                });

                showToast('Profile updated successfully', 'success');
                navigation.goBack();
            }
        } catch (error: any) {
            showToast(error.message || 'Failed to update profile', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={theme.colors.text.primary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Edit Profile</Text>
                <TouchableOpacity onPress={handleSave} disabled={loading || uploading}>
                    <Text style={[styles.saveText, (loading || uploading) && styles.saveTextDisabled]}>
                        {loading ? 'Saving...' : 'Save'}
                    </Text>
                </TouchableOpacity>
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
            >
                <ScrollView style={styles.content}>
                    <View style={styles.avatarContainer}>
                        {photoURL ? (
                            <Image source={{ uri: photoURL }} style={styles.avatarImage} />
                        ) : (
                            <LinearGradient
                                colors={[theme.colors.primary.light, theme.colors.primary.main]}
                                style={styles.avatarPlaceholder}
                            >
                                <Text style={styles.avatarText}>
                                    {displayName ? displayName[0].toUpperCase() : 'U'}
                                </Text>
                            </LinearGradient>
                        )}

                        <TouchableOpacity
                            style={styles.changeAvatarButton}
                            onPress={pickImage}
                            disabled={uploading}
                        >
                            {uploading ? (
                                <ActivityIndicator size="small" color="#FFF" />
                            ) : (
                                <Ionicons name="camera" size={20} color="#FFFFFF" />
                            )}
                        </TouchableOpacity>
                    </View>

                    <View style={styles.form}>
                        {/* Full Name */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Full Name</Text>
                            <View style={styles.inputContainer}>
                                <Ionicons name="person-outline" size={20} color={theme.colors.neutral[400]} />
                                <TextInput
                                    style={styles.input}
                                    value={displayName}
                                    onChangeText={setDisplayName}
                                    placeholder="Enter your full name"
                                    placeholderTextColor={theme.colors.neutral[400]}
                                />
                            </View>
                        </View>

                        {/* Email (Read Only) */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Email</Text>
                            <View style={[styles.inputContainer, styles.inputDisabledContainer]}>
                                <Ionicons name="mail-outline" size={20} color={theme.colors.neutral[400]} />
                                <TextInput
                                    style={[styles.input, styles.inputDisabled]}
                                    value={email}
                                    editable={false}
                                />
                            </View>
                            <Text style={styles.helperText}>Email cannot be changed directly.</Text>
                        </View>

                        {/* Phone Number */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Phone Number</Text>
                            <View style={styles.inputContainer}>
                                <Ionicons name="call-outline" size={20} color={theme.colors.neutral[400]} />
                                <TextInput
                                    style={styles.input}
                                    value={phoneNumber}
                                    onChangeText={setPhoneNumber}
                                    placeholder="Add phone number"
                                    placeholderTextColor={theme.colors.neutral[400]}
                                    keyboardType="phone-pad"
                                />
                            </View>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
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
        justifyContent: 'space-between',
        paddingHorizontal: theme.spacing.lg,
        paddingVertical: theme.spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.neutral[200],
        backgroundColor: '#FFFFFF',
    },
    backButton: {
        padding: 4,
    },
    headerTitle: {
        ...theme.typography.styles.heading3,
        color: theme.colors.text.primary,
    },
    saveText: {
        ...theme.typography.styles.body,
        fontWeight: '600',
        color: theme.colors.primary.main,
    },
    saveTextDisabled: {
        color: theme.colors.neutral[400],
    },
    keyboardView: {
        flex: 1,
    },
    content: {
        flex: 1,
    },
    avatarContainer: {
        alignItems: 'center',
        marginVertical: 32,
        position: 'relative',
    },
    avatarImage: {
        width: 100,
        height: 100,
        borderRadius: 50,
    },
    avatarPlaceholder: {
        width: 100,
        height: 100,
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        fontSize: 40,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    changeAvatarButton: {
        position: 'absolute',
        bottom: 0,
        right: '35%',
        backgroundColor: theme.colors.primary.main,
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#FFFFFF',
    },
    form: {
        paddingHorizontal: theme.spacing.lg,
    },
    inputGroup: {
        marginBottom: theme.spacing.xl,
    },
    label: {
        ...theme.typography.styles.bodySmall,
        fontWeight: '600',
        color: theme.colors.text.secondary,
        marginBottom: theme.spacing.sm,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: theme.colors.neutral[300],
        borderRadius: theme.borderRadius.lg,
        paddingHorizontal: theme.spacing.md,
        height: 48,
        gap: theme.spacing.sm,
    },
    input: {
        flex: 1,
        ...theme.typography.styles.body,
        color: theme.colors.text.primary,
        height: '100%',
    },
    inputDisabledContainer: {
        backgroundColor: theme.colors.neutral[100],
    },
    inputDisabled: {
        color: theme.colors.neutral[500],
    },
    helperText: {
        ...theme.typography.styles.caption,
        color: theme.colors.neutral[500],
        marginTop: 4,
        marginLeft: 4,
    },
});