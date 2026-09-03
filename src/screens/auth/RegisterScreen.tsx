import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import { User, Phone, Lock, CreditCard, Mail } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import apiClient from '../../api/client';
import { useAuthStore } from '../../store/authStore';
import CustomAlert, { AlertType } from '../../components/CustomAlert';

export default function RegisterScreen() {
  const navigation = useNavigation<any>();
  const login = useAuthStore((state) => state.login);
  
  const [form, setForm] = useState({ name: '', email: '', phone: '', nik: '', password: '' });
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

  const handleRegister = async () => {
    if (!form.name || !form.email || !form.phone || !form.nik || !form.password) {
      showAlert('Peringatan', 'Semua kolom wajib diisi!', 'warning');
      return;
    }

    setLoading(true);
    try {
      const response = await apiClient.post('/auth/register', form);
      const { data, token } = response.data;
      
      showAlert('Sukses', 'Akun berhasil dibuat!', 'success', async () => {
        closeAlert();
        await login(data, 'warga', token); // Otomatis login setelah user klik OK
      });

    } catch (error: any) {
      const errorMsg = error.response?.data?.message || 'Gagal mendaftar. Pastikan data belum pernah digunakan.';
      showAlert('Registrasi Gagal', errorMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-slate-900">
      <ScrollView 
        contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 24 }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="mb-8">
          <Text className="text-3xl font-extrabold text-white">Daftar Akun</Text>
          <Text className="text-slate-400 mt-2">Mari berpartisipasi menjaga fasilitas umum bersama.</Text>
        </View>

        <View className="space-y-4 mb-8">
          <View className="flex-row items-center bg-slate-800 rounded-xl px-4 h-14 border border-slate-700">
            <User color="#94a3b8" size={20} />
            <TextInput className="flex-1 text-white ml-3" placeholder="Nama Lengkap" placeholderTextColor="#64748b"
              onChangeText={(t) => setForm({ ...form, name: t })} />
          </View>

          <View className="flex-row items-center bg-slate-800 rounded-xl px-4 h-14 border border-slate-700">
            <Mail color="#94a3b8" size={20} />
            <TextInput className="flex-1 text-white ml-3" placeholder="Email" placeholderTextColor="#64748b" keyboardType="email-address"
              onChangeText={(t) => setForm({ ...form, email: t })} />
          </View>

          <View className="flex-row items-center bg-slate-800 rounded-xl px-4 h-14 border border-slate-700">
            <CreditCard color="#94a3b8" size={20} />
            <TextInput className="flex-1 text-white ml-3" placeholder="NIK (16 Digit)" placeholderTextColor="#64748b" keyboardType="numeric" maxLength={16}
              onChangeText={(t) => setForm({ ...form, nik: t })} />
          </View>

          <View className="flex-row items-center bg-slate-800 rounded-xl px-4 h-14 border border-slate-700">
            <Phone color="#94a3b8" size={20} />
            <TextInput className="flex-1 text-white ml-3" placeholder="Nomor HP" placeholderTextColor="#64748b" keyboardType="phone-pad"
              onChangeText={(t) => setForm({ ...form, phone: t })} />
          </View>

          <View className="flex-row items-center bg-slate-800 rounded-xl px-4 h-14 border border-slate-700">
            <Lock color="#94a3b8" size={20} />
            <TextInput className="flex-1 text-white ml-3" placeholder="Password" placeholderTextColor="#64748b" secureTextEntry
              onChangeText={(t) => setForm({ ...form, password: t })} />
          </View>
        </View>

        <TouchableOpacity 
          onPress={handleRegister} 
          disabled={loading} 
          className={`h-14 rounded-xl items-center justify-center ${loading ? 'bg-orange-500/50' : 'bg-orange-500'}`}
        >
          {loading ? <ActivityIndicator color="white" /> : <Text className="text-white font-bold text-lg">Daftar Sekarang</Text>}
        </TouchableOpacity>

        <View className="flex-row justify-center mt-6">
          <Text className="text-slate-400">Sudah punya akun? </Text>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text className="text-orange-400 font-bold">Masuk di sini</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Render Custom Alert di root view */}
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