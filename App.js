import 'react-native-gesture-handler'; // Importante para la navegación
import 'react-native-url-polyfill/auto'; // Necesario para Supabase
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from './src/context/AuthContext';
import { DataProvider } from './src/context/DataContext';
import AppNavigator from './src/navigation/AppNavigator';
import { enableScreens } from 'react-native-screens';

enableScreens(); // Esto optimiza la navegación y evita pantallas blancas

export default function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <StatusBar style="light" backgroundColor="#000000" />
        <AppNavigator />
      </DataProvider>
    </AuthProvider>
  );
}
