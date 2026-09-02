import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, ActivityIndicator, Alert, TextInput } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ChevronLeft, MapPin, Camera, CheckCircle, Clock, Wrench } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import apiClient from '../../api/client';

export default function TugasDetailScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { id } = route.params;

  const [assignment, setAssignment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  // State untuk form penyelesaian
  const [notes, setNotes] = useState('');
  const [photoUri, setPhotoUri] = useState<string | null>(null);

  const fetchDetail = async () => {
    try {
      const response = await apiClient.get(`/petugas/assignments/${id}`);
      setAssignment(response.data.data);
    } catch (error) {
      Alert.alert('Error', 'Gagal memuat detail tugas.');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, []);

  const getImageUrl = (path?: string) => {
    if (!path) return null;
    const baseUrl = process.env.EXPO_PUBLIC_API_URL?.replace('/api/v1', '');
    return `${baseUrl}/storage/${path}`;
  };

  // Buka Kamera untuk Foto Selesai
  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Izin Ditolak', 'Dibutuhkan akses kamera untuk bukti perbaikan.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: false,
      quality: 0.8,
    });

    if (!result.canceled) {
      const manipResult = await ImageManipulator.manipulateAsync(
        result.assets[0].uri,
        [{ resize: { width: 1080 } }],
        { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
      );
      setPhotoUri(manipResult.uri);
    }
  };

  // Fungsi Update Status
  const handleUpdateStatus = async (newStatus: string) => {
    if (newStatus === 'completed' && !photoUri) {
      Alert.alert('Peringatan', 'Foto bukti perbaikan wajib dilampirkan!');
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('status', newStatus);
      
      if (notes) formData.append('petugas_notes', notes);
      
      if (photoUri && newStatus === 'completed') {
        const filename = photoUri.split('/').pop() || 'after.jpg';
        const match = /\.(\w+)$/.exec(filename);
        const fileType = match ? `image/${match[1]}` : `image/jpeg`;

        formData.append('photo_after', {
          uri: photoUri,
          name: filename,
          type: fileType,
        } as any);
      }

      await apiClient.post(`/petugas/assignments/${id}/update-status`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      Alert.alert('Berhasil', 'Status tugas berhasil diperbarui.');
      fetchDetail();

    } catch (error: any) {
      Alert.alert('Gagal', error.response?.data?.message || 'Terjadi kesalahan saat mengupdate status.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !assignment) {
    return (
      <View className="flex-1 items-center justify-center bg-slate-50">
        <ActivityIndicator size="large" color="#0284c7" />
        <Text className="text-slate-500 mt-4">Memuat detail tugas...</Text>
      </View>
    );
  }

  const report = assignment.report;
  const lampPost = report?.lamp_post;
  const photoBefore = report?.media?.find((m: any) => m.type === 'before');
  const photoAfter = report?.media?.find((m: any) => m.type === 'after');

  return (
    <ScrollView className="flex-1 bg-slate-50" contentContainerStyle={{ paddingBottom: 40 }}>
      {/* Header */}
      <View className="bg-sky-600 pt-12 pb-4 px-4 flex-row items-center shadow-md">
        <TouchableOpacity onPress={() => navigation.goBack()} className="p-2 -ml-2">
          <ChevronLeft size={28} color="white" />
        </TouchableOpacity>
        <Text className="text-lg font-bold text-white ml-2">Detail Pekerjaan</Text>
      </View>

      {/* Info Utama */}
      <View className="bg-white p-6 shadow-sm border-b border-slate-100">
        <View className="flex-row justify-between items-start mb-4">
          <View>
            <Text className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">
              Kode Tiang
            </Text>
            <Text className="text-slate-800 text-lg font-extrabold">{lampPost?.code_tiang}</Text>
          </View>
          <View className="bg-sky-100 px-3 py-1.5 rounded-lg">
            <Text className="text-sky-700 font-bold text-xs uppercase tracking-wider">
              {assignment.status.replace('_', ' ')}
            </Text>
          </View>
        </View>

        <Text className="text-slate-500 text-sm mb-4 leading-relaxed">
          <Text className="font-bold text-slate-700">Laporan Warga:</Text> {report?.description || 'Tidak ada deskripsi spesifik.'}
        </Text>

        <View className="flex-row items-start bg-slate-50 p-3 rounded-xl border border-slate-100 mb-4">
          <MapPin size={20} color="#0284c7" className="mt-0.5" />
          <Text className="ml-3 text-slate-600 text-sm flex-1 leading-relaxed">
            {report?.alamat_lengkap || 'Lokasi tidak diketahui'}
          </Text>
        </View>

        {/* Foto Sebelum */}
        <Text className="font-bold text-slate-700 mb-2">Kondisi Dilaporkan (Sebelum)</Text>
        <View className="w-full h-48 bg-slate-200 rounded-xl overflow-hidden border border-slate-200">
          {photoBefore ? (
            <Image source={{ uri: getImageUrl(photoBefore.file_path)! }} className="w-full h-full" resizeMode="cover" />
          ) : (
            <View className="flex-1 items-center justify-center"><Text className="text-slate-400">Tidak ada foto</Text></View>
          )}
        </View>
      </View>

      {/* Action Area (Berdasarkan Status) */}
      <View className="p-6">
        {assignment.status === 'assigned' && (
          <TouchableOpacity onPress={() => handleUpdateStatus('accepted')} disabled={submitting} className="bg-sky-500 h-14 rounded-xl flex-row items-center justify-center shadow-lg shadow-sky-500/30">
            {submitting ? <ActivityIndicator color="white" /> : (
              <><CheckCircle color="white" size={20} /><Text className="text-white font-bold text-lg ml-2">Terima Tugas</Text></>
            )}
          </TouchableOpacity>
        )}

        {assignment.status === 'accepted' && (
          <TouchableOpacity onPress={() => handleUpdateStatus('on_site')} disabled={submitting} className="bg-purple-500 h-14 rounded-xl flex-row items-center justify-center shadow-lg shadow-purple-500/30">
            {submitting ? <ActivityIndicator color="white" /> : (
              <><MapPin color="white" size={20} /><Text className="text-white font-bold text-lg ml-2">Tiba di Lokasi</Text></>
            )}
          </TouchableOpacity>
        )}

        {assignment.status === 'on_site' && (
          <View className="space-y-4">
            <Text className="font-extrabold text-slate-800 text-lg mb-2">Penyelesaian Tugas</Text>
            
            <View>
              <Text className="font-semibold text-slate-700 mb-2">Catatan Perbaikan</Text>
              <TextInput
                className="bg-white border border-slate-300 rounded-xl px-4 py-3 text-slate-700"
                placeholder="Misal: Bohlam diganti baru, kabel dirapikan..."
                multiline numberOfLines={3} textAlignVertical="top"
                value={notes} onChangeText={setNotes}
              />
            </View>

            <View>
              <Text className="font-semibold text-slate-700 mb-2">Foto Bukti Perbaikan (Wajib)</Text>
              <TouchableOpacity onPress={takePhoto} className="h-32 bg-white border-2 border-dashed border-sky-300 rounded-xl items-center justify-center overflow-hidden">
                {photoUri ? (
                  <Image source={{ uri: photoUri }} className="w-full h-full" resizeMode="cover" />
                ) : (
                  <View className="items-center">
                    <Camera size={32} color="#0ea5e9" className="mb-2" />
                    <Text className="text-sky-600 font-medium">Ambil Foto Selesai</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>

            <TouchableOpacity onPress={() => handleUpdateStatus('completed')} disabled={submitting} className={`h-14 mt-4 rounded-xl flex-row items-center justify-center ${submitting ? 'bg-emerald-500/50' : 'bg-emerald-500 shadow-lg shadow-emerald-500/30'}`}>
              {submitting ? <ActivityIndicator color="white" /> : (
                <><CheckCircle color="white" size={20} /><Text className="text-white font-bold text-lg ml-2">Tugas Selesai</Text></>
              )}
            </TouchableOpacity>
          </View>
        )}

        {assignment.status === 'completed' && (
          <View className="bg-emerald-50 border border-emerald-100 rounded-xl p-5 items-center">
            <CheckCircle size={48} color="#10b981" className="mb-3" />
            <Text className="text-emerald-800 font-extrabold text-lg text-center mb-1">Pekerjaan Selesai</Text>
            <Text className="text-emerald-600 text-sm text-center mb-4">{assignment.petugas_notes}</Text>
            
            {photoAfter && (
              <View className="w-full h-40 rounded-lg overflow-hidden mt-2">
                <Image source={{ uri: getImageUrl(photoAfter.file_path)! }} className="w-full h-full" resizeMode="cover" />
              </View>
            )}
          </View>
        )}
      </View>
    </ScrollView>
  );
}