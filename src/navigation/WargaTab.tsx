import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Home, FileText, User } from 'lucide-react-native';
import { View, Text } from 'react-native';

const DummyScreen = ({ title }: { title: string }) => (
  <View className="flex-1 justify-center items-center"><Text>{title} Warga</Text></View>
);

const Tab = createBottomTabNavigator();

export default function WargaTab() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#ea580c', // Orange-600
        tabBarInactiveTintColor: '#94a3b8',
        headerShown: false,
        tabBarStyle: { paddingBottom: 5, height: 60 }
      }}
    >
      <Tab.Screen 
        name="Home" 
        component={() => <DummyScreen title="Dashboard" />} 
        options={{ tabBarIcon: ({ color }) => <Home color={color} size={24} /> }} 
      />
      <Tab.Screen 
        name="Laporanku" 
        component={() => <DummyScreen title="Laporan Saya" />} 
        options={{ tabBarIcon: ({ color }) => <FileText color={color} size={24} /> }} 
      />
      <Tab.Screen 
        name="Profile" 
        component={() => <DummyScreen title="Profil" />} 
        options={{ tabBarIcon: ({ color }) => <User color={color} size={24} /> }} 
      />
    </Tab.Navigator>
  );
}