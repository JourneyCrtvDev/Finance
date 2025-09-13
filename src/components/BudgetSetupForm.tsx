import React, { useState } from 'react';
import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { DEFAULT_ALLOCATIONS } from '../types/budget';
import { BudgetService } from '../services/budgetService';
import { BudgetPlan, IncomeItem, ExpenseItem, AllocationTarget } from '../types/budget';
import { BudgetIncomeStep } from './budget/BudgetIncomeStep';
import { BudgetExpenseStep } from './budget/BudgetExpenseStep';
import { BudgetAllocationStep } from './budget/BudgetAllocationStep';
import { SupabaseConnectionTest } from './SupabaseConnectionTest';
import { supabase } from '../lib/supabaseClient';

interface BudgetSetupFormProps {
  onNavigateToDashboard: () => void;
  editingPlan: BudgetPlan | null;
  currentUserId: string | null;
}

export const BudgetSetupForm: React.FC<BudgetSetupFormProps> = ({ onNavigateToDashboard, editingPlan, currentUserId }) => {
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
  const [currentPlan, setCurrentPlan] = useState<BudgetPlan | null>(editingPlan);
  const [isCheckingExisting, setIsCheckingExisting] = useState(false);

  const [showConnectionTest, setShowConnectionTest] = useState(false);

  const isEditing = !!currentPlan;
  const isTrulyNew = !editingPlan && !currentPlan;

  // Check for existing budget plan on component mount
  useEffect(() => {
    const checkExistingPlan = async () => {
      if (!currentUserId || editingPlan || isCheckingExisting) return;
      
      setIsCheckingExisting(true);
      try {
        const currentDate = new Date();
        const month = currentDate.getMonth() + 1;
        const year = currentDate.getFullYear();
        
        const existingPlan = await BudgetService.getBudgetPlan(currentUserId, month, year);
        
        if (existingPlan) {
          // Load existing plan for editing
          setCurrentPlan(existingPlan);
          setBudgetName(existingPlan.name);
          setIncomeItems(existingPlan.income_items || [{ id: '1', name: 'Main Salary', amount: 0, type: 'main' }]);
          setExpenseItems(existingPlan.expense_items || []);
          setAllocationTargets(existingPlan.allocation_targets || DEFAULT_ALLOCATIONS);
        }
      } catch (error) {
        console.error('Error checking for existing plan:', error);
        // Continue with new plan creation if check fails
      } finally {
        setIsCheckingExisting(false);
      }
    };

    checkExistingPlan();
  }, [currentUserId, editingPlan]);
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
    if (!currentUserId) {
      alert('User not authenticated. Please sign in again.');
      return;
    }
    
    // Check if Supabase is configured
    if (!supabase) {
      alert('Database not connected. Please click "Connect to Supabase" in the top right corner to set up your database connection.');
      return;
    }

    // Additional check for environment variables
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      alert('⚠️ Database Connection Required\n\nTo save your budget plan, you need to connect to Supabase:\n\n1. Click the "Connect to Supabase" button in the top right corner\n2. This will set up your database automatically\n3. Then you can create and save budget plans\n\nYour data will be securely stored and synced across all your devices.');
      return;
    }
    
    setIsLoading(true);
    try {
      let result;
      
      if (isEditing && currentPlan) {
        // Update existing plan
        const updatedPlan: BudgetPlan = {
          ...currentPlan,
          name: budgetName || currentPlan.name,
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
          user_id: currentUserId,
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
        // Show connection test instead of generic error
        setShowConnectionTest(true);
      }
    } catch (error) {
      console.error(`Error ${isEditing ? 'updating' : 'creating'} budget plan:`, error);
      // Show connection test for any database errors
      setShowConnectionTest(true);
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading state while checking for existing plan
  if (isCheckingExisting) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-lime-accent border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-light-text-secondary dark:text-dark-text-secondary">
            Checking for existing budget plan...
          </p>
        </div>
      </div>
    );
  }
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
          {currentPlan && !editingPlan && (
            <span className="block text-sm text-lime-accent mt-1">
              Found existing plan for this month - editing instead of creating new
            </span>
          )}
        </p>
      </motion.div>

      {/* Connection Test Modal */}
      {showConnectionTest && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setShowConnectionTest(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-light-surface dark:bg-dark-surface rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-light-text dark:text-dark-text">
                Database Connection Diagnostics
              </h3>
              <button
                onClick={() => setShowConnectionTest(false)}
                className="text-light-text-secondary dark:text-dark-text-secondary hover:text-light-text dark:hover:text-dark-text text-xl"
              >
                ✕
              </button>
            </div>
            <SupabaseConnectionTest />
            <div className="mt-6 flex justify-end">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowConnectionTest(false)}
                className="bg-lime-accent text-light-base dark:text-dark-base px-4 py-2 rounded-lg font-medium hover:shadow-glow transition-all"
              >
                Close
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}

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
        {/* Database Connection Warning */}
        {(!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-orange-500/10 border border-orange-500/20 rounded-xl"
          >
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-orange-500/20 rounded-full flex items-center justify-center">
                <span className="text-orange-400 font-bold">!</span>
              </div>
              <div>
                <h4 className="font-semibold text-orange-400 mb-1">Database Connection Required</h4>
                <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                  To save your budget plan, click <strong>"Connect to Supabase"</strong> in the top right corner to set up your database.
                </p>
              </div>
            </div>
          </motion.div>
        )}

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
            isEditing={!isTrulyNew}
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