import React, { useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { useAuthStore } from "../store/authStore";
//import { registerForPushNotificationsAsync } from '../utils/pushNotifications';

import AuthStack from "./AuthStack";
import WargaTab from "./WargaTab";
import PetugasTab from "./PetugasTab";
import AdminTab from './AdminTab';
import SplashScreen from "../screens/SplashScreen";

export default function RootNavigator() {
  const { token, role, isLoading, checkAuth } = useAuthStore();

  useEffect(() => {
    setTimeout(() => {
      checkAuth();
    }, 1500);
  }, []);

  useEffect(() => {
    if (token) {
      //registerForPushNotificationsAsync();
    }
  }, [token]);

  if (isLoading) {
    return <SplashScreen />;
  }

  return (
    <NavigationContainer>
      {token === null ? (
        <AuthStack />
      ) : role === 'admin' ? (
        <AdminTab />
      ) : role === 'petugas' ? (
        <PetugasTab />
      ) : (
        <WargaTab />
      )}
    </NavigationContainer>
  );
}
