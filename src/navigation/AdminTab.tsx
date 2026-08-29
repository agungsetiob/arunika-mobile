import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Inbox, User } from 'lucide-react-native';

import AdminStack from './AdminStack';
import ProfileStack from './ProfileStack';

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
        name="Profile" 
        component={ProfileStack} 
        options={{ tabBarIcon: ({ color }) => <User color={color} size={24} /> }} 
      />
    </Tab.Navigator>
  );
}