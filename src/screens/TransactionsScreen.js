import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, TextInput, Modal, Alert } from 'react-native';
import { useData } from '../context/DataContext';
import { Ionicons } from '@expo/vector-icons';

const TransactionsScreen = ({ navigation }) => {
  const { transactions, accounts, deleteTransaction, addTransaction, updateTransaction } = useData();
  const [modalVisible, setModalVisible] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    amount: '',
    category: '',
    accountId: '',
    type: 'expense',
    date: new Date().toISOString().split('T')[0],
  });

  const categories = ['Comida', 'Transporte', 'Entretenimiento', 'Música', 'Compras', 'Otros'];
  const categoryColors = {
    'Comida': '#FF6B6B',
    'Transporte': '#4ECDC4',
    'Entretenimiento': '#FFE66D',
    'Música': '#1DB954',
    'Compras': '#FF9900',
    'Otros': '#95E1D3',
  };

  const categoryIcons = {
    'Comida': 'restaurant-outline',
    'Transporte': 'car-outline',
    'Entretenimiento': 'film-outline',
    'Música': 'musical-notes-outline',
    'Compras': 'cart-outline',
    'Otros': 'ellipsis-horizontal-outline',
  };

  const handleAdd = () => {
    setEditingTransaction(null);
    setFormData({
      title: '',
      amount: '',
      category: '',
      accountId: accounts[0]?.id?.toString() || '',
      type: 'expense',
      date: new Date().toISOString().split('T')[0],
    });
    setModalVisible(true);
  };

  const handleEdit = (transaction) => {
    setEditingTransaction(transaction);
    setFormData({
      title: transaction.title,
      amount: Math.abs(transaction.amount).toString(),
      category: transaction.category,
      accountId: transaction.accountId?.toString() || '',
      type: transaction.amount > 0 ? 'income' : 'expense',
      date: transaction.date.split('T')[0],
    });
    setModalVisible(true);
  };

  const handleDelete = async (id) => {
    const result = await deleteTransaction(id);
    if (result.success) {
      Alert.alert('Éxito', 'Transacción eliminada correctamente');
    }
  };

  const handleSave = async () => {
    try {
      if (!formData.title || !formData.amount || !formData.category || !formData.accountId) {
        Alert.alert('Error', 'Todos los campos son requeridos');
        return;
      }

      const amount = parseFloat(formData.amount);
      if (isNaN(amount) || amount <= 0) {
        Alert.alert('Error', 'El monto debe ser un número positivo');
        return;
      }

      const finalAmount = formData.type === 'expense' ? -amount : amount;

      if (editingTransaction) {
        const result = await updateTransaction(editingTransaction.id, {
          title: formData.title,
          amount: finalAmount,
          category: formData.category,
          accountId: parseInt(formData.accountId),
          date: formData.date,
        });
        if (result.success) {
          Alert.alert('Éxito', 'Transacción actualizada correctamente');
          setModalVisible(false);
        } else {
          Alert.alert('Error', result.error);
        }
      } else {
        const result = await addTransaction({
          title: formData.title,
          amount: finalAmount,
          category: formData.category,
          accountId: parseInt(formData.accountId),
          date: formData.date,
        });
        if (result.success) {
          Alert.alert('Éxito', 'Transacción agregada correctamente');
          setModalVisible(false);
        } else {
          Alert.alert('Error', result.error);
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Ocurrió un error al guardar la transacción');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
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
        <Text style={styles.headerTitle}>Transacciones</Text>
        <TouchableOpacity style={styles.addButton} onPress={handleAdd}>
          <Ionicons name="add" size={24} color="#00C2FF" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {transactions.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="receipt-outline" size={64} color="#888" />
            <Text style={styles.emptyText}>No hay transacciones</Text>
            <Text style={styles.emptySubtext}>Agrega tu primera transacción</Text>
          </View>
        ) : (
          transactions.map((transaction) => {
            const account = accounts.find(a => a.id === transaction.accountId);
            const icon = categoryIcons[transaction.category] || 'ellipsis-horizontal-outline';
            const color = categoryColors[transaction.category] || '#00C2FF';

            return (
              <View key={transaction.id} style={styles.transactionCard}>
                <View style={styles.transactionLeft}>
                  <View style={[styles.transactionIcon, { backgroundColor: `${color}20` }]}>
                    <Ionicons name={icon} size={24} color={color} />
                  </View>
                  <View style={styles.transactionInfo}>
                    <Text style={styles.transactionTitle}>{transaction.title}</Text>
                    <Text style={styles.transactionDetails}>
                      {transaction.category} • {account?.name || 'Cuenta'}
                    </Text>
                    <Text style={styles.transactionDate}>{formatDate(transaction.date)}</Text>
                  </View>
                </View>
                <View style={styles.transactionRight}>
                  <Text style={[
                    styles.transactionAmount,
                    transaction.amount > 0 ? styles.amountPositive : styles.amountNegative
                  ]}>
                    {transaction.amount > 0 ? '+' : ''}${Math.abs(transaction.amount).toFixed(2)}
                  </Text>
                  <View style={styles.transactionActions}>
                    <TouchableOpacity onPress={() => handleEdit(transaction)}>
                      <Ionicons name="create-outline" size={20} color="#00C2FF" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleDelete(transaction.id)}>
                      <Ionicons name="trash-outline" size={20} color="#ff4444" />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            );
          })
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
                {editingTransaction ? 'Editar Transacción' : 'Nueva Transacción'}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#fff" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalScrollView}>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Título</Text>
                <TextInput
                  style={styles.input}
                  value={formData.title}
                  onChangeText={(text) => setFormData({ ...formData, title: text })}
                  placeholder="Ej: Netflix, Salario..."
                  placeholderTextColor="#888"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Monto</Text>
                <TextInput
                  style={styles.input}
                  value={formData.amount}
                  onChangeText={(text) => setFormData({ ...formData, amount: text })}
                  placeholder="0.00"
                  keyboardType="decimal-pad"
                  placeholderTextColor="#888"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Tipo</Text>
                <View style={styles.typeSelector}>
                  <TouchableOpacity
                    style={[styles.typeButton, formData.type === 'income' && styles.typeButtonActive]}
                    onPress={() => setFormData({ ...formData, type: 'income' })}
                  >
                    <Ionicons name="arrow-down" size={20} color={formData.type === 'income' ? '#000' : '#888'} />
                    <Text style={[styles.typeButtonText, formData.type === 'income' && styles.typeButtonTextActive]}>
                      Ingreso
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.typeButton, formData.type === 'expense' && styles.typeButtonActive]}
                    onPress={() => setFormData({ ...formData, type: 'expense' })}
                  >
                    <Ionicons name="arrow-up" size={20} color={formData.type === 'expense' ? '#000' : '#888'} />
                    <Text style={[styles.typeButtonText, formData.type === 'expense' && styles.typeButtonTextActive]}>
                      Gasto
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Categoría</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesContainer}>
                  {categories.map((category) => (
                    <TouchableOpacity
                      key={category}
                      style={[
                        styles.categoryChip,
                        formData.category === category && styles.categoryChipActive
                      ]}
                      onPress={() => setFormData({ ...formData, category })}
                    >
                      <View style={[styles.categoryDot, { backgroundColor: categoryColors[category] }]} />
                      <Text style={[
                        styles.categoryChipText,
                        formData.category === category && styles.categoryChipTextActive
                      ]}>
                        {category}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Cuenta</Text>
                <View style={styles.accountsContainer}>
                  {accounts.map((account) => (
                    <TouchableOpacity
                      key={account.id}
                      style={[
                        styles.accountChip,
                        formData.accountId === account.id.toString() && styles.accountChipActive
                      ]}
                      onPress={() => setFormData({ ...formData, accountId: account.id.toString() })}
                    >
                      <View style={[styles.accountDot, { backgroundColor: account.color }]} />
                      <Text style={[
                        styles.accountChipText,
                        formData.accountId === account.id.toString() && styles.accountChipTextActive
                      ]}>
                        {account.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Fecha</Text>
                <TextInput
                  style={styles.input}
                  value={formData.date}
                  onChangeText={(text) => setFormData({ ...formData, date: text })}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor="#888"
                />
              </View>

              <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                <Text style={styles.saveButtonText}>
                  {editingTransaction ? 'Actualizar' : 'Guardar'}
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
  transactionCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1a1a2e',
    marginHorizontal: 20,
    marginVertical: 8,
    borderRadius: 16,
    padding: 16,
  },
  transactionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  transactionIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  transactionDetails: {
    fontSize: 14,
    color: '#888',
    marginBottom: 4,
  },
  transactionDate: {
    fontSize: 12,
    color: '#666',
  },
  transactionRight: {
    alignItems: 'flex-end',
  },
  transactionAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  amountPositive: {
    color: '#00C2FF',
  },
  amountNegative: {
    color: '#ff4444',
  },
  transactionActions: {
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
    maxHeight: '90%',
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
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
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
  typeSelector: {
    flexDirection: 'row',
    gap: 12,
  },
  typeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0a0a0f',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#2a2a4a',
    gap: 8,
  },
  typeButtonActive: {
    backgroundColor: '#00C2FF',
    borderColor: '#00C2FF',
  },
  typeButtonText: {
    fontSize: 14,
    color: '#888',
    fontWeight: '600',
  },
  typeButtonTextActive: {
    color: '#000',
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0a0a0f',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#2a2a4a',
    gap: 6,
  },
  categoryChipActive: {
    backgroundColor: '#00C2FF',
    borderColor: '#00C2FF',
  },
  categoryDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  categoryChipText: {
    fontSize: 14,
    color: '#888',
  },
  categoryChipTextActive: {
    color: '#000',
    fontWeight: '600',
  },
  accountsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  accountChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0a0a0f',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#2a2a4a',
    gap: 6,
  },
  accountChipActive: {
    backgroundColor: '#00C2FF',
    borderColor: '#00C2FF',
  },
  accountDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  accountChipText: {
    fontSize: 14,
    color: '#888',
  },
  accountChipTextActive: {
    color: '#000',
    fontWeight: '600',
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

export default TransactionsScreen;
