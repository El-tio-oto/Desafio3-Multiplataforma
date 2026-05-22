import React from 'react';
import { View, FlatList, Text, StyleSheet } from 'react-native';
import { useAccounts } from '../../context/AccountsContext';
import Button from '../../components/ui/Button'; // Asegúrate de la ruta según tu estructura

const AccountsListScreen = ({ navigation }) => {
  const { accounts, deleteAccount } = useAccounts();

  const renderAccountItem = ({ item }) => (
    <View style={styles.accountCard}>
      <View>
        <Text style={styles.accountName}>{item.nombre}</Text>
        <Text style={styles.accountBalance}>Saldo: ${parseFloat(item.saldo).toFixed(2)}</Text>
      </View>
      <Button 
        title="Eliminar" 
        onPress={() => deleteAccount(item.id)} 
        style={styles.deleteButton} 
      />
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mis Cuentas</Text>
      
      <FlatList
        data={accounts}
        keyExtractor={(item) => item.id}
        renderItem={renderAccountItem}
        ListEmptyComponent={<Text style={styles.emptyText}>No hay cuentas registradas.</Text>}
      />

      <Button 
        title="Agregar Nueva Cuenta" 
        onPress={() => navigation.navigate('AccountForm')} 
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
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  accountCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    alignItems: 'center',
  },
  accountName: {
    fontSize: 18,
    fontWeight: '600',
  },
  accountBalance: {
    fontSize: 16,
    color: '#555',
  },
  deleteButton: {
    backgroundColor: '#ff4d4d',
    padding: 8,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 50,
    color: '#888',
  }
});

export default AccountsListScreen;  