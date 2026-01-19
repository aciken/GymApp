import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, ScrollView, Image, Dimensions } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import React, { useState, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import programData from '../../data/programData';
import { taskIcons } from '../../data/icons';
import { BlurView } from 'expo-blur';

const { width } = Dimensions.get('window');

const getDisplayValue = (task, loggedTask) => {
    if (!task) return `${loggedTask.progress}%`;

    switch (task.type) {
        case 'slider':
            const maxValue = task.inverted ? task.maxValue : task.goal;
            const value = (loggedTask.progress / 100) * maxValue;
            const roundedValue = Math.round(value / task.step) * task.step;
            const finalValue = Number.isInteger(roundedValue) ? roundedValue : roundedValue.toFixed(1);
            return `${finalValue}${task.unit ? ` ${task.unit}` : ''}`;
        case 'checklist':
            const takenCount = loggedTask.checked ? loggedTask.checked.length : 0;
            return `${takenCount} of 4`;
        case 'simple':
            return loggedTask.progress >= 95 ? 'Completed' : 'Incomplete';
        case 'meals':
            if (loggedTask.history && loggedTask.history.length > 0) {
                const totalScore = loggedTask.history.reduce((sum, meal) => sum + meal.value, 0);
                const averageScore = Math.round(totalScore / loggedTask.history.length);
                if (averageScore >= 60) return 'Good';
                if (averageScore >= 30) return 'Average';
                return 'Bad';
            }
            return 'Incomplete';
        default:
            return `${loggedTask.progress}%`;
    }
};

const HistoryItem = ({ date, status, displayValue }) => {
    const isCompleted = status === 'completed';
    const isPartial = status === 'partial';

    return (
        <View style={styles.historyItemContainer}>
            <View style={[styles.timelineDot, isCompleted ? styles.dotCompleted : isPartial ? styles.dotPartial : styles.dotMissed]} />
            <View style={styles.timelineLine} />
            
            <View style={[styles.historyCard, isCompleted && styles.completedCard]}>
                {isCompleted && (
                   <LinearGradient
                        colors={['rgba(255, 149, 0, 0.1)', 'rgba(255, 149, 0, 0.02)']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={StyleSheet.absoluteFill}
                    />
                )}
                
                <View style={styles.cardContent}>
                    <Text style={[styles.historyDate, isCompleted && styles.textHighlight]}>{date}</Text>
                    <View style={styles.statusContainer}>
                        <Text style={[styles.historyValue, isCompleted && styles.textHighlight]}>{displayValue}</Text>
                        {isCompleted && <Ionicons name="checkmark-circle" size={16} color="#FF9500" style={{ marginLeft: 6 }} />}
                    </View>
                </View>
            </View>
        </View>
    );
};

export default function FactorHistoryModal() {
  const router = useRouter();
  const { factorId } = useLocalSearchParams();
  
  const [history, setHistory] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [taskInfo, setTaskInfo] = useState(null);

  useEffect(() => {
    const fetchHistory = async () => {
        if (!factorId) {
            setIsLoading(false);
            return;
        }

        try {
            const allTasks = [...programData[1].dos, ...programData[1].donts];
            const foundTask = allTasks.find(t => t.id === factorId);
            setTaskInfo(foundTask);

            const userString = await AsyncStorage.getItem('user');
            if (!userString) {
                setIsLoading(false);
                return;
            }
            
            const user = JSON.parse(userString);
            const dateCreated = new Date(user.dateCreated);
            const today = new Date();
            dateCreated.setHours(0, 0, 0, 0);
            today.setHours(0, 0, 0, 0);

            const loggedTasks = user.tasks
                .filter(task => task.taskId === factorId)
                .reduce((map, task) => {
                    const taskDate = new Date(task.date);
                    const dayIndex = Math.round((taskDate - dateCreated) / (1000 * 60 * 60 * 24));
                    map[dayIndex] = task;
                    return map;
                }, {});

            const fullHistory = [];
            for (let i = 0; i < 30; i++) {
                const date = new Date(today);
                date.setDate(today.getDate() - i);
                const dayIndex = Math.round((date - dateCreated) / (1000 * 60 * 60 * 24));

                if (dayIndex < 0) continue;

                const loggedTask = loggedTasks[dayIndex];
                let status = 'notLogged';
                let displayValue = 'Not Logged';

                if (loggedTask) {
                    displayValue = getDisplayValue(foundTask, loggedTask);

                    if (foundTask.id === '3') { // meals
                        if (displayValue === 'Good') {
                            status = 'completed';
                        } else if (displayValue === 'Average') {
                            status = 'partial';
                        } else {
                            status = 'missed';
                        }
                    } else if (foundTask.inverted) {
                        status = loggedTask.progress < 50 ? 'completed' : 'missed';
                    } else {
                        if (loggedTask.progress >= 95) status = 'completed';
                        else if (loggedTask.progress > 5) status = 'partial';
                        else status = 'missed';
                    }
                }
                
                fullHistory.push({
                    key: date.toISOString(),
                    date: date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
                    status: status,
                    displayValue: displayValue,
                });
            }
            
            if (fullHistory.length > 0) {
                setHistory(fullHistory);
            }
        } catch (error) {
            console.error("Failed to fetch factor history:", error);
        } finally {
            setIsLoading(false);
        }
    };
    fetchHistory();
  }, [factorId]);

  return (
    <View style={styles.container}>
        <Image 
            source={require('../../assets/Background1.png')} 
            style={styles.backgroundImage}
            blurRadius={10}
        />
        <LinearGradient 
            colors={['rgba(0,0,0,0.7)', 'rgba(0,0,0,0.9)', '#000000']} 
            style={styles.gradientOverlay} 
        />

      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                <Ionicons name="close" size={24} color="#FFF" />
            </TouchableOpacity>
            
            <View style={styles.headerTitleContainer}>
                {taskInfo && (
                    <View style={styles.iconContainer}>
                        <Image source={taskIcons[factorId]} style={styles.headerIcon} />
                    </View>
                )}
                <Text style={styles.headerTitle}>{taskInfo ? taskInfo.task : 'History'}</Text>
            </View>
            <View style={{ width: 28 }} /> 
        </View>

        <View style={styles.content}>
            {isLoading ? <ActivityIndicator size="large" color="#FF9500" style={{ marginTop: 50 }} />
            : history && history.length > 0 ? (
                <ScrollView contentContainerStyle={styles.historyList} showsVerticalScrollIndicator={false}>
                    <Text style={styles.listTitle}>LAST 30 DAYS</Text>
                    {history.map(({ key, ...rest }) => (
                        <HistoryItem key={key} {...rest} />
                    ))}
                </ScrollView>
            ) : (
                <View style={styles.emptyState}>
                    <Ionicons name="time-outline" size={64} color="#333" />
                    <Text style={styles.placeholderText}>
                        No history found for this factor yet.
                    </Text>
                </View>
            )}
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  backgroundImage: {
    ...StyleSheet.absoluteFillObject,
    width: width,
    height: '100%',
    resizeMode: 'cover',
    opacity: 0.3,
  },
  gradientOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  backButton: {
    padding: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
  },
  headerTitleContainer: {
      flexDirection: 'row',
      alignItems: 'center',
  },
  iconContainer: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: 'rgba(255, 255, 255, 0.08)',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerIcon: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  content: {
    flex: 1,
  },
  listTitle: {
      color: '#666',
      fontSize: 12,
      fontWeight: 'bold',
      letterSpacing: 1.5,
      marginBottom: 20,
      marginLeft: 45,
  },
  historyList: {
    padding: 20,
  },
  historyItemContainer: {
      flexDirection: 'row',
      marginBottom: 0,
      position: 'relative',
  },
  timelineLine: {
      position: 'absolute',
      left: 9,
      top: 20,
      bottom: -20,
      width: 2,
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      zIndex: 0,
  },
  timelineDot: {
      width: 20,
      height: 20,
      borderRadius: 10,
      marginRight: 15,
      marginTop: 15,
      zIndex: 1,
      borderWidth: 3,
      borderColor: '#000',
  },
  dotCompleted: {
      backgroundColor: '#FF9500',
      borderColor: '#1a1a1a',
      borderWidth: 2,
  },
  dotPartial: {
      backgroundColor: '#666',
      borderColor: '#1a1a1a',
      borderWidth: 2,
  },
  dotMissed: {
      backgroundColor: '#333',
      borderColor: '#1a1a1a',
      borderWidth: 2,
  },
  historyCard: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    overflow: 'hidden',
  },
  completedCard: {
      backgroundColor: 'rgba(255, 149, 0, 0.05)',
      borderColor: 'rgba(255, 149, 0, 0.3)',
  },
  cardContent: {
      flex: 1,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
  },
  statusContainer: {
      flexDirection: 'row',
      alignItems: 'center',
  },
  historyDate: {
    color: '#888',
    fontSize: 15,
    fontWeight: '500',
  },
  historyValue: {
    color: '#999',
    fontSize: 15,
    fontWeight: '600',
  },
  textHighlight: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  emptyState: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 100,
  },
  placeholderText: {
    color: '#666',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },
});
