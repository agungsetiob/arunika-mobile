import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, RefreshControl, ActivityIndicator, Image } from 'react-native';
import { ShieldCheck, MapPin, ChevronRight, AlertCircle, Bell } from 'lucide-react-native';
import apiClient from '../../api/client';
import { useNavigation, useFocusEffect } from '@react-navigation/native';

export default function AdminHomeScreen() {
  const navigation = useNavigation<any>();
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  
  // State untuk notifikasi belum dibaca
  const [unreadCount, setUnreadCount] = useState(0);

  // Ambil jumlah notifikasi setiap kali halaman admin ini aktif
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

  const fetchReports = async (pageNumber = 1) => {
    if (pageNumber === 1) setLoading(true);
    else setLoadingMore(true);

    try {
      const response = await apiClient.get(`/admin/reports?status=pending,verified&page=${pageNumber}`);
      
      const newData = response.data.data;
      const lastPage = response.data.last_page;

      if (pageNumber === 1) {
        setReports(newData);
      } else {
        setReports(prev => {
          const allData = [...prev, ...newData];
          const uniqueData = Array.from(new Map(allData.map(item => [item.id, item])).values());
          return uniqueData;
        });
      }

      setPage(pageNumber);
      setHasMore(pageNumber < lastPage);
    } catch (error) {
      console.log('Gagal memuat:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchReports();
    });
    return unsubscribe;
  }, [navigation]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchReports();
  }, []);

  const getImageUrl = (path?: string) => {
    if (!path) return null;
    const baseUrl = process.env.EXPO_PUBLIC_API_URL?.replace('/api/v1', '');
    return `${baseUrl}/storage/${path}`;
  };

  const handleLoadMore = () => {
    if (hasMore && !loadingMore && !loading) {
      fetchReports(page + 1);
    }
  };

  const renderFooter = () => {
    if (!loadingMore) return null;
    return (
      <View className="py-4 items-center justify-center">
        <ActivityIndicator size="small" color="#7c3aed" /> 
        <Text className="text-slate-400 text-xs mt-1">Memuat data...</Text>
      </View>
    );
  };

  const renderItem = ({ item }: { item: any }) => {
    const date = new Date(item.created_at).toLocaleDateString('id-ID', { 
      day: 'numeric', month: 'short' 
    });
    const coverMedia = item.media?.find((m: any) => m.type === 'before');
    const imageUrl = getImageUrl(coverMedia?.file_path);

    return (
      <TouchableOpacity 
        activeOpacity={0.7}
        onPress={() => navigation.navigate('AdminAssign', { report: item })}
        className="bg-white mx-4 my-2 rounded-2xl p-4 shadow-sm border border-slate-100 flex-row"
      >
        <View className="h-16 w-16 bg-slate-100 rounded-xl overflow-hidden mr-4 border border-slate-200">
          {imageUrl ? (
            <Image source={{ uri: imageUrl }} className="w-full h-full" resizeMode="cover" />
          ) : (
            <View className="flex-1 items-center justify-center"><AlertCircle color="#cbd5e1" size={24} /></View>
          )}
        </View>

        <View className="flex-1 justify-center">
          <View className="flex-row justify-between items-start mb-1">
            <Text className="text-violet-600 text-[10px] font-bold uppercase tracking-wider bg-violet-100 px-2 py-1 rounded-md">
              {item.status}
            </Text>
            <Text className="text-xs text-slate-400 font-medium">{date}</Text>
          </View>
          
          <Text className="text-slate-800 font-bold text-sm mb-1 line-clamp-1" numberOfLines={1}>
            {item.damage_category.replace(/_/g, ' ').toUpperCase()}
          </Text>
          
          <View className="flex-row items-center mt-1">
            <MapPin size={12} color="#94a3b8" />
            <Text className="text-slate-500 text-xs ml-1 flex-1" numberOfLines={1}>
              {item.alamat_lengkap || 'Lokasi tidak diketahui'}
            </Text>
          </View>
        </View>

        <View className="justify-center pl-2">
          <ChevronRight size={20} color="#cbd5e1" />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View className="flex-1 bg-slate-50">
      <View className="bg-violet-600 pt-14 pb-6 px-6 shadow-md rounded-b-[30px] z-10 flex-row justify-between items-center">
        <View>
          <Text className="text-violet-200 text-xs font-bold uppercase tracking-widest mb-1">Command Center</Text>
          <Text className="text-2xl font-extrabold text-white">Laporan Masuk</Text>
        </View>
        
        <TouchableOpacity 
          onPress={() => navigation.navigate('Notifications')}
          className="h-12 w-12 bg-white/20 rounded-2xl items-center justify-center border border-white/20 relative"
        >
          <Bell size={24} color="white" />
          
          {unreadCount > 0 && (
            <View className="absolute top-2.5 right-2.5 bg-red-500 w-3 h-3 rounded-full border-2 border-violet-600" />
          )}
        </TouchableOpacity>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#ea580c" />
          <Text className="text-slate-500 mt-4">Memuat laporan warga...</Text>
        </View>
      ) : (
        <FlatList
          data={reports}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={{ paddingVertical: 12, flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#7c3aed']} />}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.4}
          ListFooterComponent={renderFooter}
          ListEmptyComponent={
            <View className="flex-1 items-center justify-center px-8 mt-20">
              <View className="h-24 w-24 bg-violet-50 rounded-full items-center justify-center mb-4">
                <ShieldCheck size={40} color="#7c3aed" />
              </View>
              <Text className="text-slate-800 font-bold text-lg mb-2 text-center">Area Aman</Text>
              <Text className="text-slate-500 text-center text-sm">
                Belum ada laporan baru dari warga yang perlu ditugaskan.
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}