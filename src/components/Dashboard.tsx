import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PiggyBank, TrendingUp, Shield, Zap, Plus, Edit3, Calendar, ArrowLeft, LogOut, DollarSign, Save, Download, BarChart3, Target } from 'lucide-react';
import { BudgetService } from '../services/budgetService';
import { BudgetPlan, BudgetSummary } from '../types/budget';
import { signOut } from '../lib/supabaseClient';
import { BudgetPlanSelector } from './BudgetPlanSelector';
import { DataExportService } from '../services/dataExportService';
import { QuickActions } from './QuickActions';
import { BudgetAnalytics } from './BudgetAnalytics';
import { FinancialGoals } from './FinancialGoals';
import { SmartNotifications } from './SmartNotifications';
import { MobileQuickStats } from './MobileQuickStats';
import { MobileExpenseTracker } from './MobileExpenseTracker';

interface DashboardProps {
  onNavigateBack: () => void;
  onEditBudget: (plan: BudgetPlan) => void;
  onSignOut: () => void;
  currentUserId: string | null;
  onSectionChange: (section: string) => void;
}

// Romanian Lei currency symbol component
const LeiIcon: React.FC<{ className?: string }> = ({ className = "w-4 h-4" }) => (
  <span className={`font-bold ${className.replace('w-4 h-4', 'text-xs')}`}>RON</span>
);

export const Dashboard: React.FC<DashboardProps> = ({ onNavigateBack, onEditBudget, onSignOut, currentUserId, onSectionChange }) => {
  const [budgetPlans, setBudgetPlans] = useState<BudgetPlan[]>([]);
  const [currentPlan, setCurrentPlan] = useState<BudgetPlan | null>(null);
  const [summary, setSummary] = useState<BudgetSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [editingExpenseId, setEditingExpenseId] = useState<string | null>(null);
  const [tempActualAmount, setTempActualAmount] = useState<number>(0);
  const [isSavingActual, setIsSavingActual] = useState(false);
  const [isExportingBudget, setIsExportingBudget] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'analytics' | 'goals'>('overview');

  useEffect(() => {
    if (currentUserId) {
      loadBudgetPlans();
    }
  }, [currentUserId]);

  const loadBudgetPlans = async () => {
    if (!currentUserId) return;
    
    setIsLoading(true);
    try {
      const plans = await BudgetService.getUserBudgetPlans(currentUserId);
      setBudgetPlans(plans);
      
      if (plans.length > 0) {
        const latest = plans[0]; // Most recent plan
        setCurrentPlan(latest);
        setSummary(BudgetService.calculateBudgetSummary(latest));
      }
    } catch (error) {
      console.error('Error loading budget plans:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlanSelect = (plan: BudgetPlan) => {
    setCurrentPlan(plan);
    setSummary(BudgetService.calculateBudgetSummary(plan));
  };

  const handleDeletePlan = async (planId: string) => {
    if (budgetPlans.length <= 1) return; // Don't delete the last plan
    
    const success = await BudgetService.deleteBudgetPlan(planId);
    if (success) {
      const updatedPlans = budgetPlans.filter(p => p.id !== planId);
      setBudgetPlans(updatedPlans);
      
      // If we deleted the current plan, select the first available one
      if (currentPlan?.id === planId && updatedPlans.length > 0) {
        handlePlanSelect(updatedPlans[0]);
      }
    }
  };

  const handleEditActual = (expenseId: string, currentActual: number) => {
    setEditingExpenseId(expenseId);
    setTempActualAmount(currentActual);
  };

  const handleSaveActual = async () => {
    if (!currentPlan || !editingExpenseId) return;
    
    setIsSavingActual(true);
    try {
      const updatedExpenseItems = currentPlan.expense_items.map(item =>
        item.id === editingExpenseId 
          ? { ...item, actual: tempActualAmount }
          : item
      );

      const updatedPlan: BudgetPlan = {
        ...currentPlan,
        expense_items: updatedExpenseItems
      };

      const result = await BudgetService.updateBudgetPlan(updatedPlan);
      if (result) {
        setCurrentPlan(result);
        setSummary(BudgetService.calculateBudgetSummary(result));
        // Update the plans list
        setBudgetPlans(plans => 
          plans.map(plan => plan.id === result.id ? result : plan)
        );
      }
    } catch (error) {
      console.error('Error updating actual amount:', error);
    } finally {
      setEditingExpenseId(null);
      setIsSavingActual(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingExpenseId(null);
    setTempActualAmount(0);
  };

  const handleExportCurrentBudget = async () => {
    if (!currentPlan) return;
    
    setIsExportingBudget(true);
    try {
      await DataExportService.exportBudgetPlanOnly(currentPlan);
      alert('Budget plan exported successfully! Check your downloads folder.');
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export budget plan. Please try again.');
    } finally {
      setIsExportingBudget(false);
    }
  };

  const handleSignOut = async () => {
    setIsSigningOut(true);
    await signOut();
    setTimeout(() => {
      setIsSigningOut(false);
      onSignOut();
    }, 500);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <div className="w-8 h-8 border-2 border-lime-accent border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-light-text-secondary dark:text-dark-text-secondary">Loading your budget...</p>
        </motion.div>
      </div>
    );
  }

  if (!currentPlan || !summary) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0"
        >
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onNavigateBack}
                className="p-2 bg-light-glass dark:bg-dark-glass rounded-full hover:bg-lime-accent/10 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-light-text dark:text-dark-text" />
              </motion.button>
              <h2 className="text-3xl font-bold text-light-text dark:text-dark-text font-editorial">Budget Dashboard</h2>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onNavigateBack}
              className="flex items-center space-x-2 bg-lime-accent text-light-base dark:text-dark-base px-3 py-2 rounded-xl font-medium hover:shadow-glow transition-all"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">New Budget</span>
            </motion.button>
          </div>
        </motion.div>

        {/* Quick Actions - Always Show */}
        <QuickActions onAction={onSectionChange} />

        {/* Smart Notifications - Always Show */}
        <SmartNotifications currentUserId={currentUserId} onNavigateToSection={onSectionChange} />

        {/* Financial Goals - Always Show */}
        <FinancialGoals currentUserId={currentUserId} />

        {/* Getting Started Message */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="bg-light-surface/50 dark:bg-dark-surface/50 backdrop-blur-sm border border-light-border dark:border-dark-border rounded-2xl p-8 shadow-glass text-center"
        >
          <PiggyBank className="w-16 h-16 text-lime-accent mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-light-text dark:text-dark-text font-editorial mb-2">
            Ready to Start Budgeting?
          </h3>
          <p className="text-light-text-secondary dark:text-dark-text-secondary mb-6">
            Create your first budget plan to unlock personalized insights and track your financial progress
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onNavigateBack}
            className="bg-lime-accent text-light-base dark:text-dark-base px-6 py-3 rounded-xl font-medium hover:shadow-glow transition-all"
          >
            Create Your First Budget
          </motion.button>
        </motion.div>
      </div>
    );
  }

  const allocationIcons = {
    savings: PiggyBank,
    emergency: Shield,
    investments: TrendingUp,
    fun: Zap
  };

  return (
    <div className="space-y-6 overflow-x-hidden max-w-full">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0"
      >
        <div>
          <div className="flex items-center space-x-3 mb-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onNavigateBack}
              className="p-2 bg-light-glass dark:bg-dark-glass rounded-full hover:bg-lime-accent/10 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-light-text dark:text-dark-text" />
            </motion.button>
            <h2 className="text-3xl font-bold text-light-text dark:text-dark-text font-editorial">Budget Dashboard</h2>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleExportCurrentBudget}
            disabled={isExportingBudget}
            className="flex items-center space-x-2 bg-light-glass dark:bg-dark-glass border border-light-border dark:border-dark-border px-4 py-2 rounded-xl text-light-text dark:text-dark-text hover:border-lime-accent/30 transition-all disabled:opacity-50"
          >
            {isExportingBudget ? (
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            <span className="hidden sm:inline">{isExportingBudget ? 'Exporting...' : 'Export'}</span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSignOut}
            disabled={isSigningOut}
            className="flex items-center space-x-2 bg-light-glass dark:bg-dark-glass border border-light-border dark:border-dark-border px-4 py-2 rounded-xl text-light-text dark:text-dark-text hover:border-red-400/30 hover:text-red-400 transition-all disabled:opacity-50"
          >
            {isSigningOut ? (
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : (
              <LogOut className="w-4 h-4" />
            )}
            <span className="hidden sm:inline">{isSigningOut ? 'Signing Out...' : 'Sign Out'}</span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => currentPlan && onEditBudget(currentPlan)}
            className="flex items-center space-x-2 bg-light-glass dark:bg-dark-glass border border-light-border dark:border-dark-border px-3 py-2 rounded-xl text-light-text dark:text-dark-text hover:border-lime-accent/30 transition-all"
          >
            <Edit3 className="w-4 h-4" />
            <span className="hidden sm:inline">Edit Budget</span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onNavigateBack}
            className="flex items-center space-x-2 bg-lime-accent text-light-base dark:text-dark-base px-3 py-2 rounded-xl font-medium hover:shadow-glow transition-all"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">New Budget</span>
          </motion.button>
        </div>
      </motion.div>

      {/* Budget Plan Selector */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <BudgetPlanSelector
          budgetPlans={budgetPlans}
          currentPlan={currentPlan}
          onPlanSelect={handlePlanSelect}
          onCreateNew={onNavigateBack}
          onDeletePlan={handleDeletePlan}
        />
      </motion.div>

      {/* Tab Navigation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="flex items-center bg-light-glass dark:bg-dark-glass border border-light-border dark:border-dark-border rounded-xl p-2"
      >
        {[
          { id: 'overview', label: 'Overview', icon: BarChart3 },
          { id: 'analytics', label: 'Analytics', icon: TrendingUp },
          { id: 'goals', label: 'Goals', icon: Target }
        ].map((tab) => (
          <motion.button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center space-x-2 px-4 py-3 rounded-lg transition-all flex-1 justify-center ${
              activeTab === tab.id
                ? 'bg-lime-accent text-light-base dark:text-dark-base shadow-glow'
                : 'text-light-text-secondary dark:text-dark-text-secondary hover:text-light-text dark:hover:text-dark-text'
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <tab.icon className="w-4 h-4" />
            <span className="font-medium">{tab.label}</span>
          </motion.button>
        ))}
      </motion.div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'overview' && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {/* Quick Actions */}
            <QuickActions onAction={onSectionChange} />

            {/* Mobile Quick Stats */}
            {currentPlan && summary && (
              <MobileQuickStats currentPlan={currentPlan} summary={summary} />
            )}

            {/* Mobile Expense Tracker */}
            {currentPlan && (
              <MobileExpenseTracker 
                currentPlan={currentPlan}
                onUpdateExpense={async (expenseId: string, actualAmount: number) => {
                  const updatedExpenseItems = currentPlan.expense_items.map(item =>
                    item.id === expenseId 
                      ? { ...item, actual: actualAmount }
                      : item
                  );

                  const updatedPlan: BudgetPlan = {
                    ...currentPlan,
                    expense_items: updatedExpenseItems
                  };

                  const result = await BudgetService.updateBudgetPlan(updatedPlan);
                  if (result) {
                    setCurrentPlan(result);
                    setSummary(BudgetService.calculateBudgetSummary(result));
                    setBudgetPlans(plans => 
                      plans.map(plan => plan.id === result.id ? result : plan)
                    );
                  }
                }}
              />
            )}

            {/* Smart Notifications */}
            <SmartNotifications currentUserId={currentUserId} onNavigateToSection={onSectionChange} />

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-gradient-to-br from-lime-accent/10 to-lime-accent/5 border border-lime-accent/20 rounded-xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-light-text dark:text-dark-text">Total Income</h3>
            <TrendingUp className="w-6 h-6 text-lime-accent" />
          </div>
          <p className="text-3xl font-bold text-lime-accent">{summary.totalIncome.toLocaleString()} LEI</p>
          <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary mt-2">
            From {currentPlan.income_items.length} source{currentPlan.income_items.length !== 1 ? 's' : ''}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="bg-gradient-to-br from-red-500/10 to-red-500/5 border border-red-500/20 rounded-xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-light-text dark:text-dark-text">Total Expenses</h3>
            <Calendar className="w-6 h-6 text-red-400" />
          </div>
          <p className="text-3xl font-bold text-red-400">{summary.totalExpenses.toLocaleString()} LEI</p>
          <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary mt-2">
            {currentPlan.expense_items.length} expense{currentPlan.expense_items.length !== 1 ? 's' : ''} planned
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className={`bg-gradient-to-br ${
            summary.leftoverAmount >= 0 
              ? 'from-blue-500/10 to-blue-500/5 border-blue-500/20' 
              : 'from-orange-500/10 to-orange-500/5 border-orange-500/20'
          } border rounded-xl p-6`}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-light-text dark:text-dark-text">Leftover</h3>
            <PiggyBank className={`w-6 h-6 ${summary.leftoverAmount >= 0 ? 'text-blue-400' : 'text-orange-400'}`} />
          </div>
          <p className={`text-3xl font-bold ${summary.leftoverAmount >= 0 ? 'text-blue-400' : 'text-orange-400'}`}>
            {summary.leftoverAmount.toLocaleString()} LEI
          </p>
          <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary mt-2">
            {summary.leftoverAmount >= 0 ? 'Available for allocation' : 'Budget deficit'}
          </p>
        </motion.div>
      </div>

      {/* Allocation Breakdown */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="bg-light-surface/50 dark:bg-dark-surface/50 backdrop-blur-sm border border-light-border dark:border-dark-border rounded-2xl p-6 shadow-glass"
      >
        <h3 className="text-xl font-bold text-light-text dark:text-dark-text font-editorial mb-6">Money Allocation</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(summary.allocations).map(([key, amount], index) => {
            const IconComponent = allocationIcons[key as keyof typeof allocationIcons];
            const target = currentPlan.allocation_targets.find(t => t.id === key);
            
            return (
              <motion.div
                key={key}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.6 + index * 0.1 }}
                className="bg-light-glass dark:bg-dark-glass border border-light-border dark:border-dark-border rounded-xl p-4"
              >
                <div className="flex items-center space-x-3 mb-3">
                  <div className="p-2 bg-lime-accent/20 rounded-lg">
                    <IconComponent className="w-5 h-5 text-lime-accent" />
                  </div>
                  <h4 className="font-semibold text-light-text dark:text-dark-text capitalize">{key}</h4>
                </div>
                <p className="text-2xl font-bold text-lime-accent mb-1">{amount.toLocaleString()} LEI</p>
                {target && (
                  <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary">
                    {target.type === 'percentage' ? `${target.value}%` : 'Fixed amount'}
                  </p>
                )}
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Income & Expenses Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Income Breakdown */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
          className="bg-light-surface/50 dark:bg-dark-surface/50 backdrop-blur-sm border border-light-border dark:border-dark-border rounded-2xl p-6 shadow-glass"
        >
          <h3 className="text-xl font-bold text-light-text dark:text-dark-text font-editorial mb-4">Income Sources</h3>
          <div className="space-y-3">
            {currentPlan.income_items.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.8 + index * 0.1 }}
                className="flex items-center justify-between p-3 bg-light-glass dark:bg-dark-glass rounded-lg"
              >
                <span className="text-light-text dark:text-dark-text font-medium">{item.name}</span>
                <span className="text-lime-accent font-bold">{item.amount.toLocaleString()} LEI</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Expenses Breakdown */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
          className="bg-light-surface/50 dark:bg-dark-surface/50 backdrop-blur-sm border border-light-border dark:border-dark-border rounded-2xl p-6 shadow-glass"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-light-text dark:text-dark-text font-editorial">Expenses Tracking</h3>
            <div className="text-xs text-light-text-secondary dark:text-dark-text-secondary">
              Click amounts to edit actuals
            </div>
          </div>
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {currentPlan.expense_items.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.8 + index * 0.05 }}
                className="p-3 bg-light-glass dark:bg-dark-glass rounded-lg"
              >
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <span className="text-light-text dark:text-dark-text font-medium block">{item.name}</span>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      item.category === 'fixed' 
                        ? 'bg-blue-500/20 text-blue-400' 
                        : 'bg-orange-500/20 text-orange-400'
                    }`}>
                      {item.category}
                    </span>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-light-text-secondary dark:text-dark-text-secondary block">Planned:</span>
                    <span className="text-orange-400 font-bold">{item.planned.toLocaleString()} LEI</span>
                  </div>
                  <div>
                    <span className="text-light-text-secondary dark:text-dark-text-secondary block">Actual:</span>
                    {editingExpenseId === item.id ? (
                      <div className="flex items-center space-x-2">
                        <div className="relative flex-1">
                          <LeiIcon className="absolute left-2 top-1/2 transform -translate-y-1/2 w-3 h-3 text-light-text-secondary dark:text-dark-text-secondary" />
                          <input
                            type="number"
                            value={tempActualAmount || ''}
                            onChange={(e) => setTempActualAmount(parseFloat(e.target.value) || 0)}
                            className="w-full bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border rounded pl-6 pr-2 py-1 text-xs text-light-text dark:text-dark-text focus:outline-none focus:border-lime-accent/50"
                            autoFocus
                          />
                        </div>
                        <div className="flex space-x-1">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={handleSaveActual}
                            disabled={isSavingActual}
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
                            ✕
                          </motion.button>
                        </div>
                      </div>
                    ) : (
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleEditActual(item.id, item.actual)}
                        className="flex items-center space-x-1 text-lime-accent font-bold hover:bg-lime-accent/10 px-2 py-1 rounded transition-colors"
                      >
                        <span>{item.actual.toLocaleString()} LEI</span>
                        <Edit3 className="w-3 h-3" />
                      </motion.button>
                    )}
                  </div>
                </div>
                
                {/* Variance indicator */}
                {item.actual > 0 && (
                  <div className="mt-2 pt-2 border-t border-light-border dark:border-dark-border">
                    <div className="flex justify-between text-xs">
                      <span className="text-light-text-secondary dark:text-dark-text-secondary">Variance:</span>
                      <span className={`font-medium ${
                        item.actual <= item.planned ? 'text-lime-accent' : 'text-red-400'
                      }`}>
                        {item.actual <= item.planned ? '✓' : '⚠'} {(item.actual - item.planned).toLocaleString()} LEI
                      </span>
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
          
          {/* Summary */}
          <div className="mt-4 pt-4 border-t border-light-border dark:border-dark-border">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-light-text-secondary dark:text-dark-text-secondary block">Total Planned:</span>
                <span className="text-orange-400 font-bold">{summary.totalExpenses.toLocaleString()} LEI</span>
              </div>
              <div>
                <span className="text-light-text-secondary dark:text-dark-text-secondary block">Total Actual:</span>
                <span className="text-lime-accent font-bold">
                  {currentPlan.expense_items.reduce((sum, item) => sum + item.actual, 0).toLocaleString()} LEI
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
          </motion.div>
        )}

        {activeTab === 'analytics' && (
          <motion.div
            key="analytics"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <BudgetAnalytics currentUserId={currentUserId} currentPlan={currentPlan} />
          </motion.div>
        )}

        {activeTab === 'goals' && (
          <motion.div
            key="goals"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <FinancialGoals currentUserId={currentUserId} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};