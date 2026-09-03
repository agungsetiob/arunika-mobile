import { useNavigation, useFocusEffect } from "@react-navigation/native";
import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  FlatList,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";
import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator";
import { Plus, Search, Bell, X, Zap, AlertTriangle, MapPin } from "lucide-react-native";
import { useAuthStore } from "../../store/authStore";
import apiClient from "../../api/client";
import CustomAlert, { AlertType } from "../../components/CustomAlert";

export default function HomeScreen() {
  const navigation = useNavigation<any>();
  const user = useAuthStore((state) => state.user);
  const [unreadCount, setUnreadCount] = useState(0);

  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [nearbyLamps, setNearbyLamps] = useState<any[]>([]);

  const [selectedLamp, setSelectedLamp] = useState<any>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const mapRef = useRef<MapView>(null);

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

  const filteredLamps = nearbyLamps.filter(
    (lamp) =>
      lamp.code_tiang?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lamp.alamat_lengkap?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setErrorMsg(
          "Izin akses lokasi ditolak. Aplikasi butuh GPS untuk fitur pelaporan.",
        );
        return;
      }

      let loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      setLocation(loc);

      try {
        const response = await apiClient.get("/lamp-posts/nearby", {
          params: {
            lat: loc.coords.latitude,
            lng: loc.coords.longitude,
            radius: 2000,
          },
        });
        setNearbyLamps(response.data.data);
      } catch (error) {
        console.log("Gagal memuat tiang terdekat", error);
      }
    })();
  }, []);

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

  const handleLapor = async (lampId?: number) => {
    if (!location) {
      showAlert("Tunggu Sebentar", "Sedang melacak lokasi Anda. Pastikan GPS perangkat aktif.", "info");
      return;
    }

    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      showAlert(
        "Izin Ditolak",
        "Dibutuhkan akses kamera untuk mengambil foto kerusakan fasilitas.",
        "error"
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: false,
      quality: 0.8,
    });

    if (!result.canceled) {
      const manipResult = await ImageManipulator.manipulateAsync(
        result.assets[0].uri,
        [{ resize: { width: 1080 } }],
        { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG },
      );

      navigation.navigate("LaporForm", {
        photoUri: manipResult.uri,
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        lamp_id: lampId,
      });
    }
  };

  return (
    <View className="flex-1 bg-slate-50">

      <View
        className="bg-orange-600 pt-14 pb-6 px-6 rounded-b-3xl shadow-lg"
        style={{
          zIndex: 50,
          elevation: 50,
        }}
      >
        {/* Header top */}
        <View className="flex-row justify-between items-center mb-5">
          <View>
            <Text className="text-orange-200 text-sm font-medium">
              Selamat datang,
            </Text>

            <Text className="text-white text-xl font-bold">
              {user?.name || "Warga"}
            </Text>
          </View>

          <TouchableOpacity 
            onPress={() => navigation.navigate('Notifications')}
            className="bg-white/20 p-2 rounded-full relative"
          >
            <Bell size={24} color="white" />

            {unreadCount > 0 && (
              <View className="absolute top-1.5 right-1.5 bg-red-500 w-3 h-3 rounded-full border-2 border-orange-600" />
            )}
          </TouchableOpacity>
        </View>

        <View
          className="relative"
          style={{
            zIndex: 100,
            elevation: 100,
          }}
        >
          {/* Search input */}
          <View className="bg-white flex-row items-center px-4 mb-1 rounded-3xl shadow-sm h-12">
            <Search size={20} color="#94a3b8" />

            <TextInput
              className="flex-1 ml-3 text-slate-700 font-medium h-full"
              placeholder="Cari kode tiang atau jalan..."
              placeholderTextColor="#94a3b8"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />

            {searchQuery.length > 0 && (
              <TouchableOpacity
                onPress={() => setSearchQuery("")}
                className="p-1"
              >
                <X size={18} color="#94a3b8" />
              </TouchableOpacity>
            )}
          </View>

          {/* Dropdown Pencarian */}
          {searchQuery.length > 0 && (
            <View
              className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden"
              style={{
                zIndex: 999,
                elevation: 999,
                maxHeight: 260,
              }}
            >
              <FlatList
                data={filteredLamps}
                keyExtractor={(item) => item.id.toString()}
                keyboardShouldPersistTaps="handled"
                nestedScrollEnabled
                renderItem={({ item }) => (
                  <TouchableOpacity
                    activeOpacity={0.7}
                    className="px-4 py-3 border-b border-slate-100 flex-row items-center"
                    onPress={() => {
                      setSearchQuery("");
                      setSelectedLamp(item);

                      mapRef.current?.animateToRegion(
                        {
                          latitude: parseFloat(item.lat),
                          longitude: parseFloat(item.lng),
                          latitudeDelta: 0.005,
                          longitudeDelta: 0.005,
                        },
                        1000,
                      );
                    }}
                  >
                    {/* Icon */}
                    <View
                      className={`h-9 w-9 rounded-full items-center justify-center mr-3 ${
                        item.status_lampu === "active"
                          ? "bg-emerald-100"
                          : item.status_lampu === "broken"
                            ? "bg-red-100"
                            : "bg-yellow-100"
                      }`}
                    >
                      <Zap
                        size={15}
                        color={
                          item.status_lampu === "active"
                            ? "#10b981"
                            : item.status_lampu === "broken"
                              ? "#ef4444"
                              : "#eab308"
                        }
                      />
                    </View>

                    {/* Detail */}
                    <View className="flex-1">
                      <Text className="text-slate-800 font-bold">
                        {item.code_tiang}
                      </Text>

                      <Text
                        className="text-slate-500 text-xs"
                        numberOfLines={1}
                      >
                        {item.alamat_lengkap}
                      </Text>
                    </View>
                  </TouchableOpacity>
                )}
                ListEmptyComponent={
                  <View className="px-4 py-6">
                    <Text className="text-center text-slate-500 text-sm">
                      Tiang tidak ditemukan.
                    </Text>
                  </View>
                }
              />
            </View>
          )}
        </View>
      </View>

      {!location ? (
        <View className="flex-1 items-center justify-center bg-slate-100 -mt-8" style={{ zIndex: 1 }}>
          <ActivityIndicator size="large" color="#ea580c" />
          <Text className="text-slate-500 mt-4 font-medium">
            {errorMsg || "Mendapatkan titik koordinat..."}
          </Text>
        </View>
      ) : (
        <View className="flex-1 relative -mt-8" style={{ zIndex: 1 }}>
          <MapView
            ref={mapRef}
            className="flex-1"
            initialRegion={{
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            }}
            showsUserLocation={true}
            showsMyLocationButton={false}
            onPress={() => setSelectedLamp(null)}
          >
            {nearbyLamps.map((lamp) => (
              <Marker
                key={lamp.id}
                coordinate={{
                  latitude: parseFloat(lamp.lat),
                  longitude: parseFloat(lamp.lng),
                }}
                pinColor={
                  lamp.status_lampu === "active"
                    ? "#10b981"
                    : lamp.status_lampu === "broken"
                      ? "#ef4444"
                      : "#eab308"
                }
                onPress={(e) => {
                  e.stopPropagation();
                  setSelectedLamp(lamp);
                }}
              />
            ))}
          </MapView>

          {selectedLamp && (
            <View className="absolute bottom-6 left-4 right-4 bg-white rounded-3xl p-5 shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-slate-100">
              <TouchableOpacity
                onPress={() => setSelectedLamp(null)}
                className="absolute top-4 right-4 z-10 bg-slate-100 p-1.5 rounded-full"
              >
                <X size={18} color="#64748b" />
              </TouchableOpacity>

              <View className="flex-row mb-3 pr-8">
                <View
                  className={`h-12 w-12 rounded-2xl items-center justify-center mr-4 ${
                    selectedLamp.status_lampu === "active"
                      ? "bg-emerald-100"
                      : selectedLamp.status_lampu === "broken"
                        ? "bg-red-100"
                        : "bg-yellow-100"
                  }`}
                >
                  <Zap
                    size={24}
                    color={
                      selectedLamp.status_lampu === "active"
                        ? "#10b981"
                        : selectedLamp.status_lampu === "broken"
                          ? "#ef4444"
                          : "#eab308"
                    }
                  />
                </View>

                <View className="flex-1">
                  <Text className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">
                    {selectedLamp.type.replace("_", " ")}
                  </Text>

                  <Text className="text-slate-800 text-lg font-extrabold">
                    {selectedLamp.code_tiang}
                  </Text>
                </View>
              </View>

              <View className="flex-row items-center mb-4">
                <View
                  className={`px-2.5 py-1 rounded-md ${
                    selectedLamp.status_lampu === "active"
                      ? "bg-emerald-100"
                      : selectedLamp.status_lampu === "broken"
                        ? "bg-red-100"
                        : "bg-yellow-100"
                  }`}
                >
                  <Text
                    className={`text-xs font-bold uppercase tracking-wider ${
                      selectedLamp.status_lampu === "active"
                        ? "text-emerald-700"
                        : selectedLamp.status_lampu === "broken"
                          ? "text-red-700"
                          : "text-yellow-700"
                    }`}
                  >
                    Status: {selectedLamp.status_lampu}
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                onPress={() => handleLapor(selectedLamp.id)}
                className="bg-orange-600 h-12 rounded-xl flex-row items-center justify-center shadow-lg shadow-orange-600/30"
              >
                <AlertTriangle color="white" size={18} />

                <Text className="text-white font-bold ml-2">
                  Lapor Kerusakan Tiang Ini
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {!selectedLamp && (
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => handleLapor()}
              className="absolute bottom-6 self-center bg-orange-500 flex-row items-center px-6 py-4 rounded-full shadow-lg shadow-orange-500/40"
            >
              <Plus color="white" size={24} strokeWidth={3} />

              <Text className="text-white font-extrabold text-lg ml-2 tracking-wide">
                LAPOR SEKARANG
              </Text>
            </TouchableOpacity>
          )}
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