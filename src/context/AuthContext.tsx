import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, SavedAddress } from '../types';
import {
  signUpWithSupabase,
  registerCustomerAccountWithLocation,
  signInWithSupabase,
  signOutWithSupabase,
  resetPasswordWithSupabase,
  updatePasswordWithSupabase,
  updateUserProfileInDB,
  updateAvatarInDB,
  syncAddressesToSupabase,
  resendVerificationEmailWithSupabase,
  getSupabaseClient,
  uploadProductImageToSupabaseStorage,
} from '../lib/supabase';

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  rememberMe: boolean;
  setRememberMe: (val: boolean) => void;
  isSupabaseConnected: boolean;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<{ userProfile: UserProfile | null; error: string | null }>;
  register: (
    email: string,
    password: string,
    fullName: string,
    phone?: string,
    district?: string,
    address?: string
  ) => Promise<{ userProfile: UserProfile | null; error: string | null; needsEmailVerification: boolean }>;
  registerWithLocationDetails: (data: {
    firstName: string;
    lastName: string;
    fullName: string;
    phone: string;
    email?: string;
    password?: string;
    province: string;
    district: string;
    municipality: string;
    wardNumber: string;
    areaLocality: string;
    street: string;
    postalCode: string;
    fullDeliveryAddress: string;
    latitude?: number;
    longitude?: number;
    gpsAccuracy?: number;
    registrationDate: string;
    preferredLanguage: string;
    themePreference: string;
  }) => Promise<{ userProfile: UserProfile | null; error: string | null; needsEmailVerification: boolean }>;
  logout: () => Promise<void>;
  forgotPassword: (email: string) => Promise<{ success: boolean; error: string | null }>;
  changePassword: (newPassword: string) => Promise<{ success: boolean; error: string | null }>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<{ userProfile: UserProfile | null; error: string | null }>;
  updateAvatar: (fileOrUrl: File | string) => Promise<{ avatarUrl: string | null; error: string | null }>;
  savedAddresses: SavedAddress[];
  addAddress: (addr: Omit<SavedAddress, 'id'>) => Promise<void>;
  updateAddress: (id: string, addr: Partial<SavedAddress>) => Promise<void>;
  deleteAddress: (id: string) => Promise<void>;
  setDefaultAddress: (id: string) => Promise<void>;
  resendVerificationEmail: (email: string) => Promise<{ success: boolean; error: string | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('manas_traders_user') || sessionStorage.getItem('manas_traders_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [loading, setLoading] = useState<boolean>(true);
  const [rememberMe, setRememberMe] = useState<boolean>(() => {
    return localStorage.getItem('manas_traders_remember_me') !== 'false';
  });

  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>(() => {
    if (user?.savedAddresses && user.savedAddresses.length > 0) {
      return user.savedAddresses;
    }
    // Default initial Nepalese addresses if user has a default address
    if (user?.address) {
      return [
        {
          id: 'addr-default',
          label: 'Home',
          fullName: user.fullName,
          phone: user.phone || '9848500665',
          district: user.district || 'Kailali',
          address: user.address,
          isDefault: true,
        },
      ];
    }
    return [
      {
        id: 'addr-1',
        label: 'Home (Tikapur)',
        fullName: 'Binod Bhandari',
        phone: '9848500665',
        district: 'Kailali',
        address: 'Tikapur Ward No. 1, Kailali, Sudurpashchim',
        isDefault: true,
      },
      {
        id: 'addr-2',
        label: 'Store / Shop',
        fullName: 'Manas Traders Kirana',
        phone: '9824600477',
        district: 'Kailali',
        address: 'Main Market, Tikapur, Kailali',
        isDefault: false,
      },
    ];
  });

  // Sync session & user state on mount
  useEffect(() => {
    const supabase = getSupabaseClient();
    if (supabase) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          const meta = session.user.user_metadata || {};
          const usr: UserProfile = {
            id: session.user.id,
            email: session.user.email || '',
            fullName: meta.full_name || session.user.email?.split('@')[0] || 'Customer',
            phone: meta.phone || '',
            district: meta.district || 'Kailali',
            address: meta.address || '',
            role: (meta.role as 'admin' | 'customer') || 'customer',
            avatarUrl: meta.avatar_url || meta.picture,
            emailVerified: session.user.email_confirmed_at != null,
            savedAddresses: meta.saved_addresses || [],
          };
          setUser(usr);
          if (usr.savedAddresses && usr.savedAddresses.length > 0) {
            setSavedAddresses(usr.savedAddresses);
          }
        }
        setLoading(false);
      });

      const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (session?.user) {
          const meta = session.user.user_metadata || {};
          const usr: UserProfile = {
            id: session.user.id,
            email: session.user.email || '',
            fullName: meta.full_name || session.user.email?.split('@')[0] || 'Customer',
            phone: meta.phone || '',
            district: meta.district || 'Kailali',
            address: meta.address || '',
            role: (meta.role as 'admin' | 'customer') || 'customer',
            avatarUrl: meta.avatar_url || meta.picture,
            emailVerified: session.user.email_confirmed_at != null,
            savedAddresses: meta.saved_addresses || [],
          };
          setUser(usr);
          if (usr.savedAddresses && usr.savedAddresses.length > 0) {
            setSavedAddresses(usr.savedAddresses);
          }

          if (rememberMe) {
            localStorage.setItem('manas_traders_user', JSON.stringify(usr));
          } else {
            sessionStorage.setItem('manas_traders_user', JSON.stringify(usr));
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          localStorage.removeItem('manas_traders_user');
          sessionStorage.removeItem('manas_traders_user');
        }
        setLoading(false);
      });

      return () => {
        authListener.subscription.unsubscribe();
      };
    } else {
      setLoading(false);
    }
  }, [rememberMe]);

  // Login
  const login = async (email: string, password: string, remMe: boolean = true) => {
    setRememberMe(remMe);
    localStorage.setItem('manas_traders_remember_me', remMe ? 'true' : 'false');

    const result = await signInWithSupabase(email, password);
    if (result.userProfile) {
      setUser(result.userProfile);
      if (remMe) {
        localStorage.setItem('manas_traders_user', JSON.stringify(result.userProfile));
      } else {
        sessionStorage.setItem('manas_traders_user', JSON.stringify(result.userProfile));
      }
    }
    return result;
  };

  // Register
  const register = async (
    email: string,
    password: string,
    fullName: string,
    phone: string = '',
    district: string = 'Kailali',
    address: string = ''
  ) => {
    const result = await signUpWithSupabase(email, password, fullName, phone, district, address);
    if (result.userProfile) {
      setUser(result.userProfile);
      localStorage.setItem('manas_traders_user', JSON.stringify(result.userProfile));
    }
    return result;
  };

  // Register with full location & GPS metadata
  const registerWithLocationDetails = async (data: {
    firstName: string;
    lastName: string;
    fullName: string;
    phone: string;
    email?: string;
    password?: string;
    province: string;
    district: string;
    municipality: string;
    wardNumber: string;
    areaLocality: string;
    street: string;
    postalCode: string;
    fullDeliveryAddress: string;
    latitude?: number;
    longitude?: number;
    gpsAccuracy?: number;
    registrationDate: string;
    preferredLanguage: string;
    themePreference: string;
  }) => {
    const result = await registerCustomerAccountWithLocation(data);
    if (result.userProfile) {
      setUser(result.userProfile);
      localStorage.setItem('manas_traders_user', JSON.stringify(result.userProfile));
      if (result.userProfile.savedAddresses && result.userProfile.savedAddresses.length > 0) {
        setSavedAddresses(result.userProfile.savedAddresses);
      }
    }
    return result;
  };

  // Logout
  const logout = async () => {
    await signOutWithSupabase();
    setUser(null);
    localStorage.removeItem('manas_traders_user');
    sessionStorage.removeItem('manas_traders_user');
  };

  // Forgot Password
  const forgotPassword = async (email: string) => {
    return resetPasswordWithSupabase(email);
  };

  // Change Password
  const changePassword = async (newPassword: string) => {
    return updatePasswordWithSupabase(newPassword);
  };

  // Resend Email Verification
  const resendVerificationEmail = async (email: string) => {
    return resendVerificationEmailWithSupabase(email);
  };

  // Update Profile
  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return { userProfile: null, error: 'Not logged in' };
    const result = await updateUserProfileInDB(user.id, updates);
    if (result.userProfile) {
      setUser(result.userProfile);
    }
    return result;
  };

  // Update Avatar
  const updateAvatar = async (fileOrUrl: File | string) => {
    if (!user) return { avatarUrl: null, error: 'Not logged in' };
    let url = typeof fileOrUrl === 'string' ? fileOrUrl : '';
    if (fileOrUrl instanceof File) {
      url = await uploadProductImageToSupabaseStorage(fileOrUrl);
    }

    if (url) {
      await updateAvatarInDB(user.id, url);
      setUser((prev) => (prev ? { ...prev, avatarUrl: url } : null));
      return { avatarUrl: url, error: null };
    }
    return { avatarUrl: null, error: 'Failed to upload profile picture' };
  };

  // Address Management
  const persistAddresses = async (newAddresses: SavedAddress[]) => {
    setSavedAddresses(newAddresses);
    if (user?.id) {
      await syncAddressesToSupabase(user.id, newAddresses);
      setUser((prev) => (prev ? { ...prev, savedAddresses: newAddresses } : null));
    }
  };

  const addAddress = async (addr: Omit<SavedAddress, 'id'>) => {
    const newAddr: SavedAddress = {
      ...addr,
      id: 'addr-' + Date.now(),
    };
    let updated = [...savedAddresses];
    if (newAddr.isDefault) {
      updated = updated.map((a) => ({ ...a, isDefault: false }));
    }
    updated.push(newAddr);
    await persistAddresses(updated);
  };

  const updateAddress = async (id: string, addr: Partial<SavedAddress>) => {
    let updated = savedAddresses.map((a) => {
      if (a.id === id) {
        return { ...a, ...addr };
      }
      if (addr.isDefault) {
        return { ...a, isDefault: false };
      }
      return a;
    });
    await persistAddresses(updated);
  };

  const deleteAddress = async (id: string) => {
    const updated = savedAddresses.filter((a) => a.id !== id);
    if (updated.length > 0 && !updated.some((a) => a.isDefault)) {
      updated[0].isDefault = true;
    }
    await persistAddresses(updated);
  };

  const setDefaultAddress = async (id: string) => {
    const updated = savedAddresses.map((a) => ({
      ...a,
      isDefault: a.id === id,
    }));
    await persistAddresses(updated);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        rememberMe,
        setRememberMe,
        isSupabaseConnected: !!getSupabaseClient(),
        login,
        register,
        registerWithLocationDetails,
        logout,
        forgotPassword,
        changePassword,
        updateProfile,
        updateAvatar,
        savedAddresses,
        addAddress,
        updateAddress,
        deleteAddress,
        setDefaultAddress,
        resendVerificationEmail,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
