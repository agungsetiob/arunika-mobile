import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import TugasListScreen from '../screens/petugas/TugasListScreen';
import TugasDetailScreen from '../screens/petugas/TugasDetailScreen';
import NotificationsScreen from '../screens/shared/NotificationsScreen';

const Stack = createNativeStackNavigator();

export default function TugasStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="TugasList" component={TugasListScreen} />
      {/* <Stack.Screen name="TugasDetail" component={TugasDetailScreen} /> */}
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
    </Stack.Navigator>
  );
}