//import 'dotenv/config';

export default {
  expo: {
    name: "ARUNIKA",
    slug: "arunika-mobile",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    newArchEnabled: true,
    splash: {
      backgroundColor: "#0f172a"
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.agung.arunika",
      config: {
        googleMapsApiKey: process.env.EXPO_PUBLIC_IOS_MAPS_API_KEY
      },
      icon: "./assets/icon.png",
      googleServicesFile: "./GoogleService-Info.plist",
      infoPlist: {
        NSCameraUsageDescription: "Aplikasi membutuhkan akses kamera untuk mengambil foto kerusakan lampu jalan.",
        NSLocationWhenInUseUsageDescription: "Aplikasi membutuhkan akses lokasi untuk melaporkan posisi kerusakan lampu jalan.",
        NSUserNotificationUsageDescription: "Aplikasi membutuhkan izin notifikasi untuk mengirim laporan dan update status kerusakan lampu jalan."
      }
    },
    android: {
      package: "com.agung.arunika",
      config: {
        googleMaps: {
          apiKey: process.env.EXPO_PUBLIC_ANDROID_MAPS_API_KEY
        }
      },
      googleServicesFile: "./google-services.json",
      adaptiveIcon: {
        foregroundImage: "./assets/icon.png",
        backgroundColor: "#0f172a"
      },
      permissions: [
        "CAMERA",
        "ACCESS_FINE_LOCATION",
        "ACCESS_COARSE_LOCATION"
      ],
      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false
    },
    web: {
      favicon: "./assets/favicon.png"
    },
    extra: {
      eas: {
        projectId: "2a65cf0a-04b6-4103-b2f2-4d948d1d22bd"
      }
    },
    plugins: [
      "expo-font",
      "expo-secure-store",
      "expo-status-bar",
      [
        "expo-notifications",
        {
          icon: "./assets/logo-kemenhub.png",
          color: "#ea580c"
        }
      ]
    ]
  }
};