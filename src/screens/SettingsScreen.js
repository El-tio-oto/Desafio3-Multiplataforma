import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, Alert, Switch } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

const SettingsScreen = ({ navigation }) => {
  const { user, logout } = useAuth();
  const { isDarkMode, toggleTheme, colors } = useTheme();

  const handleLogout = () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro de que quieres cerrar sesión?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Cerrar Sesión',
          style: 'destructive',
          onPress: () => logout(),
        },
      ]
    );
  };

  const settingsOptions = [
    {
      id: 1,
      icon: 'person-outline',
      title: 'Perfil de Usuario',
      subtitle: 'Editar tu información personal',
      onPress: () => console.log('Perfil'),
    },
    {
      id: 2,
      icon: 'lock-closed-outline',
      title: 'Cambiar Contraseña',
      subtitle: 'Actualizar tu contraseña',
      onPress: () => console.log('Cambiar contraseña'),
    },
    {
      id: 3,
      icon: 'notifications-outline',
      title: 'Notificaciones',
      subtitle: 'Configurar alertas y notificaciones',
      onPress: () => console.log('Notificaciones'),
    },
    {
      id: 4,
      icon: 'moon-outline',
      title: 'Tema',
      subtitle: 'Modo oscuro/claro',
      isSwitch: true,
      switchValue: isDarkMode,
      onSwitchChange: toggleTheme,
    },
    {
      id: 5,
      icon: 'card-outline',
      title: 'Métodos de Pago',
      subtitle: 'Gestionar tus tarjetas y cuentas',
      onPress: () => console.log('Métodos de pago'),
    },
    {
      id: 6,
      icon: 'shield-outline',
      title: 'Seguridad',
      subtitle: 'Autenticación de dos factores',
      onPress: () => console.log('Seguridad'),
    },
    {
      id: 7,
      icon: 'help-circle-outline',
      title: 'Ayuda y Soporte',
      subtitle: 'Preguntas frecuentes y contacto',
      onPress: () => console.log('Ayuda'),
    },
    {
      id: 8,
      icon: 'information-circle-outline',
      title: 'Acerca de',
      subtitle: 'Versión de la aplicación',
      onPress: () => console.log('Acerca de'),
    },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity 
          style={[styles.backButton, { backgroundColor: colors.surface }]}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Ajustes de Cuenta</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* User Info Card */}
        <View style={[styles.userCard, { backgroundColor: colors.surface }]}>
          <View style={[styles.userAvatar, { backgroundColor: isDarkMode ? 'rgba(0, 194, 255, 0.2)' : 'rgba(0, 102, 204, 0.1)' }]}>
            <Ionicons name="person" size={40} color={isDarkMode ? '#00C2FF' : '#0066cc'} />
          </View>
          <View style={styles.userInfo}>
            <Text style={[styles.userName, { color: colors.text }]}>{user?.fullName || user?.email?.split('@')[0] || 'Usuario'}</Text>
            <Text style={[styles.userEmail, { color: colors.textSecondary }]}>{user?.email || 'usuario@email.com'}</Text>
          </View>
        </View>

        {/* Settings Options */}
        <View style={styles.settingsSection}>
          {settingsOptions.map((option) => (
            option.isSwitch ? (
              <View key={option.id} style={[styles.settingItem, { backgroundColor: colors.surface }]}>
                <View style={[styles.settingIconContainer, { backgroundColor: isDarkMode ? 'rgba(0, 194, 255, 0.1)' : 'rgba(0, 102, 204, 0.1)' }]}>
                  <Ionicons name={option.icon} size={24} color={isDarkMode ? '#00C2FF' : '#0066cc'} />
                </View>
                <View style={styles.settingTextContainer}>
                  <Text style={[styles.settingTitle, { color: colors.text }]}>{option.title}</Text>
                  <Text style={[styles.settingSubtitle, { color: colors.textSecondary }]}>{option.subtitle}</Text>
                </View>
                <Switch
                  value={option.switchValue}
                  onValueChange={option.onSwitchChange}
                  trackColor={{ false: '#767577', true: isDarkMode ? '#00C2FF' : '#0066cc' }}
                  thumbColor={option.switchValue ? '#fff' : '#f4f3f4'}
                  ios_backgroundColor="#3e3e3e"
                />
              </View>
            ) : (
              <TouchableOpacity 
                key={option.id} 
                style={[styles.settingItem, { backgroundColor: colors.surface }]}
                onPress={option.onPress}
              >
                <View style={[styles.settingIconContainer, { backgroundColor: isDarkMode ? 'rgba(0, 194, 255, 0.1)' : 'rgba(0, 102, 204, 0.1)' }]}>
                  <Ionicons name={option.icon} size={24} color={isDarkMode ? '#00C2FF' : '#0066cc'} />
                </View>
                <View style={styles.settingTextContainer}>
                  <Text style={[styles.settingTitle, { color: colors.text }]}>{option.title}</Text>
                  <Text style={[styles.settingSubtitle, { color: colors.textSecondary }]}>{option.subtitle}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
              </TouchableOpacity>
            )
          ))}
        </View>

        {/* Logout Button */}
        <TouchableOpacity 
          style={[styles.logoutButton, { backgroundColor: colors.surface, borderColor: colors.error }]} 
          onPress={handleLogout}
        >
          <Ionicons name="log-out-outline" size={24} color={colors.error} />
          <Text style={[styles.logoutButtonText, { color: colors.error }]}>Cerrar Sesión</Text>
        </TouchableOpacity>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0f',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a4a',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1a1a2e',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a2e',
    margin: 20,
    borderRadius: 16,
    padding: 20,
  },
  userAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(0, 194, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#888',
  },
  settingsSection: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  settingIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 194, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  settingTextContainer: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  settingSubtitle: {
    fontSize: 14,
    color: '#888',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1a1a2e',
    marginHorizontal: 20,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#ff4444',
    marginBottom: 20,
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ff4444',
    marginLeft: 8,
  },
  bottomPadding: {
    height: 40,
  },
});

export default SettingsScreen;
