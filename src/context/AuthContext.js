import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Cargar sesión persistente al iniciar
  useEffect(() => {
    loadSession();
  }, []);

  const loadSession = async () => {
    try {
      const storedUser = await AsyncStorage.getItem('zenith_user');
      const storedToken = await AsyncStorage.getItem('zenith_token');
      
      if (storedUser && storedToken) {
        setUser(JSON.parse(storedUser));
        setToken(storedToken);
      }
    } catch (error) {
      console.error('Error cargando sesión:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      // Simulación de autenticación
      // En producción, aquí iría la llamada a tu API
      if (!email || !password) {
        throw new Error('Por favor completa todos los campos');
      }

      // Validación básica de email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        throw new Error('Email inválido');
      }

      // Simulación de login exitoso
      const mockUser = {
        id: '1',
        email: email,
        fullName: 'Usuario Zenith',
      };

      const mockToken = 'mock_jwt_token_' + Date.now();

      await AsyncStorage.setItem('zenith_user', JSON.stringify(mockUser));
      await AsyncStorage.setItem('zenith_token', mockToken);

      setUser(mockUser);
      setToken(mockToken);

      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const register = async (fullName, email, password, confirmPassword) => {
    try {
      // Validaciones
      if (!fullName || !email || !password || !confirmPassword) {
        throw new Error('Por favor completa todos los campos');
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        throw new Error('Email inválido');
      }

      if (password.length < 6) {
        throw new Error('La contraseña debe tener al menos 6 caracteres');
      }

      if (password !== confirmPassword) {
        throw new Error('Las contraseñas no coinciden');
      }

      // Simulación de registro exitoso
      const mockUser = {
        id: '1',
        email: email,
        fullName: fullName,
      };

      const mockToken = 'mock_jwt_token_' + Date.now();

      await AsyncStorage.setItem('zenith_user', JSON.stringify(mockUser));
      await AsyncStorage.setItem('zenith_token', mockToken);

      setUser(mockUser);
      setToken(mockToken);

      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('zenith_user');
      await AsyncStorage.removeItem('zenith_token');
      setUser(null);
      setToken(null);
    } catch (error) {
      console.error('Error cerrando sesión:', error);
    }
  };

  const value = {
    user,
    token,
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
