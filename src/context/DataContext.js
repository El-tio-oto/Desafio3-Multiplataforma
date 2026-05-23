import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';

const DataContext = createContext(null);

export const DataProvider = ({ children }) => {
  const [transactions, setTransactions] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState('all');

  // Cargar datos iniciales o de AsyncStorage
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const storedTransactions = await AsyncStorage.getItem('zenith_transactions');
      const storedAccounts = await AsyncStorage.getItem('zenith_accounts');
      const storedBudgets = await AsyncStorage.getItem('zenith_budgets');

      if (storedTransactions) {
        setTransactions(JSON.parse(storedTransactions));
      } else {
        // Datos iniciales de prueba
        const initialTransactions = [
          { id: 1, title: 'Netflix', category: 'Entretenimiento', amount: -15.99, date: new Date().toISOString(), type: 'expense', accountId: 1 },
          { id: 2, title: 'Spotify', category: 'Música', amount: -9.99, date: new Date(Date.now() - 86400000).toISOString(), type: 'expense', accountId: 1 },
          { id: 3, title: 'Salario', category: 'Ingreso', amount: 2500.00, date: new Date(Date.now() - 172800000).toISOString(), type: 'income', accountId: 2 },
          { id: 4, title: 'Amazon', category: 'Compras', amount: -89.50, date: new Date(Date.now() - 259200000).toISOString(), type: 'expense', accountId: 3 },
        ];
        setTransactions(initialTransactions);
        await AsyncStorage.setItem('zenith_transactions', JSON.stringify(initialTransactions));
      }

      if (storedAccounts) {
        setAccounts(JSON.parse(storedAccounts));
      } else {
        // Cuentas iniciales de prueba
        const initialAccounts = [
          { id: 1, name: 'Efectivo', type: 'cash', balance: 500, color: '#4ECDC4' },
          { id: 2, name: 'Chase Bank', type: 'bank', balance: 5000, color: '#00C2FF' },
          { id: 3, name: 'Capital One', type: 'credit', balance: -200, color: '#FF6B6B' },
        ];
        setAccounts(initialAccounts);
        await AsyncStorage.setItem('zenith_accounts', JSON.stringify(initialAccounts));
      }

      if (storedBudgets) {
        setBudgets(JSON.parse(storedBudgets));
      } else {
        // Presupuestos iniciales de prueba
        const initialBudgets = [
          { id: 1, category: 'Comida', limit: 500, spent: 450, color: '#FF6B6B' },
          { id: 2, category: 'Transporte', limit: 300, spent: 200, color: '#4ECDC4' },
          { id: 3, category: 'Entretenimiento', limit: 200, spent: 150, color: '#FFE66D' },
          { id: 4, category: 'Otros', limit: 200, spent: 100, color: '#95E1D3' },
        ];
        setBudgets(initialBudgets);
        await AsyncStorage.setItem('zenith_budgets', JSON.stringify(initialBudgets));
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
    return accountTransactions.reduce((sum, t) => sum + t.amount, 0);
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

      const newTransaction = {
        id: Date.now(),
        ...transactionData,
        date: transactionData.date || new Date().toISOString(),
        type: transactionData.amount > 0 ? 'income' : 'expense',
      };

      const updatedTransactions = [...transactions, newTransaction];
      setTransactions(updatedTransactions);
      await AsyncStorage.setItem('zenith_transactions', JSON.stringify(updatedTransactions));
      
      // Actualizar saldo de la cuenta
      updateAllAccountBalances();
      await AsyncStorage.setItem('zenith_accounts', JSON.stringify(accounts));

      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const updateTransaction = async (id, updates) => {
    try {
      const updatedTransactions = transactions.map(t => 
        t.id === id ? { ...t, ...updates } : t
      );
      setTransactions(updatedTransactions);
      await AsyncStorage.setItem('zenith_transactions', JSON.stringify(updatedTransactions));
      
      // Actualizar saldo de la cuenta
      updateAllAccountBalances();
      await AsyncStorage.setItem('zenith_accounts', JSON.stringify(accounts));

      return { success: true };
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
                const updatedTransactions = transactions.filter(t => t.id !== id);
                setTransactions(updatedTransactions);
                await AsyncStorage.setItem('zenith_transactions', JSON.stringify(updatedTransactions));
                
                // Actualizar saldo de la cuenta
                updateAllAccountBalances();
                await AsyncStorage.setItem('zenith_accounts', JSON.stringify(accounts));

                resolve({ success: true });
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

      const newAccount = {
        id: Date.now(),
        ...accountData,
        balance: 0,
        color: accountData.color || '#00C2FF',
      };

      const updatedAccounts = [...accounts, newAccount];
      setAccounts(updatedAccounts);
      await AsyncStorage.setItem('zenith_accounts', JSON.stringify(updatedAccounts));

      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const updateAccount = async (id, updates) => {
    try {
      const updatedAccounts = accounts.map(a => 
        a.id === id ? { ...a, ...updates } : a
      );
      setAccounts(updatedAccounts);
      await AsyncStorage.setItem('zenith_accounts', JSON.stringify(updatedAccounts));

      return { success: true };
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
                // Eliminar transacciones de esta cuenta
                const updatedTransactions = transactions.filter(t => t.accountId !== id);
                setTransactions(updatedTransactions);
                await AsyncStorage.setItem('zenith_transactions', JSON.stringify(updatedTransactions));

                // Eliminar cuenta
                const updatedAccounts = accounts.filter(a => a.id !== id);
                setAccounts(updatedAccounts);
                await AsyncStorage.setItem('zenith_accounts', JSON.stringify(updatedAccounts));

                resolve({ success: true });
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

      const newBudget = {
        id: Date.now(),
        ...budgetData,
        spent: 0,
        color: budgetData.color || '#00C2FF',
      };

      const updatedBudgets = [...budgets, newBudget];
      setBudgets(updatedBudgets);
      await AsyncStorage.setItem('zenith_budgets', JSON.stringify(updatedBudgets));

      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const updateBudget = async (id, updates) => {
    try {
      const updatedBudgets = budgets.map(b => 
        b.id === id ? { ...b, ...updates } : b
      );
      setBudgets(updatedBudgets);
      await AsyncStorage.setItem('zenith_budgets', JSON.stringify(updatedBudgets));

      return { success: true };
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
                const updatedBudgets = budgets.filter(b => b.id !== id);
                setBudgets(updatedBudgets);
                await AsyncStorage.setItem('zenith_budgets', JSON.stringify(updatedBudgets));

                resolve({ success: true });
              } catch (error) {
                resolve({ success: false, error: error.message });
              }
            },
          },
        ]
      );
    });
  };

  // Actualizar presupuesto gastado basado en transacciones
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
    AsyncStorage.setItem('zenith_budgets', JSON.stringify(updatedBudgets));
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
