import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, TextInput } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ChevronLeft, MapPin, UserCheck, CheckCircle2, XCircle, FileWarning, AlertTriangle, Search, X } from 'lucide-react-native';
import apiClient from '../../api/client';
import CustomAlert, { AlertType } from '../../components/CustomAlert';

export default function AdminAssignScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  
  // 1. TANGKAP PARAMETER
  const params = route.params || {};
  const passedReport = params.report;
  const reportId = params.id || passedReport?.id;

  // 2. STATE UNTUK DATA LAPORAN
  const [report, setReport] = useState<any>(passedReport?.damage_category ? passedReport : null);
  const [isLoadingData, setIsLoadingData] = useState<boolean>(!report);

  const [currentStatus, setCurrentStatus] = useState(report?.status || '');
  
  // State Petugas & Pencarian
  const [petugasList, setPetugasList] = useState<any[]>([]);
  const [selectedPetugas, setSelectedPetugas] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [selectedPriority, setSelectedPriority] = useState<string>('medium');
  const [isRejecting, setIsRejecting] = useState(false);
  const [rejectNotes, setRejectNotes] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Custom Alert State
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

  useEffect(() => {
    if (!report && reportId) {
      fetchReportDetail();
    }
  }, []);

  // Fungsi Fetch Detail Laporan
  const fetchReportDetail = async () => {
    try {
      const response = await apiClient.get(`/admin/reports/${reportId}`);
      const fetchedReport = response.data.data;
      
      setReport(fetchedReport);
      setCurrentStatus(fetchedReport.status);
    } catch (error) {
      showAlert('Error', 'Data laporan tidak ditemukan atau telah dihapus.', 'error', () => {
        closeAlert();
        navigation.goBack();
      });
    } finally {
      setIsLoadingData(false);
    }
  };

  // 4. Pencarian dengan Debounce (Hanya jalan jika status verified)
  useEffect(() => {
    if (currentStatus === 'verified') {
      const delayDebounceFn = setTimeout(() => {
        fetchPetugas(searchQuery);
      }, 500);

      return () => clearTimeout(delayDebounceFn);
    }
  }, [currentStatus, searchQuery]);

  const fetchPetugas = async (query = '') => {
    setLoading(true);
    try {
      const response = await apiClient.get('/admin/petugas', { params: { search: query } });
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
      showAlert('Berhasil', 'Laporan valid. Silakan tentukan prioritas dan pilih petugas.', 'success');
      setCurrentStatus('verified'); 
    } catch (error) {
      showAlert('Gagal', 'Terjadi kesalahan saat memverifikasi laporan.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!rejectNotes.trim()) {
      showAlert('Peringatan', 'Alasan penolakan wajib diisi!', 'warning');
      return;
    }
    setSubmitting(true);
    try {
      await apiClient.post(`/admin/reports/${report.id}/reject`, { notes: rejectNotes });
      showAlert('Berhasil', 'Laporan telah ditolak.', 'success', () => {
        closeAlert();
        navigation.goBack();
      });
    } catch (error) {
      showAlert('Gagal', 'Terjadi kesalahan saat menolak laporan.', 'error');
      setSubmitting(false);
    }
  };

  const handleAssign = async () => {
    if (!selectedPetugas) {
      showAlert('Peringatan', 'Pilih petugas lapangan terlebih dahulu!', 'warning');
      return;
    }
    setSubmitting(true);
    try {
      await apiClient.post('/admin/assignments', {
        report_id: report.id,
        user_id: selectedPetugas,
        priority: selectedPriority,
      });
      showAlert('Berhasil', `Tugas dengan prioritas ${selectedPriority.toUpperCase()} telah diberikan.`, 'success', () => {
        closeAlert();
        navigation.goBack();
      });
    } catch (error: any) {
      showAlert('Gagal', error.response?.data?.message || 'Gagal menugaskan.', 'error');
      setSubmitting(false);
    }
  };

  const priorities = [
    { id: 'low', label: 'Rendah', color: 'bg-slate-100', activeColor: 'bg-slate-600', textColor: 'text-slate-600', activeTextColor: 'text-white' },
    { id: 'medium', label: 'Sedang', color: 'bg-blue-50', activeColor: 'bg-blue-600', textColor: 'text-blue-600', activeTextColor: 'text-white' },
    { id: 'high', label: 'Tinggi', color: 'bg-orange-50', activeColor: 'bg-orange-600', textColor: 'text-orange-600', activeTextColor: 'text-white' },
    { id: 'emergency', label: 'Darurat!', color: 'bg-red-50', activeColor: 'bg-red-600', textColor: 'text-red-600', activeTextColor: 'text-white' },
  ];

  // LOADING STATE JIKA FETCH DARI NOTIFIKASI
  if (isLoadingData) {
    return (
      <View className="flex-1 bg-slate-50">
        <View className="bg-violet-600 pt-12 pb-4 px-4 flex-row items-center shadow-md z-10">
          <TouchableOpacity onPress={() => navigation.goBack()} className="p-2 -ml-2">
            <ChevronLeft size={28} color="white" />
          </TouchableOpacity>
          <Text className="text-lg font-bold text-white ml-2">Tindak Lanjut Laporan</Text>
        </View>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#7c3aed" />
          <Text className="text-slate-500 mt-3 font-medium">Memuat data laporan...</Text>
        </View>

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

  // RENDER UTAMA
  return (
    <View className="flex-1 bg-slate-50">
      <View className="bg-violet-600 pt-12 pb-4 px-4 flex-row items-center shadow-md z-10">
        <TouchableOpacity onPress={() => navigation.goBack()} className="p-2 -ml-2">
          <ChevronLeft size={28} color="white" />
        </TouchableOpacity>
        <Text className="text-lg font-bold text-white ml-2">Tindak Lanjut Laporan</Text>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
        <View className="bg-white p-6 shadow-sm border-b border-slate-100 mb-4">
          <View className="flex-row justify-between items-start mb-2">
            <Text className="text-xs font-bold text-violet-600 uppercase tracking-widest">Detail Laporan</Text>
            <View className={`px-2 py-1 rounded-md ${currentStatus === 'pending' ? 'bg-amber-100' : 'bg-emerald-100'}`}>
              <Text className={`text-[10px] font-bold uppercase ${currentStatus === 'pending' ? 'text-amber-700' : 'text-emerald-700'}`}>
                {currentStatus}
              </Text>
            </View>
          </View>
          <Text className="text-lg font-extrabold text-slate-800 mb-2">
            {report?.damage_category?.replace(/_/g, ' ').toUpperCase()}
          </Text>
          <View className="flex-row items-start bg-slate-50 p-3 rounded-xl border border-slate-100 mb-3">
            <MapPin size={20} color="#7c3aed" className="mt-0.5" />
            <Text className="ml-3 text-slate-600 text-sm flex-1 leading-relaxed">
              {report?.alamat_lengkap || 'Lokasi tidak diketahui'}
            </Text>
          </View>
          {report?.description && (
            <Text className="text-slate-600 text-sm"><Text className="font-bold">Deskripsi:</Text> {report.description}</Text>
          )}
        </View>

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
              <View className="bg-red-50 p-4 rounded-2xl border border-red-200">
                <View className="flex-row items-center mb-3">
                  <FileWarning color="#ef4444" size={20} />
                  <Text className="text-red-700 font-bold ml-2">Alasan Penolakan</Text>
                </View>
                <TextInput
                  className="bg-white border border-red-200 rounded-xl px-4 py-3 text-slate-700 mb-3"
                  placeholder="Masukkan alasan penolakan..."
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

        {currentStatus === 'verified' && (
          <View className="px-4 space-y-6">
            <View>
              <View className="flex-row items-center mb-3">
                <AlertTriangle size={18} color="#475569" />
                <Text className="font-extrabold text-slate-800 text-lg ml-2">Tingkat Prioritas</Text>
              </View>
              <View className="flex-row flex-wrap justify-between gap-y-2">
                {priorities.map((item) => {
                  const isActive = selectedPriority === item.id;
                  return (
                    <TouchableOpacity
                      key={item.id} activeOpacity={0.7} onPress={() => setSelectedPriority(item.id)}
                      className={`w-[48%] py-3 rounded-xl border ${
                        isActive ? `border-transparent ${item.activeColor} shadow-md` : `border-slate-200 bg-white`
                      } items-center justify-center`}
                    >
                      <Text className={`font-bold ${isActive ? item.activeTextColor : item.textColor}`}>{item.label}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            <View>
              <View className="flex-row items-center justify-between mb-3">
                <View className="flex-row items-center">
                  <UserCheck size={18} color="#475569" />
                  <Text className="font-extrabold text-slate-800 text-lg ml-2">Tim Lapangan</Text>
                </View>
              </View>

              <View className="flex-row items-center bg-white border border-slate-200 rounded-xl px-3 h-12 mb-4">
                <Search size={20} color="#94a3b8" />
                <TextInput 
                  className="flex-1 h-full px-3 text-slate-700"
                  placeholder="Cari nama petugas..."
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />
                {searchQuery.length > 0 && (
                  <TouchableOpacity onPress={() => setSearchQuery('')} className="p-1">
                    <X size={18} color="#94a3b8" />
                  </TouchableOpacity>
                )}
              </View>
              
              {loading && petugasList.length === 0 ? (
                <ActivityIndicator size="large" color="#7c3aed" className="mt-4" />
              ) : petugasList.length === 0 ? (
                <View className="bg-slate-100 p-4 rounded-xl border border-slate-200 items-center">
                  <Text className="text-slate-500 italic">Petugas tidak ditemukan.</Text>
                </View>
              ) : (
                petugasList.map((petugas) => (
                  <TouchableOpacity
                    key={petugas.id} activeOpacity={0.8} onPress={() => setSelectedPetugas(petugas.id)}
                    className={`flex-row items-center p-4 mb-3 rounded-2xl border-2 ${
                      selectedPetugas === petugas.id ? 'border-violet-500 bg-violet-50' : 'border-slate-200 bg-white'
                    }`}
                  >
                    <View className={`h-12 w-12 rounded-full items-center justify-center mr-4 ${
                      selectedPetugas === petugas.id ? 'bg-violet-200' : 'bg-slate-100'
                    }`}>
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
          </View>
        )}
      </ScrollView>

      {currentStatus === 'verified' && (
        <View className="p-4 bg-white border-t border-slate-100 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
          <TouchableOpacity 
            onPress={handleAssign} disabled={submitting || !selectedPetugas}
            className={`h-14 rounded-xl flex-row items-center justify-center ${
              submitting || !selectedPetugas ? 'bg-violet-400' : 'bg-violet-600 shadow-lg shadow-violet-500/30'
            }`}
          >
            {submitting ? (
              <ActivityIndicator color="white" /> 
            ) : (
              <Text className="text-white font-bold text-lg">
                Tugaskan Sekarang
              </Text>
            )}
          </TouchableOpacity>
        </View>
      )}

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