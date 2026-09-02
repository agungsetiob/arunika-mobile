import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, ActivityIndicator, RefreshControl } from 'react-native';
import { ArrowLeft, Bell, CheckCircle2, Wrench, ShieldAlert, CheckCheck } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import apiClient from '../../api/client';
import { useAuthStore } from '../../store/authStore';

export default function NotificationsScreen() {
  const navigation = useNavigation();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const role = useAuthStore((state) => state.role);
  const bgTheme = role === 'admin' ? 'bg-violet-600' : role === 'petugas' ? 'bg-sky-600' : 'bg-orange-600';
  const iconTheme = role === 'admin' ? '#7c3aed' : role === 'petugas' ? '#0284c7' : '#ea580c';

  // Ambil data dari API Laravel
  const fetchNotifications = async () => {
    try {
      const response = await apiClient.get('/notifications');
      // response.data.data.data karena Laravel menggunakan Pagination
      setNotifications(response.data.data.data);
    } catch (error) {
      console.log('Gagal memuat notifikasi', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchNotifications();
  };

  // Fungsi tandai satu pesan sudah dibaca
  const markAsRead = async (id: string, readAt: string | null) => {
    if (readAt !== null) return;
    
    setNotifications(notifications.map(n => n.id === id ? { ...n, read_at: new Date().toISOString() } : n));
    
    try {
      await apiClient.post(`/notifications/${id}/read`);
    } catch (error) {
      console.log('Gagal update status read', error);
    }
  };

  const markAllAsRead = async () => {
    setNotifications(notifications.map(n => ({ ...n, read_at: new Date().toISOString() })));
    try {
      await apiClient.post('/notifications/read-all');
    } catch (error) {
      console.log('Gagal tandai semua', error);
    }
  };

  const getIcon = (type: string) => {
    switch(type) {
      case 'completed': return <CheckCircle2 size={24} color="#10b981" />;
      case 'assignment': return <Wrench size={24} color="#ea580c" />;
      default: return <ShieldAlert size={24} color="#3b82f6" />;
    }
  };

  const getIconBg = (type: string) => {
    switch(type) {
      case 'completed': return 'bg-emerald-100';
      case 'assignment': return 'bg-orange-100';
      default: return 'bg-blue-100';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', { 
        day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' 
    });
  };

  if (loading) {
    return (
      <View className="flex-1 bg-slate-50 justify-center items-center">
        <ActivityIndicator size="large" color={iconTheme} />
      </View>
    );
  }

  const hasUnread = notifications.some(n => n.read_at === null);

  return (
    <View className="flex-1 bg-slate-50">
      {/* Header */}
      <View className={`${bgTheme} pt-14 pb-4 px-4 flex-row items-center justify-between shadow-sm`}>
        <View className="flex-row items-center">
            <TouchableOpacity onPress={() => navigation.goBack()} className="p-2">
            <ArrowLeft color="white" size={24} />
            </TouchableOpacity>
            <Text className="text-white text-lg font-bold ml-2">Notifikasi</Text>
        </View>

        {hasUnread && (
            <TouchableOpacity onPress={markAllAsRead} className="flex-row items-center bg-white/20 px-3 py-1.5 rounded-full">
                <CheckCheck color="white" size={16} />
                <Text className="text-white text-xs font-medium ml-1">Baca Semua</Text>
            </TouchableOpacity>
        )}
      </View>

      {/* List Notifikasi */}
      <FlatList
        data={notifications}
        keyExtractor={item => item.id}
        contentContainerStyle={{ padding: 16 }}
        refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[iconTheme]} />
        }
        ListEmptyComponent={
          <View className="flex-1 items-center justify-center mt-20">
            <View className="bg-slate-200 p-4 rounded-full mb-4">
              <Bell size={40} color="#94a3b8" />
            </View>
            <Text className="text-slate-500 font-medium">Belum ada notifikasi.</Text>
          </View>
        }
        renderItem={({ item }) => {
          const isUnread = item.read_at === null; // Null berarti belum dibaca
          const notifData = item.data;

          return (
            <TouchableOpacity 
              onPress={() => markAsRead(item.id, item.read_at)}
              activeOpacity={0.7}
              className={`flex-row p-4 mb-3 rounded-2xl border ${!isUnread ? 'bg-white border-slate-100 shadow-sm' : 'bg-orange-50/50 border-orange-200 shadow-sm'}`}
            >
              {/* Ikon Tipe Notif */}
              <View className={`w-12 h-12 rounded-full items-center justify-center mr-4 ${getIconBg(notifData.type)}`}>
                {getIcon(notifData.type)}
              </View>

              {/* Konten */}
              <View className="flex-1">
                <View className="flex-row justify-between items-start mb-1">
                  <Text className={`flex-1 font-bold ${!isUnread ? 'text-slate-800' : 'text-orange-900'}`}>
                    {notifData.title}
                  </Text>
                  {isUnread && (
                    <View className="w-2.5 h-2.5 bg-orange-500 rounded-full ml-2 mt-1" />
                  )}
                </View>
                
                <Text className={`text-sm mb-2 leading-tight ${!isUnread ? 'text-slate-500' : 'text-slate-700'}`}>
                  {notifData.body}
                </Text>
                
                <Text className="text-xs text-slate-400 font-medium">
                  {formatDate(item.created_at)}
                </Text>
              </View>
            </TouchableOpacity>
          )
        }}
      />
    </View>
  );
}