import React, { useState, useEffect, useRef } from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, Animated, Easing, TouchableWithoutFeedback, TextInput, ActivityIndicator, KeyboardAvoidingView, Platform, Keyboard, ScrollView, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import CustomSlider from './CustomSlider';
import { OPENAI_API_KEY } from '@env';
import OpenAI from 'openai';  
import { useRouter } from 'expo-router';
import Svg, { Path, Defs, LinearGradient as SvgLinearGradient, Stop } from 'react-native-svg';
import axios from 'axios';
import { useGlobalContext } from '../app/context/GlobalProvider';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';


const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

console.log(OPENAI_API_KEY);

const AnimatedPath = Animated.createAnimatedComponent(Path);

const AnalysisGauge = ({ score }) => {
    const size = 120;
    const strokeWidth = 12;
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * Math.PI; 

    const progressAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(progressAnim, {
            toValue: score,
            duration: 800,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
        }).start();
    }, [score]);

    const strokeDashoffset = progressAnim.interpolate({
        inputRange: [0, 100],
        outputRange: [circumference, 0],
    });

    let gradientId;
    let scoreColor;

    if (score >= 75) {
        gradientId = "greenGradient";
        scoreColor = '#4CAF50';
    } else if (score >= 40) {
        gradientId = "orangeGradient";
        scoreColor = '#FF9500';
    } else {
        gradientId = "redGradient";
        scoreColor = '#FF3B30';
    }

    const d = `M ${strokeWidth / 2} ${size / 2} A ${radius} ${radius} 0 0 1 ${size - strokeWidth / 2} ${size / 2}`;

    return (
        <View style={styles.gaugeContainer}>
            <Svg width={size} height={size / 2 + strokeWidth} viewBox={`0 0 ${size} ${size/2 + strokeWidth/2}`}>
                <Defs>
                    <SvgLinearGradient id="greenGradient" x1="0" y1="0" x2="1" y2="0">
                        <Stop offset="0%" stopColor="#4CAF50" />
                        <Stop offset="100%" stopColor="#8BC34A" />
                    </SvgLinearGradient>
                    <SvgLinearGradient id="orangeGradient" x1="0" y1="0" x2="1" y2="0">
                        <Stop offset="0%" stopColor="#FFC107" />
                        <Stop offset="100%" stopColor="#FF9800" />
                    </SvgLinearGradient>
                    <SvgLinearGradient id="redGradient" x1="0" y1="0" x2="1" y2="0">
                        <Stop offset="0%" stopColor="#F44336" />
                        <Stop offset="100%" stopColor="#D32F2F" />
                    </SvgLinearGradient>
                </Defs>
                <Path d={d} stroke="rgba(255, 255, 255, 0.1)" strokeWidth={strokeWidth} strokeLinecap="round" fill="none" />
                <AnimatedPath
                    d={d}
                    stroke={`url(#${gradientId})`}
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                    fill="none"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                />
            </Svg>
            <Text style={[styles.analysisScore, { color: scoreColor }]}>{score}%</Text>
        </View>
    );
};

const AnimatedBlurView = Animated.createAnimatedComponent(BlurView);

const ChecklistItem = ({ item, onToggle }) => {
  const anim = useRef(new Animated.Value(item.done ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: item.done ? 1 : 0,
      duration: 300,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: false,
    }).start();
  }, [item.done]);

  const textColor = anim.interpolate({
    inputRange: [0, 1],
    outputRange: ['#888888', '#FFFFFF'],
  });

  const strikethroughWidth = anim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <TouchableOpacity style={styles.checklistItem} onPress={() => onToggle(item.id)}>
      <View style={styles.checkboxContainer}>
        <Ionicons name="ellipse-outline" size={28} color="#888888" style={{ position: 'absolute' }} />
        <Animated.View style={{ transform: [{ scale: anim }] }}>
          <Ionicons name="checkmark-circle" size={28} color="#FF9500" />
        </Animated.View>
      </View>
      <View>
        <Animated.Text style={[styles.checklistText, { color: textColor }]}>
          {item.name}
        </Animated.Text>
        <Animated.View style={[styles.strikethrough, { width: strikethroughWidth }]} />
      </View>
    </TouchableOpacity>
  );
};

const TaskDetailModal = ({ isVisible, task, onClose }) => {
  const router = useRouter();
  const [currentValue, setCurrentValue] = useState(0);
  const [checklistItems, setChecklistItems] = useState([]);
  const [mealInput, setMealInput] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [showMealHistory, setShowMealHistory] = useState(false);
  const [sliderKey, setSliderKey] = useState(0);
  const slideAnim = useRef(new Animated.Value(500)).current;
  const blurAnim = useRef(new Animated.Value(0)).current;

  const getModalHeight = () => {
    if (!task) return '55%';
    switch (task.type) {
      case 'meals':
        return '70%';
      case 'checklist':
        return '65%';
      case 'slider':
        return '45%';
      case 'sleep':
        return '55%';
      case 'simple_dont':
      case 'simple':
        return '45%'; // Increased height for better spacing
      default:
        return '55%';
    }
  };

  useEffect(() => {
    if (isVisible && task) {
      // Reset state based on task type
      switch (task.type) {
        case 'slider':
          // Convert saved progress (percentage) back to the slider's raw value for initialization
          let initialValue;
          if (task.inverted) {
            const maxValue = task.maxValue || task.goal * 1.5;
            initialValue = (task.progress / 100) * maxValue;
          } else {
            initialValue = (task.progress / 100) * task.goal;
          }
          setCurrentValue(initialValue);
          setSliderKey(prev => prev + 1); // Force complete remount of slider
          setChecklistItems([]);
          setMealInput('');
          setIsAnalyzing(false);
          setAnalysis(null);
          break;
        case 'checklist':
          // If the task object already has a 'checked' property, use it to initialize the state
          const initialChecklist = (task.checklist || []).map(item => ({
            ...item,
            done: task.checked ? task.checked.includes(item.id) : false,
          }));
          setChecklistItems(initialChecklist);
          setCurrentValue(0);
          setMealInput('');
          setIsAnalyzing(false);
          setAnalysis(null);
          break;
        case 'meals':
          setMealInput('');
          setIsAnalyzing(false);
          setAnalysis(null);
          setCurrentValue(0);
          setChecklistItems([]);
          break;
        default:
          setCurrentValue(0);
          setChecklistItems([]);
          setMealInput('');
          setIsAnalyzing(false);
          setAnalysis(null);
          break;
      }

      // Start open animation
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 50,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(blurAnim, {
          toValue: 60,
          duration: 400,
          easing: Easing.out(Easing.ease),
          useNativeDriver: false, 
        }),
      ]).start();
    } else if (!isVisible) {
      // Start close animation
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 500,
          duration: 300,
          easing: Easing.in(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(blurAnim, {
          toValue: 0,
          duration: 300,
          easing: Easing.in(Easing.ease),
          useNativeDriver: false,
        }),
      ]).start();
    }
  }, [isVisible, task]);

  const handleClose = (saveData = null) => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 500,
        duration: 300,
        easing: Easing.in(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(blurAnim, {
        toValue: 0,
        duration: 300,
        easing: Easing.in(Easing.ease),
        useNativeDriver: false,
      }),
    ]).start(() => onClose(saveData));
  };
  
  const renderSimpleTask = () => (
    <View style={styles.contentContainer}>
      <View style={styles.taskImageContainer}>
        <Image source={task.modalImage || task.image} style={styles.taskImage} />
      </View>
      <Text style={styles.taskTitle}>
        {task.task}
      </Text>
      <Text style={styles.taskSubtitle}>Did you complete this task?</Text>
    </View>
  );

  const renderSimpleDontTask = () => (
    <View style={styles.contentContainer}>
      <View style={[styles.taskImageContainer, { backgroundColor: 'rgba(239, 68, 68, 0.1)' }]}>
        {task.modalImage || task.image ? (
             <Image source={task.modalImage || task.image} style={styles.taskImage} />
        ) : (
            <Ionicons name="close" size={48} color="#ef4444"/>
        )}
      </View>
      <Text style={styles.taskTitle}>Avoid Masturbation</Text>
      <Text style={styles.taskSubtitle}>Did you stay disciplined today?</Text>
    </View>
  );

  const renderSliderTask = () => (
    <View style={[styles.contentContainer, { justifyContent: 'center', paddingTop: 0 }]}>
      <Text style={styles.taskTitle}>
        {task.inverted ? `Rate your ${task.task.toLowerCase()}` : `How much ${task.task.toLowerCase()}?`}
      </Text>
      <View style={styles.sliderWrapper}>
        <CustomSlider 
            key={sliderKey}
            min={0}
            max={task.maxValue || task.goal * 1.5}
            initialValue={currentValue} // `currentValue` is now the raw value
            onValueChange={setCurrentValue} // `onValueChange` from slider gives raw value
            unit={task.unit}
            step={task.step || 1}
        />
      </View>
    </View>
  );

  const renderChecklistTask = () => {
    const toggleItem = (itemId) => {
      setChecklistItems(
        checklistItems.map(item =>
          item.id === itemId ? { ...item, done: !item.done } : item
        )
      );
    };

    return (
      <View style={styles.contentContainer}>
        <Text style={styles.taskTitle}>Daily Supplements</Text>
        <View style={styles.checklistContainer}>
          {checklistItems.map(item => (
            <ChecklistItem
              key={item.id}
              item={item}
              onToggle={toggleItem}
            />
          ))}
        </View>
      </View>
    );
  };

  const renderMealsTask = () => {
    const handleAnalyze = async () => {
      setIsAnalyzing(true);
      setAnalysis(null);
      Keyboard.dismiss();

      try {
        const completion = await openai.chat.completions.create({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: `You are a testosterone optimization assistant. Analyze the user's meal for its impact on testosterone production. Provide a response in JSON format with two keys: "score" (a number from 0 to 100 representing how good this meal is for testosterone optimization) and "text" (a brief, one-sentence (15 word max)  analysis explaining why this meal is good or bad for testosterone).`
            },
            {
              role: 'user',
              content: mealInput
            }
          ],
        });

        const result = JSON.parse(completion.choices[0].message.content);
        setAnalysis({ text: result.text, score: result.score });

      } catch (error) {
        console.error("OpenAI API Error:", error);
        setAnalysis({
          text: 'Sorry, the analysis could not be completed at this time.',
          score: 0,
        });
      } finally {
        setIsAnalyzing(false);
      }
    };

    return (
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"} 
        style={{ flex: 1, width: '100%' }}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={[styles.contentContainer, { justifyContent: 'center', paddingBottom: 40 }]}>
            <Text style={styles.taskTitle}>Nutrition Log</Text>
            
            {task.history && task.history.length > 0 && (
              <TouchableOpacity 
                style={styles.viewHistoryButton} 
                onPress={() => setShowMealHistory(true)}
              >
                <Ionicons name="list-outline" size={20} color="#FFFFFF" />
                <Text style={styles.viewHistoryButtonText}>View History ({task.history.length} meals)</Text>
                <Ionicons name="chevron-forward" size={20} color="#888" />
              </TouchableOpacity>
            )}

            <TextInput
              style={styles.mealTextInput}
              placeholder="e.g., Steak, eggs, and spinach..."
              placeholderTextColor="#666"
              value={mealInput}
              onChangeText={setMealInput}
              multiline
            />
            <View style={styles.analysisContainer}>
              {isAnalyzing ? (
                <ActivityIndicator color="#FF9500" size="large" />
              ) : analysis ? (
                <View style={styles.analysisResult}>
                    <AnalysisGauge score={analysis.score} />
                    <Text style={styles.analysisText}>{analysis.text}</Text>
                </View>
              ) : (
                <TouchableOpacity
                  onPress={handleAnalyze}
                  disabled={!mealInput}
                  style={{ width: '100%' }}
                >
                  <LinearGradient
                    colors={!mealInput ? ['#333', '#222'] : ['#FF9500', '#FF5E00']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={[styles.analyzeButton, !mealInput && styles.disabledButton]}
                  >
                    <Text style={styles.analyzeButtonText}>Analyze Meal Impact</Text>
                    <Ionicons name="analytics" size={20} color="#FFF" style={{ marginLeft: 8 }} />
                  </LinearGradient>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    );
  };

  const renderContent = () => {
    if (!task) return null;
  
    switch (task.type) {
      case 'slider':
        return renderSliderTask();
      case 'checklist':
        return renderChecklistTask();
      case 'meals':
        return renderMealsTask();
      case 'simple':
        return task.inverted ? renderSimpleDontTask() : renderSimpleTask();
      default:
        // Fallback for any other types, or if inverted is used on other types
        return task.inverted ? renderSimpleDontTask() : renderSimpleTask();
    }
  };

  if (!task) return null;

  const isSimpleTask = task.type === 'simple';
  const isCompleted = isSimpleTask && task.progress > 0;

  const getButtonText = () => {
    if (isSimpleTask) {
      if (isCompleted) {
        return "Undo Completion";
      } else {
        return task.inverted ? "I Resisted" : "Mark as Complete";
      }
    }
    // Fallback for other task types
    return 'Save Progress';
  };

  const handleButtonPress = () => {
    if (isCompleted) {
      handleClose({ id: task.id, progress: 0, checked: [] });
      return;
    }

    let saveData = { id: task.id };
    if (task.type === 'simple' || task.type === 'simple_dont') {
      saveData.progress = 100;
      saveData.checked = ['done'];
    } else if (task.type === 'slider') {
      if (task.inverted) {
        // For inverted sliders, progress is a percentage of the max value.
        const maxValue = task.maxValue || task.goal * 1.5;
        saveData.progress = Math.round((currentValue / maxValue) * 100);
      } else {
        // For "do" sliders, progress is a percentage of the goal.
        saveData.progress = Math.round((currentValue / task.goal) * 100);
      }
    } else if (task.type === 'checklist') {
      const doneCount = checklistItems.filter(item => item.done).length;
      saveData.progress = Math.round((doneCount / checklistItems.length) * 100);
      saveData.checked = checklistItems.filter(item => item.done).map(item => item.id);
    } else if (task.type === 'meals') {
      if (analysis) {
        saveData.progress = analysis.score < 50 ? -(100 - analysis.score) : analysis.score;
        saveData.description = mealInput;
        saveData.history = {
          timestamp: new Date().toISOString(),
          value: analysis.score,
          description: mealInput,
        };
      }
    }
    handleClose(saveData);
  };

  return (
    <Modal
      animationType="none"
      transparent={true}
      visible={isVisible}
      onRequestClose={() => handleClose()}
    >
      <TouchableWithoutFeedback onPress={() => handleClose()}>
        <AnimatedBlurView intensity={blurAnim} tint="dark" style={styles.modalOverlay}>
          <TouchableWithoutFeedback>
            <Animated.View style={[styles.modalContainer, { transform: [{ translateY: slideAnim }], height: getModalHeight() }]}>
              <LinearGradient colors={['#1A1A1A', '#000000']} style={styles.gradientContainer}>
                <View style={styles.dragIndicator} />
                <TouchableOpacity style={styles.closeButton} onPress={() => handleClose()}>
                  <Ionicons name="close" size={24} color="#888" />
                </TouchableOpacity>
                
                {renderContent()}
                
                <TouchableOpacity 
                  style={[
                    styles.saveButton, 
                    (task.type === 'meals' && !analysis) && styles.saveButtonDisabled
                  ]} 
                  disabled={task.type === 'meals' && !analysis}
                  onPress={handleButtonPress}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={isCompleted ? ['#333', '#222'] : ['#FFFFFF', '#E0E0E0']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.saveButtonGradient}
                  >
                    <Text style={[styles.saveButtonText, isCompleted && { color: '#FFFFFF' }, !isCompleted && { color: '#000000' }]}>
                        {getButtonText()}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              </LinearGradient>
            </Animated.View>
          </TouchableWithoutFeedback>
        </AnimatedBlurView>
      </TouchableWithoutFeedback>
      
      {/* Meal History Modal */}
      {showMealHistory && task.history && (
        <MealHistoryModal 
          visible={showMealHistory}
          meals={task.history}
          onClose={() => setShowMealHistory(false)}
          onMealDeleted={() => {
            // This function will be passed down to the MealHistoryModal
            // and will be called when a meal is deleted.
            // The parent component (TaskDetailModal) will then update the task.history
            // and potentially re-render this modal or trigger a re-fetch.
          }}
        />
      )}
    </Modal>
  );
};

const MealHistoryModal = ({ visible, meals, onClose, onMealDeleted }) => {
  const totalScore = meals.reduce((sum, meal) => sum + meal.value, 0);
  const averageScore = meals.length > 0 ? Math.round(totalScore / meals.length) : 0;
  const [mealHistory, setMealHistory] = useState(meals);
  const { user, setUser } = useGlobalContext();

  useEffect(() => {
    setMealHistory(meals);
  }, [meals]);

  const handleDeleteMeal = async (timestamp, description) => {
    Alert.alert(
      "Delete Meal",
      `Are you sure you want to delete this meal?`,
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            const newHistory = mealHistory.filter(meal => meal.timestamp !== timestamp);
            setMealHistory(newHistory);

            try {
                const response = await axios.post('https://testosterone.onrender.com/tasks/meal/delete', {
                    userId: user._id,
                    timestamp: timestamp,
                    taskId: '3', 
                });

                if (response.data.user) {
                    setUser(response.data.user);
                    await AsyncStorage.setItem('user', JSON.stringify(response.data.user));
                    onMealDeleted(response.data.user);
                }
            } catch (error) {
                console.log(error);
                console.error("Failed to delete meal:", error.response ? error.response.data : error.message);
                setMealHistory(meals);
            }
          }
        }
      ]
    );
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.historyModalContainer}>
        <TouchableOpacity 
          style={styles.historyBackdrop} 
          activeOpacity={1}
          onPress={onClose}
        />
        <LinearGradient colors={['#0A0A0A', '#000000']} style={styles.historyContent}>
          <SafeAreaView style={styles.historySafeArea} edges={['top']}>
            <View style={styles.historyHeader}>
              <View style={styles.historyHeaderTop}>
                <Text style={styles.historyTitle}>Meal History</Text>
                <TouchableOpacity onPress={onClose} style={styles.historyCloseButton}>
                  <Ionicons name="close-circle" size={32} color="#555" />
                </TouchableOpacity>
              </View>
              
              <View style={styles.historyStatsContainer}>
                <View style={styles.statsRow}>
                  <Text style={styles.statsLabel}>Today's Diet</Text>
                  <Text style={[styles.statsScore, averageScore >= 60 ? { color: '#4CAF50' } : averageScore >= 30 ? { color: '#FF9500' } : { color: '#FF3B30' }]}>
                    {averageScore >= 60 ? 'Good' : averageScore >= 30 ? 'Average' : 'Bad'}
                  </Text>
                </View>
                
                <View style={styles.progressBarWrapper}>
                  <View style={styles.progressBarBg}>
                    <LinearGradient
                      colors={
                        averageScore >= 60 
                          ? ['#81C784', '#66BB6A', '#4CAF50', '#43A047'] 
                          : averageScore >= 30 
                            ? ['#FFD54F', '#FFB74D', '#FF9500', '#FB8C00'] 
                            : ['#EF5350', '#FF6B6B', '#FF3B30', '#E53935']
                      }
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={[
                        styles.progressBarFill, 
                        { 
                          width: `${Math.min(Math.max(averageScore, 0), 100)}%`,
                          shadowColor: averageScore >= 60 ? '#4CAF50' : averageScore >= 30 ? '#FF9500' : '#FF3B30',
                          shadowOffset: { width: 0, height: 0 },
                          shadowOpacity: 0.6,
                          shadowRadius: 6,
                        }
                      ]} 
                    />
                  </View>
                </View>
                
                <Text style={styles.mealCountText}>{meals.length} {meals.length === 1 ? 'meal' : 'meals'} analyzed</Text>
              </View>
            </View>
            
            <ScrollView contentContainerStyle={styles.historyScrollContent} showsVerticalScrollIndicator={false}>
              {mealHistory.map((item, index) => {
                let scoreColor = '#FF9500';
                if (item.value >= 75) {
                    scoreColor = '#4CAF50';
                } else if (item.value < 40) {
                    scoreColor = '#FF3B30';
                }
                
                return (
                    <View key={index} style={styles.historyMealCard}>
                        <View style={styles.historyMealMainContent}>
                            <View style={styles.historyMealTextContainer}>
                                <Text style={styles.historyMealDescription} numberOfLines={1}>
                                    {item.description || `Meal ${index + 1}`}
                                </Text>
                                <Text style={styles.historyMealTime}>
                                    {new Date(item.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                </Text>
                            </View>
                            
                            <View style={styles.historyMealActions}>
                                <View style={[styles.historyScorePill, { backgroundColor: scoreColor }]}>
                                    <Text style={styles.historyScoreText}>
                                        {item.value > 0 ? `+${item.value}` : item.value}%
                                    </Text>
                                </View>
                                
                                <TouchableOpacity 
                                    onPress={() => handleDeleteMeal(item.timestamp, item.description)} 
                                    style={styles.historyDeleteBtn}
                                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                                >
                                    <Ionicons name="trash-outline" size={20} color="#666" />
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                );
              })}
            </ScrollView>
          </SafeAreaView>
        </LinearGradient>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContainer: {
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    overflow: 'hidden',
    width: '100%',
  },
  gradientContainer: {
    flex: 1,
    padding: 24,
    justifyContent: 'space-between',
  },
  dragIndicator: {
    width: 40,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 10,
  },
  closeButton: {
    position: 'absolute',
    top: 24,
    right: 24,
    zIndex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 20,
    padding: 4,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: 20,
    width: '100%',
  },
  taskImageContainer: {
    width: 120,
    height: 120,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
  },
  taskImage: {
    width: '80%',
    height: '80%',
    resizeMode: 'contain',
  },
  viewHistoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    width: '100%',
  },
  viewHistoryButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
    flex: 1,
    marginLeft: 10,
  },
  taskTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  taskSubtitle: {
    color: '#888',
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 30,
  },
  sliderWrapper: {
    width: '100%',
    marginTop: 20,
  },
  mealTextInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    color: '#FFFFFF',
    fontSize: 16,
    padding: 18,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    minHeight: 120,
    textAlignVertical: 'top',
    width: '100%',
  },
  analysisContainer: {
    marginTop: 20,
    alignItems: 'center',
    justifyContent: 'center', 
    minHeight: 90,
    width: '100%',
  },
  analyzeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 25,
    paddingVertical: 16,
    width: '100%',
    shadowColor: '#FF9500',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  analyzeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  disabledButton: {
    shadowOpacity: 0,
    opacity: 0.5,
  },
  analysisResult: {
    alignItems: 'center',
    padding: 20,
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  gaugeContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  analysisText: {
    color: '#E0E0E0',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    fontWeight: '500',
  },
  analysisScore: {
    position: 'absolute',
    top: '60%',
    fontSize: 28,
    fontWeight: 'bold',
  },
  checklistContainer: {
    width: '100%',
    alignItems: 'flex-start',
    marginTop: 10,
  },
  checklistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    width: '100%',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  checkboxContainer: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  checklistText: {
    fontSize: 17,
    fontWeight: '600',
  },
  strikethrough: {
    position: 'absolute',
    height: 2,
    backgroundColor: '#FFFFFF',
    top: '50%',
  },
  saveButton: {
    width: '100%',
    borderRadius: 25,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  saveButtonGradient: {
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  // Meal History Modal Styles
  historyModalContainer: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  historyBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  historyContent: {
    flex: 1,
    marginTop: 60,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    overflow: 'hidden',
  },
  historySafeArea: {
    flex: 1,
  },
  historyHeader: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  historyHeaderTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  historyTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
    flex: 1,
  },
  historyCloseButton: {
    marginLeft: 16,
  },
  historyStatsContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statsLabel: {
    fontSize: 15,
    color: '#999',
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  statsScore: {
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  progressBarWrapper: {
    marginBottom: 10,
  },
  progressBarBg: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  mealCountText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
    textAlign: 'center',
  },
  historyScrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  historyMealCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  historyMealMainContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
  },
  historyMealTextContainer: {
    flex: 1,
    marginRight: 12,
  },
  historyMealDescription: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 4,
  },
  historyMealTime: {
    color: '#666',
    fontSize: 12,
    fontWeight: '400',
  },
  historyMealActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  historyScorePill: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  historyScoreText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  historyDeleteBtn: {
    padding: 4,
  },
});

export default TaskDetailModal;
