import React, { createContext, useState, useContext, useEffect } from 'react';
import { getProfile, updateThemePreference } from '../services/supabaseService';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ThemeContext = createContext(null);

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  // Cargar tema preferido al iniciar
  useEffect(() => {
    loadThemePreference();
  }, []);

  const loadThemePreference = async () => {
    try {
      // 1. Intentar cargar de AsyncStorage primero (muy rápido)
      const localTheme = await AsyncStorage.getItem('@theme_preference');
      if (localTheme) {
        setIsDarkMode(localTheme === 'dark');
      }

      // 2. Sincronizar con el perfil de Supabase en segundo plano
      const result = await getProfile();
      if (result.success && result.data) {
        const themePreference = result.data.theme_preference || 'dark';
        // Solo actualizar si es diferente al local (o si no había local)
        if (!localTheme || localTheme !== themePreference) {
          setIsDarkMode(themePreference === 'dark');
          await AsyncStorage.setItem('@theme_preference', themePreference);
        }
      }
    } catch (error) {
      console.error('Error cargando tema:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleTheme = async () => {
    try {
      const newTheme = !isDarkMode;
      const themeString = newTheme ? 'dark' : 'light';
      setIsDarkMode(newTheme);
      // Guardar localmente
      await AsyncStorage.setItem('@theme_preference', themeString);
      // Guardar en la nube
      await updateThemePreference(themeString);
    } catch (error) {
      console.error('Error guardando tema:', error);
    }
  };

  const setTheme = async (theme) => {
    try {
      const isDark = theme === 'dark';
      setIsDarkMode(isDark);
      // Guardar localmente
      await AsyncStorage.setItem('@theme_preference', theme);
      // Guardar en la nube
      await updateThemePreference(theme);
    } catch (error) {
      console.error('Error estableciendo tema:', error);
    }
  };

  // Colores para dark mode
  const darkColors = {
    background: '#0a0a0f',
    surface: '#1a1a2e',
    surfaceLight: '#2a2a4a',
    text: '#ffffff',
    textSecondary: '#888888',
    textTertiary: '#666666',
    primary: '#00C2FF',
    success: '#4ECDC4',
    warning: '#FF9900',
    error: '#ff4444',
    border: '#2a2a4a',
    inputBackground: '#0a0a0f',
  };

  // Colores para light mode
  const lightColors = {
    background: '#f5f5f5',
    surface: '#ffffff',
    surfaceLight: '#e0e0e0',
    text: '#1a1a1a',
    textSecondary: '#666666',
    textTertiary: '#888888',
    primary: '#0066cc',
    success: '#00aa66',
    warning: '#ff8800',
    error: '#cc0000',
    border: '#e0e0e0',
    inputBackground: '#ffffff',
  };

  const colors = isDarkMode ? darkColors : lightColors;

  const value = {
    isDarkMode,
    colors,
    toggleTheme,
    setTheme,
    isLoading,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme debe ser usado dentro de un ThemeProvider');
  }
  return context;
};
