import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert, TextInput } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ChevronLeft, MapPin, UserCheck, CheckCircle2, XCircle, FileWarning } from 'lucide-react-native';
import apiClient from '../../api/client';

export default function AdminAssignScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { report } = route.params;

  // State untuk menyimpan status laporan secara real-time di layar ini
  const [currentStatus, setCurrentStatus] = useState(report.status);
  
  // State Assign
  const [petugasList, setPetugasList] = useState<any[]>([]);
  const [selectedPetugas, setSelectedPetugas] = useState<number | null>(null);
  
  // State Rejection (Tolak)
  const [isRejecting, setIsRejecting] = useState(false);
  const [rejectNotes, setRejectNotes] = useState('');
  
  // Loading states
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // Hanya ambil daftar petugas jika laporan sudah diverifikasi
    if (currentStatus === 'verified') {
      fetchPetugas();
    }
  }, [currentStatus]);

  const fetchPetugas = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get('/admin/petugas');
      setPetugasList(response.data.data);
    } catch (error) {
      console.log('Error fetch petugas:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    setSubmitting(true);
    try {
      await apiClient.post(`/admin/reports/${report.id}/verify`);
      Alert.alert('Berhasil', 'Laporan valid. Silakan pilih petugas untuk ditugaskan.');
      setCurrentStatus('verified'); // Otomatis ubah UI ke mode Assign
    } catch (error) {
      Alert.alert('Gagal', 'Terjadi kesalahan saat memverifikasi laporan.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!rejectNotes.trim()) {
      Alert.alert('Peringatan', 'Alasan penolakan wajib diisi!');
      return;
    }
    setSubmitting(true);
    try {
      await apiClient.post(`/admin/reports/${report.id}/reject`, { notes: rejectNotes });
      Alert.alert('Berhasil', 'Laporan telah ditolak.', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      Alert.alert('Gagal', 'Terjadi kesalahan saat menolak laporan.');
      setSubmitting(false);
    }
  };

  const handleAssign = async () => {
    if (!selectedPetugas) {
      Alert.alert('Peringatan', 'Pilih petugas lapangan terlebih dahulu!');
      return;
    }
    setSubmitting(true);
    try {
      await apiClient.post('/admin/assignments', {
        report_id: report.id,
        user_id: selectedPetugas,
      });
      Alert.alert('Berhasil', 'Tugas telah diberikan kepada petugas lapangan.', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error: any) {
      Alert.alert('Gagal', error.response?.data?.message || 'Gagal menugaskan.');
      setSubmitting(false);
    }
  };

  return (
    <View className="flex-1 bg-slate-50">
      {/* Header */}
      <View className="bg-violet-600 pt-12 pb-4 px-4 flex-row items-center shadow-md z-10">
        <TouchableOpacity onPress={() => navigation.goBack()} className="p-2 -ml-2">
          <ChevronLeft size={28} color="white" />
        </TouchableOpacity>
        <Text className="text-lg font-bold text-white ml-2">Tindak Lanjut Laporan</Text>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Info Laporan Singkat */}
        <View className="bg-white p-6 shadow-sm border-b border-slate-100 mb-4">
          <View className="flex-row justify-between items-start mb-2">
            <Text className="text-xs font-bold text-violet-600 uppercase tracking-widest">Detail Laporan</Text>
            <View className={`px-2 py-1 rounded-md ${currentStatus === 'pending' ? 'bg-yellow-100' : 'bg-blue-100'}`}>
              <Text className={`text-[10px] font-bold uppercase ${currentStatus === 'pending' ? 'text-yellow-700' : 'text-blue-700'}`}>
                {currentStatus}
              </Text>
            </View>
          </View>
          <Text className="text-lg font-extrabold text-slate-800 mb-2">
            {report.damage_category.replace(/_/g, ' ').toUpperCase()}
          </Text>
          <View className="flex-row items-start bg-slate-50 p-3 rounded-xl border border-slate-100 mb-3">
            <MapPin size={20} color="#7c3aed" className="mt-0.5" />
            <Text className="ml-3 text-slate-600 text-sm flex-1 leading-relaxed">
              {report.alamat_lengkap || 'Lokasi tidak diketahui'}
            </Text>
          </View>
          {report.description && (
            <Text className="text-slate-600 text-sm"><Text className="font-bold">Deskripsi:</Text> {report.description}</Text>
          )}
        </View>

        {/* --- AREA AKSI BERDASARKAN STATUS --- */}

        {/* 1. Jika masih PENDING -> Tampilkan Tombol Verifikasi & Tolak */}
        {currentStatus === 'pending' && (
          <View className="px-4 mt-2">
            {!isRejecting ? (
              <View className="space-y-3">
                <Text className="font-extrabold text-slate-800 text-base mb-2">Tindakan Admin</Text>
                <TouchableOpacity 
                  onPress={handleVerify} disabled={submitting}
                  className="bg-emerald-500 h-14 rounded-xl flex-row items-center justify-center shadow-md shadow-emerald-500/30"
                >
                  {submitting ? <ActivityIndicator color="white" /> : (
                    <><CheckCircle2 color="white" size={20} /><Text className="text-white font-bold text-lg ml-2">Verifikasi Laporan</Text></>
                  )}
                </TouchableOpacity>

                <TouchableOpacity 
                  onPress={() => setIsRejecting(true)} disabled={submitting}
                  className="bg-white border-2 border-red-500 h-14 rounded-xl flex-row items-center justify-center"
                >
                  <XCircle color="#ef4444" size={20} />
                  <Text className="text-red-500 font-bold text-lg ml-2">Tolak Laporan</Text>
                </TouchableOpacity>
              </View>
            ) : (
              // Form Penolakan
              <View className="bg-red-50 p-4 rounded-2xl border border-red-200">
                <View className="flex-row items-center mb-3">
                  <FileWarning color="#ef4444" size={20} />
                  <Text className="text-red-700 font-bold ml-2">Alasan Penolakan</Text>
                </View>
                <TextInput
                  className="bg-white border border-red-200 rounded-xl px-4 py-3 text-slate-700 mb-3"
                  placeholder="Masukkan alasan kenapa laporan ditolak..."
                  multiline numberOfLines={3} textAlignVertical="top"
                  value={rejectNotes} onChangeText={setRejectNotes}
                />
                <View className="flex-row space-x-3">
                  <TouchableOpacity onPress={() => setIsRejecting(false)} className="flex-1 bg-white border border-slate-300 h-12 rounded-lg items-center justify-center">
                    <Text className="text-slate-600 font-bold">Batal</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={handleReject} disabled={submitting} className="flex-1 bg-red-500 h-12 rounded-lg items-center justify-center shadow-sm">
                    {submitting ? <ActivityIndicator color="white" /> : <Text className="text-white font-bold">Kirim Penolakan</Text>}
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        )}

        {/* 2. Jika sudah VERIFIED -> Tampilkan Daftar Petugas */}
        {currentStatus === 'verified' && (
          <View className="px-4">
            <Text className="font-extrabold text-slate-800 text-lg mb-4">Pilih Petugas Lapangan</Text>
            {loading ? (
              <ActivityIndicator size="large" color="#ea580c" className="mt-4" />
            ) : petugasList.length === 0 ? (
              <Text className="text-slate-500 text-center italic">Tidak ada petugas yang tersedia.</Text>
            ) : (
              petugasList.map((petugas) => (
                <TouchableOpacity
                  key={petugas.id} activeOpacity={0.8} onPress={() => setSelectedPetugas(petugas.id)}
                  className={`flex-row items-center p-4 mb-3 rounded-2xl border-2 ${
                    selectedPetugas === petugas.id ? 'border-violet-500 bg-violet-50' : 'border-slate-200 bg-white'
                  }`}
                >
                  <View className="h-12 w-12 bg-slate-100 rounded-full items-center justify-center mr-4">
                    <UserCheck size={24} color={selectedPetugas === petugas.id ? '#7c3aed' : '#94a3b8'} />
                  </View>
                  <View className="flex-1">
                    <Text className={`font-bold text-base ${selectedPetugas === petugas.id ? 'text-violet-700' : 'text-slate-700'}`}>
                      {petugas.name}
                    </Text>
                    <Text className="text-slate-500 text-xs mt-0.5">{petugas.phone || 'No HP tidak tersedia'}</Text>
                  </View>
                  {selectedPetugas === petugas.id && <CheckCircle2 size={24} color="#7c3aed" />}
                </TouchableOpacity>
              ))
            )}
          </View>
        )}
      </ScrollView>

      {/* Tombol Eksekusi Penugasan (Hanya muncul jika mode VERIFIED) */}
      {currentStatus === 'verified' && (
        <View className="p-4 bg-white border-t border-slate-100 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
          <TouchableOpacity 
            onPress={handleAssign} disabled={submitting || !selectedPetugas}
            className={`h-14 rounded-xl flex-row items-center justify-center ${
              submitting || !selectedPetugas ? 'bg-violet-400' : 'bg-violet-600 shadow-lg shadow-violet-500/30'
            }`}
          >
            {submitting ? <ActivityIndicator color="white" /> : <Text className="text-white font-bold text-lg">Tugaskan Sekarang</Text>}
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}