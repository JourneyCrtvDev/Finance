import React from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2, Calendar } from 'lucide-react';
import { ExpenseItem, DEFAULT_EXPENSE_CATEGORIES } from '../../types/budget';

// Romanian Lei currency symbol component
const LeiIcon: React.FC<{ className?: string }> = ({ className = "w-4 h-4" }) => (
  <span className={`font-bold ${className.replace('w-4 h-4', 'text-xs')}`}>RON</span>
);

interface BudgetExpenseStepProps {
  expenseItems: ExpenseItem[];
  setExpenseItems: (items: ExpenseItem[]) => void;
  totalIncome: number;
  isEditing: boolean;
  hasLoadedPreviousExpenses: boolean;
  setHasLoadedPreviousExpenses: (loaded: boolean) => void;
  onLoadPreviousExpenses: () => void;
  isLoadingPrevious: boolean;
}

export const BudgetExpenseStep: React.FC<BudgetExpenseStepProps> = ({
  expenseItems,
  setExpenseItems,
  totalIncome,
  isEditing,
  hasLoadedPreviousExpenses,
  setHasLoadedPreviousExpenses,
  onLoadPreviousExpenses,
  isLoadingPrevious
}) => {
  const [customExpenseName, setCustomExpenseName] = React.useState('');
  const [customExpenseCategory, setCustomExpenseCategory] = React.useState<'fixed' | 'variable'>('variable');

  const totalExpenses = expenseItems.reduce((sum, item) => sum + item.planned, 0);
  const leftoverAmount = totalIncome - totalExpenses;

  const addExpenseItem = (category: 'fixed' | 'variable', subcategory: string) => {
    const newItem: ExpenseItem = {
      id: Date.now().toString(),
      name: subcategory,
      amount: 0,
      category,
      subcategory,
      planned: 0,
      actual: 0
    };
    setExpenseItems([...expenseItems, newItem]);
  };

  const addCustomExpenseItem = () => {
    if (!customExpenseName.trim()) return;
    
    const newItem: ExpenseItem = {
      id: Date.now().toString(),
      name: customExpenseName.trim(),
      amount: 0,
      category: customExpenseCategory,
      subcategory: customExpenseName.trim(),
      planned: 0,
      actual: 0
    };
    setExpenseItems([...expenseItems, newItem]);
    setCustomExpenseName('');
  };

  const updateExpenseItem = (id: string, field: keyof ExpenseItem, value: any) => {
    setExpenseItems(items => 
      items.map(item => 
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };

  const removeExpenseItem = (id: string) => {
    setExpenseItems(items => items.filter(item => item.id !== id));
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-6"
    >
      <div>
        <h3 className="text-xl md:text-2xl font-bold text-light-text dark:text-dark-text font-editorial mb-2">Monthly Expenses</h3>
        <p className="text-light-text-secondary dark:text-dark-text-secondary mb-6 text-sm md:text-base">Add your fixed and variable expenses</p>

        {/* Fixed Expenses */}
        <div className="mb-8">
          <h4 className="text-lg font-semibold text-light-text dark:text-dark-text mb-4">Fixed Expenses</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-3 mb-4">
            {DEFAULT_EXPENSE_CATEGORIES.fixed.map((category) => (
              <motion.button
                key={category}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => addExpenseItem('fixed', category)}
                className="p-2 md:p-3 bg-light-glass dark:bg-dark-glass border border-light-border dark:border-dark-border rounded-lg text-xs md:text-sm text-light-text dark:text-dark-text hover:border-lime-accent/30 transition-all text-center"
              >
                <span className="block">+</span>
                <span className="block">{category}</span>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Variable Expenses */}
        <div className="mb-8">
          <h4 className="text-lg font-semibold text-light-text dark:text-dark-text mb-4">Variable Expenses</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-3 mb-4">
            {DEFAULT_EXPENSE_CATEGORIES.variable.map((category) => (
              <motion.button
                key={category}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => addExpenseItem('variable', category)}
                className="p-2 md:p-3 bg-light-glass dark:bg-dark-glass border border-light-border dark:border-dark-border rounded-lg text-xs md:text-sm text-light-text dark:text-dark-text hover:border-lime-accent/30 transition-all text-center"
              >
                <span className="block">+</span>
                <span className="block">{category}</span>
              </motion.button>
            ))}
          </div>
          
          {/* Load Previous Month Expenses Button */}
          {!isEditing && expenseItems.length === 0 && !hasLoadedPreviousExpenses && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-gradient-to-r from-lime-accent/10 to-lime-accent/5 border border-lime-accent/20 rounded-xl"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-3 sm:space-y-0">
                <div>
                  <h4 className="text-base font-semibold text-light-text dark:text-dark-text mb-1">
                    Save Time with Previous Expenses
                  </h4>
                  <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                    Load expenses from your most recent budget plan to avoid re-entering recurring payments.
                  </p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onLoadPreviousExpenses}
                  disabled={isLoadingPrevious}
                  className="flex items-center space-x-2 bg-lime-accent text-light-base dark:text-dark-base px-4 py-2 rounded-xl font-medium hover:shadow-glow transition-all disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                >
                  {isLoadingPrevious ? (
                    <>
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      <span>Loading...</span>
                    </>
                  ) : (
                    <>
                      <Calendar className="w-4 h-4" />
                      <span>Load Previous Expenses</span>
                    </>
                  )}
                </motion.button>
              </div>
            </motion.div>
          )}
        </div>

        {/* Custom Expense Input */}
        <div className="mb-8">
          <h4 className="text-lg font-semibold text-light-text dark:text-dark-text mb-4">Add Custom Expense</h4>
          <div className="bg-light-glass dark:bg-dark-glass border border-light-border dark:border-dark-border rounded-xl p-4">
            <div className="space-y-4 md:grid md:grid-cols-4 md:gap-4 md:items-end md:space-y-0">
              <div className="md:col-span-2">
                <label className="block text-sm text-light-text-secondary dark:text-dark-text-secondary mb-2">Expense Name</label>
                <input
                  type="text"
                  value={customExpenseName}
                  onChange={(e) => setCustomExpenseName(e.target.value)}
                  placeholder="e.g., Gym Membership, Pet Care"
                  className="w-full bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-lg px-3 py-2 text-light-text dark:text-dark-text focus:outline-none focus:border-lime-accent/50 transition-colors duration-300"
                />
              </div>
              <div>
                <label className="block text-sm text-light-text-secondary dark:text-dark-text-secondary mb-2">Type</label>
                <select
                  value={customExpenseCategory}
                  onChange={(e) => setCustomExpenseCategory(e.target.value as 'fixed' | 'variable')}
                  className="w-full bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-lg px-3 py-2 text-light-text dark:text-dark-text focus:outline-none focus:border-lime-accent/50 transition-colors duration-300"
                >
                  <option value="variable">Variable</option>
                  <option value="fixed">Fixed</option>
                </select>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={addCustomExpenseItem}
                disabled={!customExpenseName.trim()}
                className="bg-lime-accent text-light-base dark:text-dark-base px-4 py-2 rounded-lg font-medium hover:shadow-glow transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add Expense
              </motion.button>
            </div>
          </div>
        </div>

        {/* Added Expenses */}
        {expenseItems.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-lg font-semibold text-light-text dark:text-dark-text">Your Expenses</h4>
              {hasLoadedPreviousExpenses && (
                <span className="text-xs bg-lime-accent/20 text-lime-accent px-2 py-1 rounded-full">
                  Loaded from previous month
                </span>
              )}
            </div>
            {expenseItems.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-light-surface/50 dark:bg-dark-surface/50 border border-light-border dark:border-dark-border rounded-xl p-3 md:p-4"
              >
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-light-text-secondary dark:text-dark-text-secondary mb-2">Expense Name</label>
                    <input
                      type="text"
                      value={item.name}
                      onChange={(e) => updateExpenseItem(item.id, 'name', e.target.value)}
                      className="w-full bg-light-glass dark:bg-dark-glass border border-light-border dark:border-dark-border rounded-lg px-3 py-2 text-light-text dark:text-dark-text focus:outline-none focus:border-lime-accent/50 transition-colors duration-300"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-light-text-secondary dark:text-dark-text-secondary mb-2">Type</label>
                    <span className={`inline-block px-3 py-2 rounded-lg text-xs md:text-sm ${
                      item.category === 'fixed' 
                        ? 'bg-blue-500/20 text-blue-400' 
                        : 'bg-orange-500/20 text-orange-400'
                    }`}>
                      {item.category === 'fixed' ? 'Fixed' : 'Variable'}
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm text-light-text-secondary dark:text-dark-text-secondary mb-2">Monthly Amount</label>
                    <div className="relative">
                      <LeiIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-light-text-secondary dark:text-dark-text-secondary" />
                      <input
                        type="number"
                        value={item.planned || ''}
                        onChange={(e) => updateExpenseItem(item.id, 'planned', parseFloat(e.target.value) || 0)}
                        className="w-full bg-light-glass dark:bg-dark-glass border border-light-border dark:border-dark-border rounded-lg pl-10 pr-3 py-2 text-light-text dark:text-dark-text focus:outline-none focus:border-lime-accent/50 transition-colors duration-300"
                      />
                    </div>
                  </div>
                  <div className="flex justify-center">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => removeExpenseItem(item.id)}
                      className="w-full md:w-auto p-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors text-sm"
                    >
                      <Trash2 className="w-4 h-4 mx-auto" />
                      <span className="block md:hidden mt-1">Remove</span>
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        <div className="mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
          <div className="flex items-center justify-between">
            <span className="text-light-text dark:text-dark-text font-medium text-sm md:text-base">Total Monthly Expenses:</span>
            <span className="text-xl md:text-2xl font-bold text-red-400">{totalExpenses.toLocaleString()} LEI</span>
          </div>
        </div>

        <div className="mt-4 p-4 bg-lime-accent/10 border border-lime-accent/20 rounded-xl">
          <div className="flex items-center justify-between">
            <span className="text-light-text dark:text-dark-text font-medium text-sm md:text-base">Leftover Amount:</span>
            <span className={`text-xl md:text-2xl font-bold ${leftoverAmount >= 0 ? 'text-lime-accent' : 'text-red-400'}`}>
              {leftoverAmount.toLocaleString()} LEI
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};