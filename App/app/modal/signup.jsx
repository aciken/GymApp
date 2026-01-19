import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Animated,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  StyleSheet
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useGlobalContext } from '../context/GlobalProvider';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';


// Temporarily comment out AsyncStorage if not installed
// import AsyncStorage from '@react-native-async-storage/async-storage';

// Temporarily comment out axios if not installed
// import axios from 'axios';

export default function Signup() {
  // Remove GlobalContext reference temporarily
  // const { setUser } = useGlobalContext();
    const { setError, setIsAuthenticated, setUser, isAuthenticated } = useGlobalContext();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordsMatch, setPasswordsMatch] = useState(true);


  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    // Start animations when component mounts
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  useEffect(() => {
    // Check if passwords match when either password field changes
    if (confirmPassword !== '') {
      setPasswordsMatch(password === confirmPassword);
    } else {
      setPasswordsMatch(true);
    }
  }, [password, confirmPassword]);

  useEffect(() => {
    if(isAuthenticated) {
      router.replace('/home');
    }
  }, [isAuthenticated]);

  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');


  // --- Validation Functions ---
  const isValidEmail = (emailToTest) => {

    // Basic email regex - adjust if needed for more strictness

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(emailToTest);


  };

  useEffect(() => {
    // Don't show error if email is empty
    if (!email) {
      setEmailError('');
      return;
    }
    // Show error if email is not empty AND invalid
    if (!isValidEmail(email)) {
      setEmailError('Please enter a valid email address.');
    } else {
      setEmailError(''); // Clear error if valid
    }
  }, [email]);

  const isValidPassword = (passwordToTest) => {
    // At least 8 characters, at least one number
    const passwordRegex = /^(?=.*\d).{8,}$/;
    return passwordRegex.test(passwordToTest);
  };

    useEffect(() => {
    // Don't show error if password is empty
    if (!password) {
      setPasswordError('');
      return;
    }
     // Show error if password is not empty AND invalid
    if (!isValidPassword(password)) {
      setPasswordError('Password must be 8+ chars & contain 1 number.'); // Shortened message
    } else {
      setPasswordError(''); // Clear error if valid
    }
  }, [password]);
  // --- End Validation Functions ---

  const handleSignUp = async () => {
    setError(null); // Clear previous errors

    // 1. Check if all fields are filled
    if (!name.trim() || !email.trim() || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }

    // 2. Check email format
    if (!isValidEmail(email)) {
        Alert.alert('Error', 'Please enter a valid email address.');
        return;
    }

    // 3. Check password requirements
    if (!isValidPassword(password)) {
        Alert.alert('Error', 'Password must be at least 8 characters long and contain at least one number.');
        return;
    }

    // 4. Check if passwords match
    if (!passwordsMatch) {
      Alert.alert('Error', 'Passwords do not match.');
      return;
    }

    // --- If all validation passes, proceed with API call ---
    try {
      const response = await axios.put('https://f95b31457302.ngrok-free.app/signup', { // Ensure URL is correct
        name: name.trim(), // Send trimmed name
        email: email.trim(), // Send trimmed email
        password // Send original password
      });


      if(response.status === 200) { // Check for user object
          await AsyncStorage.setItem('user', JSON.stringify(response.data));
          setUser(response.data);
          router.replace('/modal/verify');



      } else {
          const message = response.data?.message || "Sign up failed. Invalid response from server.";
          setError(message);
          Alert.alert( message);
      }
    } catch (error) {
        let message = "An unexpected error occurred during sign up.";
        if (error.response) {
          message = error.response.data?.message || `Server error: ${error.response.status}`;
        } else if (error.request) {
          message = "No response from server.";
        } else {
          message = error.message || "Error setting up request.";
        }
        setError(message);
        Alert.alert("Sign Up Error", message);
    }
  };

  return (
    <LinearGradient colors={['#101010', '#000000']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar style="light" />

        {/* Close button */}
        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => router.back()}
        >
          <Ionicons name="close" size={28} color="#FFFFFF" />
        </TouchableOpacity>

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardAvoidingView}
        >
          <ScrollView contentContainerStyle={styles.scrollViewContent}>
            <Animated.View
              style={[
                styles.formContainer,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }]
                }
              ]}
            >
              {/* Welcome Text */}
              <Text style={styles.title}>
                Create Account
              </Text>
              <Text style={styles.subtitle}>
                Join the community and start your journey.
              </Text>

              {/* Input Fields */}
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="Your Name"
                  placeholderTextColor="#888"
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                />
              </View>

              <View style={styles.inputContainer}>
                <TextInput
                  style={[styles.input, emailError && styles.inputError]}
                  placeholder="Your Email"
                  placeholderTextColor="#888"
                  value={email}
                  onChangeText={(text) => setEmail(text.trim())}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
                {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}
              </View>

              <View style={styles.inputContainer}>
                <TextInput
                  style={[styles.input, passwordError && styles.inputError]}
                  placeholder="Create Password"
                  placeholderTextColor="#888"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                />
                {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}
              </View>

              <View style={styles.inputContainer}>
                <TextInput
                  style={[styles.input, (!passwordsMatch && confirmPassword) && styles.inputError]}
                  placeholder="Confirm Password"
                  placeholderTextColor="#888"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry
                />
                {(!passwordsMatch && confirmPassword) ? <Text style={styles.errorText}>Passwords don't match</Text> : null}
              </View>

              {/* Sign Up Button */}
              <TouchableOpacity
                style={styles.signUpButton}
                onPress={handleSignUp}
              >
                <Text style={styles.signUpButtonText}>
                  Create Account
                </Text>
              </TouchableOpacity>

              {/* Already have an account */}
              <TouchableOpacity
                style={styles.signInPrompt}
                onPress={() => router.replace('/modal/signin')}
              >
                <Text style={styles.signInText}>
                  Already have an account? <Text style={styles.signInLink}>Sign In</Text>
                </Text>
              </TouchableOpacity>
            </Animated.View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  closeButton: {
    position: 'absolute',
    top: 60,
    right: 24,
    zIndex: 10,
  },
  keyboardAvoidingView: {
    flex: 1,
    justifyContent: 'center',
  },
  scrollViewContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: 40,
  },
  formContainer: {
    paddingHorizontal: 24,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    color: '#8A95B6',
    fontSize: 18,
    marginBottom: 40,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 15,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    color: 'white',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  inputError: {
    borderColor: '#FF6B6B',
  },
  errorText: {
    color: '#FF6B6B',
    fontSize: 12,
    marginTop: 5,
    marginLeft: 5,
  },
  signUpButton: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 18,
    borderRadius: 30,
    marginTop: 20,
    marginBottom: 30,
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.30,
    shadowRadius: 4.65,
    elevation: 8,
  },
  signUpButtonText: {
    color: '#000000',
    fontSize: 18,
    fontWeight: 'bold',
  },
  signInPrompt: {
    marginBottom: 32,
  },
  signInText: {
    color: '#8A95B6',
    textAlign: 'center',
    fontSize: 16,
  },
  signInLink: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});
