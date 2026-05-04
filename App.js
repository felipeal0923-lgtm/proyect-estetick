import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Platform } from 'react-native';

if (Platform.OS === 'web') {
  const style = document.createElement('style');
  style.textContent = `
    input:-webkit-autofill,
    input:-webkit-autofill:hover, 
    input:-webkit-autofill:focus, 
    input:-webkit-autofill:active {
        -webkit-text-fill-color: #FFFFFF !important;
        transition: background-color 5000s ease-in-out 0s !important;
    }
  `;
  document.head.append(style);
}

// IMPORTANDO PANTALLAS
import SplashScreen from './src/components/SplashScreen';
import WelcomeScreen from './src/screens/WelcomeScreen';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import ResetPasswordScreen from './src/screens/ResetPasswordScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import AdminScreen from './src/screens/AdminScreen';

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [currentScreen, setCurrentScreen] = useState('Welcome');
  // Opciones: 'Welcome', 'Login', 'Register', 'ResetPassword', 'Dashboard'

  useEffect(() => {
    // Simulando tiempo de carga para el SplashScreen
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  const navigateTo = (screen) => {
    setCurrentScreen(screen);
  };

  if (isLoading) {
    return (
      <>
        <StatusBar style="light" />
        <SplashScreen />
      </>
    );
  }

  // Router simple basado en estados
  const renderScreen = () => {
    switch (currentScreen) {
      case 'Welcome':
        return <WelcomeScreen navigateTo={navigateTo} />;
      case 'Login':
        return <LoginScreen navigateTo={navigateTo} />;
      case 'Register':
        return <RegisterScreen navigateTo={navigateTo} />;
      case 'ResetPassword':
        return <ResetPasswordScreen navigateTo={navigateTo} />;
      case 'Dashboard':
        return <DashboardScreen />;
      case 'Admin':
        return <AdminScreen navigateTo={navigateTo} />;
      default:
        return <WelcomeScreen navigateTo={navigateTo} />;
    }
  };

  return (
    <>
      <StatusBar style="light" />
      {renderScreen()}
    </>
  );
}
