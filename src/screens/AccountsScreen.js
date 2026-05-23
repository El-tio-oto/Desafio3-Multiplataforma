import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, TextInput, Modal, Alert } from 'react-native';
import { useData } from '../context/DataContext';
import { Ionicons } from '@expo/vector-icons';

const AccountsScreen = ({ navigation }) => {
  const { accounts, addAccount, updateAccount, deleteAccount } = useData();
  const [modalVisible, setModalVisible] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'cash',
    color: '#00C2FF',
  });

  const accountTypes = [
    { value: 'cash', label: 'Efectivo', icon: 'cash-outline' },
    { value: 'bank', label: 'Banco', icon: 'business-outline' },
    { value: 'credit', label: 'Tarjeta de Crédito', icon: 'card-outline' },
  ];

  const accountColors = [
    '#00C2FF', '#FF6B6B', '#4ECDC4', '#FFE66D', '#95E1D3', '#1DB954', '#FF9900', '#A78BFA'
  ];

  const handleAdd = () => {
    setEditingAccount(null);
    setFormData({
      name: '',
      type: 'cash',
      color: '#00C2FF',
    });
    setModalVisible(true);
  };

  const handleEdit = (account) => {
    setEditingAccount(account);
    setFormData({
      name: account.name,
      type: account.type,
      color: account.color,
    });
    setModalVisible(true);
  };

  const handleDelete = async (id) => {
    const result = await deleteAccount(id);
    if (result.success) {
      Alert.alert('Éxito', 'Cuenta eliminada correctamente');
    }
  };

  const handleSave = async () => {
    try {
      if (!formData.name || !formData.type) {
        Alert.alert('Error', 'Nombre y tipo de cuenta son requeridos');
        return;
      }

      if (editingAccount) {
        const result = await updateAccount(editingAccount.id, formData);
        if (result.success) {
          Alert.alert('Éxito', 'Cuenta actualizada correctamente');
          setModalVisible(false);
        } else {
          Alert.alert('Error', result.error);
        }
      } else {
        const result = await addAccount(formData);
        if (result.success) {
          Alert.alert('Éxito', 'Cuenta agregada correctamente');
          setModalVisible(false);
        } else {
          Alert.alert('Error', result.error);
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Ocurrió un error al guardar la cuenta');
    }
  };

  const getAccountIcon = (type) => {
    const typeInfo = accountTypes.find(t => t.value === type);
    return typeInfo?.icon || 'wallet-outline';
  };

  const getAccountTypeLabel = (type) => {
    const typeInfo = accountTypes.find(t => t.value === type);
    return typeInfo?.label || type;
  };

  const getTotalBalance = () => {
    return accounts.reduce((sum, account) => sum + account.balance, 0);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Cuentas</Text>
        <TouchableOpacity style={styles.addButton} onPress={handleAdd}>
          <Ionicons name="add" size={24} color="#00C2FF" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Total Balance Card */}
        <View style={styles.totalBalanceCard}>
          <Text style={styles.totalBalanceLabel}>Balance Total</Text>
          <Text style={styles.totalBalanceAmount}>${getTotalBalance().toFixed(2)}</Text>
          <Text style={styles.totalBalanceSubtext}>Todas tus cuentas</Text>
        </View>

        {accounts.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="wallet-outline" size={64} color="#888" />
            <Text style={styles.emptyText}>No hay cuentas</Text>
            <Text style={styles.emptySubtext}>Agrega tu primera cuenta</Text>
          </View>
        ) : (
          accounts.map((account) => (
            <View key={account.id} style={styles.accountCard}>
              <View style={styles.accountLeft}>
                <View style={[styles.accountIcon, { backgroundColor: `${account.color}20` }]}>
                  <Ionicons name={getAccountIcon(account.type)} size={28} color={account.color} />
                </View>
                <View style={styles.accountInfo}>
                  <Text style={styles.accountName}>{account.name}</Text>
                  <Text style={styles.accountType}>{getAccountTypeLabel(account.type)}</Text>
                </View>
              </View>
              <View style={styles.accountRight}>
                <Text style={[
                  styles.accountBalance,
                  account.balance < 0 ? styles.balanceNegative : styles.balancePositive
                ]}>
                  ${account.balance.toFixed(2)}
                </Text>
                <View style={styles.accountActions}>
                  <TouchableOpacity onPress={() => handleEdit(account)}>
                    <Ionicons name="create-outline" size={20} color="#00C2FF" />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleDelete(account.id)}>
                    <Ionicons name="trash-outline" size={20} color="#ff4444" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))
        )}
        <View style={styles.bottomPadding} />
      </ScrollView>

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingAccount ? 'Editar Cuenta' : 'Nueva Cuenta'}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#fff" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalScrollView}>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Nombre de la Cuenta</Text>
                <TextInput
                  style={styles.input}
                  value={formData.name}
                  onChangeText={(text) => setFormData({ ...formData, name: text })}
                  placeholder="Ej: Efectivo, Chase Bank..."
                  placeholderTextColor="#888"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Tipo de Cuenta</Text>
                <View style={styles.typesContainer}>
                  {accountTypes.map((type) => (
                    <TouchableOpacity
                      key={type.value}
                      style={[
                        styles.typeCard,
                        formData.type === type.value && styles.typeCardActive
                      ]}
                      onPress={() => setFormData({ ...formData, type: type.value })}
                    >
                      <Ionicons 
                        name={type.icon} 
                        size={24} 
                        color={formData.type === type.value ? '#000' : '#888'} 
                      />
                      <Text style={[
                        styles.typeCardText,
                        formData.type === type.value && styles.typeCardTextActive
                      ]}>
                        {type.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Color</Text>
                <View style={styles.colorsContainer}>
                  {accountColors.map((color) => (
                    <TouchableOpacity
                      key={color}
                      style={[
                        styles.colorOption,
                        formData.color === color && styles.colorOptionActive
                      ]}
                      onPress={() => setFormData({ ...formData, color })}
                    >
                      <View style={[styles.colorCircle, { backgroundColor: color }]} />
                      {formData.color === color && (
                        <Ionicons name="checkmark" size={16} color="#000" style={styles.checkIcon} />
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                <Text style={styles.saveButtonText}>
                  {editingAccount ? 'Actualizar' : 'Guardar'}
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
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
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1a1a2e',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  totalBalanceCard: {
    backgroundColor: '#1a1a2e',
    margin: 20,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
  },
  totalBalanceLabel: {
    fontSize: 14,
    color: '#888',
    marginBottom: 8,
  },
  totalBalanceAmount: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  totalBalanceSubtext: {
    fontSize: 14,
    color: '#888',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 100,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#888',
    marginTop: 8,
  },
  accountCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1a1a2e',
    marginHorizontal: 20,
    marginVertical: 8,
    borderRadius: 16,
    padding: 16,
  },
  accountLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  accountIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  accountInfo: {
    flex: 1,
  },
  accountName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  accountType: {
    fontSize: 14,
    color: '#888',
  },
  accountRight: {
    alignItems: 'flex-end',
  },
  accountBalance: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  balancePositive: {
    color: '#00C2FF',
  },
  balanceNegative: {
    color: '#ff4444',
  },
  accountActions: {
    flexDirection: 'row',
    gap: 16,
  },
  bottomPadding: {
    height: 40,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#1a1a2e',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a4a',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  modalScrollView: {
    padding: 20,
  },
  formGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 12,
  },
  input: {
    backgroundColor: '#0a0a0f',
    borderRadius: 12,
    padding: 16,
    color: '#fff',
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#2a2a4a',
  },
  typesContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  typeCard: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#0a0a0f',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#2a2a4a',
    gap: 8,
  },
  typeCardActive: {
    backgroundColor: '#00C2FF',
    borderColor: '#00C2FF',
  },
  typeCardText: {
    fontSize: 12,
    color: '#888',
    fontWeight: '600',
    textAlign: 'center',
  },
  typeCardTextActive: {
    color: '#000',
  },
  colorsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  colorOption: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#0a0a0f',
    borderWidth: 2,
    borderColor: '#2a2a4a',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  colorOptionActive: {
    borderColor: '#00C2FF',
  },
  colorCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  checkIcon: {
    position: 'absolute',
  },
  saveButton: {
    backgroundColor: '#00C2FF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
});

export default AccountsScreen;
