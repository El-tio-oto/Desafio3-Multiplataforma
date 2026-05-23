import React, { createContext, useState, useContext, useEffect } from 'react';
import { supabase } from '../config/supabaseClient';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Escuchar cambios en el estado de autenticación de Supabase
  useEffect(() => {
    // Obtener sesión inicial
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email,
          fullName: session.user.user_metadata?.full_name || 'Usuario Zenith',
        });
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });

    // Suscribirse a cambios futuros
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email,
          fullName: session.user.user_metadata?.full_name || 'Usuario Zenith',
        });
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email, password) => {
    try {
      if (!email || !password) {
        throw new Error('Por favor completa todos los campos');
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const register = async (fullName, email, password, confirmPassword) => {
    try {
      if (!fullName || !email || !password || !confirmPassword) {
        throw new Error('Por favor completa todos los campos');
      }

      if (password !== confirmPassword) {
        throw new Error('Las contraseñas no coinciden');
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (error) throw error;

      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const logout = async () => {
    try {
      // Logout de Supabase
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      // Limpiar datos de la aplicación (transacciones, cuentas, presupuestos)
      await AsyncStorage.removeItem('zenith_transactions');
      await AsyncStorage.removeItem('zenith_accounts');
      await AsyncStorage.removeItem('zenith_budgets');
    } catch (error) {
      console.error('Error cerrando sesión:', error);
    }
  };

  const value = {
    user,
    session,
    token: session?.access_token || null,
    isLoading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};
