import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, TextInput, Alert, Image } from 'react-native';
import { useData } from '../context/DataContext';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

const EditTransactionScreen = ({ route, navigation }) => {
  const { transaction } = route.params;
  const { accounts, updateTransaction } = useData();
  const [formData, setFormData] = useState({
    title: transaction.title || '',
    amount: transaction.amount ? Math.abs(transaction.amount).toString() : '',
    category: transaction.category || 'Comida',
    accountId: transaction.accountId || accounts[0]?.id?.toString() || '',
    type: transaction.type || 'expense',
    date: transaction.date ? new Date(transaction.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    receiptUri: transaction.receiptUri || null,
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

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permiso denegado', 'Necesitamos acceso a tu galería para subir el recibo.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled) {
        setFormData({ ...formData, receiptUri: result.assets[0].uri });
      }
    } catch (error) {
      console.error('Error al seleccionar imagen:', error);
    }
  };

  const handleSave = async () => {
    try {
      if (!formData.title || !formData.amount || !formData.category) {
        Alert.alert('Error', 'Todos los campos son requeridos');
        return;
      }

      if (!formData.accountId) {
        Alert.alert('Error', 'Debes crear al menos una cuenta (en la pestaña "Cuentas") antes de agregar transacciones.');
        return;
      }

      const amount = parseFloat(formData.amount);
      if (isNaN(amount) || amount <= 0) {
        Alert.alert('Error', 'El monto debe ser un número positivo');
        return;
      }

      const finalAmount = formData.type === 'expense' ? -amount : amount;

      const result = await updateTransaction(transaction.id, {
        title: formData.title,
        amount: finalAmount,
        category: formData.category,
        accountId: formData.accountId,
        date: formData.date,
        receiptUri: formData.receiptUri,
      });

      if (result.success) {
        Alert.alert('Éxito', 'Transacción actualizada correctamente', [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]);
      } else {
        Alert.alert('Error', result.error);
      }
    } catch (error) {
      Alert.alert('Error', 'Ocurrió un error al guardar la transacción');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="close" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Editar Transacción</Text>
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Guardar</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.formContainer}>
          {/* Type Selector */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Tipo de Transacción</Text>
            <View style={styles.typeSelector}>
              <TouchableOpacity
                style={[styles.typeButton, formData.type === 'income' && styles.typeButtonActive]}
                onPress={() => setFormData({ ...formData, type: 'income' })}
              >
                <Ionicons name="arrow-down" size={24} color={formData.type === 'income' ? '#000' : '#888'} />
                <Text style={[styles.typeButtonText, formData.type === 'income' && styles.typeButtonTextActive]}>
                  Ingreso
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.typeButton, formData.type === 'expense' && styles.typeButtonActive]}
                onPress={() => setFormData({ ...formData, type: 'expense' })}
              >
                <Ionicons name="arrow-up" size={24} color={formData.type === 'expense' ? '#000' : '#888'} />
                <Text style={[styles.typeButtonText, formData.type === 'expense' && styles.typeButtonTextActive]}>
                  Gasto
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Amount Input */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Monto</Text>
            <View style={styles.amountInputContainer}>
              <Text style={styles.currencySymbol}>$</Text>
              <TextInput
                style={styles.amountInput}
                value={formData.amount}
                onChangeText={(text) => setFormData({ ...formData, amount: text })}
                placeholder="0.00"
                keyboardType="decimal-pad"
                placeholderTextColor="#888"
              />
            </View>
          </View>

          {/* Title Input */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Descripción</Text>
            <TextInput
              style={styles.input}
              value={formData.title}
              onChangeText={(text) => setFormData({ ...formData, title: text })}
              placeholder="Ej: Netflix, Salario, Compras..."
              placeholderTextColor="#888"
            />
          </View>

          {/* Category Selection */}
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

          {/* Account Selection */}
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

          {/* Date Input */}
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

          {/* Receipt Image Picker */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Recibo (Opcional)</Text>
            <TouchableOpacity style={styles.imagePickerButton} onPress={pickImage}>
              {formData.receiptUri ? (
                <>
                  <Image source={{ uri: formData.receiptUri }} style={styles.receiptPreview} />
                  <View style={styles.changeImageOverlay}>
                    <Ionicons name="camera" size={24} color="#fff" />
                    <Text style={styles.changeImageText}>Cambiar foto</Text>
                  </View>
                </>
              ) : (
                <>
                  <Ionicons name="camera-outline" size={32} color="#888" />
                  <Text style={styles.imagePickerText}>Adjuntar foto del recibo</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>

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
  saveButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#00C2FF',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  scrollView: {
    flex: 1,
  },
  formContainer: {
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
  typeSelector: {
    flexDirection: 'row',
    gap: 12,
  },
  typeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#2a2a4a',
    gap: 8,
  },
  typeButtonActive: {
    backgroundColor: '#00C2FF',
    borderColor: '#00C2FF',
  },
  typeButtonText: {
    fontSize: 16,
    color: '#888',
    fontWeight: '600',
  },
  typeButtonTextActive: {
    color: '#000',
  },
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#2a2a4a',
  },
  currencySymbol: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#888',
    marginRight: 8,
  },
  amountInput: {
    flex: 1,
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
  },
  input: {
    backgroundColor: '#1a1a2e',
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
    backgroundColor: '#1a1a2e',
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
    backgroundColor: '#1a1a2e',
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
  imagePickerButton: {
    height: 120,
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2a2a4a',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  imagePickerText: {
    color: '#888',
    marginTop: 8,
    fontSize: 14,
  },
  receiptPreview: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  changeImageOverlay: {
    position: 'absolute',
    backgroundColor: 'rgba(0,0,0,0.5)',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  changeImageText: {
    color: '#fff',
    fontSize: 12,
    marginTop: 4,
  },
  bottomPadding: {
    height: 40,
  },
});

export default EditTransactionScreen;
