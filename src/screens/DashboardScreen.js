import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, Dimensions } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { useTheme } from '../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { PieChart } from 'react-native-chart-kit';

const DashboardScreen = ({ navigation }) => {
  const { user, logout } = useAuth();
  const { 
    transactions, 
    accounts, 
    budgets, 
    getMonthlyTotals, 
    getFilteredTransactions, 
    getExpensesByCategory,
    selectedFilter,
    setSelectedFilter 
  } = useData();
  const { isDarkMode, colors } = useTheme();
  const screenWidth = Dimensions.get('window').width;

  const monthlyTotals = getMonthlyTotals();
  const filteredTransactions = getFilteredTransactions();
  const expensesByCategory = getExpensesByCategory();

  const categoryIcons = {
    'Comida': 'restaurant-outline',
    'Transporte': 'car-outline',
    'Entretenimiento': 'film-outline',
    'Música': 'musical-notes-outline',
    'Compras': 'cart-outline',
    'Otros': 'ellipsis-horizontal-outline',
  };

  const categoryColors = {
    'Comida': '#FF6B6B',
    'Transporte': '#4ECDC4',
    'Entretenimiento': '#FFE66D',
    'Música': '#1DB954',
    'Compras': '#FF9900',
    'Otros': '#95E1D3',
  };

  const pieChartData = expensesByCategory.map(cat => ({
    name: cat.name,
    population: cat.percentage,
    color: cat.color,
    legendFontColor: '#FFF',
    legendFontSize: 12,
  }));

  const chartConfig = {
    backgroundColor: 'transparent',
    backgroundGradientFrom: 'transparent',
    backgroundGradientTo: 'transparent',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '6',
      strokeWidth: '2',
      stroke: '#fff',
    },
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={[styles.headerTitle, { color: colors.text }]}>Zenith Ledger</Text>
            <Text style={[styles.welcomeText, { color: colors.textSecondary }]}>Bienvenido, {user?.fullName || user?.email?.split('@')[0] || 'Usuario'}!</Text>
          </View>
          <TouchableOpacity 
            style={[styles.settingsButton, { backgroundColor: colors.surface }]}
            onPress={() => navigation.navigate('Settings')}
          >
            <Ionicons name="settings-outline" size={24} color={isDarkMode ? '#00C2FF' : '#0066cc'} />
          </TouchableOpacity>
        </View>

        {/* Balance Card */}
        <View style={[styles.balanceCard, { backgroundColor: colors.surface }]}>
          <Text style={[styles.balanceLabel, { color: colors.textSecondary }]}>Balance Total Actual</Text>
          <Text style={[styles.balanceAmount, { color: colors.text }]}>${monthlyTotals.netBalance.toFixed(2)}</Text>
          <View style={styles.balanceChange}>
            <Ionicons name={monthlyTotals.netBalance >= 0 ? 'trending-up' : 'trending-down'} size={16} color={monthlyTotals.netBalance >= 0 ? colors.success : colors.error} />
            <Text style={[styles.balanceChangeText, { color: monthlyTotals.netBalance >= 0 ? colors.success : colors.error }]}>
              {monthlyTotals.netBalance >= 0 ? '+' : ''}{((monthlyTotals.netBalance / (monthlyTotals.income || 1)) * 100).toFixed(1)}% este mes
            </Text>
          </View>
        </View>

        {/* Account Filters */}
        <View style={styles.filterContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <TouchableOpacity 
              style={[styles.filterChip, { backgroundColor: colors.surface }, selectedFilter === 'all' && styles.filterChipActive]}
              onPress={() => setSelectedFilter('all')}
            >
              <Text style={[styles.filterText, { color: colors.textSecondary }, selectedFilter === 'all' && styles.filterTextActive]}>
                Todas las Cuentas
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.filterChip, { backgroundColor: colors.surface }, selectedFilter === 'income' && styles.filterChipActive]}
              onPress={() => setSelectedFilter('income')}
            >
              <Text style={[styles.filterText, { color: colors.textSecondary }, selectedFilter === 'income' && styles.filterTextActive]}>
                Ingresos
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.filterChip, { backgroundColor: colors.surface }, selectedFilter === 'expense' && styles.filterChipActive]}
              onPress={() => setSelectedFilter('expense')}
            >
              <Text style={[styles.filterText, { color: colors.textSecondary }, selectedFilter === 'expense' && styles.filterTextActive]}>
                Gastos
              </Text>
            </TouchableOpacity>
            {accounts.map((account) => (
              <TouchableOpacity 
                key={account.id}
                style={[styles.filterChip, { backgroundColor: colors.surface }, selectedFilter === account.name && styles.filterChipActive]}
                onPress={() => setSelectedFilter(account.name)}
              >
                <Text style={[styles.filterText, { color: colors.textSecondary }, selectedFilter === account.name && styles.filterTextActive]}>
                  {account.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Monthly Summary */}
        <View style={styles.summaryContainer}>
          <View style={[styles.summaryItem, { backgroundColor: colors.surface }]}>
            <View style={[styles.summaryIcon, { backgroundColor: isDarkMode ? 'rgba(0, 194, 255, 0.2)' : 'rgba(0, 102, 204, 0.1)' }]}>
              <Ionicons name="arrow-down-outline" size={20} color={isDarkMode ? '#00C2FF' : '#0066cc'} />
            </View>
            <View>
              <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Ingresos</Text>
              <Text style={[styles.summaryValue, { color: colors.text }]}>${monthlyTotals.income.toFixed(2)}</Text>
            </View>
          </View>
          <View style={[styles.summaryItem, { backgroundColor: colors.surface }]}>
            <View style={[styles.summaryIcon, { backgroundColor: isDarkMode ? 'rgba(255, 68, 68, 0.2)' : 'rgba(204, 0, 0, 0.1)' }]}>
              <Ionicons name="arrow-up-outline" size={20} color={isDarkMode ? '#ff4444' : '#cc0000'} />
            </View>
            <View>
              <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Gastos</Text>
              <Text style={[styles.summaryValue, { color: colors.text }]}>${monthlyTotals.expenses.toFixed(2)}</Text>
            </View>
          </View>
          <View style={[styles.summaryItem, { backgroundColor: colors.surface }]}>
            <View style={[styles.summaryIcon, { backgroundColor: isDarkMode ? 'rgba(78, 205, 196, 0.2)' : 'rgba(0, 170, 102, 0.1)' }]}>
              <Ionicons name="piggy-bank-outline" size={20} color={isDarkMode ? '#4ECDC4' : '#00aa66'} />
            </View>
            <View>
              <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Ahorros</Text>
              <Text style={[styles.summaryValue, { color: colors.text }]}>${monthlyTotals.netBalance.toFixed(2)}</Text>
            </View>
          </View>
        </View>

        {/* Expenses by Category */}
        <View style={styles.categorySection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Gastos por Categoría</Text>
          <View style={[styles.chartContainer, { backgroundColor: colors.surface }]}>
            <View style={styles.pieChartWrapper}>
              <PieChart
                data={pieChartData}
                width={screenWidth - 40}
                height={180}
                chartConfig={chartConfig}
                accessor="population"
                backgroundColor="transparent"
                paddingLeft="15"
                absolute
                hasLegend={false}
              />
            </View>
            <View style={styles.legendContainer}>
              {expensesByCategory.map((cat, index) => (
                <View key={index} style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: cat.color }]} />
                  <View style={styles.legendTextContainer}>
                    <Text style={[styles.legendName, { color: colors.text }]}>{cat.name}</Text>
                    <Text style={[styles.legendPercentage, { color: colors.textSecondary }]}>{cat.percentage}%</Text>
                  </View>
                  <Text style={[styles.legendAmount, { color: colors.text }]}>${cat.amount.toFixed(2)}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Recent Transactions */}
        <View style={styles.transactionsSection}>
          <View style={styles.transactionsHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Transacciones Recientes</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Transactions')}>
              <Text style={[styles.seeAllText, { color: isDarkMode ? '#00C2FF' : '#0066cc' }]}>Ver todo</Text>
            </TouchableOpacity>
          </View>
          {filteredTransactions.slice(0, 5).map((transaction) => {
            const account = accounts.find(a => a.id === transaction.accountId);
            const icon = categoryIcons[transaction.category] || 'ellipsis-horizontal-outline';
            const color = categoryColors[transaction.category] || (isDarkMode ? '#00C2FF' : '#0066cc');
            const date = new Date(transaction.date);
            const formattedDate = date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
            
            return (
              <TouchableOpacity key={transaction.id} style={[styles.transactionItem, { backgroundColor: colors.surface }]}>
                <View style={[styles.transactionIcon, { backgroundColor: `${color}20` }]}>
                  <Ionicons name={icon} size={24} color={color} />
                </View>
                <View style={styles.transactionDetails}>
                  <Text style={[styles.transactionTitle, { color: colors.text }]}>{transaction.title}</Text>
                  <Text style={[styles.transactionCategory, { color: colors.textSecondary }]}>{transaction.category} • {account?.name || 'Cuenta'}</Text>
                </View>
                <View style={styles.transactionAmountContainer}>
                  <Text style={[
                    styles.transactionAmount, 
                    transaction.amount > 0 ? styles.amountPositive : styles.amountNegative,
                    { color: transaction.amount > 0 ? colors.success : colors.error }
                  ]}>
                    {transaction.amount > 0 ? '+' : ''}${Math.abs(transaction.amount).toFixed(2)}
                  </Text>
                  <Text style={[styles.transactionDate, { color: colors.textTertiary }]}>{formattedDate}</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Bottom padding for FAB */}
        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity style={[styles.fab, { backgroundColor: isDarkMode ? '#00C2FF' : '#0066cc' }]} onPress={() => navigation.navigate('AddTransaction')}>
        <Ionicons name="add" size={28} color="#000" />
      </TouchableOpacity>

      {/* Bottom Navigation */}
      <View style={[styles.bottomNav, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="home" size={24} color={isDarkMode ? '#00C2FF' : '#0066cc'} />
          <Text style={[styles.navText, { color: isDarkMode ? '#00C2FF' : '#0066cc' }]}>Inicio</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Statistics')}>
          <Ionicons name="stats-chart" size={24} color={colors.textTertiary} />
          <Text style={[styles.navText, { color: colors.textTertiary }]}>Estadísticas</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Accounts')}>
          <Ionicons name="wallet" size={24} color={colors.textTertiary} />
          <Text style={[styles.navText, { color: colors.textTertiary }]}>Cuentas</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Settings')}>
          <Ionicons name="person" size={24} color={colors.textTertiary} />
          <Text style={[styles.navText, { color: colors.textTertiary }]}>Perfil</Text>
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
  chartContainer: {
    backgroundColor: '#1a1a2e',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  pieChartWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  legendContainer: {
    flex: 1,
    marginLeft: 20,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  legendTextContainer: {
    flex: 1,
  },
  legendName: {
    fontSize: 14,
    color: '#fff',
    marginBottom: 2,
  },
  legendPercentage: {
    fontSize: 12,
    color: '#888',
  },
  legendAmount: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
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
