import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { useBudget } from '../../context/BudgetContext';
// Asumimos que tienes un componente visual para el progreso
// Si no, puedes usar una View simple con ancho variable.

const BudgetListScreen = () => {
  const { budgets, getBudgetStatus } = useBudget();

  // En una aplicación real, 'totalSpent' vendría de tu contexto de transacciones.
  // Aquí usamos 0 como placeholder para el ejemplo.
  const renderBudgetCard = ({ item }) => {
    const { percentage, status, limit } = getBudgetStatus(item.categoryId, 0); 
    
    const statusColor = status === 'exceeded' ? '#ff4d4d' : status === 'warning' ? '#ffcc00' : '#4caf50';

    return (
      <View style={styles.card}>
        <Text style={styles.categoryTitle}>{item.categoryId}</Text>
        <Text>Presupuesto: ${limit}</Text>
        <View style={styles.progressBarContainer}>
          <View style={[styles.progressBar, { width: `${percentage}%`, backgroundColor: statusColor }]} />
        </View>
        <Text style={[styles.statusText, { color: statusColor }]}>
          {status === 'exceeded' ? '¡Límite excedido!' : status === 'warning' ? 'Alerta: >80%' : 'En rango'}
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Presupuestos Mensuales</Text>
      <FlatList
        data={budgets}
        keyExtractor={(item) => item.categoryId}
        renderItem={renderBudgetCard}
        ListEmptyComponent={<Text style={styles.empty}>No hay presupuestos definidos.</Text>}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  card: { padding: 15, marginBottom: 15, borderRadius: 10, backgroundColor: '#f9f9f9', borderWidth: 1, borderColor: '#eee' },
  categoryTitle: { fontSize: 18, fontWeight: '600' },
  progressBarContainer: { height: 10, backgroundColor: '#e0e0e0', borderRadius: 5, marginVertical: 10, overflow: 'hidden' },
  progressBar: { height: '100%' },
  statusText: { fontWeight: 'bold' },
  empty: { textAlign: 'center', marginTop: 50, color: '#888' }
});

export default BudgetListScreen;