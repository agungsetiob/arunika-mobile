import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { Lightbulb, Phone, Lock } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import apiClient from '../../api/client';
import { useAuthStore } from '../../store/authStore';
import { registerForPushNotificationsAsync } from '../../utils/pushNotification';

export default function LoginScreen() {
  const navigation = useNavigation<any>();
  const login = useAuthStore((state) => state.login);
  
  const [phone, setPhone] = useState('081100000003'); // Default ke akun Warga untuk testing
  const [password, setPassword] = useState('password123');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!phone || !password) {
      Alert.alert('Error', 'Nomor HP dan Password wajib diisi!');
      return;
    }

    setLoading(true);
    try {
      const response = await apiClient.post('/auth/login', {
        phone,
        password,
      });

      const { data, role, token } = response.data;
      
      if (token) {
        const fcmToken = await registerForPushNotificationsAsync();
        
        if (fcmToken) {
            try {
                await apiClient.post('/fcm-token', { fcm_token: fcmToken }, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                console.log('FCM Token berhasil dikirim ke server!');
            } catch (error) {
                console.log('Gagal mengirim FCM token ke server', error);
            }
        }
      }
      await login(data, role, token);

    } catch (error: any) {
      const errorMsg = error.response?.data?.message || 'Gagal terhubung ke server';
      Alert.alert('Login Gagal', errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-slate-900 justify-center px-6">
      <View className="absolute top-0 -left-10 h-64 w-64 rounded-full bg-orange-500/10 blur-3xl" />
      
      {/* Header/Logo */}
      <View className="items-center mb-10">
        <View className="mb-4 flex h-20 w-20 items-center justify-center">
          <Lightbulb color="white" size={40} />
        </View>
        <Text className="text-3xl font-extrabold text-white">Masuk Arunika</Text>
        <Text className="text-slate-400 mt-2 text-center">Silakan masuk untuk melaporkan atau menangani kerusakan PJU.</Text>
      </View>

      {/* Form Input */}
      <View className="space-y-4 mb-6">
        <View className="flex-row items-center bg-slate-800 rounded-xl px-4 h-14 border border-slate-700 focus:border-orange-500">
          <Phone color="#94a3b8" size={20} />
          <TextInput
            className="flex-1 text-white ml-3"
            placeholder="Nomor HP"
            placeholderTextColor="#64748b"
            keyboardType="phone-pad"
            value={phone}
            onChangeText={setPhone}
          />
        </View>

        <View className="flex-row items-center bg-slate-800 rounded-xl px-4 h-14 border border-slate-700">
          <Lock color="#94a3b8" size={20} />
          <TextInput
            className="flex-1 text-white ml-3"
            placeholder="Password"
            placeholderTextColor="#64748b"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
        </View>
      </View>

      {/* Tombol Login */}
      <TouchableOpacity 
        onPress={handleLogin} 
        disabled={loading}
        className={`h-14 rounded-xl items-center justify-center ${loading ? 'bg-orange-500/50' : 'bg-orange-500'}`}
      >
        {loading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text className="text-white font-bold text-lg">Masuk Sekarang</Text>
        )}
      </TouchableOpacity>

      {/* Link ke Register */}
      <View className="flex-row justify-center mt-8">
        <Text className="text-slate-400">Belum punya akun? </Text>
        <TouchableOpacity onPress={() => navigation.navigate('Register')}>
          <Text className="text-orange-400 font-bold">Daftar Warga Baru</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}