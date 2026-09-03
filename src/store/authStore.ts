import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface User {
  id: number;
  name: string;
  phone: string;
  nik: string;
  email: string;
}

interface AuthState {
  user: User | null;
  role: 'warga' | 'petugas' | 'admin' | null;
  token: string | null;
  isLoading: boolean;
  login: (userData: User, userRole: 'warga' | 'petugas', userToken: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  setUser: (user: any) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  role: null,
  token: null,
  isLoading: true,
  setUser: (user) => set({ user }),

  login: async (userData, userRole, userToken) => {
    await AsyncStorage.setItem('userToken', userToken);
    await AsyncStorage.setItem('userData', JSON.stringify(userData));
    await AsyncStorage.setItem('userRole', userRole);
    
    set({ user: userData, role: userRole, token: userToken });
  },

  logout: async () => {
    await AsyncStorage.multiRemove(['userToken', 'userData', 'userRole']);
    set({ user: null, role: null, token: null });
  },

  checkAuth: async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const role = await AsyncStorage.getItem('userRole') as 'warga' | 'petugas' | null;
      const userStr = await AsyncStorage.getItem('userData');
      
      if (token && userStr && role) {
        set({ token, role, user: JSON.parse(userStr), isLoading: false });
      } else {
        set({ isLoading: false });
      }
    } catch (e) {
      set({ isLoading: false });
    }
  },
}));