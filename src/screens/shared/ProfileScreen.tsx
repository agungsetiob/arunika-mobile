import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import {
  User,
  Phone,
  CreditCard,
  LogOut,
  ChevronRight,
  Info,
} from 'lucide-react-native';
import { useAuthStore } from '../../store/authStore';
import { useNavigation } from '@react-navigation/native';
import apiClient from '../../api/client';

export default function ProfileScreen() {
  const { user, role, logout } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation<any>();

  const themeColor =
    role === 'admin'
      ? '#7c3aed'
      : role === 'petugas'
        ? '#0284c7'
        : '#ea580c';

  const themeBg =
    role === 'admin'
      ? 'bg-violet-100'
      : role === 'petugas'
        ? 'bg-sky-100'
        : 'bg-orange-100';

  const themeSoft =
    role === 'admin'
      ? 'bg-violet-50'
      : role === 'petugas'
        ? 'bg-sky-50'
        : 'bg-orange-50';

  const roleLabel =
    role === 'admin'
      ? 'Administrator'
      : role === 'petugas'
        ? 'Petugas Lapangan'
        : 'Warga';

  const handleLogout = () => {
    Alert.alert(
      'Konfirmasi Keluar',
      'Apakah Anda yakin ingin keluar dari aplikasi?',
      [
        {
          text: 'Batal',
          style: 'cancel',
        },
        {
          text: 'Ya, Keluar',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);

            try {
              await apiClient.post('/auth/logout');
            } catch (error) {
              console.log(
                'API Logout error, force local logout.',
                error
              );
            } finally {
              await logout();
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  return (
    <View className="flex-1 bg-slate-50">

      {/* ================================================= */}
      {/* FIXED PROFILE HEADER */}
      {/* ================================================= */}

      <View
        className="bg-slate-900 rounded-b-[36px] px-6 pt-16 pb-8 items-center"
        style={{
          zIndex: 10,
          elevation: 10,
        }}
      >
        {/* Avatar */}
        <View
          className="h-24 w-24 rounded-full items-center justify-center mb-4"
          style={{
            backgroundColor: '#ffffff',
            borderWidth: 4,
            borderColor: themeColor,
          }}
        >
          <Text
            className="text-4xl font-extrabold"
            style={{
              color: themeColor,
            }}
          >
            {user?.name?.charAt(0).toUpperCase() || '?'}
          </Text>
        </View>

        {/* Nama */}
        <Text className="text-2xl font-extrabold text-white text-center">
          {user?.name || 'Pengguna'}
        </Text>

        {/* Role */}
        <View
          className={`mt-3 px-4 py-1.5 rounded-full ${themeSoft}`}
        >
          <Text
            className="text-xs font-extrabold uppercase tracking-widest"
            style={{
              color: themeColor,
            }}
          >
            {roleLabel}
          </Text>
        </View>
      </View>

      {/* ================================================= */}
      {/* SCROLLABLE CONTENT */}
      {/* ================================================= */}

      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 24,
          paddingBottom: 32,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* ================================================= */}
        {/* INFORMASI AKUN */}
        {/* ================================================= */}

        <View>
          <Text className="text-base font-extrabold text-slate-800 mb-3 ml-1">
            Informasi Akun
          </Text>

          <View className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm">

            {/* Nomor HP */}
            <View className="flex-row items-center px-5 py-4">
              <View className="h-11 w-11 rounded-2xl bg-slate-100 items-center justify-center">
                <Phone size={20} color="#475569" />
              </View>

              <View className="flex-1 ml-4">
                <Text className="text-xs text-slate-400 font-medium mb-1">
                  Nomor Handphone
                </Text>

                <Text className="text-slate-800 text-sm font-bold">
                  {user?.phone || '-'}
                </Text>
              </View>
            </View>

            {/* Divider */}
            {user?.nik && (
              <View className="h-px bg-slate-100 ml-[76px]" />
            )}

            {/* NIK */}
            {user?.nik && (
              <View className="flex-row items-center px-5 py-4">
                <View className="h-11 w-11 rounded-2xl bg-slate-100 items-center justify-center">
                  <CreditCard size={20} color="#475569" />
                </View>

                <View className="flex-1 ml-4">
                  <Text className="text-xs text-slate-400 font-medium mb-1">
                    NIK
                  </Text>

                  <Text className="text-slate-800 text-sm font-bold">
                    {user.nik}
                  </Text>
                </View>
              </View>
            )}

          </View>
        </View>

        {/* ================================================= */}
        {/* PENGATURAN */}
        {/* ================================================= */}

        <View className="mt-7">
          <Text className="text-base font-extrabold text-slate-800 mb-3 ml-1">
            Pengaturan
          </Text>

          <View className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm">

            {/* Edit Profile */}
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => navigation.navigate('EditProfile')}
              className="flex-row items-center px-5 py-4"
            >
              <View className="h-11 w-11 rounded-2xl bg-slate-100 items-center justify-center">
                <User size={20} color="#475569" />
              </View>

              <View className="flex-1 ml-4">
                <Text className="text-slate-800 text-sm font-bold">
                  Edit Profil
                </Text>

                <Text className="text-slate-400 text-xs mt-1">
                  Ubah informasi akun Anda
                </Text>
              </View>

              <ChevronRight size={20} color="#cbd5e1" />
            </TouchableOpacity>

            <View className="h-px bg-slate-100 ml-[76px]" />

            {/* Tentang */}
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => navigation.navigate('About')}
              className="flex-row items-center px-5 py-4"
            >
              <View
                className={`h-11 w-11 rounded-2xl ${themeBg} items-center justify-center`}
              >
                <Info size={20} color={themeColor} />
              </View>

              <View className="flex-1 ml-4">
                <Text className="text-slate-800 text-sm font-bold">
                  Tentang Aplikasi
                </Text>

                <Text className="text-slate-400 text-xs mt-1">
                  Informasi dan versi aplikasi
                </Text>
              </View>

              <ChevronRight size={20} color="#cbd5e1" />
            </TouchableOpacity>

          </View>
        </View>

        {/* ================================================= */}
        {/* LOGOUT */}
        {/* ================================================= */}

        <View className="mt-7">
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={handleLogout}
            disabled={loading}
            className="bg-white rounded-3xl border border-red-100 px-5 py-4 flex-row items-center shadow-sm"
          >
            <View className="h-11 w-11 rounded-2xl bg-red-50 items-center justify-center">
              {loading ? (
                <ActivityIndicator
                  size="small"
                  color="#ef4444"
                />
              ) : (
                <LogOut
                  size={20}
                  color="#ef4444"
                />
              )}
            </View>

            <View className="flex-1 ml-4">
              <Text className="text-red-500 text-sm font-extrabold">
                Keluar Aplikasi
              </Text>

              <Text className="text-slate-400 text-xs mt-1">
                Keluar dari akun Anda di perangkat ini
              </Text>
            </View>

            {!loading && (
              <ChevronRight
                size={20}
                color="#fca5a5"
              />
            )}
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <Text className="text-center text-xs text-slate-400 mt-7">
          Kabupaten Tanah Bumbu
        </Text>

      </ScrollView>
    </View>
  );
}