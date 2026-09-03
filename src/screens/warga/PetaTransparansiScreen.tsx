import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import MapView, { Marker, Callout, PROVIDER_GOOGLE } from 'react-native-maps';
import { ChevronLeft, Zap, Wrench, CheckCircle2 } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import apiClient from '../../api/client';

export default function PetaTransparansiScreen() {
  const navigation = useNavigation<any>();
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMapData();
  }, []);

  const fetchMapData = async () => {
    try {
      const response = await apiClient.get('/reports/map');
      setReports(response.data.data);
    } catch (error) {
      console.log('Gagal memuat data peta', error);
    } finally {
      setLoading(false);
    }
  };

  // Helper untuk mendapatkan warna Pin Marker berdasarkan status
  const getMarkerColor = (status: string) => {
    switch (status) {
      case 'completed': return '#10b981'; // Emerald/Hijau
      case 'in_progress': 
      case 'assigned': return '#0284c7'; // Biru
      case 'verified': return '#f59e0b'; // Kuning/Amber
      case 'pending':
      default: return '#ef4444'; // Merah
    }
  };

  // Helper untuk teks status
  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'Selesai Diperbaiki';
      case 'in_progress':
      case 'assigned': return 'Sedang Dikerjakan';
      case 'verified': return 'Akan Dikerjakan';
      case 'pending': return 'Menunggu Verifikasi';
      default: return status;
    }
  };

  if (loading) {
    return (
      <View className="flex-1 bg-slate-50 justify-center items-center">
        <ActivityIndicator size="large" color="#ea580c" />
        <Text className="mt-4 text-slate-500 font-medium">Memuat Peta Kota...</Text>
      </View>
    );
  }

  const initialRegion = {
    latitude: reports.length > 0 ? parseFloat(reports[0].lat) : -3.5216322592414397, 
    longitude: reports.length > 0 ? parseFloat(reports[0].lng) : 115.95824941099634,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  };

  return (
    <View className="flex-1 bg-white">
      {/* Header Melayang di atas Peta */}
      <View className="absolute top-12 left-4 right-4 z-10 flex-row items-center justify-between">
        <TouchableOpacity 
          onPress={() => navigation.goBack()} 
          className="h-12 w-12 bg-white rounded-full items-center justify-center shadow-lg border border-slate-100"
        >
          <ChevronLeft size={28} color="#334155" />
        </TouchableOpacity>

        <View className="bg-white px-5 py-3 rounded-full shadow-lg border border-slate-100">
          <Text className="font-extrabold text-slate-800 text-base">Peta Transparansi</Text>
        </View>
      </View>

      {/* Komponen Peta */}
      <MapView 
        style={StyleSheet.absoluteFillObject}
        provider={PROVIDER_GOOGLE}
        initialRegion={initialRegion}
        showsUserLocation={true}
      >
        {reports.map((report) => (
          <Marker
            key={report.id}
            coordinate={{ 
              latitude: parseFloat(report.lat), 
              longitude: parseFloat(report.lng) 
            }}
            pinColor={getMarkerColor(report.status)}
          >
            {/* Pop-up Info (Callout) saat Pin ditekan */}
            <Callout tooltip onPress={() => navigation.navigate('ReportDetail', { id: report.id })}>
              <View className="bg-white rounded-2xl p-4 shadow-xl border border-slate-100 w-[250px]">
                <View className="flex-row items-center mb-2">
                  <Zap size={16} color={report.type === 'pju' ? '#f59e0b' : '#ef4444'} />
                  <Text className="ml-1.5 font-bold text-slate-800 text-sm">
                    {report.type === 'pju' ? 'Lampu Jalan' : 'Traffic Light'}
                  </Text>
                </View>
                
                <Text className="text-xs text-slate-500 font-medium mb-3">
                  Kategori: {report.damage_category.replace(/_/g, ' ').toUpperCase()}
                </Text>
                
                <View className="flex-row items-center bg-slate-50 p-2 rounded-lg border border-slate-100">
                  <View 
                    className="w-3 h-3 rounded-full mr-2" 
                    style={{ backgroundColor: getMarkerColor(report.status) }} 
                  />
                  <Text className="text-xs font-bold text-slate-700">
                    {getStatusText(report.status)}
                  </Text>
                </View>

                <Text className="text-[10px] text-center text-slate-400 mt-3 underline">
                  Ketuk untuk lihat detail
                </Text>
              </View>
            </Callout>
          </Marker>
        ))}
      </MapView>

      {/* Legenda Peta (Bawah) */}
      <View className="absolute bottom-8 left-4 right-4 bg-white rounded-2xl p-4 shadow-xl border border-slate-100 flex-row justify-between items-center">
        <View className="items-center">
          <View className="w-4 h-4 rounded-full bg-emerald-500 mb-1 border-2 border-white shadow-sm" />
          <Text className="text-[10px] font-bold text-slate-600">Selesai</Text>
        </View>
        <View className="items-center">
          <View className="w-4 h-4 rounded-full bg-sky-500 mb-1 border-2 border-white shadow-sm" />
          <Text className="text-[10px] font-bold text-slate-600">Dikerjakan</Text>
        </View>
        <View className="items-center">
          <View className="w-4 h-4 rounded-full bg-amber-500 mb-1 border-2 border-white shadow-sm" />
          <Text className="text-[10px] font-bold text-slate-600">Diverifikasi</Text>
        </View>
        <View className="items-center">
          <View className="w-4 h-4 rounded-full bg-red-500 mb-1 border-2 border-white shadow-sm" />
          <Text className="text-[10px] font-bold text-slate-600">Laporan Baru</Text>
        </View>
      </View>
    </View>
  );
}