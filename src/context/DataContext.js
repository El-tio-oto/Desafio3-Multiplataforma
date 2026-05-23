import React, { createContext, useState, useContext, useEffect } from 'react';
import { Alert } from 'react-native';
import {
  getAccounts,
  createAccount,
  updateAccount as updateAccountSupabase,
  deleteAccount as deleteAccountSupabase,
  getBudgets,
  createBudget,
  updateBudget as updateBudgetSupabase,
  deleteBudget as deleteBudgetSupabase,
  getTransactions,
  createTransaction as createTransactionSupabase,
  updateTransaction as updateTransactionSupabase,
  deleteTransaction as deleteTransactionSupabase,
} from '../services/supabaseService';

const DataContext = createContext(null);

export const DataProvider = ({ children }) => {
  const [transactions, setTransactions] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState('all');

  // Cargar datos desde Supabase
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Cargar datos de Supabase en paralelo
      const [transactionsResult, accountsResult, budgetsResult] = await Promise.all([
        getTransactions(),
        getAccounts(),
        getBudgets(),
      ]);

      if (transactionsResult.success) {
        setTransactions(transactionsResult.data);
      }

      if (accountsResult.success) {
        setAccounts(accountsResult.data);
      }

      if (budgetsResult.success) {
        setBudgets(budgetsResult.data);
      }
    } catch (error) {
      console.error('Error cargando datos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Calcular saldo dinámico de una cuenta
  const calculateAccountBalance = (accountId) => {
    const accountTransactions = transactions.filter(t => t.accountId === accountId);
    return accountTransactions.reduce((sum, t) => sum + (t.type === 'income' ? t.amount : -t.amount), 0);
  };

  // Actualizar saldos de todas las cuentas
  const updateAllAccountBalances = () => {
    setAccounts(prevAccounts => 
      prevAccounts.map(account => ({
        ...account,
        balance: calculateAccountBalance(account.id)
      }))
    );
  };

  // CRUD Transacciones
  const addTransaction = async (transactionData) => {
    try {
      if (!transactionData.title || !transactionData.amount || !transactionData.category || !transactionData.accountId) {
        throw new Error('Todos los campos son requeridos');
      }

      const result = await createTransactionSupabase(transactionData);

      if (result.success) {
        // Recargar datos para mantener sincronización
        await loadData();
        return { success: true };
      } else {
        return result;
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const updateTransaction = async (id, updates) => {
    try {
      const result = await updateTransactionSupabase(id, updates);

      if (result.success) {
        // Recargar datos para mantener sincronización
        await loadData();
        return { success: true };
      } else {
        return result;
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const deleteTransaction = async (id) => {
    return new Promise((resolve) => {
      Alert.alert(
        'Eliminar Transacción',
        '¿Estás seguro de que quieres eliminar esta transacción?',
        [
          {
            text: 'Cancelar',
            style: 'cancel',
            onPress: () => resolve({ success: false }),
          },
          {
            text: 'Eliminar',
            style: 'destructive',
            onPress: async () => {
              try {
                const result = await deleteTransactionSupabase(id);

                if (result.success) {
                  // Recargar datos para mantener sincronización
                  await loadData();
                  resolve({ success: true });
                } else {
                  resolve(result);
                }
              } catch (error) {
                resolve({ success: false, error: error.message });
              }
            },
          },
        ]
      );
    });
  };

  // CRUD Cuentas
  const addAccount = async (accountData) => {
    try {
      if (!accountData.name || !accountData.type) {
        throw new Error('Nombre y tipo de cuenta son requeridos');
      }

      const result = await createAccount(accountData);

      if (result.success) {
        // Recargar datos para mantener sincronización
        await loadData();
        return { success: true };
      } else {
        return result;
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const updateAccount = async (id, updates) => {
    try {
      const result = await updateAccountSupabase(id, updates);

      if (result.success) {
        // Recargar datos para mantener sincronización
        await loadData();
        return { success: true };
      } else {
        return result;
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const deleteAccount = async (id) => {
    return new Promise((resolve) => {
      Alert.alert(
        'Eliminar Cuenta',
        '¿Estás seguro de que quieres eliminar esta cuenta? Las transacciones asociadas también se eliminarán.',
        [
          {
            text: 'Cancelar',
            style: 'cancel',
            onPress: () => resolve({ success: false }),
          },
          {
            text: 'Eliminar',
            style: 'destructive',
            onPress: async () => {
              try {
                const result = await deleteAccountSupabase(id);

                if (result.success) {
                  // Recargar datos para mantener sincronización
                  await loadData();
                  resolve({ success: true });
                } else {
                  resolve(result);
                }
              } catch (error) {
                resolve({ success: false, error: error.message });
              }
            },
          },
        ]
      );
    });
  };

  // CRUD Presupuestos
  const addBudget = async (budgetData) => {
    try {
      if (!budgetData.category || !budgetData.limit) {
        throw new Error('Categoría y límite son requeridos');
      }

      const result = await createBudget(budgetData);

      if (result.success) {
        // Recargar datos para mantener sincronización
        await loadData();
        return { success: true };
      } else {
        return result;
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const updateBudget = async (id, updates) => {
    try {
      const result = await updateBudgetSupabase(id, updates);

      if (result.success) {
        // Recargar datos para mantener sincronización
        await loadData();
        return { success: true };
      } else {
        return result;
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const deleteBudget = async (id) => {
    return new Promise((resolve) => {
      Alert.alert(
        'Eliminar Presupuesto',
        '¿Estás seguro de que quieres eliminar este presupuesto?',
        [
          {
            text: 'Cancelar',
            style: 'cancel',
            onPress: () => resolve({ success: false }),
          },
          {
            text: 'Eliminar',
            style: 'destructive',
            onPress: async () => {
              try {
                const result = await deleteBudgetSupabase(id);

                if (result.success) {
                  // Recargar datos para mantener sincronización
                  await loadData();
                  resolve({ success: true });
                } else {
                  resolve(result);
                }
              } catch (error) {
                resolve({ success: false, error: error.message });
              }
            },
          },
        ]
      );
    });
  };

  // Actualizar presupuesto gastado basado en transacciones (calculado dinámicamente)
  const updateBudgetSpent = () => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    const updatedBudgets = budgets.map(budget => {
      const categoryTransactions = transactions.filter(t => {
        const transactionDate = new Date(t.date);
        return (
          t.category === budget.category &&
          t.type === 'expense' &&
          transactionDate.getMonth() === currentMonth &&
          transactionDate.getFullYear() === currentYear
        );
      });

      const spent = categoryTransactions.reduce((sum, t) => sum + Math.abs(t.amount), 0);
      return { ...budget, spent };
    });

    setBudgets(updatedBudgets);
  };

  // Calcular totales del mes actual
  const getMonthlyTotals = () => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    const monthlyTransactions = transactions.filter(t => {
      const transactionDate = new Date(t.date);
      return (
        transactionDate.getMonth() === currentMonth &&
        transactionDate.getFullYear() === currentYear
      );
    });

    const income = monthlyTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const expenses = monthlyTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    const netBalance = income - expenses;

    return { income, expenses, netBalance };
  };

  // Filtrar transacciones
  const getFilteredTransactions = () => {
    if (selectedFilter === 'all') return transactions;
    
    if (selectedFilter === 'income') {
      return transactions.filter(t => t.type === 'income');
    }
    
    if (selectedFilter === 'expense') {
      return transactions.filter(t => t.type === 'expense');
    }

    // Filtrar por cuenta
    const account = accounts.find(a => a.name === selectedFilter);
    if (account) {
      return transactions.filter(t => t.accountId === account.id);
    }

    return transactions;
  };

  // Obtener distribución de gastos por categoría para el Pie Chart
  const getExpensesByCategory = () => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    const monthlyExpenses = transactions.filter(t => {
      const transactionDate = new Date(t.date);
      return (
        t.type === 'expense' &&
        transactionDate.getMonth() === currentMonth &&
        transactionDate.getFullYear() === currentYear
      );
    });

    const categoryTotals = {};
    monthlyExpenses.forEach(t => {
      const amount = Math.abs(t.amount);
      categoryTotals[t.category] = (categoryTotals[t.category] || 0) + amount;
    });

    const totalExpenses = Object.values(categoryTotals).reduce((sum, val) => sum + val, 0);

    const categoryColors = {
      'Comida': '#FF6B6B',
      'Transporte': '#4ECDC4',
      'Entretenimiento': '#FFE66D',
      'Música': '#1DB954',
      'Compras': '#FF9900',
      'Otros': '#95E1D3',
    };

    return Object.entries(categoryTotals).map(([name, amount]) => ({
      name,
      amount,
      percentage: Math.round((amount / totalExpenses) * 100),
      color: categoryColors[name] || '#00C2FF',
    }));
  };

  const value = {
    transactions,
    accounts,
    budgets,
    isLoading,
    selectedFilter,
    setSelectedFilter,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    addAccount,
    updateAccount,
    deleteAccount,
    addBudget,
    updateBudget,
    deleteBudget,
    updateBudgetSpent,
    getMonthlyTotals,
    getFilteredTransactions,
    getExpensesByCategory,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData debe ser usado dentro de un DataProvider');
  }
  return context;
};
