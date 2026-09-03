import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LaporankuScreen from '../screens/warga/LaporankuScreen';
import LaporDetailScreen from '../screens/warga/LaporDetailScreen';

const Stack = createNativeStackNavigator();

export default function LaporankuStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="LaporankuList" component={LaporankuScreen} />
      {/* <Stack.Screen name="ReportDetail" component={LaporDetailScreen} /> */}
    </Stack.Navigator>
  );
}