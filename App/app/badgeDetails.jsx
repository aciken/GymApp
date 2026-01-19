import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as Haptics from 'expo-haptics';

export default function BadgeDetailsScreen() {
    const router = useRouter();
    const { name, image, description, primaryColor, secondaryColor, glowColor } = useLocalSearchParams();
    const badgeImage = image ? { uri: image } : null;

    const handleShare = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        // Implement sharing logic here
        console.log('Sharing badge:', name);
    };

    return (
        <LinearGradient colors={[primaryColor || '#1D2A21', secondaryColor || '#101010']} style={styles.container}>
            <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Ionicons name="close" size={28} color="rgba(255, 255, 255, 0.7)" />
                    </TouchableOpacity>
                </View>

                <View style={styles.contentContainer}>
                    <View style={[styles.badgeContainer, { shadowColor: glowColor || '#A8FFC1' }]}>
                        <Image source={badgeImage} style={styles.badgeImage} />
                    </View>

                    <Text style={styles.badgeName}>{name}</Text>
                    <Text style={styles.badgeDescription}>{description}</Text>
                    <Text style={styles.dateEarned}>EARNED ON 04 OCT 2025</Text>

                    <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
                        <Ionicons name="share-social" size={20} color="#FFFFFF" style={styles.shareIcon} />
                        <Text style={styles.shareButtonText}>Share</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    safeArea: { flex: 1 },
    header: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        paddingHorizontal: 20,
        paddingTop: 10,
    },
    backButton: {
        padding: 5,
    },
    contentContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 30,
        paddingBottom: 50,
    },
    badgeContainer: {
        marginBottom: 30,
        shadowColor: '#A8FFC1',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 30,
    },
    badgeImage: {
        width: 250,
        height: 250,
        resizeMode: 'contain',
    },
    badgeName: {
        color: '#FFFFFF',
        fontSize: 36,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 15,
    },
    badgeDescription: {
        color: '#B0B0B0',
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 10,
    },
    dateEarned: {
        color: '#707070',
        fontSize: 12,
        fontWeight: '600',
        letterSpacing: 1,
        textAlign: 'center',
        marginBottom: 40,
    },
    shareButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 30,
        paddingVertical: 15,
        paddingHorizontal: 40,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
    },
    shareIcon: {
        marginRight: 10,
    },
    shareButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
