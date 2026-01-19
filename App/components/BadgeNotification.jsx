import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, Animated, Easing } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';

const BadgeNotification = ({ badge, onDismiss }) => {
    const [isRevealed, setIsRevealed] = useState(false);
    const anim = useRef(new Animated.Value(0)).current;
    const badgeAnim = useRef(new Animated.Value(0)).current;
    const pulseAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Animated.timing(anim, {
            toValue: 1,
            duration: 500,
            easing: Easing.out(Easing.exp),
            useNativeDriver: true,
        }).start();

        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, { toValue: 1.05, duration: 1500, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
                Animated.timing(pulseAnim, { toValue: 1, duration: 1500, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
            ])
        ).start();
    }, []);

    const handleReveal = () => {
        if (isRevealed) return;
        setIsRevealed(true);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        Animated.timing(anim, {
            toValue: 2,
            duration: 400,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
        }).start();

        Animated.sequence([
            Animated.delay(100),
            Animated.spring(badgeAnim, {
                toValue: 1,
                friction: 4,
                tension: 30,
                useNativeDriver: true,
            })
        ]).start();
    };

    const handleDismiss = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        Animated.spring(anim, {
            toValue: 3,
            friction: 7,
            tension: 40,
            useNativeDriver: true,
        }).start(() => onDismiss());
    };

    const containerOpacity = anim.interpolate({ inputRange: [0, 1, 2.7, 3], outputRange: [0, 1, 1, 0] });
    const unrevealedScale = anim.interpolate({ inputRange: [0, 1, 2], outputRange: [0.8, 1, 1.1] });
    const unrevealedOpacity = anim.interpolate({ inputRange: [1.5, 2], outputRange: [1, 0] });
    const revealedScale = anim.interpolate({ inputRange: [1.5, 2, 2.5, 3], outputRange: [0.8, 1, 1, 0] });
    const revealedOpacity = anim.interpolate({ inputRange: [1.5, 2, 2.7, 3], outputRange: [0, 1, 1, 0] });
    
    const badgeScale = badgeAnim.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, 1.1, 1] });

    return (
        <Animated.View style={[styles.container, { opacity: containerOpacity }]}>
            <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
            <TouchableOpacity activeOpacity={1} onPress={handleReveal} style={styles.touchableContainer}>
                
                {/* Unrevealed State */}
                <Animated.View style={[styles.modal, { opacity: unrevealedOpacity, transform: [{ scale: unrevealedScale }] }]}>
                    <LinearGradient colors={['#2a2a2a', '#111111']} style={styles.gradient}>
                        <View style={styles.unrevealedImageContainer}>
                            <Animated.View style={[styles.unrevealedGlow, { transform: [{ scale: pulseAnim }] }]} />
                            <Image source={require('../assets/newBadge.png')} style={styles.unrevealedImage} />
                        </View>
                        <Text style={styles.unrevealedTitle}>Reward Unlocked</Text>
                        <Text style={styles.unrevealedSubtitle}>Tap to reveal</Text>
                    </LinearGradient>
                </Animated.View>

                {/* Revealed State */}
                <Animated.View style={[styles.modal, { opacity: revealedOpacity, transform: [{ scale: revealedScale }] }]}>
                    <LinearGradient colors={[badge.primaryColor, badge.secondaryColor]} style={styles.gradient}>
                        <TouchableOpacity onPress={handleDismiss} style={styles.closeButton}>
                            <Ionicons name="close" size={28} color="rgba(255, 255, 255, 0.7)" />
                        </TouchableOpacity>
                        <Animated.View style={[styles.badgeImageContainer, { shadowColor: badge.glowColor, transform: [{scale: badgeScale}] }]}>
                            <Image source={badge.image} style={styles.badgeImage} />
                        </Animated.View>
                        <Text style={styles.badgeName}>{badge.name}</Text>
                        <Text style={styles.badgeDescription}>{badge.description}</Text>
                    </LinearGradient>
                </Animated.View>

            </TouchableOpacity>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
    },
    touchableContainer: {
        width: '90%',
        aspectRatio: 0.8,
    },
    modal: {
        ...StyleSheet.absoluteFillObject,
        borderRadius: 30,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 20 },
        shadowOpacity: 0.6,
        shadowRadius: 30,
        elevation: 20,
    },
    gradient: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 30,
    },
    unrevealedImageContainer: {
        width: 160,
        height: 160,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 25,
    },
    unrevealedGlow: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        backgroundColor: 'transparent',
        borderRadius: 80,
        shadowColor: '#FFFFFF',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 1,
        shadowRadius: 40,
    },
    unrevealedImage: {
        width: '100%',
        height: '100%',
    },
    unrevealedTitle: {
        color: '#FFFFFF',
        fontSize: 32,
        fontWeight: 'bold',
        marginTop: 20,
        textShadowColor: 'rgba(0, 0, 0, 0.5)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 4,
    },
    unrevealedSubtitle: {
        color: '#AAAAAA',
        fontSize: 18,
        marginTop: 8,
    },
    closeButton: {
        position: 'absolute',
        top: 20,
        right: 20,
    },
    badgeImageContainer: {
        width: 200,
        height: 200,
        marginBottom: 25,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 1,
        shadowRadius: 30,
    },
    badgeImage: {
        width: '100%',
        height: '100%',
    },
    badgeName: {
        color: '#FFFFFF',
        fontSize: 36,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 10,
        textShadowColor: 'rgba(0, 0, 0, 0.5)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 3,
    },
    badgeDescription: {
        color: '#ffffff',
        opacity: 0.8,
        fontSize: 16,
        textAlign: 'center',
    },
});

export default BadgeNotification;
