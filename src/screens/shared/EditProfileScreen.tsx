import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { ChevronLeft, User, Phone, Lock, Save, Mail, CreditCard } from "lucide-react-native";
import { useAuthStore } from "../../store/authStore";
import apiClient from "../../api/client";
import CustomAlert, { AlertType } from "../../components/CustomAlert";

export default function EditProfileScreen() {
  const navigation = useNavigation<any>();
  const { user, role, setUser } = useAuthStore();

  const [name, setName] = useState(user?.name || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [email, setEmail] = useState(user?.email || "");
  const [nik, setNik] = useState(user?.nik || "");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // State untuk CustomAlert
  const [alertConfig, setAlertConfig] = useState({
    visible: false,
    title: "",
    message: "",
    type: "info" as AlertType,
    onConfirm: () => closeAlert(),
  });

  const showAlert = (title: string, message: string, type: AlertType, onConfirm: () => void = closeAlert) => {
    setAlertConfig({ visible: true, title, message, type, onConfirm });
  };
  
  const closeAlert = () => setAlertConfig(prev => ({ ...prev, visible: false }));

  const themeColor =
    role === "admin" ? "#7c3aed" : role === "petugas" ? "#0284c7" : "#ea580c";
  const bgTheme =
    role === "admin"
      ? "bg-violet-600"
      : role === "petugas"
        ? "bg-sky-600"
        : "bg-orange-600";
  const shadowTheme =
    role === "admin"
      ? "shadow-violet-500/30"
      : role === "petugas"
        ? "shadow-sky-500/30"
        : "shadow-orange-500/30";

  const handleSave = async () => {
    if (!name.trim() || !phone.trim() || !email.trim() || !nik.trim()) {
      showAlert("Peringatan", "Semua kolom (kecuali kata sandi) wajib diisi.", "warning");
      return;
    }

    setLoading(true);
    try {
      const payload: any = { name, phone, email, nik };
      if (password.trim()) {
        payload.password = password;
      }

      const response = await apiClient.put("/profile", payload);

      setUser(response.data.data);

      showAlert("Berhasil", "Profil Anda berhasil diperbarui.", "success", () => {
        closeAlert();
        navigation.goBack();
      });
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || "Terjadi kesalahan saat menyimpan profil.";
      showAlert("Gagal", errorMsg, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-slate-50">
      {/* Header */}
      <View
        className={`${bgTheme} pt-12 pb-4 px-4 flex-row items-center shadow-md z-10`}
      >
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="p-2 -ml-2"
        >
          <ChevronLeft size={28} color="white" />
        </TouchableOpacity>
        <Text className="text-lg font-bold text-white ml-2">Edit Profil</Text>
      </View>

      <ScrollView 
        contentContainerStyle={{ padding: 24, paddingBottom: 40 }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="mb-5">
          <Text className="text-slate-600 font-bold mb-2 ml-1">
            Nama Lengkap
          </Text>
          <View className="flex-row items-center bg-white border border-slate-200 rounded-2xl px-4 py-1 h-14 shadow-sm focus:border-orange-500">
            <User size={20} color={themeColor} />
            <TextInput
              className="flex-1 ml-3 text-slate-800 font-medium"
              value={name}
              onChangeText={setName}
              placeholder="Masukkan nama lengkap"
            />
          </View>
        </View>

        <View className="mb-5">
          <Text className="text-slate-600 font-bold mb-2 ml-1">
            Email
          </Text>
          <View className="flex-row items-center bg-white border border-slate-200 rounded-2xl px-4 py-1 h-14 shadow-sm">
            <Mail size={20} color={themeColor} />
            <TextInput
              className="flex-1 ml-3 text-slate-800 font-medium"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholder="email@contoh.com"
            />
          </View>
        </View>

        <View className="mb-5">
          <Text className="text-slate-600 font-bold mb-2 ml-1">
            NIK (16 Digit)
          </Text>
          <View className="flex-row items-center bg-white border border-slate-200 rounded-2xl px-4 py-1 h-14 shadow-sm">
            <CreditCard size={20} color={themeColor} />
            <TextInput
              className="flex-1 ml-3 text-slate-800 font-medium"
              value={nik}
              onChangeText={setNik}
              keyboardType="numeric"
              maxLength={16}
              placeholder="Masukkan NIK KTP Anda"
            />
          </View>
        </View>

        <View className="mb-5">
          <Text className="text-slate-600 font-bold mb-2 ml-1">
            Nomor Handphone
          </Text>
          <View className="flex-row items-center bg-white border border-slate-200 rounded-2xl px-4 py-1 h-14 shadow-sm">
            <Phone size={20} color={themeColor} />
            <TextInput
              className="flex-1 ml-3 text-slate-800 font-medium"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              placeholder="0812xxxxxx"
            />
          </View>
        </View>

        <View className="mb-8">
          <Text className="text-slate-600 font-bold mb-2 ml-1">
            Password Baru (Opsional)
          </Text>
          <View className="flex-row items-center bg-white border border-slate-200 rounded-2xl px-4 py-1 h-14 shadow-sm">
            <Lock size={20} color={themeColor} />
            <TextInput
              className="flex-1 ml-3 text-slate-800 font-medium"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              placeholder="Kosongkan jika tidak ingin mengubah"
            />
          </View>
          <Text className="text-slate-400 text-xs ml-1 mt-2">
            Isi kolom ini hanya jika Anda ingin mengganti kata sandi.
          </Text>
        </View>

        <TouchableOpacity
          onPress={handleSave}
          disabled={loading}
          className={`${bgTheme} h-14 rounded-2xl flex-row items-center justify-center shadow-lg ${shadowTheme}`}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <>
              <Save color="white" size={20} />
              <Text className="text-white font-bold text-lg ml-2">
                Simpan Perubahan
              </Text>
            </>
          )}
        </TouchableOpacity>
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