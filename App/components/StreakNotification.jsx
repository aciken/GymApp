import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const StreakNotification = ({ title, message, streakCount, icon }) => {
    const totalCircles = 7;
    const filledCircles = streakCount > 0 ? (streakCount - 1) % totalCircles + 1 : 0;

    return (
        <View style={styles.shadowContainer}>
            <LinearGradient
                colors={['#1C1C1E', '#0D0D0D']}
                style={styles.container}
            >
                <View style={styles.mainContent}>
                    <View style={styles.iconContainer}>
                        {typeof icon === 'string' ? (
                            <Ionicons name={icon} size={28} color="#FFFFFF" />
                        ) : (
                            <Image source={icon} style={styles.taskImage} />
                        )}
                    </View>
                    <View>
                        <Text style={styles.title}>{title}</Text>
                        <Text style={styles.message}>{message}</Text>
                        <View style={styles.circlesContainer}>
                            {[...Array(totalCircles)].map((_, i) => (
                                <View key={i} style={[styles.circle, i < filledCircles && styles.filledCircle]}>
                                    {i < filledCircles && <Ionicons name="checkmark" size={12} color="#1A1A1A" />}
                                </View>
                            ))}
                        </View>
                    </View>
                </View>
                <View style={styles.rightContent}>
                    <Image
                        source={require('../assets/StreakImage3.png')}
                        style={styles.streakImage}
                    />
                    <View style={styles.streakTextContainer}>
                        <Text style={styles.streakNumber}>{streakCount}</Text>
                    </View>
                </View>
            </LinearGradient>
        </View>
    );
};

const styles = StyleSheet.create({
    shadowContainer: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.5,
        shadowRadius: 20,
        elevation: 15,
    },
    container: {
        width: '100%',
        borderRadius: 22,
        paddingHorizontal: 16,
        paddingVertical: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        overflow: 'hidden',
    },
    mainContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconContainer: {
        width: 60,
        height: 60,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    taskImage: {
        width: 48,
        height: 48,
    },
    leftContent: {
        flex: 1,
    },
    rightContent: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: 'bold',
    },
    message: {
        color: '#A0A0A0',
        fontSize: 14,
        marginTop: 4,
    },
    circlesContainer: {
        flexDirection: 'row',
        marginTop: 12,
    },
    circle: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 1.5,
        borderColor: 'rgba(255, 255, 255, 0.3)',
        borderStyle: 'dashed',
        marginRight: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    filledCircle: {
        backgroundColor: '#FFFFFF',
        borderColor: '#FFFFFF',
        borderStyle: 'solid',
    },
    streakImage: {
        position: 'absolute',
        width: 100,
        height: 100,
        opacity: 0.5,
    },
    streakTextContainer: {
        width: 80,
        height: 80,
        alignItems: 'center',
        justifyContent: 'center',
    },
    streakNumber: {
        color: '#FFFFFF',
        fontSize: 40,
        fontWeight: 'bold',
        marginTop: 10,
    },
});

export default StreakNotification;
