import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, ScrollView, ActivityIndicator } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import * as Location from 'expo-location';
import { ChevronLeft, MapPin } from 'lucide-react-native';
import apiClient from '../../api/client';
import CustomAlert, { AlertType } from '../../components/CustomAlert';

export default function LaporScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  
  const { photoUri, latitude, longitude } = route.params;

  const [address, setAddress] = useState('Sedang mencari alamat...');
  const [type, setType] = useState<'pju' | 'traffic_light'>('pju');
  const [category, setCategory] = useState('mati_total');
  const [description, setDescription] = useState('');
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

      await apiClient.post('/reports', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      showAlert('Berhasil', 'Laporan Anda telah diterima dan akan segera ditinjau.', 'success', () => {
        closeAlert();
        navigation.navigate('HomeMain');
      });
      
    } catch (error: any) {
      console.log('Error API Lapor:', error.response || error.message);
      
      // WORKAROUND BUG: Jika Laravel secara tidak sengaja mereturn 200/201 tapi formatnya bukan JSON
      if (error.response && (error.response.status === 200 || error.response.status === 201)) {
        showAlert('Berhasil', 'Laporan Anda telah diterima dan akan segera ditinjau.', 'success', () => {
          closeAlert();
          navigation.navigate('HomeMain');
        });
        return;
      }

      if (error.response?.status === 409) {
        showAlert('Info', 'Lampu di area ini sudah dilaporkan dan sedang dalam penanganan.', 'warning');
      } else {
        showAlert(
          'Gagal', 
          error.response?.data?.message || 'Terjadi kesalahan saat mengirim laporan. Pastikan koneksi stabil.', 
          'error'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-slate-50">
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
        {/* Header Info */}
        <View className="bg-white px-4 pt-12 pb-4 flex-row items-center shadow-sm z-10">
          <TouchableOpacity onPress={() => navigation.goBack()} className="p-2 -ml-2">
            <ChevronLeft size={28} color="#334155" />
          </TouchableOpacity>
          <Text className="text-lg font-bold text-slate-800 ml-2">Detail Laporan</Text>
        </View>

        {/* Preview Foto */}
        <View className="px-4 mt-6">
          <Text className="font-semibold text-slate-700 mb-2">Foto Kondisi</Text>
          <Image source={{ uri: photoUri }} className="w-full h-48 rounded-2xl bg-slate-200" />
        </View>

        {/* Info Lokasi Otomatis */}
        <View className="px-4 mt-6">
          <Text className="font-semibold text-slate-700 mb-2">Lokasi Terdeteksi</Text>
          <View className="flex-row items-start bg-orange-50 p-4 rounded-xl border border-orange-100">
            <MapPin size={20} color="#ea580c" className="mt-0.5" />
            <Text className="ml-3 text-slate-700 flex-1 text-sm leading-relaxed">{address}</Text>
          </View>
        </View>

        {/* Form Input Data */}
        <View className="px-4 mt-8 space-y-5">
          
          {/* Pilihan Jenis Tiang */}
          <View>
            <Text className="font-semibold text-slate-700 mb-3">Jenis Fasilitas</Text>
            <View className="flex-row space-x-3">
              <TouchableOpacity 
                activeOpacity={0.7}
                onPress={() => setType('pju')} 
                className={`flex-1 py-3.5 items-center border-2 rounded-xl ${type === 'pju' ? 'bg-orange-50 border-orange-500' : 'bg-white border-slate-200'}`}
              >
                <Text className={`font-bold ${type === 'pju' ? 'text-orange-600' : 'text-slate-500'}`}>Lampu Jalan</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                activeOpacity={0.7}
                onPress={() => setType('traffic_light')} 
                className={`flex-1 py-3.5 items-center border-2 rounded-xl ${type === 'traffic_light' ? 'bg-orange-50 border-orange-500' : 'bg-white border-slate-200'}`}
              >
                <Text className={`font-bold ${type === 'traffic_light' ? 'text-orange-600' : 'text-slate-500'}`}>Lampu Merah</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Pilihan Kerusakan */}
          <View>
            <Text className="font-semibold text-slate-700 mb-3">Kategori Kerusakan</Text>
            <View className="flex-row flex-wrap gap-2.5">
              {['mati_total', 'redup', 'tiang_miring_roboh', 'kabel_menjuntai', 'lampu_kedip'].map((cat) => (
                <TouchableOpacity 
                  key={cat} 
                  activeOpacity={0.7}
                  onPress={() => setCategory(cat)} 
                  className={`px-4 py-2.5 border-2 rounded-xl ${category === cat ? 'bg-slate-800 border-slate-800 shadow-sm' : 'bg-white border-slate-200'}`}
                >
                  <Text className={`text-sm font-bold ${category === cat ? 'text-white' : 'text-slate-500'}`}>
                    {cat.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Deskripsi */}
          <View>
            <Text className="font-semibold text-slate-700 mb-3">Deskripsi Tambahan (Opsional)</Text>
            <TextInput
              className="bg-white border-2 border-slate-200 rounded-xl px-4 py-3 text-slate-700 text-sm focus:border-orange-400"
              placeholder="Tuliskan detail spesifik jika ada..."
              multiline
              numberOfLines={4}
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
            className={`h-14 rounded-xl items-center justify-center flex-row shadow-lg ${loading ? 'bg-orange-400 shadow-orange-400/20' : 'bg-orange-500 shadow-orange-500/30'}`}
          >
            {loading ? <ActivityIndicator color="white" /> : <Text className="text-white font-bold text-lg tracking-wide">Kirim Laporan Sekarang</Text>}
          </TouchableOpacity>
        </View>
      </ScrollView>

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