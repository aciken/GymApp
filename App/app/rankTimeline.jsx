import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { TouchableOpacity } from 'react-native-gesture-handler';

const ranks = [
    { name: 'Bronze', minScore: 250, maxScore: 350, image: require('../assets/BronzeRank.png'), color: '#E6A66A' },
    { name: 'Silver', minScore: 351, maxScore: 600, image: require('../assets/SilverRank.png'), color: '#C0C0C0' },
    { name: 'Gold', minScore: 601, maxScore: 750, image: require('../assets/GoldRank.png'), color: '#FFD700' },
    { name: 'Platinum', minScore: 751, maxScore: 900, image: require('../assets/DiamondRank.png'), color: '#E5E4E2' },
    { name: 'Champion', minScore: 901, maxScore: 1100, image: require('../assets/ChampionRank.png'), color: '#FF4136' },
];

const RankItem = ({ rank, isCurrent, isAchieved, isLast }) => {
    return (
        <View style={styles.rankItem}>
            {!isLast && (
                <LinearGradient
                    colors={[isAchieved ? rank.color : 'rgba(255,255,255,0.1)', isAchieved ? rank.color : 'rgba(255,255,255,0.05)']}
                    style={[styles.timelineConnector, isAchieved && { opacity: 0.5 }]}
                />
            )}
            <View style={[
                styles.rankIconContainer, 
                isAchieved && { borderColor: rank.color, shadowColor: rank.color, backgroundColor: 'rgba(255,255,255,0.05)' },
                isCurrent && { shadowOpacity: 0.8, shadowRadius: 20, borderColor: rank.color, borderWidth: 3 }
            ]}>
                {isCurrent && <View style={[styles.activeGlow, { shadowColor: rank.color }]} />}
                <Image 
                    source={rank.image} 
                    style={[styles.rankImage, !isAchieved && { opacity: 0.3 }]}
                />
                {!isAchieved && (
                    <View style={styles.lockContainer}>
                        <Ionicons name="lock-closed" size={20} color="rgba(255, 255, 255, 0.5)" />
                    </View>
                )}
            </View>
            <View style={styles.rankDetails}>
                <Text style={[styles.rankName, isAchieved && { color: rank.color, textShadowColor: rank.color, textShadowRadius: 10 }]}>
                    {rank.name.toUpperCase()}
                </Text>
                <Text style={[styles.rankScore, isAchieved && styles.rankScoreActive]}>
                    {rank.minScore}+ ng/dl
                </Text>
                {isCurrent && (
                    <View style={[styles.currentBadge, { borderColor: rank.color }]}>
                        <Text style={[styles.currentBadgeText, { color: rank.color }]}>CURRENT RANK</Text>
                    </View>
                )}
            </View>
        </View>
    );
};

export default function RankTimelineScreen() {
    const router = useRouter();
    const { currentTScore } = useLocalSearchParams();
    const score = parseInt(currentTScore);

    return (
        <LinearGradient colors={['#101010', '#000000']} style={styles.container}>
            <SafeAreaView style={styles.safeArea} edges={['top']}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>RANK PROGRESSION</Text>
                    <View style={{ width: 24 }} />
                </View>
                <ScrollView contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
                    {ranks.map((rank, index) => {
                        const isCurrent = score >= rank.minScore && score <= rank.maxScore;
                        // If score > max of this rank, it is achieved. If current, it is achieved.
                        const isAchieved = score >= rank.minScore;
                        return <RankItem key={index} rank={rank} isCurrent={isCurrent} isAchieved={isAchieved} isLast={index === ranks.length - 1} />;
                    })}
                </ScrollView>
            </SafeAreaView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    safeArea: { flex: 1 },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 24,
        paddingTop: 20,
        paddingBottom: 20,
    },
    backButton: {
        padding: 8,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 20,
    },
    headerTitle: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '900',
        letterSpacing: 2,
    },
    contentContainer: {
        paddingHorizontal: 30,
        paddingTop: 20,
        paddingBottom: 50,
    },
    rankItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 40,
        height: 120, 
    },
    timelineConnector: {
        position: 'absolute',
        left: 59, 
        top: 110, 
        width: 2,
        height: 60, 
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        zIndex: -1,
    },
    rankIconContainer: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: 'rgba(20, 20, 20, 0.8)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        zIndex: 10,
    },
    activeGlow: {
        ...StyleSheet.absoluteFillObject,
        borderRadius: 60,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.6,
        shadowRadius: 30,
        elevation: 10,
    },
    rankImage: {
        width: 90,
        height: 90,
        resizeMode: 'contain',
    },
    lockContainer: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: '#1A1A1A',
        padding: 8,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    rankDetails: {
        marginLeft: 30,
        flex: 1,
        justifyContent: 'center',
    },
    rankName: {
        color: '#666',
        fontSize: 28,
        fontWeight: '900',
        letterSpacing: 1,
        marginBottom: 4,
    },
    rankScore: {
        color: '#666',
        fontSize: 14,
        fontWeight: '600',
        letterSpacing: 0.5,
    },
    rankScoreActive: {
        color: '#FFFFFF',
        opacity: 0.8,
    },
    currentBadge: {
        marginTop: 10,
        alignSelf: 'flex-start',
        borderWidth: 1,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        backgroundColor: 'rgba(0,0,0,0.3)',
    },
    currentBadgeText: {
        fontSize: 10,
        fontWeight: 'bold',
        letterSpacing: 1,
    },
});
