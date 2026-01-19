import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated, Easing, ActivityIndicator, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
// NOTE: We no longer preload local image assets. The app can run with zero local images.
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import TaskDetailModal from '../../components/TaskDetailModal';
import TodoCard from '../../components/TodoCard';
import programData from '../../data/programData';
import StreakNotification from '../../components/StreakNotification';
import { taskIcons } from '../../data/icons';
import BadgeNotification from '../../components/BadgeNotification';
import { allBadges } from '../../data/badgeData';
import { useGlobalContext } from '../context/GlobalProvider';
import { useRouter, useFocusEffect } from 'expo-router';

// Error Boundary-like component for catching render errors
const HomeContent = (props) => {
  try {
    // All original content of HomeScreen goes here
    return (
      <LinearGradient colors={['#101010', '#000000']} style={styles.container}>
        <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
          <ScrollView contentContainerStyle={styles.scrollView}>
            <View style={styles.header}>
              <View style={styles.dayNavigator}>
                <TouchableOpacity onPress={() => handleDayChange(-1)} style={styles.arrowButton}>
                  <Ionicons name="chevron-back" size={32} color="#FFFFFF" />
                </TouchableOpacity>
                <View style={styles.dayDisplay}>
                  <Text style={styles.dayLabel}>DAY</Text>
                  <Text style={styles.dayNumber}>{currentDay}</Text>
                  <View style={styles.todayButtonContainer}>
                    {currentDay !== programDay ? (
                      <TouchableOpacity onPress={() => setCurrentDay(programDay)} style={styles.todayButton}>
                        <Text style={styles.todayText}>RETURN TO TODAY</Text>
                      </TouchableOpacity>
                    ) : (
                      <Text style={styles.isTodayText}>TODAY</Text>
                    )}
                  </View>
                </View>
                <TouchableOpacity
                  onPress={() => handleDayChange(1)}
                  style={[styles.arrowButton, currentDay >= programDay && styles.arrowButtonDisabled]}
                  disabled={currentDay >= programDay}
                >
                  <Ionicons name="chevron-forward" size={32} color={currentDay >= programDay ? '#555555' : '#FFFFFF'} />
                </TouchableOpacity>
              </View>
              <View style={styles.progressContainer}>
                <Animated.View style={[styles.negativeProgressBar, { width: negativeWidth }]} />
                <Animated.View style={[styles.progressBar, { width: positiveWidth }]} />
                <Text style={[styles.progressText, { 
                  color: (() => {
                    const ngDlValue = dailyNgDl;
                    let progressPercent;
                    if (ngDlValue < 0) {
                      progressPercent = (ngDlValue / 3) * 100;
                    } else {
                      progressPercent = (ngDlValue / 8) * 100;
                    }
                    return progressPercent >= 45 && progressPercent > 0 ? '#101010' : '#FFFFFF';
                  })()
                }]}>
                  {dailyNgDl >= 0 ? `+${dailyNgDl.toFixed(1)}` : dailyNgDl.toFixed(1)} ng/dl
                </Text>
              </View>
            </View>
            
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>DO'S</Text>
            </View>
  
            <View style={styles.listContainer}>
              {isDayChanging ? (
                <ActivityIndicator size="large" color="#FFFFFF" />
              ) : (
                <Animated.View style={{ opacity: listOpacity, transform: [{ scale: listScale }] }}>
                  {currentDos.map(todo => (
                    <TodoCard 
                      key={todo.id}
                      todo={todo}
                      onPress={() => handleTaskPress(todo)}
                      isEditable={currentDay === programDay}
                    />
                  ))}
                </Animated.View>
              )}
            </View>
  
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>DON'TS</Text>
            </View>
  
            <View style={styles.listContainer}>
               {isDayChanging ? (
                <ActivityIndicator size="large" color="#FFFFFF" />
              ) : (
                <Animated.View style={{ opacity: listOpacity, transform: [{ scale: listScale }] }}>
                  {currentDonts.map(todo => (
                    <TodoCard 
                      key={todo.id}
                      todo={todo}
                      onPress={() => handleTaskPress(todo)}
                      isEditable={currentDay === programDay}
                    />
                  ))}
                </Animated.View>
              )}
            </View>
  
          </ScrollView>
        </SafeAreaView>
        {selectedTask && (
          <TaskDetailModal
            isVisible={modalVisible}
            task={selectedTask}
            onClose={handleModalClose}
          />
        )}
        {notification && (
          <Animated.View style={[styles.notificationContainer, { top: notificationAnim }]}>
              <StreakNotification
                  title={notification.title}
                  message={notification.message}
                  streakCount={notification.streakCount}
                  icon={notification.icon}
              />
          </Animated.View>
        )}
        {showBadgeNotification && newlyUnlockedAchievement && (
          <BadgeNotification 
            badge={allBadges.find(b => b.id === newlyUnlockedAchievement.id)} 
            onDismiss={() => {
              setShowBadgeNotification(false);
              setNewlyUnlockedAchievement(null);
            }}
          />
        )}
      </LinearGradient>
    );
  } catch (error) {
    console.error('[CRASH_DEBUG] HomeScreen: CRITICAL RENDER ERROR!', error);
    return (
      <LinearGradient colors={['#101010', '#000000']} style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <Text style={{ color: 'red', fontSize: 18, textAlign: 'center', padding: 20 }}>
            An error occurred while rendering the home screen. Check the logs for details.
          </Text>
        </SafeAreaView>
      </LinearGradient>
    );
  }
};


export default function HomeScreen() {
  console.log('[CRASH_DEBUG] HomeScreen: Component rendering started.');
  const { user, setUser, setStreak, newlyUnlockedAchievement, setNewlyUnlockedAchievement } = useGlobalContext();
  console.log(`[CRASH_DEBUG] HomeScreen: User from context: ${user ? `ID: ${user._id}` : 'null'}`);


  const [programDay, setProgramDay] = useState(1);
  const [currentDay, setCurrentDay] = useState(1);
  const [todosByDay, setTodosByDay] = useState(programData);
  const [isDayChanging, setIsDayChanging] = useState(false);

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [dailyNgDlChange, setDailyNgDlChange] = useState(0);
  const [progressValue, setProgressValue] = useState(0);
  const [notification, setNotification] = useState(null);
  const notificationAnim = useRef(new Animated.Value(-150)).current;

  const widthAnim = useRef(new Animated.Value(0)).current;
  const listAnim = useRef(new Animated.Value(0)).current;
  const insets = useSafeAreaInsets();

  
  const router = useRouter();
  const [showBadgeNotification, setShowBadgeNotification] = useState(false);

  useEffect(() => {
    if (newlyUnlockedAchievement) {
      const timer = setTimeout(() => {
        setShowBadgeNotification(true);
      }, 1000); // 2-second delay

      return () => clearTimeout(timer);
    }
  }, [newlyUnlockedAchievement]);

  useEffect(() => {
    const getProgramDay = async () => {
      try {
        console.log('[CRASH_DEBUG] HomeScreen: getProgramDay useEffect started.');
        
        // Always start with a fresh deep copy of the program data
        const newTodosByDay = JSON.parse(JSON.stringify(programData)); 

        if (user && user.dateCreated) {
          console.log(`[CRASH_DEBUG] HomeScreen: User and dateCreated exist. Date: ${user.dateCreated}`);
          const dateCreated = new Date(user.dateCreated);
          const today = new Date();
          
          // Set both dates to the start of the day for an accurate difference
          dateCreated.setHours(0, 0, 0, 0);
          today.setHours(0, 0, 0, 0);

          const diffTime = Math.abs(today - dateCreated);
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
          console.log(`[CRASH_DEBUG] HomeScreen: Calculated program day: ${diffDays}`);
          
          setProgramDay(diffDays);
          setCurrentDay(diffDays);
          
          // If the user has saved tasks, merge them into our fresh copy
          if (user.tasks && user.tasks.length > 0) {
            console.log('[CRASH_DEBUG] HomeScreen: User has tasks. Merging...');
            
            user.tasks.forEach(savedTask => {
              // Fix: Server stores date as UTC midnight. Convert to local date by adding offset to prevent 'previous day' shift
              const rawDate = new Date(savedTask.date);
              const taskDate = new Date(rawDate.valueOf() + rawDate.getTimezoneOffset() * 60000);
              
              const startDate = new Date(dateCreated);
              startDate.setHours(0, 0, 0, 0);
              taskDate.setHours(0, 0, 0, 0);

              const timeDiff = taskDate - startDate;
              const daysDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
              // Handle edge case: if user's dateCreated is in the future (bad data/timezone issue),
              // treat all tasks as Day 1
              let dayIndex = daysDiff < 0 ? 1 : daysDiff + 1;

              // CRITICAL FIX: If the task date matches 'today', FORCE it to be on the current program day (diffDays).
              // This overcomes any subtle timezone mismatches between 'dateCreated' and 'taskDate' that
              // might otherwise shift the task to Yesterday or Tomorrow.
              if (taskDate.getDate() === today.getDate() && 
                  taskDate.getMonth() === today.getMonth() && 
                  taskDate.getFullYear() === today.getFullYear()) {
                  
                  if (dayIndex !== diffDays) {
                    console.log(`[MERGE_DEBUG] CORRECTING DRIFT for Task ${savedTask.taskId}: Changed dayIndex from ${dayIndex} to ${diffDays}`);
                    dayIndex = diffDays;
                  }
              }

              console.log(`[MERGE_DEBUG] Processing task: ${savedTask.taskId}, progress: ${savedTask.progress}, taskDate: ${taskDate.toDateString()}, startDate: ${startDate.toDateString()}, daysDiff: ${daysDiff}, dayIndex: ${dayIndex}`);

              if (newTodosByDay[dayIndex]) {
                const findAndupdateTask = (taskArray) => {
                  if (!taskArray) return;
                  const taskIndex = taskArray.findIndex(t => t.id === savedTask.taskId);
                  if (taskIndex > -1) {
                    console.log(`[MERGE_DEBUG] Found task ${savedTask.taskId} at index ${taskIndex}, updating progress to ${savedTask.progress}`);
                    taskArray[taskIndex].progress = savedTask.progress;
                    if (savedTask.checked) {
                      taskArray[taskIndex].checked = savedTask.checked;
                    }
                    if (savedTask.history) {
                        taskArray[taskIndex].history = savedTask.history;
                    }
                  } else {
                    console.log(`[MERGE_DEBUG] Task ${savedTask.taskId} NOT FOUND in array`);
                  }
                };
                findAndupdateTask(newTodosByDay[dayIndex].dos);
                findAndupdateTask(newTodosByDay[dayIndex].donts);
              } else {
                console.log(`[MERGE_DEBUG] Day ${dayIndex} not found in newTodosByDay`);
              }
            });
            console.log('[CRASH_DEBUG] HomeScreen: Task merge complete.');
          } else {
            console.log('[CRASH_DEBUG] HomeScreen: User has no tasks to merge.');
          }
        } else {
            console.log('[CRASH_DEBUG] HomeScreen: User object or user.dateCreated is missing.');
        }

        // Set the state with the potentially merged data
        setTodosByDay(newTodosByDay);

      } catch (error) {
        console.error("[CRASH_DEBUG] HomeScreen: CRITICAL ERROR in getProgramDay useEffect!", error);
      }
    };

    getProgramDay();
  }, [user]); // Add user as a dependency

  console.log(`[CRASH_DEBUG] HomeScreen: Preparing to render. currentDay: ${currentDay}`);
  const currentDayData = todosByDay[currentDay] || { dos: [], donts: [] };
  console.log(`[CRASH_DEBUG] HomeScreen: currentDayData is ${currentDayData ? 'defined' : 'undefined'}. Dos length: ${currentDayData?.dos?.length || 'N/A'}`);
  const currentDos = currentDayData.dos || [];
  const currentDonts = currentDayData.donts || [];

  // CRITICAL FIX: If data for the current day isn't loaded, show a loading screen.
  if (!currentDayData || !currentDayData.dos) {
    console.log('[CRASH_DEBUG] HomeScreen: Data not ready, showing loading spinner.');
    return (
      <LinearGradient colors={['#101010', '#000000']} style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <ActivityIndicator size="large" color="#FFFFFF" />
        </SafeAreaView>
      </LinearGradient>
    );
  }
  console.log('[CRASH_DEBUG] HomeScreen: Data is ready. Proceeding to calculate progress.');

  const positiveProgress = currentDos.reduce((sum, todo) => sum + Math.min(todo.progress || 0, 100), 0);
  const negativeProgress = currentDonts.reduce((sum, todo) => sum + (todo.progress || 0), 0);
  const totalPossiblePositive = currentDos.length * 100;

  const progress = totalPossiblePositive > 0 
    ? ((positiveProgress - negativeProgress) / totalPossiblePositive) * 100
    : -negativeProgress / (currentDonts.length * 100) * 100;

  // Calculate daily ng/dl impact
  const calculateDailyNgDl = () => {
    try {
      const allTasks = (programData[1] && programData[1].dos && programData[1].donts) 
        ? [...programData[1].dos, ...programData[1].donts] 
        : [];
      
      if (allTasks.length === 0) {
        return 0; // No tasks defined, so no impact
      }

      const taskMap = allTasks.reduce((map, task) => {
        map[task.id] = { ...task };
        return map;
      }, {});

      let totalPositive = 0;
      let totalNegative = 0;

      // Calculate for current dos
      currentDos.forEach(todo => {
        const taskInfo = taskMap[todo.id];
        if (!taskInfo) return;

        let contribution;
        if (taskInfo.id === 'sleep') {
          const hoursSlept = ((todo.progress || 0) / 100) * taskInfo.goal;
          let impactMultiplier;
          if (hoursSlept < 7) {
            const deficit = 7 - hoursSlept;
            impactMultiplier = -Math.min(deficit / 3, 1);
          } else if (hoursSlept < 8) {
            impactMultiplier = 0;
          } else {
            const surplus = hoursSlept - 8;
            impactMultiplier = Math.min(surplus / 2, 1);
          }
          contribution = impactMultiplier * taskInfo.impact;
        } else if (taskInfo.type === 'slider' && !taskInfo.inverted) {
          const actualValue = ((todo.progress || 0) / 100) * taskInfo.goal;
          const impactMultiplier = taskInfo.goal > 0 ? Math.min(actualValue / taskInfo.goal, 2) : 0;
          contribution = impactMultiplier * taskInfo.impact;
        } else if (taskInfo.type === 'meals') {
          if ((todo.progress || 0) < 0) {
            contribution = (todo.progress || 0) * taskInfo.impact / 100;
          } else {
            contribution = ((todo.progress || 0) / 100) * taskInfo.impact;
          }
        } else {
          const progressPercent = (todo.progress || 0) / 100;
          contribution = taskInfo.inverted 
            ? -1 * progressPercent * taskInfo.impact
            : progressPercent * taskInfo.impact;
        }

        if (contribution > 0) {
          totalPositive += contribution;
        } else {
          totalNegative += contribution;
        }
      });

      // Calculate for current donts
      currentDonts.forEach(todo => {
        const taskInfo = taskMap[todo.id];
        if (!taskInfo) return;

        const progressPercent = (todo.progress || 0) / 100;
        const contribution = -1 * progressPercent * taskInfo.impact;
        totalNegative += contribution;
      });

      const totalPossiblePositiveImpact = (programData[1] && programData[1].dos) 
        ? programData[1].dos.reduce((sum, task) => sum + (task.impact || 0), 0)
        : 0;

      const totalPossibleNegativeImpact = 
        ((programData[1] && programData[1].donts) ? programData[1].donts.reduce((sum, task) => sum + (task.impact || 0), 0) : 0) +
        ((programData[1] && programData[1].dos) ? programData[1].dos.filter(t => t.type === 'meals' || t.id === 'sleep').reduce((sum, task) => sum + (task.impact || 0), 0) : 0);
        
      if (totalPossiblePositiveImpact === 0 || totalPossibleNegativeImpact === 0) {
        return 0; // Avoid division by zero
      }

      const normalizedPositive = (totalPositive / totalPossiblePositiveImpact) * 8;
      const normalizedNegative = (totalNegative / totalPossibleNegativeImpact) * 3;
      
      return normalizedPositive + normalizedNegative;
    } catch (error) {
        console.error('[CRASH_DEBUG] HomeScreen: CRITICAL ERROR in calculateDailyNgDl!', error);
        return 0; // Return a safe value on error
    }
  };

  console.log('[CRASH_DEBUG] HomeScreen: Running calculateDailyNgDl...');
  const dailyNgDl = calculateDailyNgDl();
  console.log(`[CRASH_DEBUG] HomeScreen: dailyNgDl calculated: ${dailyNgDl}`);

  useEffect(() => {
    // Use the ng/dl calculation to drive the progress bar
    const ngDlValue = calculateDailyNgDl();
    
    // Map ng/dl to progress percentage (-3 to +8 range maps to -100% to +100%)
    // Negative: -3 ng/dl = -100%, 0 = 0%
    // Positive: +8 ng/dl = +100%, 0 = 0%
    let newProgress;
    if (ngDlValue < 0) {
      newProgress = (ngDlValue / 3) * 100; // -3 -> -100%
    } else {
      newProgress = (ngDlValue / 8) * 100; // +8 -> +100%
    }

    Animated.timing(widthAnim, {
      toValue: newProgress,
      duration: 800,
      easing: Easing.out(Easing.ease),
      useNativeDriver: false,
    }).start();
  }, [currentDay, todosByDay]);

  useEffect(() => {
    if (notification) {
      Animated.sequence([
        Animated.spring(notificationAnim, {
          toValue: insets.top + 10,
          tension: 40,
          friction: 14,
          useNativeDriver: false,
        }),
        Animated.delay(3000),
        Animated.spring(notificationAnim, {
          toValue: -150,
          tension: 40,
          friction: 14,
          useNativeDriver: false,
        }),
      ]).start(() => setNotification(null));
    }
  }, [notification]);

  useEffect(() => {
    if (!isDayChanging) {
      // Fade in the list
      Animated.stagger(50, [
        Animated.spring(listAnim, {
          toValue: 1,
          tension: 40,
          friction: 10,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      listAnim.setValue(0);
    }
  }, [isDayChanging]);

  const handleTaskPress = (task) => {
    if (currentDay !== programDay || isDayChanging) return;
    setSelectedTask(task);
    setModalVisible(true);
  };

  const handleModalClose = (saveData) => {
    setModalVisible(false);
    setSelectedTask(null);

    if (saveData) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      
      // Optimistic update: show progress instantly
      if (!todosByDay[currentDay]) {
        return;
      }

      const isDo = (todosByDay[currentDay].dos || []).some(t => t.id === saveData.id);

      if (isDo) {
        const newDos = (todosByDay[currentDay].dos || []).map(todo => {
          if (todo.id === saveData.id) {
            if (saveData.id === '3') { // meals task
              const newProgress = (todo.progress || 0) + saveData.progress;
              const newHistory = [...(todo.history || []), { value: saveData.progress, description: saveData.description, timestamp: new Date() }];
              return { ...todo, progress: newProgress, history: newHistory };
            }
            return { ...todo, ...saveData };
          }
          return todo;
        });
        setTodosByDay(prevData => ({
          ...prevData,
          [currentDay]: { ...prevData[currentDay], dos: newDos },
        }));
      } else {
        const newDonts = (todosByDay[currentDay].donts || []).map(todo =>
          todo.id === saveData.id ? { ...todo, ...saveData } : todo
        );
        setTodosByDay(prevData => ({
          ...prevData,
          [currentDay]: { ...prevData[currentDay], donts: newDonts },
        }));
      }
      
      sendTaskUpdate(saveData);
    }
  };

  const sendTaskUpdate = async (taskData) => {
    try {
      const now = new Date();
      const localDate = new Date(now.getTime() - (now.getTimezoneOffset() * 60000));
      console.log(localDate);
      const userString = await AsyncStorage.getItem('user');
      if (userString) {
        const user = JSON.parse(userString);
        const dailyNgDl = calculateDailyNgDl(); // Calculate the value before sending
        const updatePayload = {
          userId: user._id,
          date: localDate,
          task: taskData,
          dailyNgDl: dailyNgDl, // Add the score to the payload
        };

        const response = await axios.post('https://testosterone.onrender.com/tasks/update', updatePayload);

        if (response.data) {
          // The server now sends back the full user object, which is the source of truth
          if (response.data.user) {
            const updatedUserFromServer = response.data.user;
            await AsyncStorage.setItem('user', JSON.stringify(updatedUserFromServer));
            setUser(updatedUserFromServer); // Update context with the fresh user object
          }

          // Update streak from server response and show notification if flagged
          if (response.data.showStreakNotification && response.data.streak && typeof response.data.streak.count === 'number' && response.data.streak.count > 0) {
            const streakData = response.data.streak;
            const newStreakCount = streakData.count;
            
            // Find task info for the notification message - with defensive checks
            const allProgramTasks = (programData[1] && programData[1].dos && programData[1].donts)
              ? [...programData[1].dos, ...programData[1].donts]
              : [];
            const taskInfo = allProgramTasks.find(t => t.id === streakData.taskId);

            if (taskInfo) {
              setNotification({
                title: newStreakCount === 1 ? 'Streak Started!' : 'Streak Growing!',
                message: taskInfo.task,
                streakCount: newStreakCount,
                icon: taskIcons[streakData.taskId],
              });
            }
          }

          // Check for newly unlocked achievements
          if (response.data.newAchievements && response.data.newAchievements.length > 0) {
            const achievement = response.data.newAchievements[0]; // Assuming one at a time for simplicity
            setNewlyUnlockedAchievement(achievement);
          }
        }
      }
    } catch (error) {
      console.error("Failed to send task update:", error);
    }
  };

  const handleDayChange = (direction) => {
    const newDay = currentDay + direction;
    if (todosByDay[newDay] && !isDayChanging) {
      setIsDayChanging(true); // Show loader immediately

      // No asset preloading needed anymore (removed all local images).
      setCurrentDay(newDay);
      setIsDayChanging(false);
    }
  };

  const animatedWidth = widthAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  const listOpacity = listAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  const listScale = listAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.98, 1],
  });

  const positiveWidth = widthAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
    extrapolate: 'clamp',
  });

  const negativeWidth = widthAnim.interpolate({
    inputRange: [-100, 0],
    outputRange: ['100%', '0%'],
    extrapolate: 'clamp',
  });

  try {
    console.log('[CRASH_DEBUG] HomeScreen: Starting main render.');
    return (
      <LinearGradient colors={['#101010', '#000000']} style={styles.container}>
        <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
          <ScrollView contentContainerStyle={styles.scrollView}>
            <View style={styles.header}>
              <View style={styles.dayNavigator}>
                <TouchableOpacity onPress={() => handleDayChange(-1)} style={styles.arrowButton}>
                  <Ionicons name="chevron-back" size={32} color="#FFFFFF" />
                </TouchableOpacity>
                <View style={styles.dayDisplay}>
                  <Text style={styles.dayLabel}>DAY</Text>
                  <Text style={styles.dayNumber}>{currentDay}</Text>
                  <View style={styles.todayButtonContainer}>
                    {currentDay !== programDay ? (
                      <TouchableOpacity onPress={() => setCurrentDay(programDay)} style={styles.todayButton}>
                        <Text style={styles.todayText}>RETURN TO TODAY</Text>
                      </TouchableOpacity>
                    ) : (
                      <Text style={styles.isTodayText}>TODAY</Text>
                    )}
                  </View>
                </View>
                <TouchableOpacity
                  onPress={() => handleDayChange(1)}
                  style={[styles.arrowButton, currentDay >= programDay && styles.arrowButtonDisabled]}
                  disabled={currentDay >= programDay}
                >
                  <Ionicons name="chevron-forward" size={32} color={currentDay >= programDay ? '#555555' : '#FFFFFF'} />
                </TouchableOpacity>
              </View>
              <View style={styles.progressContainer}>
                <Animated.View style={[styles.negativeProgressBar, { width: negativeWidth }]} />
                <Animated.View style={[styles.progressBar, { width: positiveWidth }]} />
                <Text style={[styles.progressText, { 
                  color: (() => {
                    const ngDlValue = dailyNgDl;
                    let progressPercent;
                    if (ngDlValue < 0) {
                      progressPercent = (ngDlValue / 3) * 100;
                    } else {
                      progressPercent = (ngDlValue / 8) * 100;
                    }
                    return progressPercent >= 45 && progressPercent > 0 ? '#101010' : '#FFFFFF';
                  })()
                }]}>
                  {dailyNgDl >= 0 ? `+${dailyNgDl.toFixed(1)}` : dailyNgDl.toFixed(1)} ng/dl
                </Text>
              </View>
            </View>
            
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>DO'S</Text>
            </View>
  
            <View style={styles.listContainer}>
              {isDayChanging ? (
                <ActivityIndicator size="large" color="#FFFFFF" />
              ) : (
                <Animated.View style={{ opacity: listOpacity, transform: [{ scale: listScale }] }}>
                  {currentDos.map((todo, index) => {
                    console.log(`[CRASH_DEBUG] Rendering DO card index: ${index}, id: ${todo.id}`);
                    return (
                      <TodoCard 
                        key={todo.id}
                        todo={todo}
                        onPress={() => handleTaskPress(todo)}
                        isEditable={currentDay === programDay}
                      />
                    );
                  })}
                </Animated.View>
              )}
            </View>
  
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>DON'TS</Text>
            </View>
  
            <View style={styles.listContainer}>
               {isDayChanging ? (
                <ActivityIndicator size="large" color="#FFFFFF" />
              ) : (
                <Animated.View style={{ opacity: listOpacity, transform: [{ scale: listScale }] }}>
                  {currentDonts.map((todo, index) => {
                    console.log(`[CRASH_DEBUG] Rendering DONT card index: ${index}, id: ${todo.id}`);
                    return (
                      <TodoCard 
                        key={todo.id}
                        todo={todo}
                        onPress={() => handleTaskPress(todo)}
                        isEditable={currentDay === programDay}
                      />
                    );
                  })}
                </Animated.View>
              )}
            </View>
  
          </ScrollView>
        </SafeAreaView>
        {selectedTask && (
          <TaskDetailModal
            isVisible={modalVisible}
            task={selectedTask}
            onClose={handleModalClose}
          />
        )}
        {notification && (
          <Animated.View style={[styles.notificationContainer, { top: notificationAnim }]}>
              <StreakNotification
                  title={notification.title}
                  message={notification.message}
                  streakCount={notification.streakCount}
                  icon={notification.icon}
              />
          </Animated.View>
        )}
        {showBadgeNotification && newlyUnlockedAchievement && (
          <BadgeNotification 
            badge={allBadges.find(b => b.id === newlyUnlockedAchievement.id)} 
            onDismiss={() => {
              setShowBadgeNotification(false);
              setNewlyUnlockedAchievement(null);
            }}
          />
        )}
      </LinearGradient>
    );
  } catch (error) {
    console.error('[CRASH_DEBUG] HomeScreen: CRITICAL RENDER ERROR!', error);
    return (
      <LinearGradient colors={['#101010', '#000000']} style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <Text style={{ color: 'red', fontSize: 18, textAlign: 'center', padding: 20 }}>
            An error occurred while rendering the home screen. Check the logs for details.
          </Text>
        </SafeAreaView>
      </LinearGradient>
    );
  }
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  scrollView: { 
    paddingVertical: 20, 
    paddingHorizontal: 20,
    paddingBottom: 100, // Extra padding to clear the floating tab bar
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  dayNavigator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 25, // Increased margin
  },
  arrowButton: {
    padding: 10,
    backgroundColor: 'rgba(255,255,255,0.05)', // Subtle background for touch target
    borderRadius: 20,
  },
  arrowButtonDisabled: {
    opacity: 0.3,
    backgroundColor: 'transparent',
  },
  dayDisplay: {
    alignItems: 'center',
  },
  dayLabel: {
    color: '#888', // Darker grey for subtitle
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 4,
    marginBottom: -5, // Tighter spacing
  },
  dayNumber: {
    color: '#FFFFFF',
    fontSize: 76, // Slightly larger
    fontWeight: '900', // Maximum weight
    lineHeight: 84,
    textShadowColor: 'rgba(255, 255, 255, 0.1)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
  },
  todayButtonContainer: {
    height: 30,
    marginTop: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  todayButton: {
    backgroundColor: 'rgba(255, 149, 0, 0.15)', // Orange tint
    borderColor: 'rgba(255, 149, 0, 0.3)',
    borderWidth: 1,
    borderRadius: 15,
    paddingVertical: 6,
    paddingHorizontal: 16,
  },
  todayText: {
    color: '#FF9500', // Brand orange
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1,
  },
  isTodayText: {
    color: '#FF9500', // Brand orange instead of grey
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 2,
    textShadowColor: 'rgba(255, 149, 0, 0.3)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  progressContainer: {
    width: '100%',
    height: 28, // Slightly taller
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 14,
    marginTop: 10,
    position: 'relative',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    overflow: 'hidden',
  },
  sectionHeader: {
    width: '100%',
    marginBottom: 15,
    marginTop: 15, // Increased spacing
    paddingLeft: 5,
    borderLeftWidth: 3,
    borderLeftColor: '#FF9500', // Orange accent line
  },
  sectionTitle: {
    color: '#FFFFFF', // Brighter white
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 2,
    marginLeft: 10,
  },
  listContainer: {
    minHeight: 100,
    justifyContent: 'center',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    shadowColor: '#FFFFFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 5,
    elevation: 8,
    position: 'absolute',
  },
  negativeProgressBar: {
    height: '100%',
    backgroundColor: '#FF6B6B',
    borderRadius: 12,
    shadowColor: '#FF6B6B',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 5,
    elevation: 8,
    position: 'absolute',
  },
  progressText: {
    position: 'absolute',
    width: '100%',
    textAlign: 'center',
    lineHeight: 24,
    fontSize: 14,
    fontWeight: 'bold',
  },
  dontCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 107, 107, 0.05)',
    padding: 20,
    borderRadius: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 107, 0.2)',
  },
  dontCardText: {
    color: '#FFD1D1',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 15,
  },
  notificationContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 1000,
    alignItems: 'center',
    paddingHorizontal: 20,
  },
}); 