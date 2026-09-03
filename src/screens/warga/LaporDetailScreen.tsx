import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { ChevronLeft, MapPin, Clock } from "lucide-react-native";
import apiClient from "../../api/client";
import CustomAlert, { AlertType } from "../../components/CustomAlert";

export default function LaporDetailScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { id } = route.params;

  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [alertConfig, setAlertConfig] = useState({
    visible: false,
    title: "",
    message: "",
    type: "info" as AlertType,
    onConfirm: () => closeAlert(),
  });

  const showAlert = (
    title: string,
    message: string,
    type: AlertType,
    onConfirm: () => void = closeAlert,
  ) => {
    setAlertConfig({ visible: true, title, message, type, onConfirm });
  };

  const closeAlert = () =>
    setAlertConfig((prev) => ({ ...prev, visible: false }));

  useEffect(() => {
    fetchDetail();
  }, []);

  const fetchDetail = async () => {
    try {
      const response = await apiClient.get(`/reports/${id}`);
      setReport(response.data.data);
    } catch (error) {
      showAlert("Error", "Gagal memuat detail laporan.", "error", () => {
        closeAlert();
        navigation.goBack();
      });
    } finally {
      setLoading(false);
    }
  };

  const getImageUrl = (path?: string) => {
    if (!path) return null;
    const baseUrl = process.env.EXPO_PUBLIC_API_URL?.replace("/api/v1", "");
    return `${baseUrl}/storage/${path}`;
  };

  if (loading || !report) {
    return (
      <View className="flex-1 items-center justify-center bg-slate-50">
        <ActivityIndicator size="large" color="#ea580c" />
        <Text className="text-slate-500 mt-4">Memuat data laporan...</Text>

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

  const date = new Date(report.created_at).toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const photoBefore = report.media?.find((m: any) => m.type === "before");
  const photoAfter = report.media?.find((m: any) => m.type === "after");

  return (
    <View className="flex-1 bg-slate-50">
      {/* Header (Tetap diam saat di-scroll) */}
      <View className="bg-white pt-12 pb-4 px-4 flex-row items-center shadow-sm border-b border-slate-100 z-10">
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="p-2 -ml-2"
        >
          <ChevronLeft size={28} color="#334155" />
        </TouchableOpacity>
        <Text className="text-lg font-bold text-slate-800 ml-2">
          Detail Laporan
        </Text>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        <View className="p-4 space-y-6">
          {/* Status & Kategori */}
          <View className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-slate-500 text-xs font-semibold flex-row items-center">
                <Clock size={12} color="#64748b" className="mr-1" /> {date}
              </Text>
              <View className="bg-orange-100 px-3 py-1 rounded-full">
                <Text className="text-orange-600 font-bold text-xs uppercase">
                  {report.status.replace("_", " ")}
                </Text>
              </View>
            </View>
            <Text className="text-xl font-extrabold text-slate-800 mb-1">
              {report.type === "pju" ? "Lampu Jalan" : "Lampu Merah"}
            </Text>
            <Text className="text-slate-600 font-medium uppercase tracking-wider text-xs mb-4">
              {report.damage_category.replace(/_/g, " ")}
            </Text>

            <View className="flex-row items-start bg-slate-50 p-3 rounded-xl border border-slate-100">
              <MapPin size={20} color="#ea580c" className="mt-0.5" />
              <Text className="ml-3 text-slate-600 text-sm flex-1 leading-relaxed">
                {report.alamat_lengkap || "Lokasi tidak diketahui"}
              </Text>
            </View>

            {report.description && (
              <View className="mt-4 pt-4 border-t border-slate-100">
                <Text className="font-semibold text-slate-700 mb-1">
                  Deskripsi Warga:
                </Text>
                <Text className="text-slate-600 text-sm">
                  {report.description}
                </Text>
              </View>
            )}
          </View>

          {/* Bukti Laporan */}
          <View>
            <Text className="font-bold text-slate-800 mb-3 ml-1">
              Foto Bukti Kerusakan
            </Text>
            <View className="w-full h-56 bg-slate-200 rounded-2xl overflow-hidden border border-slate-200 shadow-sm">
              {photoBefore ? (
                <Image
                  source={{ uri: getImageUrl(photoBefore.file_path)! }}
                  className="w-full h-full"
                  resizeMode="cover"
                />
              ) : (
                <View className="flex-1 items-center justify-center">
                  <Text className="text-slate-400">Tidak ada foto</Text>
                </View>
              )}
            </View>
          </View>

          {/* Hasil Perbaikan - Muncul Jika Sudah Selesai */}
          {report.status === "completed" && (
            <View className="bg-emerald-50 p-5 rounded-2xl border border-emerald-100 shadow-sm mt-2">
              <Text className="font-bold text-emerald-800 mb-2">
                Perbaikan Selesai
              </Text>
              {report.assignment?.petugas_notes && (
                <Text className="text-emerald-700 text-sm mb-4">
                  Catatan Petugas: {report.assignment.petugas_notes}
                </Text>
              )}
              <View className="w-full h-56 bg-emerald-200 rounded-xl overflow-hidden border border-emerald-300">
                {photoAfter ? (
                  <Image
                    source={{ uri: getImageUrl(photoAfter.file_path)! }}
                    className="w-full h-full"
                    resizeMode="cover"
                  />
                ) : (
                  <View className="flex-1 items-center justify-center">
                    <Text className="text-emerald-600">
                      Foto perbaikan tidak tersedia
                    </Text>
                  </View>
                )}
              </View>
            </View>
          )}
        </View>
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