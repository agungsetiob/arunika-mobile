import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function registerForPushNotificationsAsync() {
  let token;

  // Notifikasi push hanya bekerja di perangkat asli (fisik), bukan emulator biasa
  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    // Jika belum ada izin, munculkan pop-up minta izin
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
      console.log('Gagal mendapatkan izin push notification!');
      return null;
    }
    
    // AMBIL TOKEN FCM ASLI (Bukan token Expo)
    try {
        const tokenData = await Notifications.getDevicePushTokenAsync();
        token = tokenData.data;
        console.log('FCM Token Android:', token);
    } catch (error) {
        console.log('Gagal mengambil Device Token', error);
    }
  } else {
    console.log('Anda harus menggunakan Perangkat Fisik (HP) untuk Push Notifications');
  }

  // Pengaturan tambahan khusus Android
  if (Platform.OS === 'android') {
    Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#ea580c',
    });
  }

  return token;
}