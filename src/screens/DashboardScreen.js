import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, Image } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';

const DashboardScreen = ({ navigation }) => {
  const { user, logout } = useAuth();

  const transactions = [
    { id: 1, title: 'Netflix', category: 'Entretenimiento', amount: -15.99, date: 'Hoy', icon: 'tv-outline', color: '#E50914' },
    { id: 2, title: 'Spotify', category: 'Música', amount: -9.99, date: 'Ayer', icon: 'musical-notes-outline', color: '#1DB954' },
    { id: 3, title: 'Salario', category: 'Ingreso', amount: 2500.00, date: '15 May', icon: 'cash-outline', color: '#00C2FF' },
    { id: 4, title: 'Amazon', category: 'Compras', amount: -89.50, date: '14 May', icon: 'cart-outline', color: '#FF9900' },
  ];

  const categories = [
    { name: 'Comida', amount: 450, percentage: 35, color: '#FF6B6B' },
    { name: 'Transporte', amount: 200, percentage: 25, color: '#4ECDC4' },
    { name: 'Entretenimiento', amount: 150, percentage: 20, color: '#FFE66D' },
    { name: 'Otros', amount: 100, percentage: 20, color: '#95E1D3' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>Zenith Ledger</Text>
            <Text style={styles.welcomeText}>Bienvenido, {user?.fullName || user?.email?.split('@')[0] || 'Usuario'}!</Text>
          </View>
          <TouchableOpacity 
            style={styles.settingsButton}
            onPress={() => navigation.navigate('Settings')}
          >
            <Ionicons name="settings-outline" size={24} color="#00C2FF" />
          </TouchableOpacity>
        </View>

        {/* Balance Card */}
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Balance Total Actual</Text>
          <Text style={styles.balanceAmount}>$12,450.00</Text>
          <View style={styles.balanceChange}>
            <Ionicons name="trending-up" size={16} color="#00C2FF" />
            <Text style={styles.balanceChangeText}>+8.5% este mes</Text>
          </View>
        </View>

        {/* Account Filters */}
        <View style={styles.filterContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {['Todas las Cuentas', 'Chase Bank', 'Capital One', 'Efectivo'].map((filter, index) => (
              <TouchableOpacity 
                key={index} 
                style={[styles.filterChip, index === 0 && styles.filterChipActive]}
              >
                <Text style={[styles.filterText, index === 0 && styles.filterTextActive]}>
                  {filter}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Monthly Summary */}
        <View style={styles.summaryContainer}>
          <View style={styles.summaryItem}>
            <View style={[styles.summaryIcon, { backgroundColor: 'rgba(0, 194, 255, 0.2)' }]}>
              <Ionicons name="arrow-down-outline" size={20} color="#00C2FF" />
            </View>
            <View>
              <Text style={styles.summaryLabel}>Ingresos</Text>
              <Text style={styles.summaryValue}>$3,500.00</Text>
            </View>
          </View>
          <View style={styles.summaryItem}>
            <View style={[styles.summaryIcon, { backgroundColor: 'rgba(255, 68, 68, 0.2)' }]}>
              <Ionicons name="arrow-up-outline" size={20} color="#ff4444" />
            </View>
            <View>
              <Text style={styles.summaryLabel}>Gastos</Text>
              <Text style={styles.summaryValue}>$1,250.00</Text>
            </View>
          </View>
          <View style={styles.summaryItem}>
            <View style={[styles.summaryIcon, { backgroundColor: 'rgba(78, 205, 196, 0.2)' }]}>
              <Ionicons name="piggy-bank-outline" size={20} color="#4ECDC4" />
            </View>
            <View>
              <Text style={styles.summaryLabel}>Ahorros</Text>
              <Text style={styles.summaryValue}>$2,250.00</Text>
            </View>
          </View>
        </View>

        {/* Expenses by Category */}
        <View style={styles.categorySection}>
          <Text style={styles.sectionTitle}>Gastos por Categoría</Text>
          <View style={styles.categoryContainer}>
            {categories.map((cat, index) => (
              <View key={index} style={styles.categoryItem}>
                <View style={styles.categoryHeader}>
                  <View style={[styles.categoryDot, { backgroundColor: cat.color }]} />
                  <Text style={styles.categoryName}>{cat.name}</Text>
                </View>
                <View style={styles.categoryDetails}>
                  <Text style={styles.categoryAmount}>${cat.amount}</Text>
                  <Text style={styles.categoryPercentage}>{cat.percentage}%</Text>
                </View>
                <View style={[styles.categoryBar, { backgroundColor: `${cat.color}40` }]}>
                  <View style={[styles.categoryBarFill, { backgroundColor: cat.color, width: `${cat.percentage}%` }]} />
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Recent Transactions */}
        <View style={styles.transactionsSection}>
          <View style={styles.transactionsHeader}>
            <Text style={styles.sectionTitle}>Transacciones Recientes</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>Ver todo</Text>
            </TouchableOpacity>
          </View>
          {transactions.map((transaction) => (
            <TouchableOpacity key={transaction.id} style={styles.transactionItem}>
              <View style={[styles.transactionIcon, { backgroundColor: `${transaction.color}20` }]}>
                <Ionicons name={transaction.icon} size={24} color={transaction.color} />
              </View>
              <View style={styles.transactionDetails}>
                <Text style={styles.transactionTitle}>{transaction.title}</Text>
                <Text style={styles.transactionCategory}>{transaction.category}</Text>
              </View>
              <View style={styles.transactionAmountContainer}>
                <Text style={[
                  styles.transactionAmount, 
                  transaction.amount > 0 ? styles.amountPositive : styles.amountNegative
                ]}>
                  {transaction.amount > 0 ? '+' : ''}${Math.abs(transaction.amount).toFixed(2)}
                </Text>
                <Text style={styles.transactionDate}>{transaction.date}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Bottom padding for FAB */}
        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity style={styles.fab}>
        <Ionicons name="add" size={28} color="#000" />
      </TouchableOpacity>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="home" size={24} color="#00C2FF" />
          <Text style={[styles.navText, { color: '#00C2FF' }]}>Inicio</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="stats-chart" size={24} color="#888" />
          <Text style={styles.navText}>Estadísticas</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="wallet" size={24} color="#888" />
          <Text style={styles.navText}>Cuentas</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="person" size={24} color="#888" />
          <Text style={styles.navText}>Perfil</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0f',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 15,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  welcomeText: {
    fontSize: 14,
    color: '#888',
    marginTop: 4,
  },
  settingsButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1a1a2e',
    justifyContent: 'center',
    alignItems: 'center',
  },
  balanceCard: {
    backgroundColor: '#1a1a2e',
    marginHorizontal: 20,
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
  },
  balanceLabel: {
    fontSize: 14,
    color: '#888',
    marginBottom: 8,
  },
  balanceAmount: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
  },
  balanceChange: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  balanceChangeText: {
    fontSize: 14,
    color: '#00C2FF',
    marginLeft: 4,
  },
  filterContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#1a1a2e',
    marginRight: 10,
  },
  filterChipActive: {
    backgroundColor: '#00C2FF',
  },
  filterText: {
    fontSize: 14,
    color: '#888',
  },
  filterTextActive: {
    color: '#000',
    fontWeight: '600',
  },
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 25,
  },
  summaryItem: {
    flex: 1,
    backgroundColor: '#1a1a2e',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 4,
  },
  summaryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#888',
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  categorySection: {
    paddingHorizontal: 20,
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
  },
  categoryContainer: {
    backgroundColor: '#1a1a2e',
    borderRadius: 16,
    padding: 20,
  },
  categoryItem: {
    marginBottom: 16,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  categoryName: {
    fontSize: 14,
    color: '#fff',
  },
  categoryDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  categoryAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  categoryPercentage: {
    fontSize: 14,
    color: '#888',
  },
  categoryBar: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  categoryBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  transactionsSection: {
    paddingHorizontal: 20,
    marginBottom: 25,
  },
  transactionsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  seeAllText: {
    fontSize: 14,
    color: '#00C2FF',
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a2e',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  transactionIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  transactionDetails: {
    flex: 1,
  },
  transactionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  transactionCategory: {
    fontSize: 14,
    color: '#888',
  },
  transactionAmountContainer: {
    alignItems: 'flex-end',
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  amountPositive: {
    color: '#00C2FF',
  },
  amountNegative: {
    color: '#ff4444',
  },
  transactionDate: {
    fontSize: 12,
    color: '#888',
  },
  bottomPadding: {
    height: 100,
  },
  fab: {
    position: 'absolute',
    bottom: 90,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#00C2FF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#00C2FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    backgroundColor: '#1a1a2e',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#2a2a4a',
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
  },
  navText: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
  },
});

export default DashboardScreen;
