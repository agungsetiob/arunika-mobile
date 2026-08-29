import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ChevronLeft, Info, ShieldCheck, Mail, Map } from 'lucide-react-native';
import { useAuthStore } from '../../store/authStore';

export default function AboutScreen() {
  const navigation = useNavigation<any>();
  const role = useAuthStore((state) => state.role);

  // Tema warna dinamis sesuai role
  const bgTheme = role === 'admin' ? 'bg-violet-600' : role === 'petugas' ? 'bg-sky-600' : 'bg-orange-600';
  const iconTheme = role === 'admin' ? '#7c3aed' : role === 'petugas' ? '#0284c7' : '#ea580c';

  return (
    <View className="flex-1 bg-slate-50">
      {/* Header */}
      <View className={`${bgTheme} pt-12 pb-4 px-4 flex-row items-center shadow-md z-10`}>
        <TouchableOpacity onPress={() => navigation.goBack()} className="p-2 -ml-2">
          <ChevronLeft size={28} color="white" />
        </TouchableOpacity>
        <Text className="text-lg font-bold text-white ml-2">Tentang Aplikasi</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 24, alignItems: 'center' }}>
        
        {/* Logo / Ikon Placeholder */}
        <View className="w-28 h-28 bg-white rounded-3xl shadow-sm items-center justify-center border border-slate-100 mb-4 mt-4">
          <Map size={48} color={iconTheme} strokeWidth={1.5} />
        </View>

        <Text className="text-2xl font-extrabold text-slate-800">ARUNIKA</Text>
        <Text className="text-slate-500 font-medium mb-1">Versi 1.0.0</Text>
        <Text className="text-slate-400 text-xs text-center px-4 mb-8">
          Sistem Informasi Layanan Pengaduan Manajemen Lampu Penerangan Jalan Umum & Traffic Light
        </Text>

        {/* Info Cards */}
        <View className="w-full space-y-4">
          <View className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex-row items-center">
            <View className="bg-slate-50 p-3 rounded-full mr-4">
              <ShieldCheck size={24} color={iconTheme} />
            </View>
            <View className="flex-1">
              <Text className="font-bold text-slate-800">Hak Cipta</Text>
              <Text className="text-slate-500 text-xs">© 2026 Dinas Perhubungan. Hak Cipta Dilindungi.</Text>
            </View>
          </View>

          <View className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex-row items-center">
            <View className="bg-slate-50 p-3 rounded-full mr-4">
              <Info size={24} color={iconTheme} />
            </View>
            <View className="flex-1">
              <Text className="font-bold text-slate-800">Tujuan Aplikasi</Text>
              <Text className="text-slate-500 text-xs leading-relaxed">
                Mempermudah warga dalam melaporkan kerusakan fasilitas jalan dan mempercepat respons penanganan oleh tim lapangan.
              </Text>
            </View>
          </View>

          <View className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex-row items-center">
            <View className="bg-slate-50 p-3 rounded-full mr-4">
              <Mail size={24} color={iconTheme} />
            </View>
            <View className="flex-1">
              <Text className="font-bold text-slate-800">Hubungi Kami</Text>
              <Text className="text-slate-500 text-xs">bantuan@tanahbumbukab.go.id</Text>
            </View>
          </View>
        </View>

        <Text className="text-slate-300 text-xs font-medium mt-12 mb-4">
          Dibuat dengan ❤️ untuk layanan masyarakat yang lebih baik.
        </Text>
      </ScrollView>
    </View>
  );
}