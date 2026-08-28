import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { ClipboardList, User } from 'lucide-react-native';
import { View, Text } from 'react-native';

const DummyScreen = ({ title }: { title: string }) => (
  <View className="flex-1 justify-center items-center"><Text>{title} Petugas</Text></View>
);

const Tab = createBottomTabNavigator();

export default function PetugasTab() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#0284c7', // Sky-600 (Beda warna agar mudah dibedakan)
        tabBarInactiveTintColor: '#94a3b8',
        headerShown: false,
        tabBarStyle: { paddingBottom: 5, height: 60 }
      }}
    >
      <Tab.Screen 
        name="Tugas" 
        component={() => <DummyScreen title="Daftar Tugas" />} 
        options={{ tabBarIcon: ({ color }) => <ClipboardList color={color} size={24} /> }} 
      />
      <Tab.Screen 
        name="Profile" 
        component={() => <DummyScreen title="Profil" />} 
        options={{ tabBarIcon: ({ color }) => <User color={color} size={24} /> }} 
      />
    </Tab.Navigator>
  );
}