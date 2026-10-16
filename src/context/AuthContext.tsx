import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, PlanType } from '../types';
import { useToast } from './ToastContext';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  todayUsage: number;
  dailyLimit: number;
  remainingOperations: number;
  upgradeModalOpen: boolean;
  upgradeFeatureReason: string | null;
  openUpgradeModal: (reason?: string) => void;
  closeUpgradeModal: () => void;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, displayName?: string) => Promise<boolean>;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => Promise<boolean>;
  upgradePlan: (planId: PlanType, interval?: 'month' | 'year') => Promise<boolean>;
  checkCanProcess: (options: { toolType: string; fileSizeMb?: number; batchCount?: number }) => Promise<boolean>;
  recordJob: (jobData: { toolType: string; inputName: string; inputSize: number; outputSize: number; format: string }) => Promise<void>;
  refreshAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  loading: true,
  todayUsage: 0,
  dailyLimit: 10,
  remainingOperations: 10,
  upgradeModalOpen: false,
  upgradeFeatureReason: null,
  openUpgradeModal: () => {},
  closeUpgradeModal: () => {},
  login: async () => false,
  register: async () => false,
  logout: () => {},
  updateProfile: async () => false,
  upgradePlan: async () => false,
  checkCanProcess: async () => true,
  recordJob: async () => {},
  refreshAuth: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('mmx7_auth_token'));
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [todayUsage, setTodayUsage] = useState<number>(0);
  const [dailyLimit, setDailyLimit] = useState<number>(10);
  const [upgradeModalOpen, setUpgradeModalOpen] = useState<boolean>(false);
  const [upgradeFeatureReason, setUpgradeFeatureReason] = useState<string | null>(null);

  const { showToast } = useToast();

  const openUpgradeModal = (reason?: string) => {
    setUpgradeFeatureReason(reason || null);
    setUpgradeModalOpen(true);
  };

  const closeUpgradeModal = () => {
    setUpgradeModalOpen(false);
    setUpgradeFeatureReason(null);
  };

  const refreshAuth = useCallback(async () => {
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/me', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        setTodayUsage(data.todayUsage || 0);
        setDailyLimit(data.limits?.dailyLimit || 10);
      } else {
        // Token invalid
        localStorage.removeItem('mmx7_auth_token');
        setToken(null);
        setUser(null);
      }
    } catch (err) {
      console.error('Failed fetching current user:', err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    refreshAuth();
  }, [refreshAuth]);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || 'Login failed', 'error');
        return false;
      }

      localStorage.setItem('mmx7_auth_token', data.token);
      setToken(data.token);
      setUser(data.user);
      setTodayUsage(data.todayUsage || 0);
      setDailyLimit(data.limits?.dailyLimit || 10);
      showToast(`Welcome back, ${data.user.displayName}!`, 'success');
      return true;
    } catch (err: any) {
      showToast(err.message || 'Network error during login', 'error');
      return false;
    }
  };

  const register = async (email: string, password: string, displayName?: string): Promise<boolean> => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, displayName }),
      });

      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || 'Registration failed', 'error');
        return false;
      }

      localStorage.setItem('mmx7_auth_token', data.token);
      setToken(data.token);
      setUser(data.user);
      setDailyLimit(data.limits?.dailyLimit || 10);
      setTodayUsage(0);
      showToast('Account created successfully!', 'success');
      return true;
    } catch (err: any) {
      showToast(err.message || 'Registration failed', 'error');
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('mmx7_auth_token');
    setToken(null);
    setUser(null);
    setTodayUsage(0);
    setDailyLimit(10);
    showToast('Signed out successfully', 'info');
  };

  const updateProfile = async (updates: Partial<User>): Promise<boolean> => {
    if (!token) return false;
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updates),
      });

      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || 'Failed to update profile', 'error');
        return false;
      }

      setUser(data.user);
      showToast('Profile updated successfully', 'success');
      return true;
    } catch (err: any) {
      showToast(err.message || 'Profile update error', 'error');
      return false;
    }
  };

  const upgradePlan = async (planId: PlanType, interval: 'month' | 'year' = 'month'): Promise<boolean> => {
    if (!token) {
      openUpgradeModal('Please sign in or create an account to activate a Pro or Studio plan.');
      return false;
    }

    try {
      const res = await fetch('/api/checkout/simulate-test-success', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ planId, billingInterval: interval }),
      });

      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || 'Failed to activate plan', 'error');
        return false;
      }

      await refreshAuth();
      closeUpgradeModal();
      showToast(data.message || `Upgraded to ${planId.toUpperCase()}!`, 'success');
      return true;
    } catch (err: any) {
      showToast(err.message || 'Payment processing error', 'error');
      return false;
    }
  };

  const checkCanProcess = async (options: { toolType: string; fileSizeMb?: number; batchCount?: number }): Promise<boolean> => {
    try {
      const res = await fetch('/api/usage/check', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify(options),
      });

      const data = await res.json();
      if (!res.ok || !data.allowed) {
        openUpgradeModal(data.message || 'Usage quota exceeded for current plan.');
        return false;
      }

      return true;
    } catch {
      return true; // Allow safe fallback
    }
  };

  const recordJob = async (jobData: { toolType: string; inputName: string; inputSize: number; outputSize: number; format: string }) => {
    try {
      await fetch('/api/history', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify(jobData),
      });

      setTodayUsage((prev) => prev + 1);
    } catch (err) {
      console.warn('Could not record job in history:', err);
    }
  };

  const remainingOperations = Math.max(0, dailyLimit - todayUsage);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        todayUsage,
        dailyLimit,
        remainingOperations,
        upgradeModalOpen,
        upgradeFeatureReason,
        openUpgradeModal,
        closeUpgradeModal,
        login,
        register,
        logout,
        updateProfile,
        upgradePlan,
        checkCanProcess,
        recordJob,
        refreshAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
