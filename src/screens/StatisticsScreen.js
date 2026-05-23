import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, Dimensions } from 'react-native';
import { useData } from '../context/DataContext';
import { Ionicons } from '@expo/vector-icons';
import { PieChart, LineChart, BarChart } from 'react-native-chart-kit';

const StatisticsScreen = ({ navigation }) => {
  const { transactions, accounts, budgets, getMonthlyTotals, getExpensesByCategory } = useData();
  const screenWidth = Dimensions.get('window').width;

  const monthlyTotals = getMonthlyTotals();
  const expensesByCategory = getExpensesByCategory();

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

  const getLast6MonthsData = () => {
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthName = date.toLocaleDateString('es-ES', { month: 'short' });
      months.push(monthName);
    }
    return months;
  };

  const getMonthlyIncomeExpenses = () => {
    const data = { income: [], expenses: [] };
    const months = getLast6MonthsData();

    months.forEach((month, index) => {
      const date = new Date();
      date.setMonth(date.getMonth() - (5 - index));
      const targetMonth = date.getMonth();
      const targetYear = date.getFullYear();

      const monthTransactions = transactions.filter(t => {
        const tDate = new Date(t.date);
        return tDate.getMonth() === targetMonth && tDate.getFullYear() === targetYear;
      });

      const income = monthTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);

      const expenses = monthTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + Math.abs(t.amount), 0);

      data.income.push(income);
      data.expenses.push(expenses);
    });

    return data;
  };

  const monthlyData = getMonthlyIncomeExpenses();

  const lineChartData = {
    labels: getLast6MonthsData(),
    datasets: [
      {
        data: monthlyData.income,
        color: (opacity = 1) => `rgba(0, 194, 255, ${opacity})`,
        strokeWidth: 2,
      },
      {
        data: monthlyData.expenses,
        color: (opacity = 1) => `rgba(255, 68, 68, ${opacity})`,
        strokeWidth: 2,
      },
    ],
  };

  const barChartData = {
    labels: getLast6MonthsData(),
    datasets: [
      {
        data: monthlyData.income.map((income, i) => income - monthlyData.expenses[i]),
      },
    ],
  };

  const getTopSpendingCategories = () => {
    return [...expensesByCategory]
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);
  };

  const topCategories = getTopSpendingCategories();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Estadísticas</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Monthly Summary Cards */}
        <View style={styles.summaryCards}>
          <View style={[styles.summaryCard, styles.incomeCard]}>
            <Ionicons name="arrow-down-outline" size={24} color="#00C2FF" />
            <Text style={styles.summaryLabel}>Ingresos</Text>
            <Text style={styles.summaryValue}>${monthlyTotals.income.toFixed(2)}</Text>
          </View>
          <View style={[styles.summaryCard, styles.expenseCard]}>
            <Ionicons name="arrow-up-outline" size={24} color="#ff4444" />
            <Text style={styles.summaryLabel}>Gastos</Text>
            <Text style={styles.summaryValue}>${monthlyTotals.expenses.toFixed(2)}</Text>
          </View>
          <View style={[styles.summaryCard, styles.balanceCard]}>
            <Ionicons name="trending-up" size={24} color="#4ECDC4" />
            <Text style={styles.summaryLabel}>Balance</Text>
            <Text style={styles.summaryValue}>${monthlyTotals.netBalance.toFixed(2)}</Text>
          </View>
        </View>

        {/* Income vs Expenses Line Chart */}
        <View style={styles.chartSection}>
          <Text style={styles.chartTitle}>Ingresos vs Gastos (Últimos 6 meses)</Text>
          <View style={styles.chartContainer}>
            <LineChart
              data={lineChartData}
              width={screenWidth - 80}
              height={220}
              chartConfig={chartConfig}
              bezier
              style={styles.chart}
              withDots={true}
              withInnerLines={false}
              withOuterLines={false}
              withVerticalLines={false}
              withHorizontalLines={false}
            />
          </View>
          <View style={styles.legend}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#00C2FF' }]} />
              <Text style={styles.legendText}>Ingresos</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#ff4444' }]} />
              <Text style={styles.legendText}>Gastos</Text>
            </View>
          </View>
        </View>

        {/* Net Balance Bar Chart */}
        <View style={styles.chartSection}>
          <Text style={styles.chartTitle}>Balance Neto Mensual</Text>
          <View style={styles.chartContainer}>
            <BarChart
              data={barChartData}
              width={screenWidth - 80}
              height={220}
              chartConfig={chartConfig}
              style={styles.chart}
              showBarTops={false}
              withInnerLines={false}
              withOuterLines={false}
            />
          </View>
        </View>

        {/* Expenses by Category Pie Chart */}
        <View style={styles.chartSection}>
          <Text style={styles.chartTitle}>Distribución de Gastos</Text>
          <View style={styles.pieChartContainer}>
            {expensesByCategory.length > 0 ? (
              <>
                <PieChart
                  data={pieChartData}
                  width={screenWidth - 80}
                  height={220}
                  chartConfig={chartConfig}
                  accessor="population"
                  backgroundColor="transparent"
                  paddingLeft="15"
                  absolute
                  hasLegend={false}
                />
                <View style={styles.pieLegend}>
                  {expensesByCategory.map((cat, index) => (
                    <View key={index} style={styles.pieLegendItem}>
                      <View style={[styles.pieLegendDot, { backgroundColor: cat.color }]} />
                      <Text style={styles.pieLegendName}>{cat.name}</Text>
                      <Text style={styles.pieLegendAmount}>${cat.amount.toFixed(2)}</Text>
                    </View>
                  ))}
                </View>
              </>
            ) : (
              <View style={styles.emptyChart}>
                <Ionicons name="pie-chart-outline" size={48} color="#888" />
                <Text style={styles.emptyChartText}>Sin datos de gastos</Text>
              </View>
            )}
          </View>
        </View>

        {/* Top Spending Categories */}
        <View style={styles.topCategoriesSection}>
          <Text style={styles.sectionTitle}>Categorías con Mayor Gasto</Text>
          {topCategories.length > 0 ? (
            topCategories.map((cat, index) => (
              <View key={index} style={styles.topCategoryItem}>
                <View style={styles.topCategoryLeft}>
                  <View style={[styles.topCategoryDot, { backgroundColor: cat.color }]} />
                  <Text style={styles.topCategoryName}>{cat.name}</Text>
                </View>
                <View style={styles.topCategoryRight}>
                  <Text style={styles.topCategoryAmount}>${cat.amount.toFixed(2)}</Text>
                  <Text style={styles.topCategoryPercentage}>{cat.percentage}%</Text>
                </View>
              </View>
            ))
          ) : (
            <View style={stylesEmptyContainer}>
              <Text style={styles.emptyText}>Sin datos</Text>
            </View>
          )}
        </View>

        {/* Accounts Overview */}
        <View style={styles.accountsSection}>
          <Text style={styles.sectionTitle}>Resumen de Cuentas</Text>
          {accounts.map((account) => (
            <View key={account.id} style={styles.accountItem}>
              <View style={[styles.accountDot, { backgroundColor: account.color }]} />
              <Text style={styles.accountName}>{account.name}</Text>
              <Text style={[
                styles.accountBalance,
                account.balance < 0 ? styles.balanceNegative : styles.balancePositive
              ]}>
                ${account.balance.toFixed(2)}
              </Text>
            </View>
          ))}
        </View>

        {/* Budget Progress */}
        <View style={styles.budgetSection}>
          <Text style={styles.sectionTitle}>Progreso de Presupuestos</Text>
          {budgets.map((budget) => {
            const percentage = budget.limit > 0 ? (budget.spent / budget.limit) * 100 : 0;
            const progressColor = percentage >= 100 ? '#ff4444' : percentage >= 80 ? '#FF9900' : '#00C2FF';

            return (
              <View key={budget.id} style={styles.budgetItem}>
                <View style={styles.budgetItemLeft}>
                  <Text style={styles.budgetItemName}>{budget.category}</Text>
                  <Text style={styles.budgetItemDetails}>
                    ${budget.spent.toFixed(2)} / ${budget.limit.toFixed(2)}
                  </Text>
                </View>
                <View style={styles.budgetItemRight}>
                  <Text style={[styles.budgetItemPercentage, { color: progressColor }]}>
                    {percentage.toFixed(0)}%
                  </Text>
                  <View style={styles.budgetProgressBar}>
                    <View 
                      style={[
                        styles.budgetProgressFill,
                        { width: `${Math.min(percentage, 100)}%`, backgroundColor: progressColor }
                      ]} 
                    />
                  </View>
                </View>
              </View>
            );
          })}
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
  scrollView: {
    flex: 1,
  },
  summaryCards: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 20,
    gap: 12,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: '#1a1a2e',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
  },
  incomeCard: {
    borderWidth: 1,
    borderColor: 'rgba(0, 194, 255, 0.3)',
  },
  expenseCard: {
    borderWidth: 1,
    borderColor: 'rgba(255, 68, 68, 0.3)',
  },
  balanceCard: {
    borderWidth: 1,
    borderColor: 'rgba(78, 205, 196, 0.3)',
  },
  summaryLabel: {
    fontSize: 12,
    color: '#888',
    marginTop: 8,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 4,
  },
  chartSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
  },
  chartContainer: {
    backgroundColor: '#1a1a2e',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
  },
  chart: {
    borderRadius: 16,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 12,
    gap: 24,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    fontSize: 14,
    color: '#888',
  },
  pieChartContainer: {
    backgroundColor: '#1a1a2e',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  pieLegend: {
    flex: 1,
    marginLeft: 20,
  },
  pieLegendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  pieLegendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  pieLegendName: {
    fontSize: 14,
    color: '#fff',
    flex: 1,
  },
  pieLegendAmount: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
  },
  emptyChart: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyChartText: {
    fontSize: 14,
    color: '#888',
    marginTop: 12,
  },
  topCategoriesSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
  },
  topCategoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  topCategoryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  topCategoryDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  topCategoryName: {
    fontSize: 16,
    color: '#fff',
  },
  topCategoryRight: {
    alignItems: 'flex-end',
  },
  topCategoryAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  topCategoryPercentage: {
    fontSize: 14,
    color: '#888',
  },
  accountsSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  accountItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  accountDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  accountName: {
    fontSize: 16,
    color: '#fff',
    flex: 1,
  },
  accountBalance: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  balancePositive: {
    color: '#00C2FF',
  },
  balanceNegative: {
    color: '#ff4444',
  },
  budgetSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  budgetItem: {
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  budgetItemLeft: {
    marginBottom: 12,
  },
  budgetItemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  budgetItemDetails: {
    fontSize: 14,
    color: '#888',
  },
  budgetItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  budgetItemPercentage: {
    fontSize: 18,
    fontWeight: 'bold',
    minWidth: 50,
    textAlign: 'right',
  },
  budgetProgressBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#0a0a0f',
    borderRadius: 4,
    marginLeft: 12,
    overflow: 'hidden',
  },
  budgetProgressFill: {
    height: '100%',
    borderRadius: 4,
  },
  bottomPadding: {
    height: 40,
  },
});

export default StatisticsScreen;
