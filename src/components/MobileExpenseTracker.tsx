import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Edit3, 
  Save, 
  X, 
  TrendingUp, 
  TrendingDown,
  AlertTriangle,
  CheckCircle2
} from 'lucide-react';
import { BudgetPlan, ExpenseItem } from '../types/budget';

interface MobileExpenseTrackerProps {
  currentPlan: BudgetPlan;
  onUpdateExpense: (expenseId: string, actualAmount: number) => Promise<void>;
}

export const MobileExpenseTracker: React.FC<MobileExpenseTrackerProps> = ({
  currentPlan,
  onUpdateExpense
}) => {
  const [editingExpenseId, setEditingExpenseId] = useState<string | null>(null);
  const [tempActualAmount, setTempActualAmount] = useState<number>(0);
  const [isSaving, setIsSaving] = useState(false);

  const handleEditActual = (expenseId: string, currentActual: number) => {
    setEditingExpenseId(expenseId);
    setTempActualAmount(currentActual);
  };

  const handleSaveActual = async () => {
    if (!editingExpenseId) return;
    
    setIsSaving(true);
    try {
      await onUpdateExpense(editingExpenseId, tempActualAmount);
    } catch (error) {
      console.error('Error updating expense:', error);
    } finally {
      setEditingExpenseId(null);
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingExpenseId(null);
    setTempActualAmount(0);
  };

  const getVarianceStatus = (planned: number, actual: number) => {
    if (actual === 0) return 'none';
    const variance = ((actual - planned) / planned) * 100;
    if (variance <= -10) return 'under';
    if (variance >= 10) return 'over';
    return 'good';
  };

  const getVarianceColor = (status: string) => {
    switch (status) {
      case 'under': return 'text-lime-accent';
      case 'over': return 'text-red-400';
      case 'good': return 'text-blue-400';
      default: return 'text-light-text-secondary dark:text-dark-text-secondary';
    }
  };

  const getVarianceIcon = (status: string) => {
    switch (status) {
      case 'under': return <TrendingDown className="w-3 h-3" />;
      case 'over': return <TrendingUp className="w-3 h-3" />;
      case 'good': return <CheckCircle2 className="w-3 h-3" />;
      default: return <AlertTriangle className="w-3 h-3" />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="md:hidden bg-light-surface/50 dark:bg-dark-surface/50 backdrop-blur-sm border border-light-border dark:border-dark-border rounded-2xl p-4 shadow-glass"
    >
      <h3 className="text-lg font-bold text-light-text dark:text-dark-text font-editorial mb-4">
        Track Expenses
      </h3>
      
      <div className="space-y-3 max-h-64 overflow-y-auto">
        {currentPlan.expense_items.map((item, index) => {
          const varianceStatus = getVarianceStatus(item.planned, item.actual);
          const variance = item.actual - item.planned;
          
          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className="p-4 bg-light-glass dark:bg-dark-glass rounded-lg"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-light-text dark:text-dark-text truncate">
                    {item.name}
                  </h4>
                  <div className="flex items-center space-x-2 mt-2">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      item.category === 'fixed' 
                        ? 'bg-blue-500/20 text-blue-400' 
                        : 'bg-orange-500/20 text-orange-400'
                    }`}>
                      {item.category}
                    </span>
                    {varianceStatus !== 'none' && (
                      <div className={`flex items-center space-x-1 ${getVarianceColor(varianceStatus)}`}>
                        {getVarianceIcon(varianceStatus)}
                        <span className="text-xs font-medium">
                          {variance > 0 ? '+' : ''}{variance.toLocaleString()} LEI
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-light-text-secondary dark:text-dark-text-secondary block text-xs">
                    Planned:
                  </span>
                  <span className="text-orange-400 font-bold text-base">
                    {item.planned.toLocaleString()} LEI
                  </span>
                </div>
                <div>
                  <span className="text-light-text-secondary dark:text-dark-text-secondary block text-xs">
                    Actual:
                  </span>
                  {editingExpenseId === item.id ? (
                    <div className="flex items-center space-x-1">
                      <input
                        type="number"
                        value={tempActualAmount || ''}
                        onChange={(e) => setTempActualAmount(parseFloat(e.target.value) || 0)}
                        className="w-16 bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border rounded px-1 py-1 text-xs text-light-text dark:text-dark-text focus:outline-none focus:border-lime-accent/50"
                        autoFocus
                      />
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={handleSaveActual}
                        disabled={isSaving}
                        className="p-1 text-lime-accent hover:bg-lime-accent/10 rounded transition-colors disabled:opacity-50"
                      >
                        <Save className="w-3 h-3" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={handleCancelEdit}
                        className="p-1 text-red-400 hover:bg-red-400/10 rounded transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </motion.button>
                    </div>
                  ) : (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleEditActual(item.id, item.actual)}
                      className="flex items-center space-x-1 text-lime-accent font-bold hover:bg-lime-accent/10 px-2 py-1 rounded transition-colors"
                    >
                      <span className="text-base">{item.actual.toLocaleString()} LEI</span>
                      <Edit3 className="w-3 h-3" />
                    </motion.button>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
      
      {/* Summary */}
      <div className="mt-6 pt-4 border-t border-light-border dark:border-dark-border">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="text-center">
            <span className="text-light-text-secondary dark:text-dark-text-secondary block text-xs">
              Total Planned
            </span>
            <span className="text-orange-400 font-bold text-base">
              {currentPlan.expense_items.reduce((sum, item) => sum + item.planned, 0).toLocaleString()} LEI
            </span>
          </div>
          <div className="text-center">
            <span className="text-light-text-secondary dark:text-dark-text-secondary block text-xs">
              Total Actual
            </span>
            <span className="text-lime-accent font-bold text-base">
              {currentPlan.expense_items.reduce((sum, item) => sum + item.actual, 0).toLocaleString()} LEI
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};