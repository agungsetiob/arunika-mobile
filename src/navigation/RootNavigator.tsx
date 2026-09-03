import React, { useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useAuthStore } from "../store/authStore";

import AuthStack from "./AuthStack";
import WargaTab from "./WargaTab";
import PetugasTab from "./PetugasTab";
import AdminTab from './AdminTab';
import SplashScreen from "../screens/SplashScreen";

import NotificationsScreen from "../screens/shared/NotificationsScreen"; 
import LaporDetailScreen from "../screens/warga/LaporDetailScreen";
import AdminAssignScreen from "../screens/admin/AdminAssignScreen";
import TugasDetailScreen from "../screens/petugas/TugasDetailScreen";

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  const { token, role, isLoading, checkAuth } = useAuthStore();

  useEffect(() => {
    setTimeout(() => {
      checkAuth();
    }, 1500);
  }, []);

  if (isLoading) {
    return <SplashScreen />;
  }

  return (
    <NavigationContainer>
      {token === null ? (
        <AuthStack />
      ) : (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          
          <Stack.Screen name="MainTabs">
            {() => {
              if (role === 'admin') return <AdminTab />;
              if (role === 'petugas') return <PetugasTab />;
              return <WargaTab />;
            }}
          </Stack.Screen>

          <Stack.Screen name="Notifications" component={NotificationsScreen} />
          <Stack.Screen name="ReportDetail" component={LaporDetailScreen} />
          <Stack.Screen name="AdminAssign" component={AdminAssignScreen} />
          <Stack.Screen name="TugasDetail" component={TugasDetailScreen} />
          
        </Stack.Navigator>
      )}
    </NavigationContainer>
  );
}


// import React, { useEffect } from "react";
// import { NavigationContainer } from "@react-navigation/native";
// import { useAuthStore } from "../store/authStore";
// //import { registerForPushNotificationsAsync } from '../utils/pushNotifications';

// import AuthStack from "./AuthStack";
// import WargaTab from "./WargaTab";
// import PetugasTab from "./PetugasTab";
// import AdminTab from './AdminTab';
// import SplashScreen from "../screens/SplashScreen";

// export default function RootNavigator() {
//   const { token, role, isLoading, checkAuth } = useAuthStore();

//   useEffect(() => {
//     setTimeout(() => {
//       checkAuth();
//     }, 1500);
//   }, []);

//   useEffect(() => {
//     if (token) {
//       //registerForPushNotificationsAsync();
//     }
//   }, [token]);

//   if (isLoading) {
//     return <SplashScreen />;
//   }

//   return (
//     <NavigationContainer>
//       {token === null ? (
//         <AuthStack />
//       ) : role === 'admin' ? (
//         <AdminTab />
//       ) : role === 'petugas' ? (
//         <PetugasTab />
//       ) : (
//         <WargaTab />
//       )}
//     </NavigationContainer>
//   );
// }