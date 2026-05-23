import { supabase } from '../config/supabaseClient';

// 1. Obtener todas las transacciones del usuario
export const getTransactions = async (userId) => {
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false });

  if (error) throw error;
  return data;
};

// 2. Agregar una nueva transacción
export const addTransaction = async (transactionData) => {
  const { data, error } = await supabase
    .from('transactions')
    .insert([transactionData]);

  if (error) throw error;
  return data;
};

// 3. Editar una transacción existente
export const updateTransaction = async (id, updates) => {
  const { data, error } = await supabase
    .from('transactions')
    .update(updates)
    .eq('id', id);

  if (error) throw error;
  return data;
};

// 4. Eliminar una transacción
export const deleteTransaction = async (id) => {
  const { error } = await supabase
    .from('transactions')
    .delete()
    .eq('id', id);

  if (error) throw error;
  return true;
};

// 5. Obtener resumen para el Dashboard (Lo que Fernando usará para los totales)
export const getDashboardSummary = async (userId) => {
  const { data, error } = await supabase
    .rpc('get_user_summary', { p_user_id: userId }); // Esto es una función SQL en Supabase

  if (error) throw error;
  return data;
};