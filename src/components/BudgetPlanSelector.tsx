import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Calendar, Plus, Trash2 } from 'lucide-react';
import { BudgetPlan } from '../types/budget';

interface BudgetPlanSelectorProps {
  budgetPlans: BudgetPlan[];
  currentPlan: BudgetPlan | null;
  onPlanSelect: (plan: BudgetPlan) => void;
  onCreateNew: () => void;
  onDeletePlan?: (planId: string) => void;
}

export const BudgetPlanSelector: React.FC<BudgetPlanSelectorProps> = ({
  budgetPlans,
  currentPlan,
  onPlanSelect,
  onCreateNew,
  onDeletePlan
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const formatPlanDate = (plan: BudgetPlan) => {
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return `${monthNames[plan.month - 1]} ${plan.year}`;
  };

  const groupPlansByYear = (plans: BudgetPlan[]) => {
    const grouped = plans.reduce((acc, plan) => {
      if (!acc[plan.year]) {
        acc[plan.year] = [];
      }
      acc[plan.year].push(plan);
      return acc;
    }, {} as Record<number, BudgetPlan[]>);

    // Sort years descending and months within each year
    Object.keys(grouped).forEach(year => {
      grouped[parseInt(year)].sort((a, b) => b.month - a.month);
    });

    return grouped;
  };

  const groupedPlans = groupPlansByYear(budgetPlans);
  const sortedYears = Object.keys(groupedPlans).map(Number).sort((a, b) => b - a);

  return (
    <div className="relative">
      {/* Selector Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="flex items-center justify-between w-full bg-light-glass dark:bg-dark-glass border border-light-border dark:border-dark-border rounded-xl px-4 py-3 text-left hover:border-lime-accent/30 transition-all"
      >
        <div className="flex items-center space-x-3">
          <Calendar className="w-5 h-5 text-lime-accent" />
          <div>
            <p className="font-medium text-light-text dark:text-dark-text">
              {currentPlan ? currentPlan.name : 'Select Budget Plan'}
            </p>
            {currentPlan && (
              <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                {formatPlanDate(currentPlan)}
              </p>
            )}
          </div>
        </div>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="w-5 h-5 text-light-text-secondary dark:text-dark-text-secondary" />
        </motion.div>
      </motion.button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            
            {/* Dropdown Content */}
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className="absolute top-full left-0 right-0 mt-2 bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-xl shadow-glass z-50 max-h-80 overflow-y-auto"
            >
              {/* Create New Button */}
              <motion.button
                onClick={() => {
                  onCreateNew();
                  setIsOpen(false);
                }}
                whileHover={{ backgroundColor: 'rgba(101, 163, 13, 0.1)' }}
                className="w-full flex items-center space-x-3 p-4 text-left border-b border-light-border dark:border-dark-border hover:bg-lime-accent/5 transition-colors"
              >
                <div className="p-2 bg-lime-accent/20 rounded-lg">
                  <Plus className="w-4 h-4 text-lime-accent" />
                </div>
                <div>
                  <p className="font-medium text-lime-accent">Create New Budget</p>
                  <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                    Start a fresh budget plan
                  </p>
                </div>
              </motion.button>

              {/* Budget Plans by Year */}
              {sortedYears.length > 0 ? (
                <div className="p-2">
                  {sortedYears.map((year) => (
                    <div key={year} className="mb-4 last:mb-0">
                      <h4 className="text-sm font-semibold text-light-text-secondary dark:text-dark-text-secondary px-3 py-2">
                        {year}
                      </h4>
                      <div className="space-y-1">
                        {groupedPlans[year].map((plan) => (
                          <motion.div
                            key={plan.id}
                            whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}
                            className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
                              currentPlan?.id === plan.id
                                ? 'bg-lime-accent/10 border border-lime-accent/20'
                                : 'hover:bg-light-glass dark:hover:bg-dark-glass'
                            }`}
                          >
                            <div
                              onClick={() => {
                                onPlanSelect(plan);
                                setIsOpen(false);
                              }}
                              className="flex-1"
                            >
                              <p className={`font-medium ${
                                currentPlan?.id === plan.id
                                  ? 'text-lime-accent'
                                  : 'text-light-text dark:text-dark-text'
                              }`}>
                                {plan.name}
                              </p>
                              <div className="flex items-center space-x-4 mt-1">
                                <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                                  {formatPlanDate(plan)}
                                </p>
                                <p className="text-sm text-lime-accent font-medium">
                                  {plan.total_income.toLocaleString()} LEI
                                </p>
                              </div>
                            </div>
                            
                            {/* Delete Button */}
                            {onDeletePlan && budgetPlans.length > 1 && (
                              <motion.button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onDeletePlan(plan.id);
                                }}
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors ml-2"
                              >
                                <Trash2 className="w-4 h-4" />
                              </motion.button>
                            )}
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 text-center">
                  <p className="text-light-text-secondary dark:text-dark-text-secondary">
                    No budget plans found. Create your first one!
                  </p>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};