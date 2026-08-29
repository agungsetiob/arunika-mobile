import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import apiClient from '../api/client';
import Constants from 'expo-constants';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function registerForPushNotificationsAsync() {
  let token;

  // Emulator Android BISA menerima push notification dari Expo Push Service
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#ea580c',
    });
  }

  if (Device.isDevice || Platform.OS === 'android') {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
      console.log('Izin Push Notification ditolak!');
      return null;
    }

    try {
      // PERUBAHAN DI SINI: Gunakan getExpoPushTokenAsync()
      const projectId = Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;
      
      const tokenData = await Notifications.getExpoPushTokenAsync({
        projectId: projectId || 'arunika-dev', // Ganti string ini jika tidak pakai EAS
      });
      
      token = tokenData.data;
      console.log('Expo Push Token didapatkan:', token);

      // Kirim token ke backend Laravel
      await apiClient.post('/auth/fcm-token', { fcm_token: token });

    } catch (error) {
      console.log('Gagal menarik Expo Token:', error);
    }
  }

  return token;
}