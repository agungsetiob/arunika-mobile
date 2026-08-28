import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { Lightbulb } from 'lucide-react-native'; // Menggunakan Lightbulb sebagai ikon lampu

export default function SplashScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-slate-900">
      
      {/* Efek Lingkaran Glow di Belakang Ikon */}
      <View className="absolute h-64 w-64 rounded-full bg-orange-500/20 blur-3xl" />

      {/* Konten Utama */}
      <View className="items-center z-10">
        <View className="mb-6 flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-amber-400 to-orange-600 shadow-2xl shadow-orange-500/50">
          <Lightbulb color="white" size={48} strokeWidth={2.5} />
        </View>

        <Text className="text-4xl font-extrabold text-white mb-1">
          ARUNIKA
        </Text>
        <Text className="text-xs font-bold uppercase text-orange-400 mb-12">
          Smart PJU System
        </Text>

        {/* Loading Indicator */}
        <ActivityIndicator size="large" color="#f97316" />
        <Text className="text-slate-400 text-sm mt-4 font-medium animate-pulse">
          Memuat sistem...
        </Text>
      </View>

      {/* Footer / Copyright */}
      <View className="absolute bottom-10">
        <Text className="text-slate-500 text-xs font-medium">
          Dinas Perhubungan & PUPR
        </Text>
      </View>
    </View>
  );
}