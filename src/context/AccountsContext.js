import React, { createContext, useState, useContext } from 'react';

export const AccountsContext = createContext();

export const AccountsProvider = ({ children }) => {
  // Estado inicial: una lista vacía de cuentas
  const [accounts, setAccounts] = useState([]);

  // Función para agregar una cuenta
  const addAccount = (account) => {
    setAccounts([...accounts, { ...account, id: Date.now().toString(), saldo: account.saldoInicial }]);
  };

  // Función para eliminar una cuenta
  const deleteAccount = (id) => {
    setAccounts(accounts.filter(acc => acc.id !== id));
  };

  // Esta función calcula el saldo total sumando las cuentas
  // (La lógica de restar gastos vendrá cuando vincules esto con las transacciones)
  const getTotalBalance = () => {
    return accounts.reduce((acc, curr) => acc + parseFloat(curr.saldo), 0);
  };

  return (
    <AccountsContext.Provider value={{ accounts, addAccount, deleteAccount, getTotalBalance }}>
      {children}
    </AccountsContext.Provider>
  );
};

export const useAccounts = () => useContext(AccountsContext);