import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { useAuth } from '../context/AuthContext';

const DashboardScreen = ({ navigation }) => {
  const { user, logout } = useAuth();

  return (
    <SafeAreaView style={styles.container}>
      {/* Nuevo Header con Nav */}
      <View style={styles.header}>
        <Text style={styles.logo}>ZENITH</Text>
        <TouchableOpacity onPress={() => console.log('Ir a perfil')}>
          <Text style={styles.navLink}>Perfil</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <Text style={styles.welcome}>Bienvenido, {user?.fullName || 'Usuario'}!</Text>
        <Text style={styles.subtitle}>Dashboard</Text>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Balance Total</Text>
          <Text style={styles.cardAmount}>$0.00</Text>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={logout}>
          <Text style={styles.logoutButtonText}>Cerrar Sesión</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a4a',
  },
  logo: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#00C2FF',
    letterSpacing: 2,
  },
  navLink: {
    color: '#00C2FF',
    fontSize: 16,
    fontWeight: '500',
  },
  content: {
    flex: 1,
    padding: 24,
    alignItems: 'center',
  },
  welcome: {
    fontSize: 24,
    fontWeight: '600',
    color: '#fff',
    marginTop: 20,
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
    marginTop: 'auto', // Esto empuja el botón hasta abajo
  },
  logoutButtonText: {
    color: '#ff4444',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default DashboardScreen;