import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useAuth } from '../context/AuthContext';

const DashboardScreen = () => {
  const { user, logout } = useAuth();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.logo}>ZENITH</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.welcome}>Bienvenido, {user?.fullName || 'Usuario'}!</Text>
        <Text style={styles.subtitle}>Dashboard placeholder</Text>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Balance Total</Text>
          <Text style={styles.cardAmount}>$0.00</Text>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={logout}>
          <Text style={styles.logoutButtonText}>Cerrar Sesión</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    padding: 24,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a4a',
  },
  logo: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#00C2FF',
    letterSpacing: 4,
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  welcome: {
    fontSize: 24,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#888',
    marginBottom: 40,
  },
  card: {
    backgroundColor: '#1a1a2e',
    borderWidth: 1,
    borderColor: '#2a2a4a',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    alignItems: 'center',
    marginBottom: 24,
  },
  cardTitle: {
    fontSize: 16,
    color: '#888',
    marginBottom: 8,
  },
  cardAmount: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#00C2FF',
  },
  logoutButton: {
    backgroundColor: '#1a1a2e',
    borderWidth: 1,
    borderColor: '#ff4444',
    borderRadius: 12,
    padding: 16,
    width: '100%',
    alignItems: 'center',
  },
  logoutButtonText: {
    color: '#ff4444',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default DashboardScreen;
