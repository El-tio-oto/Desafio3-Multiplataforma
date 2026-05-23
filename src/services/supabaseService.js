import { supabase } from '../config/supabaseClient';

// Helper para obtener el usuario actual
const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};

// Helper para manejar errores de forma amigable
const handleError = (error, context) => {
  console.error(`Error en ${context}:`, error);
  return {
    success: false,
    error: error.message || 'Ocurrió un error inesperado',
  };
};

// Transformar snake_case a camelCase para datos de Supabase
const toCamelCase = (obj) => {
  if (Array.isArray(obj)) {
    return obj.map(toCamelCase);
  }
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  return Object.keys(obj).reduce((acc, key) => {
    const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
    acc[camelKey] = toCamelCase(obj[key]);
    return acc;
  }, {});
};

// Transformar camelCase a snake_case para enviar a Supabase
const toSnakeCase = (obj) => {
  if (Array.isArray(obj)) {
    return obj.map(toSnakeCase);
  }
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  return Object.keys(obj).reduce((acc, key) => {
    const snakeKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
    acc[snakeKey] = toSnakeCase(obj[key]);
    return acc;
  }, {});
};

// ============================================
// ACCOUNTS
// ============================================

export const getAccounts = async () => {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error('Usuario no autenticado');

    const { data, error } = await supabase
      .from('accounts')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return { success: true, data: toCamelCase(data || []) };
  } catch (error) {
    return handleError(error, 'getAccounts');
  }
};

export const createAccount = async (accountData) => {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error('Usuario no autenticado');

    const { data, error } = await supabase
      .from('accounts')
      .insert({
        user_id: user.id,
        name: accountData.name,
        type: accountData.type,
        color: accountData.color || '#00C2FF',
        balance: 0,
      })
      .select()
      .single();

    if (error) throw error;

    return { success: true, data: toCamelCase(data) };
  } catch (error) {
    return handleError(error, 'createAccount');
  }
};

export const updateAccount = async (id, updates) => {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error('Usuario no autenticado');

    const { data, error } = await supabase
      .from('accounts')
      .update(toSnakeCase(updates))
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) throw error;

    return { success: true, data: toCamelCase(data) };
  } catch (error) {
    return handleError(error, 'updateAccount');
  }
};

export const deleteAccount = async (id) => {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error('Usuario no autenticado');

    const { error } = await supabase
      .from('accounts')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) throw error;

    return { success: true };
  } catch (error) {
    return handleError(error, 'deleteAccount');
  }
};

// ============================================
// BUDGETS
// ============================================

export const getBudgets = async () => {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error('Usuario no autenticado');

    const { data, error } = await supabase
      .from('budgets')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return { success: true, data: toCamelCase(data || []) };
  } catch (error) {
    return handleError(error, 'getBudgets');
  }
};

export const createBudget = async (budgetData) => {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error('Usuario no autenticado');

    const { data, error } = await supabase
      .from('budgets')
      .insert({
        user_id: user.id,
        category: budgetData.category,
        limit: budgetData.limit,
        spent: 0,
        color: budgetData.color || '#00C2FF',
      })
      .select()
      .single();

    if (error) throw error;

    return { success: true, data: toCamelCase(data) };
  } catch (error) {
    return handleError(error, 'createBudget');
  }
};

export const updateBudget = async (id, updates) => {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error('Usuario no autenticado');

    const { data, error } = await supabase
      .from('budgets')
      .update(toSnakeCase(updates))
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) throw error;

    return { success: true, data: toCamelCase(data) };
  } catch (error) {
    return handleError(error, 'updateBudget');
  }
};

export const deleteBudget = async (id) => {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error('Usuario no autenticado');

    const { error } = await supabase
      .from('budgets')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) throw error;

    return { success: true };
  } catch (error) {
    return handleError(error, 'deleteBudget');
  }
};

export const updateBudgetSpent = async (id, spent) => {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error('Usuario no autenticado');

    const { data, error } = await supabase
      .from('budgets')
      .update({ spent })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) throw error;

    return { success: true, data: toCamelCase(data) };
  } catch (error) {
    return handleError(error, 'updateBudgetSpent');
  }
};

// ============================================
// TRANSACTIONS
// ============================================

export const getTransactions = async (filters = {}) => {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error('Usuario no autenticado');

    let query = supabase
      .from('transactions')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: false });

    // Filtro por tipo
    if (filters.type) {
      query = query.eq('type', filters.type);
    }

    // Filtro por categoría
    if (filters.category) {
      query = query.eq('category', filters.category);
    }

    // Filtro por cuenta
    if (filters.accountId) {
      query = query.eq('account_id', filters.accountId);
    }

    // Filtro por fecha (rango)
    if (filters.startDate) {
      query = query.gte('date', filters.startDate);
    }
    if (filters.endDate) {
      query = query.lte('date', filters.endDate);
    }

    const { data, error } = await query;

    if (error) throw error;

    return { success: true, data: toCamelCase(data || []) };
  } catch (error) {
    return handleError(error, 'getTransactions');
  }
};

export const createTransaction = async (transactionData) => {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error('Usuario no autenticado');

    const amount = parseFloat(transactionData.amount);
    const type = amount > 0 ? 'income' : 'expense';

    const { data, error } = await supabase
      .from('transactions')
      .insert({
        user_id: user.id,
        title: transactionData.title,
        amount: Math.abs(amount),
        type: type,
        category: transactionData.category,
        account_id: transactionData.accountId,
        date: transactionData.date || new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    // Actualizar el spent del presupuesto correspondiente si es un gasto
    if (type === 'expense') {
      await updateBudgetSpentFromTransaction(transactionData.category, Math.abs(amount));
    }

    return { success: true, data: toCamelCase(data) };
  } catch (error) {
    return handleError(error, 'createTransaction');
  }
};

export const updateTransaction = async (id, updates) => {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error('Usuario no autenticado');

    const { data, error } = await supabase
      .from('transactions')
      .update(toSnakeCase(updates))
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) throw error;

    return { success: true, data: toCamelCase(data) };
  } catch (error) {
    return handleError(error, 'updateTransaction');
  }
};

export const deleteTransaction = async (id) => {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error('Usuario no autenticado');

    // Primero obtener la transacción para actualizar el presupuesto
    const { data: transaction } = await supabase
      .from('transactions')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (transaction && transaction.type === 'expense') {
      // Restar el monto del presupuesto correspondiente
      await decrementBudgetSpent(transaction.category, Math.abs(transaction.amount));
    }

    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) throw error;

    return { success: true };
  } catch (error) {
    return handleError(error, 'deleteTransaction');
  }
};

// Helper para actualizar el spent del presupuesto cuando se crea una transacción
const updateBudgetSpentFromTransaction = async (category, amount) => {
  try {
    const user = await getCurrentUser();
    if (!user) return;

    const { data: budgets } = await supabase
      .from('budgets')
      .select('*')
      .eq('user_id', user.id)
      .eq('category', category);

    if (budgets && budgets.length > 0) {
      const budget = budgets[0];
      await updateBudgetSpent(budget.id, (budget.spent || 0) + amount);
    }
  } catch (error) {
    console.error('Error actualizando presupuesto:', error);
  }
};

// Helper para decrementar el spent del presupuesto cuando se elimina una transacción
const decrementBudgetSpent = async (category, amount) => {
  try {
    const user = await getCurrentUser();
    if (!user) return;

    const { data: budgets } = await supabase
      .from('budgets')
      .select('*')
      .eq('user_id', user.id)
      .eq('category', category);

    if (budgets && budgets.length > 0) {
      const budget = budgets[0];
      const newSpent = Math.max(0, (budget.spent || 0) - amount);
      await updateBudgetSpent(budget.id, newSpent);
    }
  } catch (error) {
    console.error('Error decrementando presupuesto:', error);
  }
};

// ============================================
// PROFILES
// ============================================

export const getProfile = async () => {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error('Usuario no autenticado');

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) {
      // Si el perfil no existe, crear uno por defecto
      if (error.code === 'PGRST116') {
        return await createProfile({
          full_name: user.user_metadata?.full_name || 'Usuario Zenith',
          theme_preference: 'dark',
        });
      }
      throw error;
    }

    return { success: true, data: toCamelCase(data) };
  } catch (error) {
    return handleError(error, 'getProfile');
  }
};

export const createProfile = async (profileData) => {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error('Usuario no autenticado');

    const { data, error } = await supabase
      .from('profiles')
      .insert({
        id: user.id,
        full_name: profileData.full_name || user.user_metadata?.full_name || 'Usuario Zenith',
        theme_preference: profileData.theme_preference || 'dark',
      })
      .select()
      .single();

    if (error) throw error;

    return { success: true, data: toCamelCase(data) };
  } catch (error) {
    return handleError(error, 'createProfile');
  }
};

export const updateProfile = async (updates) => {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error('Usuario no autenticado');

    const { data, error } = await supabase
      .from('profiles')
      .update(toSnakeCase(updates))
      .eq('id', user.id)
      .select()
      .single();

    if (error) throw error;

    return { success: true, data: toCamelCase(data) };
  } catch (error) {
    return handleError(error, 'updateProfile');
  }
};

export const updateThemePreference = async (theme) => {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error('Usuario no autenticado');

    const { data, error } = await supabase
      .from('profiles')
      .update({ theme_preference: theme })
      .eq('id', user.id)
      .select()
      .single();

    if (error) throw error;

    return { success: true, data: toCamelCase(data) };
  } catch (error) {
    return handleError(error, 'updateThemePreference');
  }
};
