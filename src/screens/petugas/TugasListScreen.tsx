import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, RefreshControl, ActivityIndicator, ScrollView } from 'react-native';
import { Wrench, MapPin, ChevronRight, CheckCircle, Clock, Bell, AlertTriangle } from 'lucide-react-native'; // Tambahkan AlertTriangle
import apiClient from '../../api/client';
import { useNavigation, useFocusEffect } from '@react-navigation/native'; 

export default function TugasListScreen() {
  const navigation = useNavigation<any>();
  
  // State Data & Loading
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // State Pagination
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  // State Filter
  const [activeFilter, setActiveFilter] = useState(''); 

  // State Notifikasi
  const [unreadCount, setUnreadCount] = useState(0);

  useFocusEffect(
    useCallback(() => {
      const fetchUnreadCount = async () => {
        try {
          const response = await apiClient.get('/notifications');
          setUnreadCount(response.data.unread_count);
        } catch (error) {
          console.log('Gagal fetch unread count', error);
        }
      };
      fetchUnreadCount();
    }, [])
  );

  const fetchAssignments = async (pageNumber = 1, currentStatus = activeFilter) => {
    if (pageNumber === 1) setLoading(true);
    else setLoadingMore(true);

    try {
      const url = currentStatus 
        ? `/petugas/assignments?status=${currentStatus}&page=${pageNumber}` 
        : `/petugas/assignments?page=${pageNumber}`;

      const response = await apiClient.get(url);
      
      const newData = response.data.data;
      const lastPage = response.data.last_page;

      if (pageNumber === 1) {
        setAssignments(newData);
      } else {
        setAssignments(prev => {
          const allData = [...prev, ...newData];
          const uniqueData = Array.from(new Map(allData.map(item => [item.id, item])).values());
          return uniqueData;
        });
      }

      setPage(pageNumber);
      setHasMore(pageNumber < lastPage);
    } catch (error) {
      console.log('Gagal mengambil daftar tugas:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchAssignments(1, activeFilter);
    });
    return unsubscribe;
  }, [navigation, activeFilter]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchAssignments(1, activeFilter);
  }, [activeFilter]);

  const handleLoadMore = () => {
    if (hasMore && !loadingMore && !loading) {
      fetchAssignments(page + 1, activeFilter);
    }
  };

  const changeFilter = (status: string) => {
    if (activeFilter === status) return; 
    setActiveFilter(status);
    fetchAssignments(1, status);
  };

  const renderFooter = () => {
    if (!loadingMore) return null;
    return (
      <View className="py-4 items-center justify-center">
        <ActivityIndicator size="small" color="#0284c7" />
        <Text className="text-slate-400 text-xs mt-1">Memuat tugas lawas...</Text>
      </View>
    );
  };

  const getAssignmentBadge = (status: string) => {
    switch (status) {
      case 'assigned': return { label: 'Tugas Baru', bg: 'bg-yellow-100', text: 'text-yellow-700', icon: <Clock size={12} color="#a16207" /> };
      case 'accepted': return { label: 'Diterima', bg: 'bg-sky-100', text: 'text-sky-700', icon: <Wrench size={12} color="#0369a1" /> };
      case 'on_site': return { label: 'Di Lokasi', bg: 'bg-purple-100', text: 'text-purple-700', icon: <MapPin size={12} color="#6b21a8" /> };
      case 'completed': return { label: 'Selesai', bg: 'bg-emerald-100', text: 'text-emerald-700', icon: <CheckCircle size={12} color="#047857" /> };
      default: return { label: status, bg: 'bg-slate-100', text: 'text-slate-700', icon: null };
    }
  };

  // Helper untuk Warna Prioritas
  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'emergency': return { label: 'DARURAT', bg: 'bg-red-100', text: 'text-red-700', isEmergency: true };
      case 'high': return { label: 'TINGGI', bg: 'bg-orange-100', text: 'text-orange-700', isEmergency: false };
      case 'low': return { label: 'RENDAH', bg: 'bg-slate-100', text: 'text-slate-600', isEmergency: false };
      case 'medium':
      default: return { label: 'MENENGAH', bg: 'bg-blue-100', text: 'text-blue-700', isEmergency: false };
    }
  };

  const renderItem = ({ item }: { item: any }) => {
    const badge = getAssignmentBadge(item.status);
    const date = new Date(item.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
    const report = item.report;
    const priority = report?.priority ? getPriorityBadge(report.priority) : null;

    return (
      <TouchableOpacity 
        activeOpacity={0.7}
        onPress={() => navigation.navigate('TugasDetail', { id: item.id })}
        className="bg-white mx-4 my-2 rounded-2xl p-4 shadow-sm border border-slate-100"
      >
        <View className="flex-row justify-between items-start mb-3">
          {/* Kumpulan Badge Kiri */}
          <View className="flex-row items-center flex-wrap gap-2">
            <View className={`px-2.5 py-1.5 rounded-md flex-row items-center space-x-1.5 ${badge.bg}`}>
              {badge.icon}
              <Text className={`text-[10px] font-bold uppercase tracking-wider ${badge.text}`}>{badge.label}</Text>
            </View>

            {/* Badge Prioritas */}
            {priority && (
              <View className={`px-2.5 py-1.5 rounded-md flex-row items-center space-x-1 border border-white ${priority.bg}`}>
                {priority.isEmergency && <AlertTriangle size={10} color="#b91c1c" />}
                <Text className={`text-[10px] font-bold uppercase tracking-wider ${priority.text}`}>
                  {priority.label}
                </Text>
              </View>
            )}
          </View>

          <Text className="text-xs text-slate-400 font-medium font-mono ml-2">{date}</Text>
        </View>

        <Text className="text-slate-800 font-bold text-base mb-1">
          {report?.type === 'pju' ? 'Perbaikan PJU' : 'Perbaikan Traffic Light'}
        </Text>
        <Text className="text-slate-500 text-xs mb-3 font-medium uppercase tracking-wider">
          {report?.damage_category?.replace(/_/g, ' ')}
        </Text>
        
        <View className="flex-row items-center bg-slate-50 p-2.5 rounded-lg border border-slate-100">
          <MapPin size={16} color="#0284c7" />
          <Text className="text-slate-600 text-xs ml-2 flex-1" numberOfLines={2}>
            {report?.alamat_lengkap || 'Lokasi tiang tidak diketahui'}
          </Text>
          <ChevronRight size={18} color="#cbd5e1" />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View className="flex-1 bg-slate-50">
      {/* Header Utama */}
      <View className="bg-sky-600 pt-14 pb-4 px-6 shadow-md z-20 flex-row justify-between items-center">
        <View>
          <Text className="text-sky-200 text-xs font-bold uppercase tracking-widest mb-1">Operasional</Text>
          <Text className="text-2xl font-extrabold text-white">Daftar Tugas</Text>
        </View>
        
        <TouchableOpacity 
          onPress={() => navigation.navigate('Notifications')}
          className="h-12 w-12 bg-white/20 rounded-2xl items-center justify-center border border-white/20 relative"
        >
          <Bell size={24} color="white" />
          
          {unreadCount > 0 && (
            <View className="absolute top-2.5 right-2.5 bg-red-500 w-3 h-3 rounded-full border-2 border-sky-600" />
          )}
        </TouchableOpacity>
      </View>

      {/* Filter Horizontal */}
      <View className="bg-sky-600 pb-4 shadow-md rounded-b-[30px] z-10">
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          contentContainerStyle={{ paddingHorizontal: 20, gap: 10 }}
        >
          {['Semua', 'assigned', 'accepted', 'on_site', 'completed'].map((statusOption) => {
            const isAll = statusOption === 'Semua';
            const statusValue = isAll ? '' : statusOption;
            const isActive = activeFilter === statusValue;
            
            const label = isAll ? 'Semua' : 
                          statusOption === 'assigned' ? 'Baru' : 
                          statusOption === 'accepted' ? 'Diterima' : 
                          statusOption === 'on_site' ? 'Di Lokasi' : 'Selesai';

            return (
              <TouchableOpacity
                key={statusOption}
                onPress={() => changeFilter(statusValue)}
                className={`px-4 py-2 rounded-full border ${
                  isActive ? 'bg-white border-white' : 'bg-sky-700/50 border-sky-400'
                }`}
              >
                <Text className={`text-sm font-bold ${isActive ? 'text-sky-700' : 'text-sky-100'}`}>
                  {label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* List Tugas */}
      {loading && page === 1 ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#0284c7" />
          <Text className="text-slate-500 mt-4">Memuat tugas...</Text>
        </View>
      ) : (
        <FlatList
          data={assignments}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={{ paddingVertical: 12, flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={renderFooter}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#0284c7']} />}
          ListEmptyComponent={
            <View className="flex-1 items-center justify-center px-8 mt-20">
              <View className="h-24 w-24 bg-sky-50 rounded-full items-center justify-center mb-4">
                <CheckCircle size={40} color="#0284c7" />
              </View>
              <Text className="text-slate-800 font-bold text-lg mb-2 text-center">Bagus Sekali!</Text>
              <Text className="text-slate-500 text-center text-sm">
                {activeFilter 
                  ? 'Tidak ada tugas dengan status ini.' 
                  : 'Saat ini belum ada tugas perbaikan yang diberikan kepada Anda.'}
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}