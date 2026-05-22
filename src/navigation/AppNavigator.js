import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useAuth } from '../context/AuthContext';

// Pantallas de Autenticación
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';

// Pantalla Principal
import DashboardScreen from '../screens/DashboardScreen';

// Pantallas nuevas de tus módulos
import AccountsListScreen from '../screens/accounts/AccountsListScreen';
import AccountFormScreen from '../screens/accounts/AccountFormScreen';
import BudgetListScreen from '../screens/budgets/BudgetListScreen';

const Stack = createNativeStackNavigator();

// Stack para usuarios NO logueados
const AuthStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: false,
      contentStyle: { backgroundColor: '#000000' },
    }}
  >
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="Register" component={RegisterScreen} />
  </Stack.Navigator>
);

// Stack para usuarios YA logueados (Aquí integras tus nuevos módulos)
const AppStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: true,
      headerStyle: { backgroundColor: '#000000' },
      headerTintColor: '#fff',
      contentStyle: { backgroundColor: '#ffffff' },
    }}
  >
    <Stack.Screen 
      name="Dashboard" 
      component={DashboardScreen} 
      options={{ title: 'Inicio' }} 
    />
    <Stack.Screen 
      name="AccountsList" 
      component={AccountsListScreen} 
      options={{ title: 'Mis Cuentas' }} 
    />
    <Stack.Screen 
      name="AccountForm" 
      component={AccountFormScreen} 
      options={{ title: 'Nueva Cuenta' }} 
    />
    <Stack.Screen 
      name="BudgetList" 
      component={BudgetListScreen} 
      options={{ title: 'Presupuestos' }} 
    />
  </Stack.Navigator>
);

const AppNavigator = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#00C2FF" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {user ? <AppStack /> : <AuthStack />}
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000',
  },
});

export default AppNavigator;