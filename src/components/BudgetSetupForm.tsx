import React, { useState } from 'react';
import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { DEFAULT_ALLOCATIONS } from '../types/budget';
import { BudgetService } from '../services/budgetService';
import { isSupabaseConfigured } from '../lib/supabaseClient';
import { BudgetPlan } from '../types/budget';
import { BudgetIncomeStep } from './budget/BudgetIncomeStep';
import { BudgetExpenseStep } from './budget/BudgetExpenseStep';
import { BudgetAllocationStep } from './budget/BudgetAllocationStep';

interface BudgetSetupFormProps {
  onNavigateToDashboard: () => void;
  editingPlan?: BudgetPlan | null;
  currentUserId: string | null;
}

export const BudgetSetupForm: React.FC<BudgetSetupFormProps> = ({ onNavigateToDashboard, editingPlan }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [budgetName, setBudgetName] = useState(editingPlan?.name || '');
  const [incomeItems, setIncomeItems] = useState<IncomeItem[]>([
    ...(editingPlan?.income_items || [{ id: '1', name: 'Main Salary', amount: 0, type: 'main' }])
  ]);
  const [expenseItems, setExpenseItems] = useState<ExpenseItem[]>(editingPlan?.expense_items || []);
  const [allocationTargets, setAllocationTargets] = useState<AllocationTarget[]>(
    editingPlan?.allocation_targets || DEFAULT_ALLOCATIONS
  );
  const [isLoading, setIsLoading] = useState(false);
  const [customExpenseName, setCustomExpenseName] = useState('');
  const [customExpenseCategory, setCustomExpenseCategory] = useState<'fixed' | 'variable'>('variable');
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [hasLoadedPreviousExpenses, setHasLoadedPreviousExpenses] = useState(false);
  const [isLoadingPrevious, setIsLoadingPrevious] = useState(false);

  const isEditing = !!editingPlan;

  // Scroll to top when step changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentStep]);

  const totalIncome = incomeItems.reduce((sum, item) => sum + item.amount, 0);
  const totalExpenses = expenseItems.reduce((sum, item) => sum + item.planned, 0);
  const leftoverAmount = totalIncome - totalExpenses;

  const loadPreviousMonthExpenses = async () => {
    if (!currentUserId || hasLoadedPreviousExpenses) return;
    
    setIsLoadingPrevious(true);
    try {
      const latestPlan = await BudgetService.getLatestBudgetPlan(currentUserId);
      
      if (latestPlan && latestPlan.expense_items.length > 0) {
        // Create new expense items based on the previous month's expenses
        const newExpenseItems: ExpenseItem[] = latestPlan.expense_items.map(item => ({
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9), // Generate unique ID
          name: item.name,
          amount: item.planned, // Use the planned amount from previous month
          category: item.category,
          subcategory: item.subcategory,
          planned: item.planned,
          actual: 0 // Reset actual to 0 for new month
        }));
        
        setExpenseItems(newExpenseItems);
        setHasLoadedPreviousExpenses(true);
      } else {
        alert('No previous budget plan found to load expenses from.');
      }
    } catch (error) {
      console.error('Error loading previous month expenses:', error);
      alert('Failed to load previous month expenses. Please try again.');
    } finally {
      setIsLoadingPrevious(false);
    }
  };
  const updateAllocationTarget = (id: string, field: keyof any, value: any) => {
    setAllocationTargets(targets => 
      targets.map(target => 
        target.id === id ? { ...target, [field]: value } : target
      )
    );
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      let result;
      
      if (isEditing && editingPlan) {
        // Update existing plan
        const updatedPlan: BudgetPlan = {
          ...editingPlan,
          name: budgetName || editingPlan.name,
          income_items: incomeItems,
          expense_items: expenseItems.map(item => ({ ...item, amount: item.planned })),
          allocation_targets: allocationTargets,
          total_income: totalIncome,
          total_expenses: totalExpenses,
          leftover_amount: leftoverAmount
        };
        result = await BudgetService.updateBudgetPlan(updatedPlan);
      } else {
        // Create new plan
        const currentDate = new Date();
        const budgetPlan = {
          user_id: currentUserId || 'demo-user', // Use actual user ID or fallback for demo mode
          month: currentDate.getMonth() + 1,
          year: currentDate.getFullYear(),
          name: budgetName || `Budget ${currentDate.getMonth() + 1}/${currentDate.getFullYear()}`,
          income_items: incomeItems,
          expense_items: expenseItems.map(item => ({ ...item, amount: item.planned })),
          allocation_targets: allocationTargets,
          total_income: totalIncome,
          total_expenses: totalExpenses,
          leftover_amount: leftoverAmount
        };
        result = await BudgetService.createBudgetPlan(budgetPlan);
      }

      if (result) {
        setShowSuccessMessage(true);
        // Show success message briefly, then navigate
        setTimeout(() => {
          setShowSuccessMessage(false);
          onNavigateToDashboard();
        }, 2000);
      } else {
        alert(`Failed to ${isEditing ? 'update' : 'create'} budget plan. Please try again.`);
      }
    } catch (error) {
      console.error(`Error ${isEditing ? 'updating' : 'creating'} budget plan:`, error);
      alert('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Success Message */}
      {showSuccessMessage && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-lime-accent text-light-base dark:text-dark-base px-6 py-3 rounded-xl font-medium shadow-glow"
        >
          ✓ Budget plan {isEditing ? 'updated' : 'created'} successfully!
          {!isSupabaseConfigured && (
            <span className="block text-xs opacity-90 mt-1">
              (Demo mode - Connect Supabase for persistence)
            </span>
          )}
        </motion.div>
      )}

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-3xl font-bold text-light-text dark:text-dark-text font-editorial">
          {isEditing ? 'Edit Budget Plan' : 'Create Budget Plan'}
        </h2>
        <p className="text-light-text-secondary dark:text-dark-text-secondary mt-1">
          {isEditing ? 'Update your budget plan details' : 'Set up your monthly budget in 3 easy steps'}
        </p>
      </motion.div>

      {/* Progress Steps */}
      <div className="flex items-center justify-center space-x-1 md:space-x-4 mb-6 md:mb-8 px-4">
        {[1, 2, 3].map((step) => (
          <div key={step} className="flex items-center">
            <div className={`w-6 h-6 md:w-10 md:h-10 rounded-full flex items-center justify-center font-bold transition-all text-xs md:text-base ${
              currentStep >= step 
                ? 'bg-lime-accent text-light-base dark:text-dark-base' 
                : 'bg-light-glass dark:bg-dark-glass text-light-text-secondary dark:text-dark-text-secondary'
            }`}>
              {step}
            </div>
            {step < 3 && (
              <div className={`w-8 md:w-16 h-1 mx-1 md:mx-2 rounded-full transition-all ${
                currentStep > step ? 'bg-lime-accent' : 'bg-light-border dark:border-dark-border'
              }`} />
            )}
          </div>
        ))}
      </div>

      {/* Form Content */}
      <div className="bg-light-surface/50 dark:bg-dark-surface/50 backdrop-blur-sm border border-light-border dark:border-dark-border rounded-2xl p-4 md:p-8 shadow-glass transition-colors duration-300">
        {currentStep === 1 && (
          <BudgetIncomeStep
            budgetName={budgetName}
            setBudgetName={setBudgetName}
            incomeItems={incomeItems}
            setIncomeItems={setIncomeItems}
          />
        )}
        {currentStep === 2 && (
          <BudgetExpenseStep
            expenseItems={expenseItems}
            setExpenseItems={setExpenseItems}
            totalIncome={totalIncome}
            isEditing={isEditing}
            hasLoadedPreviousExpenses={hasLoadedPreviousExpenses}
            setHasLoadedPreviousExpenses={setHasLoadedPreviousExpenses}
            onLoadPreviousExpenses={loadPreviousMonthExpenses}
            isLoadingPrevious={isLoadingPrevious}
          />
        )}
        {currentStep === 3 && (
          <BudgetAllocationStep
            allocationTargets={allocationTargets}
            setAllocationTargets={setAllocationTargets}
            leftoverAmount={leftoverAmount}
          />
        )}

        {/* Navigation Buttons */}
        <div className="flex flex-col sm:flex-row justify-between mt-6 md:mt-8 pt-4 md:pt-6 border-t border-light-border dark:border-dark-border gap-3 sm:gap-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
            disabled={currentStep === 1}
            className={`px-6 py-3 rounded-xl font-medium transition-all order-2 sm:order-1 ${
              currentStep === 1
                ? 'bg-light-glass dark:bg-dark-glass text-light-text-secondary dark:text-dark-text-secondary cursor-not-allowed flex-1 sm:flex-none'
                : 'bg-light-glass dark:bg-dark-glass border border-light-border dark:border-dark-border text-light-text dark:text-dark-text hover:border-lime-accent/30 flex-1 sm:flex-none'
            }`}
          >
            Previous
          </motion.button>

          {currentStep < 3 ? (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setCurrentStep(Math.min(3, currentStep + 1))}
              className="bg-lime-accent text-light-base dark:text-dark-base px-6 py-3 rounded-xl font-medium hover:shadow-glow transition-all flex-1 sm:flex-none order-1 sm:order-2"
            >
              Next
            </motion.button>
          ) : (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSubmit}
              disabled={isLoading}
              className="bg-lime-accent text-light-base dark:text-dark-base px-6 py-3 rounded-xl font-medium hover:shadow-glow transition-all disabled:opacity-50 flex-1 sm:flex-none order-1 sm:order-2"
            >
              {isLoading ? (isEditing ? 'Updating...' : 'Creating...') : (isEditing ? 'Update Budget' : 'Create Budget')}
            </motion.button>
          )}
        </div>
      </div>
    </div>
  );
};