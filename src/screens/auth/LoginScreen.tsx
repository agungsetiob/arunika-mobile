import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Image, Linking } from 'react-native';
import { Phone, Lock } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import apiClient from '../../api/client';
import { useAuthStore } from '../../store/authStore';
import { registerForPushNotificationsAsync } from '../../utils/pushNotification';
import CustomAlert, { AlertType } from '../../components/CustomAlert';

export default function LoginScreen() {
  const navigation = useNavigation<any>();
  const login = useAuthStore((state) => state.login);
  
  const [phone, setPhone] = useState('081100000003'); // Default ke akun Warga untuk testing
  const [password, setPassword] = useState('password123');
  const [loading, setLoading] = useState(false);

  // State untuk CustomAlert
  const [alertConfig, setAlertConfig] = useState({
    visible: false,
    title: '',
    message: '',
    type: 'info' as AlertType,
    onConfirm: () => closeAlert(),
  });

  const showAlert = (title: string, message: string, type: AlertType, onConfirm: () => void = closeAlert) => {
    setAlertConfig({ visible: true, title, message, type, onConfirm });
  };
  
  const closeAlert = () => setAlertConfig(prev => ({ ...prev, visible: false }));

  const handleLogin = async () => {
    if (!phone || !password) {
      showAlert('Peringatan', 'Nomor HP dan Password wajib diisi!', 'warning');
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
      showAlert('Login Gagal', errorMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Mekanisme Forgot Password (Zero-Backend) via WhatsApp
  const handleForgotPassword = async () => {
    const adminPhone = "6281234567890"; // Ganti dengan nomor WA Admin (gunakan kode negara 62)
    const message = "Halo Admin Arunika, saya lupa password akun saya. Mohon bantuannya untuk melakukan reset password. Terima kasih.";
    
    const waUrlApp = `whatsapp://send?phone=${adminPhone}&text=${encodeURIComponent(message)}`;
    const waUrlWeb = `https://wa.me/${adminPhone}?text=${encodeURIComponent(message)}`;

    try {
        const supported = await Linking.canOpenURL(waUrlApp);
        if (supported) {
            await Linking.openURL(waUrlApp);
        } else {
            await Linking.openURL(waUrlWeb);
        }
    } catch (error) {
        showAlert('Error', 'Tidak dapat membuka WhatsApp. Pastikan aplikasi WhatsApp terinstal.', 'error');
    }
  };

  return (
    <View className="flex-1 bg-slate-900 justify-center px-6">
      {/* Efek Blur Background (Tidak diubah) */}
      <View className="absolute top-0 -left-10 h-64 w-64 rounded-full bg-orange-500/10 blur-3xl" />
      
      {/* Header/Logo (Diganti menggunakan Image) */}
      <View className="items-center mb-10">
        <View className="mb-4 flex h-20 w-20 items-center justify-center">
          <Image 
            source={require('../../../assets/logo-kemenhub.png')} 
            style={{ width: 80, height: 80 }} 
            resizeMode="contain" 
          />
        </View>
        <Text className="text-3xl font-extrabold text-white">ARUNIKA</Text>
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

      {/* Tautan Forgot Password */}
      <TouchableOpacity onPress={handleForgotPassword} className="mt-5 items-center">
        <Text className="text-slate-400 text-sm">
          Lupa password? <Text className="text-orange-400 font-bold">Hubungi Admin</Text>
        </Text>
      </TouchableOpacity>

      {/* Divider */}
      <View className="flex-row items-center my-6">
        <View className="flex-1 h-[1px] bg-slate-800" />
        <Text className="mx-4 text-slate-500 text-sm font-medium">ATAU</Text>
        <View className="flex-1 h-[1px] bg-slate-800" />
      </View>

      {/* Tombol Daftar Baru */}
      <TouchableOpacity 
        onPress={() => navigation.navigate('Register')}
        className="h-14 rounded-xl items-center justify-center border-2 border-slate-700 bg-slate-800/30"
      >
        <Text className="text-white font-bold text-lg">Daftar Warga Baru</Text>
      </TouchableOpacity>

      {/* Custom Alert */}
      <CustomAlert 
        visible={alertConfig.visible}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
        onConfirm={alertConfig.onConfirm}
      />
    </View>
  );
}