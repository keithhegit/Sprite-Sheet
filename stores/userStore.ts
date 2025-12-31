import { create } from 'zustand';
import { authService, User } from '../services/authService';

interface UserState {
  user: User | null;
  loading: boolean;
  initialized: boolean; // 标记是否已完成首次加载
  fetchUser: () => Promise<void>;
  logout: () => void;
  setUser: (user: User | null) => void;
}

export const useUserStore = create<UserState>((set) => ({
  user: null,
  loading: true,
  initialized: false,

  fetchUser: async () => {
    set({ loading: true });
    try {
      const user = await authService.getCurrentUser();
      set({ user, loading: false, initialized: true });
    } catch (error) {
      console.error('Failed to fetch user:', error);
      set({ user: null, loading: false, initialized: true });
    }
  },

  logout: () => {
    authService.logout();
    set({ user: null });
    // 不使用硬刷新，让 Router 处理导航
  },

  setUser: (user: User | null) => {
    set({ user });
  },
}));
