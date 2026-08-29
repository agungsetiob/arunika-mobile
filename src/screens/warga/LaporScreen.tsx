import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import * as Location from 'expo-location';
import { ChevronLeft, MapPin } from 'lucide-react-native';
import apiClient from '../../api/client';

export default function LaporScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  
  // Tangkap parameter dari HomeScreen
  const { photoUri, latitude, longitude } = route.params;

  const [address, setAddress] = useState('Sedang mencari alamat...');
  const [type, setType] = useState<'pju' | 'traffic_light'>('pju');
  const [category, setCategory] = useState('mati_total');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  // Fitur Reverse Geocoding (Ubah Koordinat jadi Alamat)
  useEffect(() => {
    (async () => {
      try {
        const geocode = await Location.reverseGeocodeAsync({ latitude, longitude });
        if (geocode.length > 0) {
          const loc = geocode[0];
          setAddress(`${loc.street || ''} ${loc.name || ''}, ${loc.subregion || loc.city || ''}`);
        }
      } catch (error) {
        setAddress('Lokasi tidak diketahui');
      }
    })();
  }, []);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // Setup Form Data untuk upload file
      const formData = new FormData();
      formData.append('type', type);
      formData.append('damage_category', category);
      formData.append('lat', latitude.toString());
      formData.append('lng', longitude.toString());
      formData.append('alamat_lengkap', address);
      formData.append('description', description);

      // Setup file foto
      const filename = photoUri.split('/').pop() || 'photo.jpg';
      const match = /\.(\w+)$/.exec(filename);
      const fileType = match ? `image/${match[1]}` : `image/jpeg`;

      formData.append('photos[]', {
        uri: photoUri,
        name: filename,
        type: fileType,
      } as any);

      // Kirim POST Request ke API
      await apiClient.post('/reports', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      Alert.alert('Berhasil', 'Laporan Anda telah diterima dan akan segera ditinjau.', [
        { text: 'OK', onPress: () => navigation.navigate('HomeMain') }
      ]);
      
    } catch (error: any) {
      if (error.response?.status === 409) {
        Alert.alert('Info', 'Lampu di area ini sudah dilaporkan dan sedang dalam penanganan.');
      } else {
        Alert.alert('Gagal', 'Terjadi kesalahan saat mengirim laporan.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView className="flex-1 bg-slate-50" contentContainerStyle={{ paddingBottom: 40 }}>
      {/* Header Info */}
      <View className="bg-white px-4 pt-12 pb-4 flex-row items-center shadow-sm">
        <TouchableOpacity onPress={() => navigation.goBack()} className="p-2 -ml-2">
          <ChevronLeft size={24} color="#334155" />
        </TouchableOpacity>
        <Text className="text-lg font-bold text-slate-800 ml-2">Detail Laporan</Text>
      </View>

      {/* Preview Foto */}
      <View className="px-4 mt-6">
        <Text className="font-semibold text-slate-700 mb-2">Foto Kondisi</Text>
        <Image source={{ uri: photoUri }} className="w-full h-48 rounded-xl bg-slate-200" />
      </View>

      {/* Info Lokasi Otomatis */}
      <View className="px-4 mt-6">
        <Text className="font-semibold text-slate-700 mb-2">Lokasi Terdeteksi</Text>
        <View className="flex-row items-start bg-orange-50 p-3 rounded-lg border border-orange-100">
          <MapPin size={20} color="#ea580c" className="mt-0.5" />
          <Text className="ml-2 text-slate-700 flex-1 text-sm">{address}</Text>
        </View>
      </View>

      {/* Form Input Data */}
      <View className="px-4 mt-6 space-y-4">
        
        {/* Pilihan Jenis Tiang */}
        <View>
          <Text className="font-semibold text-slate-700 mb-2">Jenis Fasilitas</Text>
          <View className="flex-row space-x-3">
            <TouchableOpacity onPress={() => setType('pju')} className={`flex-1 py-3 items-center border rounded-lg ${type === 'pju' ? 'bg-orange-50 border-orange-500' : 'bg-white border-slate-300'}`}>
              <Text className={`font-semibold ${type === 'pju' ? 'text-orange-600' : 'text-slate-600'}`}>Lampu Jalan</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setType('traffic_light')} className={`flex-1 py-3 items-center border rounded-lg ${type === 'traffic_light' ? 'bg-orange-50 border-orange-500' : 'bg-white border-slate-300'}`}>
              <Text className={`font-semibold ${type === 'traffic_light' ? 'text-orange-600' : 'text-slate-600'}`}>Lampu Merah</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Pilihan Kerusakan */}
        <View>
          <Text className="font-semibold text-slate-700 mb-2">Kategori Kerusakan</Text>
          <View className="flex-row flex-wrap gap-2">
            {['mati_total', 'redup', 'tiang_miring_roboh', 'kabel_menjuntai', 'lampu_kedip'].map((cat) => (
              <TouchableOpacity key={cat} onPress={() => setCategory(cat)} className={`px-3 py-2 border rounded-full ${category === cat ? 'bg-slate-800 border-slate-800' : 'bg-white border-slate-300'}`}>
                <Text className={`text-sm ${category === cat ? 'text-white' : 'text-slate-600'}`}>
                  {cat.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Deskripsi */}
        <View>
          <Text className="font-semibold text-slate-700 mb-2">Deskripsi Tambahan (Opsional)</Text>
          <TextInput
            className="bg-white border border-slate-300 rounded-lg px-4 py-3 text-slate-700"
            placeholder="Tuliskan detail jika diperlukan..."
            multiline
            numberOfLines={3}
            textAlignVertical="top"
            value={description}
            onChangeText={setDescription}
          />
        </View>
      </View>

      {/* Tombol Kirim */}
      <View className="px-4 mt-8">
        <TouchableOpacity 
          onPress={handleSubmit} 
          disabled={loading}
          className={`h-14 rounded-xl items-center justify-center flex-row ${loading ? 'bg-orange-500/50' : 'bg-orange-500'}`}
        >
          {loading ? <ActivityIndicator color="white" /> : <Text className="text-white font-bold text-lg">Kirim Laporan</Text>}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}