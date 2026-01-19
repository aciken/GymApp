import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ImageBackground, Animated, Easing } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

const TodoCard = ({ todo, onPress, isEditable }) => {
  // --- Start of Crash Proofing ---
  try {
    // Safety Check 1: Ensure the 'todo' object and its essential properties exist.
    if (!todo || typeof todo.progress === 'undefined' || !todo.task) {
      console.error("TodoCard_ERROR: Invalid 'todo' object received.", todo);
      return (
        <View style={[styles.todoCard, styles.errorCard]}>
          <Text style={styles.errorText}>Error: Invalid task data.</Text>
        </View>
      );
    }

    // Safety Check 2: Verify that the image exists before trying to render it.
    if (!todo.image) {
      console.error("TodoCard_ERROR: Missing 'todo.image' for task:", todo.task);
      return (
        <View style={[styles.todoCard, styles.errorCard]}>
          <Text style={styles.errorText}>Error: Missing image for "{todo.task}"</Text>
        </View>
      );
    }
    // --- End of Crash Proofing ---

    const isFailed = todo.inverted && (() => {
      if (todo.type === 'slider') {
        const rawValue = (todo.progress / 100) * todo.maxValue;
        return rawValue >= todo.goal;
      }
      // For simple inverted tasks, failure is when progress is 100%
      return todo.progress >= 100;
    })();

    const isCompleted = !todo.inverted && todo.progress >= 100;
    const isNegative = todo.progress < 0;
    const animation = useRef(new Animated.Value((isCompleted || isFailed) ? 1 : 0)).current;
    const progressAnim = useRef(new Animated.Value(Math.abs(todo.progress || 0))).current;

    const getGoalText = () => {
        if (!todo) return '';
        switch (todo.type) {
            case 'slider':
                return todo.inverted ? `Goal: < ${todo.goal} ${todo.unit}` : `Goal: ${todo.goal} ${todo.unit}`;
            case 'checklist':
                return `Goal: ${todo.checklist.length} items`;
            case 'meals':
                return 'Goal: Healthy';
            case 'simple':
                return 'Goal: Complete';
            default:
                return '';
        }
    };

    useEffect(() => {
      Animated.timing(animation, {
        toValue: (isCompleted || isFailed) ? 1 : 0,
        duration: 500,
        easing: Easing.out(Easing.ease),
        useNativeDriver: false,
      }).start();
    }, [isCompleted, isFailed]);

    useEffect(() => {
      Animated.timing(progressAnim, {
        toValue: Math.abs(todo.progress || 0),
        duration: 600,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }).start();
    }, [todo.progress]);

    const animatedCardStyle = {
      borderWidth: animation.interpolate({
        inputRange: [0, 1],
        outputRange: [1, 2],
      }),
      borderColor: animation.interpolate({
        inputRange: [0, 1],
        outputRange: ['rgba(255, 255, 255, 0.2)', (isFailed || isNegative) ? 'rgba(255, 107, 107, 0.9)' : 'rgba(255, 255, 255, 0.9)'],
      }),
    };

    const animatedTitleStyle = {
      opacity: animation.interpolate({
        inputRange: [0, 1],
        outputRange: [1, 0.6],
      }),
    };

    const doneOpacity = animation.interpolate({ inputRange: [0, 1], outputRange: [0, 1] });
    const blurOpacity = animation.interpolate({ inputRange: [0, 1], outputRange: [0, 1] });

    const animatedProgressWidth = progressAnim.interpolate({
      inputRange: [0, 100],
      outputRange: ['0%', '100%'],
      extrapolate: 'clamp',
    });

    return (
      <AnimatedTouchableOpacity
        style={[styles.todoCard, animatedCardStyle, !isEditable && styles.disabledCard]}
        onPress={isEditable ? onPress : null}
        activeOpacity={isEditable ? 0.7 : 1}
      >
        <ImageBackground source={todo.image} style={styles.imageBackground} imageStyle={styles.imageStyle}>
          <Animated.View style={{...StyleSheet.absoluteFillObject, opacity: blurOpacity }}>
            {(isCompleted || isFailed) && <BlurView intensity={30} tint={(isFailed || isNegative) ? "dark" : "light"} style={StyleSheet.absoluteFill} />}
          </Animated.View>
          <LinearGradient
            colors={(isCompleted || isFailed) ? ((isFailed || isNegative) ? ['rgba(150,0,0,0.5)', 'rgba(50,0,0,0.5)'] : ['rgba(0,0,0,0.5)', 'rgba(0,0,0,0.5)']) : ['rgba(0,0,0,0.6)', 'rgba(0,0,0,0.2)', 'rgba(0,0,0,0.6)']}
            style={styles.gradient}
          >
            <View style={{ height: 28 }}>
              <Animated.View style={{ opacity: doneOpacity, position: 'absolute' }}>
                <View style={[styles.badgeContainer, (isFailed || isNegative) ? styles.failedBadge : styles.completedBadge]}>
                  <Ionicons name={(isFailed || isNegative) ? "warning-outline" : "checkmark-sharp"} size={16} color="#FFFFFF" />
                  <Text style={styles.completedText}>{(isFailed || isNegative) ? "FAILED" : "DONE"}</Text>
                </View>
              </Animated.View>
            </View>

            <View style={styles.cardContent}>
              <Animated.Text style={[styles.todoTitle, animatedTitleStyle]}>{todo.task}</Animated.Text>
              <View style={styles.bottomContainer}>
                <View style={styles.cardProgressContainer}>
                  <View style={styles.cardProgressBarBackground}>
                    <Animated.View style={[
                      styles.cardProgressBarFill, 
                      { width: animatedProgressWidth },
                      (isFailed || isNegative) && { backgroundColor: '#FF6B6B' }
                    ]} />
                  </View>
                </View>
                <Text style={styles.goalText}>{getGoalText()}</Text>
              </View>
            </View>
          </LinearGradient>
        </ImageBackground>
      </AnimatedTouchableOpacity>
    );
  } catch (error) {
    // --- Start of Crash Proofing ---
    // Catch any other unexpected rendering error and display a fallback UI.
    console.error("TodoCard_ERROR: A critical rendering error occurred for task:", todo ? todo.task : 'UNKNOWN', error);
    return (
      <View style={[styles.todoCard, styles.errorCard]}>
        <Text style={styles.errorText}>A critical error occurred rendering this card.</Text>
      </View>
    );
    // --- End of Crash Proofing ---
  }
};

const styles = StyleSheet.create({
  todoCard: {
    height: 160,
    borderRadius: 20,
    marginBottom: 20,
    overflow: 'hidden',
  },
  // --- Start of Crash Proofing ---
  errorCard: {
    backgroundColor: '#550000',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
    borderColor: '#FF0000',
    borderWidth: 2,
  },
  errorText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  // --- End of Crash Proofing ---
  disabledCard: {
    opacity: 0.6,
  },
  imageBackground: {
    flex: 1,
    justifyContent: 'space-between',
  },
  imageStyle: {
    borderRadius: 20,
  },
  gradient: {
    flex: 1,
    padding: 20,
    justifyContent: 'space-between',
  },
  badgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 15,
    paddingVertical: 4,
    paddingHorizontal: 8,
    alignSelf: 'flex-start',
  },
  completedBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 10,
  },
  failedBadge: {
    backgroundColor: 'rgba(255, 107, 107, 0.3)',
    paddingHorizontal: 10,
  },
  completedText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginLeft: 6,
    fontSize: 12,
    letterSpacing: 1,
  },
  cardContent: {
    alignItems: 'flex-start',
  },
  todoTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 6,
  },
  bottomContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginTop: 10,
  },
  cardProgressContainer: {
    flex: 1,
    height: 6,
    marginRight: 12,
  },
  cardProgressBarBackground: {
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  cardProgressBarFill: {
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 3,
  },
  goalText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: 'rgba(255, 255, 255, 0.7)',
  },
});

export default TodoCard;
