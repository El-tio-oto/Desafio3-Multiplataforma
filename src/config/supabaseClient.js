import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

// IMPORTANTE: Reemplaza esta URL con la URL de tu proyecto Supabase.
// La puedes encontrar en tu panel de Supabase en: Project Settings -> API -> Project URL
const supabaseUrl = 'https://myseeypcugioaeflmwsm.supabase.co'; 

const supabaseAnonKey = 'sb_publishable_rAeu3qb6DvfYFHah6K5m7Q_9eHnapiS';

// Custom storage adapter para evitar errores de propiedades de solo lectura
const customStorage = {
  getItem: (key) => AsyncStorage.getItem(key),
  setItem: (key, value) => AsyncStorage.setItem(key, value),
  removeItem: (key) => AsyncStorage.removeItem(key),
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: customStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
