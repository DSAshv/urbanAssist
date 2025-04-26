import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { User, AuthState } from '../types';
import { API_URL } from '../config';

interface AuthContextProps {
  authState: AuthState;
  login: (email: string, password: string, mfaToken?: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  setupMFA: () => Promise<{ secret: string; qrCode: string }>;
  verifyAndEnableMFA: (token: string) => Promise<void>;
  disableMFA: (token: string, password: string) => Promise<void>;
  updateUserInfo: (user: User) => void;
}

interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
}

const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  loading: true,
  error: null
};

const AuthContext = createContext<AuthContextProps>({
  authState: initialState,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
  setupMFA: async () => ({ secret: '', qrCode: '' }),
  verifyAndEnableMFA: async () => {},
  disableMFA: async () => {},
  updateUserInfo: () => {}
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>(initialState);

  // Configure axios
  axios.defaults.withCredentials = true;

  // Set up interceptor for 401 responses
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response && error.response.status === 401) {
          // If not on auth-related pages, try to refresh token
          if (
            !window.location.pathname.includes('/login') &&
            !window.location.pathname.includes('/register')
          ) {
            try {
              await axios.post(`${API_URL}/api/auth/refresh-token`);
              return axios(error.config);
            } catch (refreshError) {
              // If refresh fails, log out
              setAuthState({
                isAuthenticated: false,
                user: null,
                loading: false,
                error: 'Session expired. Please log in again.'
              });
              
              // Redirect to login if needed
              if (!window.location.pathname.includes('/login')) {
                window.location.href = '/login';
              }
            }
          }
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, []);

  // Load user on mount
  useEffect(() => {
    const loadUser = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/auth/me`);
        setAuthState({
          isAuthenticated: true,
          user: res.data.data.user,
          loading: false,
          error: null
        });
      } catch (error) {
        setAuthState({
          isAuthenticated: false,
          user: null,
          loading: false,
          error: null
        });
      }
    };

    loadUser();
  }, []);

  // Login function
  const login = async (email: string, password: string, mfaToken?: string) => {
    try {
      setAuthState({ ...authState, loading: true, error: null });
      
      const res = await axios.post(`${API_URL}/api/auth/login`, {
        email,
        password,
        mfaToken
      });
      
      // Check if MFA is required
      if (res.data.mfaRequired) {
        setAuthState({
          isAuthenticated: false,
          user: null,
          loading: false,
          error: null,
          mfaRequired: true
        });
        
        return;
      }
      
      setAuthState({
        isAuthenticated: true,
        user: res.data.data.user,
        loading: false,
        error: null
      });
      
      toast.success('Login successful');
    } catch (error) {
      const errorMessage = 
        error.response?.data?.message || 
        'Login failed. Please check your credentials.';
      
      setAuthState({
        ...authState,
        loading: false,
        error: errorMessage
      });
      
      toast.error(errorMessage);
    }
  };

  // Register function
  const register = async (userData: RegisterData) => {
    try {
      setAuthState({ ...authState, loading: true, error: null });
      
      const res = await axios.post(`${API_URL}/api/auth/register`, userData);
      
      setAuthState({
        isAuthenticated: true,
        user: res.data.data.user,
        loading: false,
        error: null
      });
      
      toast.success('Registration successful');
    } catch (error) {
      const errorMessage = 
        error.response?.data?.message || 
        'Registration failed. Please try again.';
      
      setAuthState({
        ...authState,
        loading: false,
        error: errorMessage
      });
      
      toast.error(errorMessage);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await axios.post(`${API_URL}/api/auth/logout`);
      
      setAuthState({
        isAuthenticated: false,
        user: null,
        loading: false,
        error: null
      });
      
      toast.success('Logout successful');
    } catch (error) {
      toast.error('Logout failed. Please try again.');
    }
  };

  // Setup MFA
  const setupMFA = async () => {
    try {
      const res = await axios.post(`${API_URL}/api/auth/mfa/setup`);
      return res.data.data;
    } catch (error) {
      const errorMessage = 
        error.response?.data?.message || 
        'Failed to set up MFA. Please try again.';
      
      toast.error(errorMessage);
      throw error;
    }
  };

  // Verify and enable MFA
  const verifyAndEnableMFA = async (token: string) => {
    try {
      await axios.post(`${API_URL}/api/auth/mfa/verify`, { token });
      
      // Update user info with MFA enabled
      if (authState.user) {
        setAuthState({
          ...authState,
          user: {
            ...authState.user,
            mfaEnabled: true
          }
        });
      }
      
      toast.success('MFA enabled successfully');
    } catch (error) {
      const errorMessage = 
        error.response?.data?.message || 
        'Failed to verify MFA token. Please try again.';
      
      toast.error(errorMessage);
      throw error;
    }
  };

  // Disable MFA
  const disableMFA = async (token: string, password: string) => {
    try {
      await axios.post(`${API_URL}/api/auth/mfa/disable`, { token, password });
      
      // Update user info with MFA disabled
      if (authState.user) {
        setAuthState({
          ...authState,
          user: {
            ...authState.user,
            mfaEnabled: false
          }
        });
      }
      
      toast.success('MFA disabled successfully');
    } catch (error) {
      const errorMessage = 
        error.response?.data?.message || 
        'Failed to disable MFA. Please try again.';
      
      toast.error(errorMessage);
      throw error;
    }
  };

  // Update user info
  const updateUserInfo = (user: User) => {
    setAuthState({
      ...authState,
      user,
      loading: false,
      error: null
    });
  };

  return (
    <AuthContext.Provider
      value={{
        authState,
        login,
        register,
        logout,
        setupMFA,
        verifyAndEnableMFA,
        disableMFA,
        updateUserInfo
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};