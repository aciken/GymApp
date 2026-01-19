import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Dimensions, TouchableOpacity, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LineChart } from 'react-native-chart-kit';
import TestosteroneGauge from '../../components/TestosteroneGauge';
import programData from '../../data/programData';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import { taskIcons, taskIconsGrayscale } from '../../data/icons';
import * as Haptics from 'expo-haptics';
import { allBadges } from '../../data/badgeData';
import { useGlobalContext } from '../context/GlobalProvider';

const screenWidth = Dimensions.get('window').width;

const ranks = [
    { name: 'Bronze', minScore: 250, maxScore: 350, image: require('../../assets/BronzeRank.png'), color: '#E6A66A' },
    { name: 'Silver', minScore: 351, maxScore: 600, image: require('../../assets/SilverRank.png'), color: '#C0C0C0' },
    { name: 'Gold', minScore: 601, maxScore: 750, image: require('../../assets/GoldRank.png'), color: '#FFD700' },
    { name: 'Platinum', minScore: 751, maxScore: 900, image: require('../../assets/DiamondRank.png'), color: '#E5E4E2' },
    { name: 'Champion', minScore: 901, maxScore: 1100, image: require('../../assets/ChampionRank.png'), color: '#FF4136' },
];

const badges = allBadges.slice(0, 6);

const KeyFactorItem = ({ icon, name, totalImpact, color, maxValue, onPress, streak }) => {
    const hasStreak = streak > 0;

    // Use cleaner colors and simpler effects
    const nonStreakBg = 'rgba(255, 255, 255, 0.03)';
    const streakBg = 'rgba(255, 149, 0, 0.1)';
    
    const gradientColors = hasStreak
        ? [streakBg, streakBg]
        : [nonStreakBg, nonStreakBg];
    
    const borderColor = hasStreak ? '#FF9500' : 'rgba(255, 255, 255, 0.08)';
    const borderWidth = hasStreak ? 1.5 : 1;
    
    const currentIcon = hasStreak ? (taskIcons[icon] || icon) : (taskIconsGrayscale[icon] || icon);

    return (
        <TouchableOpacity onPress={onPress} style={styles.keyFactorTouchable}>
            <LinearGradient
                colors={gradientColors}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[styles.keyFactorItem, { borderColor, borderWidth }]}
            >
                <View style={[styles.keyFactorIconContainer, hasStreak && styles.activeIconContainer]}>
                    {typeof currentIcon === 'string' ? (
                        <Ionicons name={currentIcon} size={22} color={hasStreak ? '#FF9500' : '#666'} />
                    ) : (
                        <Image source={currentIcon} style={[styles.keyFactorImage, !hasStreak && { opacity: 0.5 }]} />
                    )}
                </View>
                
                <View style={styles.keyFactorDetails}>
                    <Text style={[styles.keyFactorName, hasStreak && styles.activeKeyFactorName]}>{name}</Text>
                    <Text style={[styles.keyFactorSubtitle, hasStreak && styles.activeKeyFactorSubtitle]}>{hasStreak ? 'Active Streak' : 'No active streak'}</Text>
                </View>
                
                <View style={styles.keyFactorValueContainer}>
                    {hasStreak && (
                        <View style={styles.streakBadge}>
                            <Ionicons name="flame" size={14} color="#FF9500" />
                            <Text style={styles.keyFactorValue}>
                                {streak}
                            </Text>
                        </View>
                    )}
                </View>
            </LinearGradient>
        </TouchableOpacity>
    );
};

export default function StatisticsScreen() {
    const router = useRouter();
    const { user } = useGlobalContext(); // Get user from global context
    const [stats, setStats] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    // Use user's baseline if available, otherwise default to 290
    const [currentTScore, setCurrentTScore] = useState(user?.baselineTestosterone || 290);
    const [viewMode, setViewMode] = useState('score');

    useFocusEffect(
        useCallback(() => {
            const calculateStats = async () => {
                try {
                    const userString = await AsyncStorage.getItem('user');
                    if (!userString) { setIsLoading(false); return; }

                    const user = JSON.parse(userString);
                    const baseline = user.baselineTestosterone || 290;

                    if (!user.tasks || user.tasks.length === 0) { 
                        setStats({ 
                            chartData: [baseline], 
                            chartLabels: ['Today'], 
                            streakingFactors: [], 
                            nonStreakingFactors: [], 
                            maxImpact: 1 
                        });
                        setCurrentTScore(baseline);
                        setIsLoading(false); 
                        return; 
                    }
                    
                    const allTasks = [...programData[1].dos, ...programData[1].donts];
                    const taskMap = allTasks.reduce((map, task) => {
                        map[task.id] = { ...task };
                        return map;
                    }, {});

                    const dateCreated = new Date(user.dateCreated);
                    const today = new Date();
                    dateCreated.setHours(0,0,0,0);
                    today.setHours(0,0,0,0);
                    const programDuration = Math.ceil((today - dateCreated) / (1000 * 60 * 60 * 24)) + 1;
                    
                    const totalPossiblePositiveImpact = programData[1].dos.reduce((sum, task) => sum + (task.impact || 0), 0);
                    const totalPossibleNegativeImpact = 
                        programData[1].donts.reduce((sum, task) => sum + (task.impact || 0), 0) +
                        programData[1].dos.filter(t => t.type === 'meals' || t.id === 'sleep').reduce((sum, task) => sum + (task.impact || 0), 0);

                    const dailyPositiveContributions = Array(programDuration).fill(0);
                    const dailyNegativeContributions = Array(programDuration).fill(0);

                    user.tasks.forEach(savedTask => {
                        const taskInfo = taskMap[savedTask.taskId];
                        if (!taskInfo) return;

                        const taskDate = new Date(savedTask.date);
                        taskDate.setHours(0,0,0,0);
                        const timeDiff = taskDate - dateCreated;
                        const daysDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
                        // Handle edge case: if user's dateCreated is in the future, treat as day 0
                        const dayIndex = daysDiff < 0 ? 0 : daysDiff;
                        
                        let contribution;
                        if (taskInfo.id === 'sleep') {
                            const hoursSlept = ((savedTask.progress || 0) / 100) * taskInfo.goal;
                            let impactMultiplier;
                            if (hoursSlept < 7) {
                                // Penalty: scales from 0 at 7h to -1 at 4h or less.
                                const deficit = 7 - hoursSlept;
                                impactMultiplier = -Math.min(deficit / 3, 1);
                            } else if (hoursSlept < 8) {
                                // Neutral zone: 7-8 hours is baseline.
                                impactMultiplier = 0;
                            } else {
                                // Reward: scales from 0 at 8h to 1 at 10h or more.
                                const surplus = hoursSlept - 8;
                                impactMultiplier = Math.min(surplus / 2, 1);
                            }
                            contribution = impactMultiplier * taskInfo.impact;
                        } else if (taskInfo.type === 'slider' && !taskInfo.inverted) {
                            const actualValue = ((savedTask.progress || 0) / 100) * taskInfo.goal;
                            const impactMultiplier = taskInfo.goal > 0 ? Math.min(actualValue / taskInfo.goal, 2) : 0;
                            contribution = impactMultiplier * taskInfo.impact;
                        } else if (taskInfo.type === 'slider' && taskInfo.inverted) {
                            const progressPercent = (savedTask.progress || 0) / 100;
                            contribution = -1 * progressPercent * taskInfo.impact;
                        } else if (taskInfo.type === 'meals') {
                            if ((savedTask.progress || 0) < 0) {
                                contribution = (savedTask.progress || 0) * taskInfo.impact / 100;
                            } else {
                                contribution = ((savedTask.progress || 0) / 100) * taskInfo.impact;
                            }
                        } else {
                            const progressPercent = (savedTask.progress || 0) / 100;
                            contribution = taskInfo.inverted 
                                ? -1 * progressPercent * taskInfo.impact
                                : progressPercent * taskInfo.impact;
                        }
                        
                        if (dayIndex >= 0 && dayIndex < programDuration) {
                            if (contribution > 0) {
                                dailyPositiveContributions[dayIndex] += contribution;
                            } else {
                                dailyNegativeContributions[dayIndex] += contribution;
                            }
                        }
                    });

                    const dailyContributions = Array(programDuration).fill(0);
                    
                    for (let i = 0; i < programDuration; i++) {
                        const scaledPositive = totalPossiblePositiveImpact > 0
                            ? (dailyPositiveContributions[i] / totalPossiblePositiveImpact) * 8
                            : 0;
                        
                        const scaledNegative = totalPossibleNegativeImpact > 0
                            ? (dailyNegativeContributions[i] / totalPossibleNegativeImpact) * 3
                            : 0;
                        
                        const netChange = scaledPositive + scaledNegative;
                        
                        if (i === 0) {
                            dailyContributions[i] = baseline + netChange;
                        } else {
                            dailyContributions[i] = dailyContributions[i-1] + netChange;
                        }
                    }

                    const rawChartData = dailyContributions.map(c => Math.max(200, Math.min(1100, c)));

                    // Apply a simple moving average to smooth the data
                    const smoothingWindow = Math.min(5, Math.floor(programDuration / 2));
                    const chartData = rawChartData.map((_, i, arr) => {
                        if (i < smoothingWindow) return arr[i];
                        const slice = arr.slice(i - smoothingWindow, i + 1);
                        return slice.reduce((a, b) => a + b, 0) / slice.length;
                    });
                    
                    const finalChartData = [chartData[0], ...chartData];

                    const chartLabels = Array(programDuration + 1).fill('');
                    if (programDuration > 0) {
                        chartLabels[1] = 'Start';
                        if (programDuration > 1) {
                            chartLabels[programDuration] = `Day ${programDuration}`;
                        }
                    }

                    const allImpacts = {};
                    programData[1].dos.forEach(task => {
                        allImpacts[task.id] = { id: task.id, name: task.task, totalImpact: 0, isDo: true };
                    });
                    programData[1].donts.forEach(task => {
                        allImpacts[task.id] = { id: task.id, name: task.task, totalImpact: 0, isDo: false };
                    });

                    user.tasks.forEach(savedTask => {
                        const taskInfo = taskMap[savedTask.taskId];
                        if (!taskInfo) return;
                        
                        let contribution;
                        if (taskInfo.id === 'sleep') {
                            const hoursSlept = ((savedTask.progress || 0) / 100) * taskInfo.goal;
                            let impactMultiplier;
                            if (hoursSlept < 7) {
                                // Penalty: scales from 0 at 7h to -1 at 4h or less.
                                const deficit = 7 - hoursSlept;
                                impactMultiplier = -Math.min(deficit / 3, 1);
                            } else if (hoursSlept < 8) {
                                // Neutral zone: 7-8 hours is baseline.
                                impactMultiplier = 0;
                            } else {
                                // Reward: scales from 0 at 8h to 1 at 10h or more.
                                const surplus = hoursSlept - 8;
                                impactMultiplier = Math.min(surplus / 2, 1);
                            }
                            contribution = impactMultiplier * taskInfo.impact;
                        } else if (taskInfo.type === 'slider' && !taskInfo.inverted) {
                            const actualValue = ((savedTask.progress || 0) / 100) * taskInfo.goal;
                            const impactMultiplier = taskInfo.goal > 0 ? Math.min(actualValue / taskInfo.goal, 2) : 0;
                            contribution = impactMultiplier * taskInfo.impact;
                        } else if (taskInfo.type === 'slider' && taskInfo.inverted) {
                            const progressPercent = (savedTask.progress || 0) / 100;
                            contribution = -1 * progressPercent * taskInfo.impact;
                        } else if (taskInfo.type === 'meals') {
                            if ((savedTask.progress || 0) < 0) {
                                contribution = (savedTask.progress || 0) * taskInfo.impact / 100;
                            } else {
                                contribution = ((savedTask.progress || 0) / 100) * taskInfo.impact;
                            }
                        } else {
                            const progressPercent = (savedTask.progress || 0) / 100;
                            contribution = taskInfo.inverted 
                                ? -1 * progressPercent * taskInfo.impact
                                : progressPercent * taskInfo.impact;
                        }
                        
                        if (allImpacts[savedTask.taskId]) {
                            allImpacts[savedTask.taskId].totalImpact += contribution;
                        }
                    });

                    const tasksById = user.tasks.reduce((acc, task) => {
                        if (!acc[task.taskId]) acc[task.taskId] = [];
                        acc[task.taskId].push(task);
                        return acc;
                    }, {});

                    for (const taskId in allImpacts) {
                        const taskLogs = tasksById[taskId];
                        if (!taskLogs) {
                            allImpacts[taskId].streak = 0;
                            continue;
                        }
                        const taskInfo = taskMap[taskId];
                    
                        const successTimestamps = new Set();
                        taskLogs.forEach(log => {
                            let isSuccess;
                            if (taskId === 'sleep') {
                                const hoursSlept = (log.progress / 100) * taskInfo.goal;
                                isSuccess = hoursSlept >= 8;
                            } else if (taskInfo.inverted) {
                                // For inverted tasks, convert progress back to raw value and check against goal
                                const rawValue = (log.progress / 100) * taskInfo.maxValue;
                                isSuccess = rawValue < taskInfo.goal;
                            }
                            else {
                                isSuccess = log.progress >= 50;
                            }
                            
                            if (isSuccess) {
                                const date = new Date(log.date);
                                date.setHours(0, 0, 0, 0);
                                successTimestamps.add(date.getTime());
                            }
                        });
                        
                        let streak = 0;
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);
                        const yesterday = new Date(today);
                        yesterday.setDate(today.getDate() - 1);
                        let currentDate = new Date(today);
                    
                        if (!successTimestamps.has(today.getTime()) && !successTimestamps.has(yesterday.getTime())) {
                            streak = 0;
                        } else {
                            if (!successTimestamps.has(today.getTime())) {
                                currentDate.setDate(currentDate.getDate() - 1);
                            }
                            while (successTimestamps.has(currentDate.getTime())) {
                                streak++;
                                currentDate.setDate(currentDate.getDate() - 1);
                            }
                        }
                        allImpacts[taskId].streak = streak;
                    }

                    const impactsArray = Object.values(allImpacts);
                    
                    // Separate factors into streaking and non-streaking to ensure streaking are always on top
                    const streakingFactors = impactsArray.filter(t => t.streak > 0).sort((a, b) => b.streak - a.streak);
                    const nonStreakingFactors = impactsArray.filter(t => t.streak === 0);

                    // Sort non-streaking factors: boosts first, then drains, each sorted by impact
                    const nonStreakingBoosts = nonStreakingFactors.filter(t => t.isDo).sort((a, b) => b.totalImpact - a.totalImpact);
                    const nonStreakingDrains = nonStreakingFactors.filter(t => !t.isDo).sort((a, b) => a.totalImpact - b.totalImpact);
                    const sortedNonStreakingFactors = [...nonStreakingBoosts, ...nonStreakingDrains];

                    const maxImpact = Math.max(...impactsArray.map(t => Math.abs(t.totalImpact)), 1);
                    
                    const finalTodayScore = Math.round(rawChartData[rawChartData.length - 1]);
                    const startScore = finalChartData[0];
                    const trendPercentage = startScore > 0 ? ((finalTodayScore - startScore) / startScore) * 100 : 0;

                    setCurrentTScore(finalTodayScore);
                    setStats({ 
                        chartData: finalChartData, 
                        chartLabels, 
                        streakingFactors, 
                        nonStreakingFactors: sortedNonStreakingFactors, 
                        maxImpact,
                        trend: trendPercentage
                    });

                } catch (error) {
                    console.error("Failed to calculate stats:", error);
                } finally {
                    setIsLoading(false);
                }
            };
            calculateStats();
        }, [])
    );

    const unlockedBadges = allBadges.filter(badge => user?.unlockedAchievements?.includes(badge.id));

    return (
        <LinearGradient colors={['#101010', '#000000']} style={styles.container}>
            <SafeAreaView style={styles.safeArea} edges={['top']}>
                <ScrollView contentContainerStyle={styles.contentContainer}>
                    <View style={styles.header}>
                        <View style={styles.toggleContainer}>
                            <TouchableOpacity 
                                style={[styles.toggleButton, viewMode === 'score' && styles.toggleButtonActive]} 
                                onPress={() => {
                                    setViewMode('score');
                                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                                }}
                            >
                                <Text style={[styles.toggleButtonText, viewMode === 'score' && styles.toggleButtonTextActive]}>Score</Text>
                            </TouchableOpacity>
                            <TouchableOpacity 
                                style={[styles.toggleButton, viewMode === 'rank' && styles.toggleButtonActive]} 
                                onPress={() => {
                                    setViewMode('rank');
                                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                                }}
                            >
                                <Text style={[styles.toggleButtonText, viewMode === 'rank' && styles.toggleButtonTextActive]}>Rank</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                    {isLoading ? <ActivityIndicator size="large" color="#FFFFFF" style={{ marginTop: 50 }} />
                    : stats ? (
                        <>
                            <View style={styles.mainDisplayContainer}>
                                {viewMode === 'score' && <TestosteroneGauge value={currentTScore} />}

                                {viewMode === 'rank' && (() => {
                                    const currentRank = ranks.find(r => currentTScore >= r.minScore && currentTScore <= r.maxScore) || ranks[0];
                                    const nextRank = ranks.find(r => r.minScore > currentTScore) || currentRank;
                                    const progress = Math.max(0, (currentTScore - currentRank.minScore) / (currentRank.maxScore - currentRank.minScore));
                                    const pointsToNext = Math.max(0, currentRank.maxScore - currentTScore + 1); // +1 to cross threshold

                                    return (
                                        <TouchableOpacity onPress={() => router.push({ pathname: '/rankTimeline', params: { currentTScore } })} activeOpacity={0.9}>
                                            <View style={styles.rankContainer}>
                                                <View style={styles.rankImageWrapper}>
                                                    <View style={[styles.rankGlow, { shadowColor: currentRank.color }]} />
                                                    <Image source={currentRank.image || require('../../assets/BronzeRank.png')} style={styles.rankImage} />
                                                </View>
                                                
                                                <View style={styles.rankInfoContainer}>
                                                    <Text style={styles.rankLabel}>CURRENT STATUS</Text>
                                                    <Text style={[styles.rankTitle, { color: currentRank.color }]}>{currentRank.name.toUpperCase()}</Text>
                                                </View>

                                                <View style={styles.rankProgressWrapper}>
                                                    <View style={styles.rankProgressLabels}>
                                                        <Text style={styles.rankProgressText}>{currentTScore} ng/dl</Text>
                                                        <Text style={styles.rankProgressText}>{currentRank.maxScore} ng/dl</Text>
                                                    </View>
                                                    <View style={styles.rankProgressBarBg}>
                                                        <LinearGradient
                                                            colors={[currentRank.color, currentRank.color]}
                                                            start={{ x: 0, y: 0 }}
                                                            end={{ x: 1, y: 0 }}
                                                            style={[styles.rankProgressBarFill, { width: `${Math.min(100, Math.max(0, progress * 100))}%` }]}
                                                        />
                                                    </View>
                                                    <Text style={styles.pointsToNextText}>
                                                        {pointsToNext > 0 ? `${pointsToNext} POINTS TO ${nextRank !== currentRank ? nextRank.name.toUpperCase() : 'MAX RANK'}` : 'MAX RANK ACHIEVED'}
                                                    </Text>
                                                </View>
                                            </View>
                                        </TouchableOpacity>
                                    );
                                })()}
                            </View>

                            <View style={styles.badgesContainer}>
                                <View style={styles.sectionHeader}>
                                    <Text style={styles.sectionTitle}>BADGES COLLECTED</Text>
                                    <TouchableOpacity onPress={() => router.push('/allBadges')}>
                                        <Text style={styles.seeAllButton}>See All</Text>
                                    </TouchableOpacity>
                                </View>
                                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.badgesScrollView}>
                                    {unlockedBadges.map(badge => (
                                        <TouchableOpacity key={badge.id} onPress={() => router.push({ pathname: '/badgeDetails', params: { ...badge, image: badge.image ? Image.resolveAssetSource(badge.image).uri : null } })}>
                                            <View style={styles.badgeItem}>
                                                <View style={styles.badgeImageContainer}>
                                                    <Image source={badge.image} style={styles.badgeImage} />
                                                </View>
                                                <Text style={styles.badgeName}>{badge.name}</Text>
                                            </View>
                                        </TouchableOpacity>
                                    ))}
                                    {Array.from({ length: Math.max(0, 4 - unlockedBadges.length) }).map((_, index) => (
                                        <View key={`placeholder-${index}`} style={styles.badgeItem}>
                                            <View style={styles.badgePlaceholder}>
                                                <Ionicons name="lock-closed" size={20} color="rgba(255, 255, 255, 0.1)" />
                                            </View>
                                            <Text style={styles.badgeNameLocked}>Locked</Text>
                                        </View>
                                    ))}
                                </ScrollView>
                            </View>

                            <View style={styles.keyFactorsContainer}>
                                <Text style={[styles.sectionTitle, { marginBottom: 20 }]}>TASK STREAKS</Text>
                                {stats.streakingFactors.map(c => {
                                    const color = c.isDo ? "#FFFFFF" : "#FF6B6B";
                                    return <KeyFactorItem key={c.id} icon={c.id} name={c.name} totalImpact={c.totalImpact} color={color} maxValue={stats.maxImpact} onPress={() => router.push({ pathname: '/modal/factorHistory', params: { factorId: c.id } })} streak={c.streak} />;
                                })}
                                {stats.nonStreakingFactors.map(c => {
                                    const color = c.isDo ? "#FFFFFF" : "#FF6B6B";
                                    return <KeyFactorItem key={c.id} icon={c.id} name={c.name} totalImpact={c.totalImpact} color={color} maxValue={stats.maxImpact} onPress={() => router.push({ pathname: '/modal/factorHistory', params: { factorId: c.id } })} streak={c.streak} />;
                                })}
                            </View>
                        </>
                    ) : (
                        <View style={styles.noDataContainer}><Ionicons name="stats-chart-outline" size={60} color="#333" /><Text style={styles.noDataText}>Start completing tasks to see your statistics.</Text></View>
                    )}
                </ScrollView>
            </SafeAreaView>
        </LinearGradient>
    );
}

const chartConfig = {
    backgroundGradientFrom: "#1A1A1A",
    backgroundGradientFromOpacity: 0,
    backgroundGradientTo: "#0F0F0F",
    backgroundGradientToOpacity: 0,
    color: (opacity = 1) => `rgba(255, 149, 0, ${opacity})`, // Orange line
    labelColor: (opacity = 1) => `rgba(120, 120, 120, ${opacity})`, // Lighter grey labels
    strokeWidth: 3,
    propsForDots: { 
        r: "0", 
        strokeWidth: "0", 
    },
    fillShadowGradientFrom: '#FF9500',
    fillShadowGradientFromOpacity: 0.5, 
    fillShadowGradientTo: '#FF9500',
    fillShadowGradientToOpacity: 0.1, 
    decimalPlaces: 0,
    linejoinType: 'round',
    propsForBackgroundLines: {
        stroke: 'rgba(255, 255, 255, 0.03)', 
        strokeDasharray: '0', // Solid lines
    },
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    safeArea: { flex: 1 },
    contentContainer: { paddingBottom: 100 },
    header: {
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 10,
        alignItems: 'flex-end',
        width: '100%',
    },
    toggleContainer: {
        flexDirection: 'row',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 20,
        padding: 4,
    },
    toggleButton: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 16,
    },
    toggleButtonActive: {
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
    },
    toggleButtonText: {
        color: '#FFFFFF',
        fontWeight: '700',
    },
    toggleButtonTextActive: {
        color: '#000000',
    },
    mainDisplayContainer: {
        height: 300,
        justifyContent: 'center',
        alignItems: 'center',
    },
    rankContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
    },
    rankImageWrapper: {
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 10,
    },
    rankGlow: {
        position: 'absolute',
        width: 100,
        height: 100,
        borderRadius: 50,
        shadowOpacity: 0.6,
        shadowRadius: 40,
        elevation: 20,
    },
    rankImage: {
        width: 180,
        height: 180,
        resizeMode: 'contain',
        zIndex: 10,
    },
    rankInfoContainer: {
        alignItems: 'center',
        marginBottom: 15,
    },
    rankLabel: {
        color: '#666',
        fontSize: 10,
        fontWeight: 'bold',
        letterSpacing: 2,
        marginBottom: 4,
    },
    rankTitle: {
        fontSize: 32,
        fontWeight: '900',
        letterSpacing: 1,
        textShadowColor: 'rgba(0,0,0,0.8)',
        textShadowRadius: 10,
    },
    rankProgressWrapper: {
        width: '85%',
    },
    rankProgressLabels: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 6,
    },
    rankProgressText: {
        color: '#888',
        fontSize: 12,
        fontWeight: '700',
    },
    rankProgressBarBg: {
        height: 6,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 3,
        overflow: 'hidden',
    },
    rankProgressBarFill: {
        height: '100%',
        borderRadius: 3,
    },
    pointsToNextText: {
        color: '#666',
        fontSize: 10,
        fontWeight: '600',
        letterSpacing: 1,
        marginTop: 8,
        textAlign: 'center',
    },
    chartContainer: {
        width: '100%',
        paddingHorizontal: 20,
        marginBottom: 20,
    },
    chartCard: {
        borderRadius: 24,
        padding: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 10,
    },
    chartHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 20,
        paddingHorizontal: 4,
    },
    chartTitle: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '800',
        letterSpacing: 0.5,
        marginBottom: 4,
    },
    chartSubtitle: {
        color: '#666',
        fontSize: 13,
        fontWeight: '600',
    },
    trendBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(76, 175, 80, 0.1)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(76, 175, 80, 0.2)',
    },
    trendText: {
        color: '#4CAF50',
        fontSize: 12,
        fontWeight: 'bold',
        marginLeft: 4,
    },
    chart: {
        borderRadius: 16,
        marginVertical: 8,
        marginLeft: -20, // Compensate for left padding to center content
    },
    currentScoreBubble: {
        backgroundColor: '#FF9500',
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 20,
        shadowColor: '#FF9500',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.6,
        shadowRadius: 10,
        elevation: 8,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.4)',
        minWidth: 60,
        alignItems: 'center',
    },
    currentScoreText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '900',
        textShadowColor: 'rgba(0,0,0,0.3)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 4,
    },
    sectionTitle: { color: '#C5C5C5', fontSize: 12, fontWeight: 'bold', letterSpacing: 2, textAlign: 'center' },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginBottom: 20,
    },
    seeAllButton: {
        color: '#FFFFFF',
        fontWeight: '600',
    },
    keyFactorsContainer: { width: '100%', marginTop: 40, paddingHorizontal: 20, },
    badgesContainer: {
        marginTop: 40,
        paddingTop: 10,
        paddingBottom: 30,
        borderBottomWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    badgesScrollView: {
        paddingHorizontal: 20,
    },
    badgeItem: {
        alignItems: 'center',
        marginRight: 25,
        width: 90,
    },
    badgePlaceholder: {
        width: 90,
        height: 90,
        borderRadius: 45,
        backgroundColor: 'transparent',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
        borderWidth: 2,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderStyle: 'dashed',
    },
    badgeImageContainer: {
        width: 90,
        height: 90,
        borderRadius: 45,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.15)',
        shadowColor: '#FFFFFF',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.25,
        shadowRadius: 12,
        elevation: 6,
    },
    badgeLocked: {
        borderColor: 'rgba(255, 255, 255, 0.2)',
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        shadowColor: '#000',
        shadowOpacity: 0,
        shadowRadius: 0,
        elevation: 0,
    },
    badgeImage: {
        width: 80,
        height: 80,
        borderRadius: 40,
    },
    badgeName: {
        color: '#E0E0E0',
        fontSize: 13,
        fontWeight: '600',
        textAlign: 'center',
        marginTop: 5,
    },
    keyFactorTouchable: {
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    keyFactorItem: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 32,
        padding: 18,
        borderWidth: 1,
    },
    keyFactorIconContainer: {
        width: 52,
        height: 52,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 18,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: 26,
    },
    activeIconContainer: {
        backgroundColor: 'rgba(255, 149, 0, 0.15)',
    },
    keyFactorDetails: { flex: 1, justifyContent: 'center' },
    keyFactorName: { color: '#999', fontSize: 16, fontWeight: '600', marginBottom: 2 },
    activeKeyFactorName: { color: '#FFFFFF' },
    keyFactorSubtitle: { color: '#555', fontSize: 12, fontWeight: '500' },
    activeKeyFactorSubtitle: { color: '#CC7700', fontWeight: '500' },
    keyFactorImage: {
        width: 24,
        height: 24,
        resizeMode: 'contain',
    },
    keyFactorValueContainer: {
        justifyContent: 'center',
        alignItems: 'flex-end',
    },
    streakBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 149, 0, 0.15)',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(255, 149, 0, 0.3)',
    },
    keyFactorValue: {
        fontSize: 14,
        fontWeight: '800',
        marginLeft: 6,
        color: '#FF9500',
    },
    noDataContainer: { marginTop: 60, alignItems: 'center', opacity: 0.5 },
    noDataText: { color: '#8A95B6', marginTop: 20, fontSize: 16, textAlign: 'center' },
});
