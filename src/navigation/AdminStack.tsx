import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AdminHomeScreen from '../screens/admin/AdminHomeScreen';
import AdminAssignScreen from '../screens/admin/AdminAssignScreen';

const Stack = createNativeStackNavigator();

export default function AdminStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="AdminHome" component={AdminHomeScreen} />
      <Stack.Screen name="AdminAssign" component={AdminAssignScreen} />
    </Stack.Navigator>
  );
}