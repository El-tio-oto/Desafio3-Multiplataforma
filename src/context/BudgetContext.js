import React, { createContext, useState, useContext } from 'react';

export const BudgetContext = createContext();

/**
 * BudgetProvider gestiona los presupuestos asignados por categoría.
 */
export const BudgetProvider = ({ children }) => {
  // Estado: Array de objetos { categoryId: string, limit: number }
  const [budgets, setBudgets] = useState([]);

  /**
   * Define o actualiza el límite presupuestario para una categoría específica.
   */
  const setBudgetLimit = (categoryId, limit) => {
    setBudgets((prev) => {
      const existing = prev.find((b) => b.categoryId === categoryId);
      if (existing) {
        return prev.map((b) => 
          b.categoryId === categoryId ? { ...b, limit: parseFloat(limit) } : b
        );
      }
      return [...prev, { categoryId, limit: parseFloat(limit) }];
    });
  };

  /**
   * Calcula el porcentaje de consumo basado en los gastos actuales de la categoría.
   * @param {string} categoryId 
   * @param {number} totalSpent - Total de gastos acumulados en esa categoría
   */
  const getBudgetStatus = (categoryId, totalSpent) => {
    const budget = budgets.find((b) => b.categoryId === categoryId);
    if (!budget) return { percentage: 0, status: 'none' };

    const percentage = (totalSpent / budget.limit) * 100;
    
    let status = 'normal';
    if (percentage >= 100) {
      status = 'exceeded'; // 100% o más
    } else if (percentage >= 80) {
      status = 'warning'; // 80% o más
    }

    return {
      percentage: Math.min(percentage, 100),
      status,
      limit: budget.limit
    };
  };

  return (
    <BudgetContext.Provider value={{ budgets, setBudgetLimit, getBudgetStatus }}>
      {children}
    </BudgetContext.Provider>
  );
};

export const useBudget = () => {
  const context = useContext(BudgetContext);
  if (!context) {
    throw new Error('useBudget must be used within a BudgetProvider');
  }
  return context;
};