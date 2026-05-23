import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';

import WelcomeScreen from './src/screens/WelcomeScreen';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import AdminScreen from './src/screens/AdminScreen';
import ResetPasswordScreen from './src/screens/ResetPasswordScreen';

export default function App() {
    const [currentScreen, setCurrentScreen] = useState('Welcome');

    const navigateTo = (screen) => {
        setCurrentScreen(screen);
    };

    const handleLogout = () => {
        setCurrentScreen('Welcome');
    };

    const renderScreen = () => {
        switch (currentScreen) {
            case 'Welcome':
                return <WelcomeScreen navigateTo={navigateTo} />;
            case 'Login':
                return <LoginScreen navigateTo={navigateTo} />;
            case 'Register':
                return <RegisterScreen navigateTo={navigateTo} />;
            case 'Dashboard':
                return <DashboardScreen onLogout={handleLogout} />;
            case 'Admin':
                return <AdminScreen navigateTo={navigateTo} />;
            case 'ResetPassword':
                return <ResetPasswordScreen navigateTo={navigateTo} />;
            default:
                return <WelcomeScreen navigateTo={navigateTo} />;
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar style="light" />
            {renderScreen()}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});
