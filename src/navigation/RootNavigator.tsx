import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { useAuthStore } from '../store/authStore';

import AuthStack from './AuthStack';
import WargaTab from './WargaTab';
import PetugasTab from './PetugasTab';
import SplashScreen from '../screens/SplashScreen';

export default function RootNavigator() {
  const { token, role, isLoading, checkAuth } = useAuthStore();

  useEffect(() => {
    // Memberikan jeda visual sedikit agar animasi splash screen terlihat
    // (Opsional: bisa dihilangkan setTimeout-nya jika ingin secepat kilat)
    setTimeout(() => {
      checkAuth();
    }, 1500); 
  }, []);

  // Selama isLoading true, tampilkan Splash Screen Arunika
  if (isLoading) {
    return <SplashScreen />;
  }

  return (
    <NavigationContainer>
      {token === null ? (
        <AuthStack />
      ) : role === 'petugas' ? (
        <PetugasTab />
      ) : (
        <WargaTab />
      )}
    </NavigationContainer>
  );
}