import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Home, FileText, User, Map, Medal } from 'lucide-react-native';

import HomeStack from './HomeStack';
import LaporankuStack from './LaporankuStack';
import ProfileStack from './ProfileStack';
import PetaTransparansiScreen from '../screens/shared/PetaTransparansiScreen';
import LeaderboardScreen from '../screens/shared/LeaderboardScreen';

const Tab = createBottomTabNavigator();

export default function WargaTab() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#ea580c', 
        tabBarInactiveTintColor: '#94a3b8',
        headerShown: false,
        tabBarStyle: { paddingBottom: 5, height: 60 }
      }}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeStack} 
        options={{ tabBarIcon: ({ color }) => <Home color={color} size={24} /> }} 
      />
      <Tab.Screen 
        name="Laporan" 
        component={LaporankuStack} 
        options={{ tabBarIcon: ({ color }) => <FileText color={color} size={24} /> }} 
      />
      <Tab.Screen 
        name="Map" 
        component={PetaTransparansiScreen} 
        options={{ tabBarIcon: ({ color }) => <Map color={color} size={24} /> }} 
      />
      <Tab.Screen 
        name="Leaderboard" 
        component={LeaderboardScreen}
        options={{ tabBarIcon: ({ color }) => <Medal color={color} size={24} /> }} 
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileStack}
        options={{ tabBarIcon: ({ color }) => <User color={color} size={24} /> }} 
      />
    </Tab.Navigator>
  );
}