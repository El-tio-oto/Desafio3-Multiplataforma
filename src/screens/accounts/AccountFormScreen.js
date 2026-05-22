import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { useAccounts } from '../../context/AccountsContext';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

const AccountFormScreen = ({ navigation }) => {
  const [nombre, setNombre] = useState('');
  const [saldo, setSaldo] = useState('');
  const { addAccount } = useAccounts();

  const handleSave = () => {
    // Validación básica de campos
    if (!nombre || !saldo) {
      Alert.alert('Error', 'Por favor, completa todos los campos.');
      return;
    }

    const nuevaCuenta = {
      nombre,
      saldoInicial: parseFloat(saldo)
    };

    addAccount(nuevaCuenta);
    Alert.alert('Éxito', 'Cuenta creada correctamente.');
    navigation.goBack(); // Regresa a la lista después de guardar
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Nueva Cuenta</Text>
      
      <Input 
        placeholder="Nombre de la cuenta (ej. Banco)" 
        value={nombre} 
        onChangeText={setNombre} 
      />
      
      <Input 
        placeholder="Saldo inicial" 
        value={saldo} 
        onChangeText={setSaldo} 
        keyboardType="numeric" 
      />

      <Button 
        title="Guardar Cuenta" 
        onPress={handleSave} 
        style={styles.saveButton} 
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  saveButton: {
    marginTop: 20,
    backgroundColor: '#007bff',
  }
});

export default AccountFormScreen;