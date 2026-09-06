import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ChevronLeft, Trophy, Medal, Award, Crown } from 'lucide-react-native';
import apiClient from '../../api/client';
import { useAuthStore } from '../../store/authStore';

const { width: screenWidth } = Dimensions.get('window');

export default function LeaderboardScreen() {
  const navigation = useNavigation<any>();
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { role } = useAuthStore();

  const bgTheme = role === 'admin' ? 'bg-violet-600' : role === 'petugas' ? 'bg-sky-600' : 'bg-orange-600';
  const textTheme = role === 'admin' ? 'text-violet-200' : role === 'petugas' ? 'text-sky-200' : 'text-orange-200';

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const response = await apiClient.get('/gamification/leaderboard');
      setLeaderboard(response.data.data);
    } catch (error) {
      console.log('Gagal memuat leaderboard', error);
    } finally {
      setLoading(false);
    }
  };

  // Pisahkan top 3 dan sisanya
  const top3 = leaderboard.filter(item => item.rank <= 3);
  const rest = leaderboard.filter(item => item.rank > 3);

  // Posisi podium: indeks 0 = peringkat 2, indeks 1 = peringkat 1, indeks 2 = peringkat 3
  const podiumData = top3.length === 3 ? [top3[1], top3[0], top3[2]] : [];

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Crown size={28} color="#fbbf24" />;
      case 2: return <Medal size={28} color="#94a3b8" />;
      case 3: return <Award size={28} color="#b45309" />;
      default: return null;
    }
  };

  const getPodiumHeight = (rank: number) => {
    switch (rank) {
      case 1: return 205;
      case 2: return 173;
      case 3: return 163;
      default: return 100;
    }
  };

  const getPodiumBg = (rank: number) => {
    switch (rank) {
      case 1: return 'bg-yellow-50 border-yellow-300';
      case 2: return 'bg-slate-50 border-slate-300';
      case 3: return 'bg-orange-50 border-orange-300';
      default: return 'bg-white border-slate-200';
    }
  };

  const renderPodium = () => {
    if (podiumData.length !== 3) return null;

    return (
      <View className="flex-row justify-center items-end px-4 mt-10 mb-6 space-x-2">
        {podiumData.map((item) => {
          const rank = item.rank;
          const height = getPodiumHeight(rank);
          const isFirst = rank === 1;

          return (
            <View
              key={item.id}
              className={`items-center justify-end rounded-t-2xl rounded-b-xl border-t-4 border-l-2 border-r-2 border-b-2 ${getPodiumBg(rank)} px-2 pb-4 pt-8 relative`}
              style={{
                width: screenWidth * 0.28,
                height: height,
              }}
            >
              {/* Medali / Icon Menggantung di Atas Podium */}
              {/* class -top-6 mengangkat ikon ke luar kotak podium sebesar 24px */}
              <View className="absolute -top-6 bg-white rounded-full p-2 shadow-sm border border-slate-100 z-10">
                {getRankIcon(rank)}
              </View>

              {/* Nama */}
              <Text 
                className="font-extrabold text-slate-800 text-center text-xs mb-2" 
                numberOfLines={isFirst ? 2 : 1} // Juara 1 dapat 2 baris nama
              >
                {item.name}
              </Text>

              {/* Skor */}
              <View className="items-center bg-white/80 w-full rounded-lg py-1.5 mb-1.5 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
                <Text className={`font-black ${isFirst ? 'text-lg text-yellow-600' : 'text-base text-slate-600'}`}>
                  {item.total_score}
                </Text>
                <Text className="text-[8px] font-bold text-slate-400 uppercase">PTS</Text>
              </View>

              {/* Jumlah laporan */}
              <Text className="text-[9px] font-semibold text-slate-500 mb-2">
                {item.reports_count} Laporan
              </Text>

              {/* Peringkat (Teks menempel di dasar) */}
              <View className={`w-full py-1 rounded-md items-center ${isFirst ? 'bg-yellow-200' : 'bg-slate-200'}`}>
                <Text className={`text-[10px] font-black ${isFirst ? 'text-yellow-700' : 'text-slate-600'}`}>
                  JUARA {rank}
                </Text>
              </View>
            </View>
          );
        })}
      </View>
    );
  };

  const renderRestItem = ({ item }: { item: any }) => {
    const badge = getRankBadge(item.rank);

    return (
      <View className={`flex-row items-center px-4 py-4 mx-4 mb-3 rounded-2xl border ${badge.border} bg-white`}>
        <View className={`h-12 w-12 rounded-full items-center justify-center mr-4 ${badge.bg}`}>
          {badge.icon}
        </View>
        <View className="flex-1">
          <Text className="text-sm font-extrabold text-slate-800">
            {item.name}
          </Text>
          <Text className="text-xs font-medium text-slate-500 mt-0.5">Warga Siaga</Text>
        </View>
        <View className="items-end justify-center">
          <Text className="font-black text-xl text-slate-600">
            {item.total_score} <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">PTS</Text>
          </Text>
          <Text className="text-[11px] font-medium text-slate-400 mt-0.5">{item.reports_count} Laporan</Text>
        </View>
      </View>
    );
  };

  const getRankBadge = (rank: number) => {
    switch (rank) {
      case 1:
        return { icon: <Trophy size={24} color="#ca8a04" />, bg: 'bg-yellow-100', border: 'border-yellow-300' };
      case 2:
        return { icon: <Medal size={24} color="#94a3b8" />, bg: 'bg-slate-200', border: 'border-slate-300' };
      case 3:
        return { icon: <Award size={24} color="#b45309" />, bg: 'bg-orange-100', border: 'border-orange-300' };
      default:
        return { icon: <Text className="font-bold text-slate-500">{rank}</Text>, bg: 'bg-slate-50', border: 'border-slate-100' };
    }
  };

  return (
    <View className="flex-1 bg-slate-50">
      {/* Header */}
      <View className={`${bgTheme} items-center pb-10 pt-12 px-4 relative rounded-b-[40px] shadow-md z-10`}>
        <TouchableOpacity onPress={() => navigation.goBack()} className="absolute top-12 left-4 p-2">
          <ChevronLeft color="white" size={28} />
        </TouchableOpacity>

        <View className="h-16 w-16 bg-white/20 rounded-full items-center justify-center mb-3">
          <Trophy color="#fde047" size={32} />
        </View>
        <Text className="text-2xl font-black text-white">Pahlawan Arunika</Text>

        <Text className={`${textTheme} mt-1 px-8 text-center text-sm`}>
          Warga paling aktif membantu memperbaiki infrastruktur kota kita.
        </Text>
      </View>

      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#7c3aed" />
          <Text className="text-slate-500 mt-3 font-medium">Menghitung skor...</Text>
        </View>
      ) : (
        <FlatList
          data={rest}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderRestItem}
          contentContainerStyle={{ paddingTop: 10, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            leaderboard.length >= 3 ? (
              <View className="mb-4">
                {renderPodium()}
                {/* Divider */}
                <View className="h-px bg-slate-200 mx-6 my-2" />
                <Text className="text-sm font-semibold text-slate-500 mx-6 mt-2 mb-1">Peringkat Lainnya</Text>
              </View>
            ) : null
          }
          ListEmptyComponent={
            <View className="items-center justify-center px-8 mt-12">
              <Text className="text-slate-500 text-center">Belum ada data pahlawan kota minggu ini.</Text>
            </View>
          }
        />
      )}
    </View>
  );
}