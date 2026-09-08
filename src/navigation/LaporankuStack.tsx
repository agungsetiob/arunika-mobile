import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LaporankuScreen from '../screens/warga/LaporankuScreen';

const Stack = createNativeStackNavigator();

export default function LaporankuStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="LaporankuList" component={LaporankuScreen} />
    </Stack.Navigator>
  );
}