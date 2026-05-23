import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, TextInput, Modal, Alert } from 'react-native';
import { useData } from '../context/DataContext';
import { Ionicons } from '@expo/vector-icons';

const BudgetsScreen = ({ navigation }) => {
  const { budgets, addBudget, updateBudget, deleteBudget, updateBudgetSpent } = useData();
  const [modalVisible, setModalVisible] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);
  const [formData, setFormData] = useState({
    category: '',
    limit: '',
    color: '#00C2FF',
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

  const budgetColors = [
    '#00C2FF', '#FF6B6B', '#4ECDC4', '#FFE66D', '#95E1D3', '#1DB954', '#FF9900', '#A78BFA'
  ];

  const handleAdd = () => {
    setEditingBudget(null);
    setFormData({
      category: '',
      limit: '',
      color: '#00C2FF',
    });
    setModalVisible(true);
  };

  const handleEdit = (budget) => {
    setEditingBudget(budget);
    setFormData({
      category: budget.category,
      limit: budget.limit.toString(),
      color: budget.color,
    });
    setModalVisible(true);
  };

  const handleDelete = async (id) => {
    const result = await deleteBudget(id);
    if (result.success) {
      Alert.alert('Éxito', 'Presupuesto eliminado correctamente');
    }
  };

  const handleSave = async () => {
    try {
      if (!formData.category || !formData.limit) {
        Alert.alert('Error', 'Categoría y límite son requeridos');
        return;
      }

      const limit = parseFloat(formData.limit);
      if (isNaN(limit) || limit <= 0) {
        Alert.alert('Error', 'El límite debe ser un número positivo');
        return;
      }

      if (editingBudget) {
        const result = await updateBudget(editingBudget.id, {
          category: formData.category,
          limit: limit,
          color: formData.color,
        });
        if (result.success) {
          Alert.alert('Éxito', 'Presupuesto actualizado correctamente');
          setModalVisible(false);
        } else {
          Alert.alert('Error', result.error);
        }
      } else {
        const result = await addBudget({
          category: formData.category,
          limit: limit,
          color: formData.color,
        });
        if (result.success) {
          Alert.alert('Éxito', 'Presupuesto agregado correctamente');
          setModalVisible(false);
        } else {
          Alert.alert('Error', result.error);
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Ocurrió un error al guardar el presupuesto');
    }
  };

  const getProgressColor = (percentage) => {
    if (percentage >= 100) return '#ff4444';
    if (percentage >= 80) return '#FF9900';
    return '#00C2FF';
  };

  const getProgressStatus = (percentage) => {
    if (percentage >= 100) return 'Excedido';
    if (percentage >= 80) return 'Cerca del límite';
    return 'En progreso';
  };

  const getTotalBudgetLimit = () => {
    return budgets.reduce((sum, budget) => sum + budget.limit, 0);
  };

  const getTotalSpent = () => {
    return budgets.reduce((sum, budget) => sum + budget.spent, 0);
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
        <Text style={styles.headerTitle}>Presupuestos</Text>
        <TouchableOpacity style={styles.addButton} onPress={handleAdd}>
          <Ionicons name="add" size={24} color="#00C2FF" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Total Budget Card */}
        <View style={styles.totalBudgetCard}>
          <Text style={styles.totalBudgetLabel}>Presupuesto Total Mensual</Text>
          <Text style={styles.totalBudgetAmount}>${getTotalBudgetLimit().toFixed(2)}</Text>
          <View style={styles.totalBudgetDetails}>
            <Text style={styles.totalBudgetSpent}>Gastado: ${getTotalSpent().toFixed(2)}</Text>
            <Text style={[
              styles.totalBudgetRemaining,
              getTotalBudgetLimit() - getTotalSpent() < 0 && styles.remainingNegative
            ]}>
              Restante: ${(getTotalBudgetLimit() - getTotalSpent()).toFixed(2)}
            </Text>
          </View>
        </View>

        {budgets.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="pie-chart-outline" size={64} color="#888" />
            <Text style={styles.emptyText}>No hay presupuestos</Text>
            <Text style={styles.emptySubtext}>Agrega tu primer presupuesto</Text>
          </View>
        ) : (
          budgets.map((budget) => {
            const percentage = budget.limit > 0 ? (budget.spent / budget.limit) * 100 : 0;
            const progressColor = getProgressColor(percentage);
            const status = getProgressStatus(percentage);

            return (
              <View key={budget.id} style={styles.budgetCard}>
                <View style={styles.budgetHeader}>
                  <View style={styles.budgetLeft}>
                    <View style={[styles.budgetIcon, { backgroundColor: `${budget.color}20` }]}>
                      <Ionicons name="wallet-outline" size={24} color={budget.color} />
                    </View>
                    <View style={styles.budgetInfo}>
                      <Text style={styles.budgetCategory}>{budget.category}</Text>
                      <Text style={[styles.budgetStatus, { color: progressColor }]}>
                        {status}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.budgetActions}>
                    <TouchableOpacity onPress={() => handleEdit(budget)}>
                      <Ionicons name="create-outline" size={20} color="#00C2FF" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleDelete(budget.id)}>
                      <Ionicons name="trash-outline" size={20} color="#ff4444" />
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.budgetAmounts}>
                  <View style={styles.budgetAmountItem}>
                    <Text style={styles.budgetAmountLabel}>Gastado</Text>
                    <Text style={styles.budgetAmountValue}>${budget.spent.toFixed(2)}</Text>
                  </View>
                  <View style={styles.budgetAmountItem}>
                    <Text style={styles.budgetAmountLabel}>Límite</Text>
                    <Text style={styles.budgetAmountValue}>${budget.limit.toFixed(2)}</Text>
                  </View>
                  <View style={styles.budgetAmountItem}>
                    <Text style={styles.budgetAmountLabel}>Restante</Text>
                    <Text style={[
                      styles.budgetAmountValue,
                      budget.limit - budget.spent < 0 && styles.amountNegative
                    ]}>
                      ${(budget.limit - budget.spent).toFixed(2)}
                    </Text>
                  </View>
                </View>

                <View style={styles.progressBarContainer}>
                  <View style={styles.progressBarBackground}>
                    <View 
                      style={[
                        styles.progressBarFill, 
                        { 
                          width: `${Math.min(percentage, 100)}%`,
                          backgroundColor: progressColor 
                        }
                      ]} 
                    />
                  </View>
                  <Text style={[styles.percentageText, { color: progressColor }]}>
                    {percentage.toFixed(0)}%
                  </Text>
                </View>

                {percentage >= 100 && (
                  <View style={styles.alertBanner}>
                    <Ionicons name="warning" size={16} color="#ff4444" />
                    <Text style={styles.alertText}>Has excedido tu presupuesto</Text>
                  </View>
                )}

                {percentage >= 80 && percentage < 100 && (
                  <View style={[styles.alertBanner, styles.warningBanner]}>
                    <Ionicons name="alert-circle" size={16} color="#FF9900" />
                    <Text style={[styles.alertText, styles.warningText]}>Cerca del límite</Text>
                  </View>
                )}
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
                {editingBudget ? 'Editar Presupuesto' : 'Nuevo Presupuesto'}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#fff" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalScrollView}>
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
                <Text style={styles.label}>Límite Mensual</Text>
                <TextInput
                  style={styles.input}
                  value={formData.limit}
                  onChangeText={(text) => setFormData({ ...formData, limit: text })}
                  placeholder="0.00"
                  keyboardType="decimal-pad"
                  placeholderTextColor="#888"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Color</Text>
                <View style={styles.colorsContainer}>
                  {budgetColors.map((color) => (
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
                  {editingBudget ? 'Actualizar' : 'Guardar'}
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
  totalBudgetCard: {
    backgroundColor: '#1a1a2e',
    margin: 20,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
  },
  totalBudgetLabel: {
    fontSize: 14,
    color: '#888',
    marginBottom: 8,
  },
  totalBudgetAmount: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
  },
  totalBudgetDetails: {
    flexDirection: 'row',
    gap: 24,
  },
  totalBudgetSpent: {
    fontSize: 14,
    color: '#888',
  },
  totalBudgetRemaining: {
    fontSize: 14,
    color: '#00C2FF',
  },
  remainingNegative: {
    color: '#ff4444',
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
  budgetCard: {
    backgroundColor: '#1a1a2e',
    marginHorizontal: 20,
    marginVertical: 8,
    borderRadius: 16,
    padding: 20,
  },
  budgetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  budgetLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  budgetIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  budgetInfo: {
    flex: 1,
  },
  budgetCategory: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  budgetStatus: {
    fontSize: 14,
    color: '#888',
  },
  budgetActions: {
    flexDirection: 'row',
    gap: 16,
  },
  budgetAmounts: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  budgetAmountItem: {
    alignItems: 'center',
  },
  budgetAmountLabel: {
    fontSize: 12,
    color: '#888',
    marginBottom: 4,
  },
  budgetAmountValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  amountNegative: {
    color: '#ff4444',
  },
  progressBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressBarBackground: {
    flex: 1,
    height: 8,
    backgroundColor: '#0a0a0f',
    borderRadius: 4,
    marginRight: 12,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  percentageText: {
    fontSize: 14,
    fontWeight: 'bold',
    minWidth: 40,
    textAlign: 'right',
  },
  alertBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 68, 68, 0.1)',
    borderRadius: 8,
    padding: 12,
    gap: 8,
  },
  warningBanner: {
    backgroundColor: 'rgba(255, 153, 0, 0.1)',
  },
  alertText: {
    fontSize: 14,
    color: '#ff4444',
    flex: 1,
  },
  warningText: {
    color: '#FF9900',
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

export default BudgetsScreen;
