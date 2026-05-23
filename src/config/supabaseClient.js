import React, { createContext, useState, useContext } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false); // Ponlo en false para que no se trabe en carga

  const login = async (email, password) => {
    // Simulamos un login exitoso
    setUser({ email, fullName: 'Usuario Prueba' });
    return { success: true };
  };

  const register = async (fullName, email, password) => {
    setUser({ email, fullName });
    return { success: true };
  };

  const logout = async () => {
    setUser(null);
  };

  const value = {
    user,
    isLoading,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);