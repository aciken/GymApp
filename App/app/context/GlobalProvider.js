import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import axios from 'axios';
import { Platform } from 'react-native';
import Purchases from 'react-native-purchases';

const API_KEY = Platform.select({
    ios: "appl_rIVvwDddRxPEkmjanYMteRJrXzT",
    android: "YOUR_ANDROID_API_KEY"
});

const GlobalContext = createContext();
export const useGlobalContext = () => useContext(GlobalContext);

export const GlobalProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [error, setError] = useState(null);
    const [selectedAdventure, setSelectedAdventure] = useState(null);
    const [isPro, setIsPro] = useState(false);
    const [streak, setStreak] = useState(0);
    const [newlyUnlockedAchievement, setNewlyUnlockedAchievement] = useState(null);
    const [isNewUserOnboarding, setIsNewUserOnboarding] = useState(false);

    useEffect(() => {
        const init = async () => {
            if (API_KEY) {
                // Purchases.setLogLevel(Purchases.LOG_LEVEL.DEBUG);
                Purchases.configure({ apiKey: API_KEY });
            }
        };
        init();
    }, []);

    useEffect(() => {
        const checkAuthAndLoginRevenueCat = async () => {
            console.log('[CRASH_DEBUG] GlobalProvider: Starting auth check.');
            setIsLoading(true);
            try {
                const storedUser = await AsyncStorage.getItem('user');
                console.log(`[CRASH_DEBUG] GlobalProvider: Fetched from AsyncStorage: ${storedUser ? 'User Found' : 'No User'}`);

                if (storedUser) {
                    const parsedUser = JSON.parse(storedUser);
                    console.log(`[CRASH_DEBUG] GlobalProvider: User parsed successfully. User ID: ${parsedUser?._id}`);
                    setIsAuthenticated(true);
                    setUser(parsedUser);
                    
                    if (API_KEY) {
                        try {
                            console.log('[CRASH_DEBUG] GlobalProvider: Logging into RevenueCat...');
                            const loginResult = await Purchases.logIn(parsedUser._id);
                            console.log('[CRASH_DEBUG] GlobalProvider: RevenueCat login successful.');
                            
                            // Check if user has active entitlements
                            const customerInfo = await Purchases.getCustomerInfo();
                            console.log('[CRASH_DEBUG] GlobalProvider: RevenueCat customer info fetched.');
                            const isProUser = customerInfo.entitlements.active['pro'] !== undefined;
                            setIsPro(isProUser);
                            console.log(`[CRASH_DEBUG] GlobalProvider: User isPro status: ${isProUser}`);
                        } catch (e) {
                            console.error("[CRASH_DEBUG] GlobalProvider: RevenueCat login/fetch error!", e);
                        }
                    }
                } else {
                    console.log('[CRASH_DEBUG] GlobalProvider: No stored user, setting auth to false.');
                    setIsAuthenticated(false);
                    setUser(null);
                }
            } catch (error) {
                console.error('[CRASH_DEBUG] GlobalProvider: CRITICAL ERROR during auth check!', error);
                // If storage is corrupt, clear it
                await AsyncStorage.removeItem('user');
                setIsAuthenticated(false);
                setUser(null);
            } finally {
                setIsLoading(false);
                console.log('[CRASH_DEBUG] GlobalProvider: Auth check finished.');
            }
        };
        checkAuthAndLoginRevenueCat();
    }, []);

    const login = async (email, password) => {
        try {
            const response = await axios.post('https://testosterone.onrender.com/signin', { email, password });
            if(response.status === 200) {
                await AsyncStorage.setItem('user', JSON.stringify(response.data.user));
                setIsAuthenticated(true);   
                setUser(response.data.user);

                if (API_KEY) {
                    try {
                        await Purchases.logIn(response.data.user._id);
                        // Check if user has active entitlements
                        const customerInfo = await Purchases.getCustomerInfo();
                        const isProUser = customerInfo.entitlements.active['pro'] !== undefined;
                        setIsPro(isProUser);
                    } catch (e) {
                        console.error("RevenueCat login error on signin:", e);
                        setIsPro(false);
                    }
                } else {
                    setIsPro(false);
                }
            } else {
                setError(response.data.message);
            }
        } catch (error) {
            setError(error.response.data.message);
        }
    }; 
    
    const signup = async (name,email, password) => {


    };

    const logout = async () => {
        if (API_KEY) {
            try {
                await Purchases.logOut();
            } catch (e) {
                console.error("RevenueCat logout error:", e);
            }
        }
        await AsyncStorage.removeItem('user');
        setIsAuthenticated(false);
        setUser(null);
        setStreak(0);
    };  
    
    return (
    <GlobalContext.Provider value={{ user, isAuthenticated, error, setError, setIsAuthenticated, setUser, login, logout, signup, selectedAdventure, setSelectedAdventure, streak, setStreak, newlyUnlockedAchievement, setNewlyUnlockedAchievement, isPro, setIsPro, isLoading, isNewUserOnboarding, setIsNewUserOnboarding }}>
        {children}
    </GlobalContext.Provider>
);
};
    
    
    
    
    
