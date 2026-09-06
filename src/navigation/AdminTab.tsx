import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Inbox, User, Map, Medal } from 'lucide-react-native';

import AdminStack from './AdminStack';
import ProfileStack from './ProfileStack';
import PetaTransparansiScreen from '../screens/shared/PetaTransparansiScreen';
import LeaderboardScreen from '../screens/shared/LeaderboardScreen';

const Tab = createBottomTabNavigator();

export default function AdminTab() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#7c3aed',
        tabBarInactiveTintColor: '#94a3b8',
        headerShown: false,
        tabBarStyle: { paddingBottom: 5, height: 60 }
      }}
    >
      <Tab.Screen 
        name="Laporan" 
        component={AdminStack} 
        options={{ tabBarIcon: ({ color }) => <Inbox color={color} size={24} /> }} 
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