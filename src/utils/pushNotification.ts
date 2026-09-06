import * as Device from 'expo-device';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import { Platform } from 'react-native';

export async function registerForPushNotificationsAsync() {
  if (Constants.executionEnvironment === ExecutionEnvironment.StoreClient) {
    console.log('Mode Expo Go terdeteksi: Fitur push notification dinonaktifkan sementara.');
    return null;
  }

  if (!Device.isDevice) {
    console.log('Anda harus menggunakan Perangkat Fisik (HP) untuk Push Notifications');
    return null;
  }

  let token = null;

  try {
    const Notifications = require('expo-notifications');

    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
      console.log('Gagal mendapatkan izin push notification!');
      return null;
    }
    
    const tokenData = await Notifications.getDevicePushTokenAsync();
    token = tokenData.data;
    console.log(`Device Push Token (${Platform.OS.toUpperCase()}):`, token);

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#ea580c',
      });
    }

  } catch (error) {
    console.log('Gagal memproses Push Notification:', error);
  }

  return token;
}