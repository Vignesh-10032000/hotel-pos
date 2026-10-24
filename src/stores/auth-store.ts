import { create } from 'zustand';
import { UserAccount } from '../types';

interface AuthState {
  user: UserAccount | null;
  isAuthenticated: boolean;
  login: (username: string, pinOrPassword?: string) => Promise<boolean>;
  logout: () => void;
  setUser: (user: UserAccount) => void;
}

export const DEFAULT_USER: UserAccount = {
  id: 'usr_admin',
  username: 'admin',
  name: 'Store Admin',
  role: 'Owner',
  pin: '1234',
  isActive: true,
};

export const useAuthStore = create<AuthState>((set) => ({
  user: DEFAULT_USER,
  isAuthenticated: true, // Auto-logged in for demo convenience, but supports /login flow
  login: async (username, pinOrPassword) => {
    const u = username.toLowerCase().trim();
    if (u === 'admin' || u === 'owner' || (!pinOrPassword && u === 'admin')) {
      set({ user: DEFAULT_USER, isAuthenticated: true });
      return true;
    }
    if (u === 'cashier' || u === 'karthik') {
      const cashierUser: UserAccount = {
        id: 'usr_karthik',
        username: 'karthik',
        name: 'Karthik',
        role: 'Cashier',
        pin: '1111',
        isActive: true,
      };
      set({ user: cashierUser, isAuthenticated: true });
      return true;
    }
    // Fail for unauthorized demo users
    return false;
  },
  logout: () => {
    set({ user: null, isAuthenticated: false });
  },
  setUser: (user) => {
    set({ user, isAuthenticated: true });
  },
}));
