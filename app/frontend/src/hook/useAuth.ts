import { useState, useEffect, useContext, createContext } from 'react';
import { useRouter } from 'next/router';
import { getCookie, setCookie, deleteCookie } from 'cookies-next';
import api from '../services/api.config';

export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  group: {
    id: number;
    name: string;
    permissions: string[];
  };
  status: 'active' | 'locked';
  email_verified_at?: string;
  created_at: string;
  updated_at: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  hasPermission: (permission: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = getCookie('access_token') || localStorage.getItem('access_token');
      
      if (token) {
        // Verify token and get user data
        await refreshUser();
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      // Clear invalid tokens
      deleteCookie('access_token');
      deleteCookie('refresh_token');
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      
      const response = await api.post('/auth/login', {
        email,
        password,
      });

      const { access_token, expires_in, token_type } = response.data;

      // Store tokens
      setCookie('access_token', access_token, {
        maxAge: expires_in,
        path: '/',
      });
      localStorage.setItem('access_token', access_token);

      // Get user data
      await refreshUser();

      // Redirect to dashboard
      router.push('/dashboard');
    } catch (error: any) {
      console.error('Login failed:', error);
      throw error.response?.data || error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear all auth data
      deleteCookie('access_token');
      deleteCookie('refresh_token');
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      setUser(null);
      
      // Redirect to login
      router.push('/login');
    }
  };

  const refreshUser = async () => {
    try {
      const response = await api.get('/auth/me');
      setUser(response.data.data);
    } catch (error) {
      console.error('Failed to refresh user:', error);
      throw error;
    }
  };

  const hasPermission = (permission: string): boolean => {
    if (!user) return false;
    
    // Administrator has all permissions
    if (user.group.name === 'Administrator') {
      return true;
    }

    // Check if permission exists in user's group permissions
    return user.group.permissions.includes(permission) || 
           user.group.permissions.includes('*');
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    refreshUser,
    hasPermission,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to check authentication
export const useRequireAuth = (redirectTo: string = '/login') => {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push(redirectTo);
    }
  }, [isAuthenticated, isLoading, router, redirectTo]);

  return { isAuthenticated, isLoading };
};

// Custom hook to check permissions
export const usePermissions = () => {
  const { hasPermission, user } = useAuth();

  return {
    canViewCustomers: hasPermission('customers.view'),
    canCreateCustomers: hasPermission('customers.create'),
    canEditCustomers: hasPermission('customers.edit'),
    canViewInvoices: hasPermission('invoices.view'),
    canCreateInvoices: hasPermission('invoices.create'),
    canEditInvoices: hasPermission('invoices.edit'),
    canViewPayments: hasPermission('payments.view'),
    canCreatePayments: hasPermission('payments.create'),
    canVerifyPayments: hasPermission('payments.verify'),
    canViewReports: hasPermission('reports.view'),
    canManageServices: hasPermission('services.manage'),
    canManageTickets: hasPermission('tickets.manage'),
    canManageUsers: hasPermission('users.manage'),
    canManageSettings: hasPermission('settings.manage'),
    isAdmin: user?.group.name === 'Administrator',
    isSupervisor: user?.group.name === 'Supervisor',
    isFinance: user?.group.name === 'Finance',
    isTeller: user?.group.name === 'Teller',
    isTechnician: user?.group.name === 'Technician',
    isSupport: user?.group.name === 'Support',
  };
};