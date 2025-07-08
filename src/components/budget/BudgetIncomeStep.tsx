import React from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2 } from 'lucide-react';
import { IncomeItem } from '../../types/budget';

// Romanian Lei currency symbol component
const LeiIcon: React.FC<{ className?: string }> = ({ className = "w-4 h-4" }) => (
  <span className={`font-bold ${className.replace('w-4 h-4', 'text-xs')}`}>RON</span>
);

interface BudgetIncomeStepProps {
  budgetName: string;
  setBudgetName: (name: string) => void;
  incomeItems: IncomeItem[];
  setIncomeItems: (items: IncomeItem[]) => void;
}

export const BudgetIncomeStep: React.FC<BudgetIncomeStepProps> = ({
  budgetName,
  setBudgetName,
  incomeItems,
  setIncomeItems
}) => {
  const totalIncome = incomeItems.reduce((sum, item) => sum + item.amount, 0);

  const addIncomeItem = () => {
    const newItem: IncomeItem = {
      id: Date.now().toString(),
      name: '',
      amount: 0,
      type: 'other'
    };
    setIncomeItems([...incomeItems, newItem]);
  };

  const updateIncomeItem = (id: string, field: keyof IncomeItem, value: any) => {
    setIncomeItems(items => 
      items.map(item => 
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };

  const removeIncomeItem = (id: string) => {
    setIncomeItems(items => items.filter(item => item.id !== id));
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-6"
    >
      <div>
        <h3 className="text-2xl font-bold text-light-text dark:text-dark-text font-editorial mb-2">Budget Name</h3>
        <p className="text-light-text-secondary dark:text-dark-text-secondary mb-4 text-sm md:text-base">Give your budget a memorable name</p>
        <input
          type="text"
          value={budgetName}
          onChange={(e) => setBudgetName(e.target.value)}
          placeholder="e.g., January 2024 Budget"
          className="w-full bg-light-glass dark:bg-dark-glass border border-light-border dark:border-dark-border rounded-xl px-4 py-3 text-light-text dark:text-dark-text focus:outline-none focus:border-lime-accent/50 transition-colors duration-300"
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl md:text-2xl font-bold text-light-text dark:text-dark-text font-editorial">Monthly Income</h3>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={addIncomeItem}
            className="flex items-center space-x-2 bg-lime-accent text-light-base dark:text-dark-base px-4 py-2 rounded-xl font-medium hover:shadow-glow transition-all"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Add Income</span>
            <span className="sm:hidden">Add</span>
          </motion.button>
        </div>

        <div className="space-y-4">
          {incomeItems.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-light-surface/50 dark:bg-dark-surface/50 border border-light-border dark:border-dark-border rounded-xl p-4 md:p-6"
            >
              <div className="space-y-3 md:grid md:grid-cols-3 md:gap-4 md:items-end md:space-y-0">
                <div>
                  <label className="block text-sm text-light-text-secondary dark:text-dark-text-secondary mb-2">Income Source</label>
                  <input
                    type="text"
                    value={item.name}
                    onChange={(e) => updateIncomeItem(item.id, 'name', e.target.value)}
                    placeholder="e.g., Main Salary, Freelance"
                    className="w-full bg-light-glass dark:bg-dark-glass border border-light-border dark:border-dark-border rounded-lg px-3 py-2 text-light-text dark:text-dark-text focus:outline-none focus:border-lime-accent/50 transition-colors duration-300"
                  />
                </div>
                <div>
                  <label className="block text-sm text-light-text-secondary dark:text-dark-text-secondary mb-2">Monthly Amount</label>
                  <div className="relative">
                    <LeiIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-light-text-secondary dark:text-dark-text-secondary" />
                    <input
                      type="number"
                      value={item.amount || ''}
                      onChange={(e) => updateIncomeItem(item.id, 'amount', parseFloat(e.target.value) || 0)}
                      className="w-full bg-light-glass dark:bg-dark-glass border border-light-border dark:border-dark-border rounded-lg pl-10 pr-3 py-2 text-light-text dark:text-dark-text focus:outline-none focus:border-lime-accent/50 transition-colors duration-300"
                    />
                  </div>
                </div>
                <div className="flex justify-center md:justify-start">
                  {incomeItems.length > 1 && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => removeIncomeItem(item.id)}
                      className="w-full md:w-auto p-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors text-sm"
                    >
                      <Trash2 className="w-4 h-4 mx-auto" />
                      <span className="block md:hidden mt-1">Remove</span>
                    </motion.button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-6 p-4 bg-lime-accent/10 border border-lime-accent/20 rounded-xl">
          <div className="flex items-center justify-between">
            <span className="text-light-text dark:text-dark-text font-medium text-sm md:text-base">Total Monthly Income:</span>
            <span className="text-xl md:text-2xl font-bold text-lime-accent">{totalIncome.toLocaleString()} LEI</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};