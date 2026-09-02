import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, RefreshControl, ActivityIndicator, Image } from 'react-native';
import { FileText, ChevronRight, AlertCircle } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import apiClient from '../../api/client';

export default function LaporankuScreen() {
  const navigation = useNavigation<any>();
  
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const fetchReports = async (pageNumber = 1) => {
    if (pageNumber === 1) setLoading(true);
    else setLoadingMore(true);

    try {
      const response = await apiClient.get(`/reports/me?page=${pageNumber}`);
      
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
      console.log('Gagal mengambil laporanku:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchReports(1);
    });
    return unsubscribe;
  }, [navigation]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchReports(1);
  }, []);

  const handleLoadMore = () => {
    if (hasMore && !loadingMore && !loading) {
      fetchReports(page + 1);
    }
  };

  const renderFooter = () => {
    if (!loadingMore) return null;
    return (
      <View className="py-4 items-center justify-center">
        <ActivityIndicator size="small" color="#ea580c" />
        <Text className="text-slate-400 text-xs mt-1">Memuat laporan lawas...</Text>
      </View>
    );
  };

  const getImageUrl = (path?: string) => {
    if (!path) return null;
    const baseUrl = process.env.EXPO_PUBLIC_API_URL?.replace('/api/v1', '');
    return `${baseUrl}/storage/${path}`;
  };

  const renderItem = ({ item }: { item: any }) => {
    const date = new Date(item.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
    const coverMedia = item.media?.find((m: any) => m.type === 'before');
    const imageUrl = getImageUrl(coverMedia?.file_path);

    return (
      <TouchableOpacity 
        activeOpacity={0.7}
        onPress={() => navigation.navigate('ReportDetail', { id: item.id })}
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
             <Text className="text-orange-600 text-[10px] font-bold uppercase tracking-wider bg-orange-100 px-2 py-1 rounded-md">{item.status.replace('_', ' ')}</Text>
             <Text className="text-xs text-slate-400 font-medium">{date}</Text>
          </View>
          <Text className="text-slate-800 font-bold text-sm mb-1 line-clamp-1" numberOfLines={1}>{item.damage_category.replace(/_/g, ' ').toUpperCase()}</Text>
        </View>
        <View className="justify-center pl-2"><ChevronRight size={20} color="#cbd5e1" /></View>
      </TouchableOpacity>
    );
  };

  return (
    <View className="flex-1 bg-slate-50">
      <View className="bg-orange-600 pt-14 pb-6 px-6 shadow-md rounded-b-[30px] z-10 flex-row justify-between items-center">
        <View>
          <Text className="text-orange-200 text-xs font-bold uppercase tracking-widest mb-1">Arsip Warga</Text>
          <Text className="text-2xl font-extrabold text-white">Laporanku</Text>
        </View>
        <View className="h-12 w-12 bg-white/20 rounded-2xl items-center justify-center border border-white/20">
          <FileText size={24} color="white" />
        </View>
      </View>

      {loading && page === 1 ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#ea580c" />
        </View>
      ) : (
        <FlatList
          data={reports}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={{ paddingVertical: 12, flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
          
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.4}
          ListFooterComponent={renderFooter}
          
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#ea580c']} />}
          ListEmptyComponent={
            <Text className="text-center mt-10 text-slate-500">Belum ada laporan.</Text>
          }
        />
      )}
    </View>
  );
}