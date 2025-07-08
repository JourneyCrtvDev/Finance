import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  TrendingDown, 
  BarChart3,
  PieChart, 
  Calendar,
  Target,
  AlertTriangle,
  CheckCircle2,
  DollarSign,
  Percent
} from 'lucide-react';
import { BudgetService } from '../services/budgetService';
import { BudgetPlan } from '../types/budget';

interface InsightsProps {
  currentUserId: string | null;
}

export const Insights: React.FC<InsightsProps> = ({ currentUserId }) => {
  const [budgetPlans, setBudgetPlans] = useState<BudgetPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<'3months' | '6months' | '1year'>('3months');

  useEffect(() => {
    loadBudgetData();
  }, [currentUserId]);

  const loadBudgetData = async () => {
    setIsLoading(true);
    try {
      const plans = await BudgetService.getUserBudgetPlans(currentUserId || 'demo-user');
      setBudgetPlans(plans);
    } catch (error) {
      console.error('Error loading budget data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateInsights = () => {
    if (budgetPlans.length === 0) return null;

    const recentPlans = budgetPlans.slice(0, selectedPeriod === '3months' ? 3 : selectedPeriod === '6months' ? 6 : 12);
    
    const totalIncome = recentPlans.reduce((sum, plan) => sum + plan.total_income, 0);
    const totalExpenses = recentPlans.reduce((sum, plan) => sum + plan.total_expenses, 0);
    const totalActualExpenses = recentPlans.reduce((sum, plan) => 
      sum + plan.expense_items.reduce((expSum, item) => expSum + item.actual, 0), 0
    );
    
    const avgMonthlyIncome = totalIncome / recentPlans.length;
    const avgMonthlyExpenses = totalExpenses / recentPlans.length;
    const avgActualExpenses = totalActualExpenses / recentPlans.length;
    
    const savingsRate = totalIncome > 0 ? ((totalIncome - totalActualExpenses) / totalIncome) * 100 : 0;
    const budgetAccuracy = totalExpenses > 0 ? (1 - Math.abs(totalExpenses - totalActualExpenses) / totalExpenses) * 100 : 0;
    
    // Category analysis
    const categorySpending: Record<string, number> = {};
    recentPlans.forEach(plan => {
      plan.expense_items.forEach(item => {
        categorySpending[item.category] = (categorySpending[item.category] || 0) + item.actual;
      });
    });

    // Trends
    const incomeGrowth = recentPlans.length >= 2 ? 
      ((recentPlans[0].total_income - recentPlans[recentPlans.length - 1].total_income) / recentPlans[recentPlans.length - 1].total_income) * 100 : 0;

    return {
      avgMonthlyIncome,
      avgMonthlyExpenses,
      avgActualExpenses,
      savingsRate,
      budgetAccuracy,
      categorySpending,
      incomeGrowth,
      totalPlans: recentPlans.length
    };
  };

  const insights = calculateInsights();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <div className="w-8 h-8 border-2 border-lime-accent border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-light-text-secondary dark:text-dark-text-secondary">Loading insights...</p>
        </motion.div>
      </div>
    );
  }

  if (!insights || budgetPlans.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <BarChart3 className="w-16 h-16 text-light-text-secondary dark:text-dark-text-secondary mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-light-text dark:text-dark-text font-editorial mb-4">No Data Available</h2>
          <p className="text-light-text-secondary dark:text-dark-text-secondary">
            Create some budget plans to see your financial insights
          </p>
        </motion.div>
      </div>
    );
  }

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
          <h2 className="text-3xl font-bold text-light-text dark:text-dark-text font-editorial">Budget Insights</h2>
          <p className="text-light-text-secondary dark:text-dark-text-secondary mt-1">
            Analyze your spending patterns and financial trends
          </p>
        </div>
        <select
          value={selectedPeriod}
          onChange={(e) => setSelectedPeriod(e.target.value as any)}
          className="bg-light-glass dark:bg-dark-glass border border-light-border dark:border-dark-border rounded-xl px-4 py-2 text-light-text dark:text-dark-text focus:outline-none focus:border-lime-accent/50"
        >
          <option value="3months">Last 3 Months</option>
          <option value="6months">Last 6 Months</option>
          <option value="1year">Last 12 Months</option>
        </select>
      </motion.div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-gradient-to-br from-lime-accent/10 to-lime-accent/5 border border-lime-accent/20 rounded-xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-light-text dark:text-dark-text">Savings Rate</h3>
            <Target className="w-5 h-5 text-lime-accent" />
          </div>
          <p className="text-3xl font-bold text-lime-accent">{insights.savingsRate.toFixed(1)}%</p>
          <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary mt-2">
            {insights.savingsRate >= 20 ? 'Excellent!' : insights.savingsRate >= 10 ? 'Good' : 'Needs improvement'}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border border-blue-500/20 rounded-xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-light-text dark:text-dark-text">Budget Accuracy</h3>
            <CheckCircle2 className="w-5 h-5 text-blue-400" />
          </div>
          <p className="text-3xl font-bold text-blue-400">{insights.budgetAccuracy.toFixed(1)}%</p>
          <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary mt-2">
            How close actual vs planned
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="bg-gradient-to-br from-purple-500/10 to-purple-500/5 border border-purple-500/20 rounded-xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-light-text dark:text-dark-text">Avg Monthly Income</h3>
            <DollarSign className="w-5 h-5 text-purple-400" />
          </div>
          <p className="text-3xl font-bold text-purple-400">{insights.avgMonthlyIncome.toLocaleString()}</p>
          <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary mt-2">LEI per month</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className={`bg-gradient-to-br ${
            insights.incomeGrowth >= 0 
              ? 'from-lime-accent/10 to-lime-accent/5 border-lime-accent/20' 
              : 'from-red-500/10 to-red-500/5 border-red-500/20'
          } border rounded-xl p-6`}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-light-text dark:text-dark-text">Income Growth</h3>
            {insights.incomeGrowth >= 0 ? (
              <TrendingUp className="w-5 h-5 text-lime-accent" />
            ) : (
              <TrendingDown className="w-5 h-5 text-red-400" />
            )}
          </div>
          <p className={`text-3xl font-bold ${insights.incomeGrowth >= 0 ? 'text-lime-accent' : 'text-red-400'}`}>
            {insights.incomeGrowth > 0 ? '+' : ''}{insights.incomeGrowth.toFixed(1)}%
          </p>
          <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary mt-2">
            vs previous period
          </p>
        </motion.div>
      </div>

      {/* Spending Analysis */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="bg-light-surface/50 dark:bg-dark-surface/50 backdrop-blur-sm border border-light-border dark:border-dark-border rounded-2xl p-6 shadow-glass"
      >
        <div className="flex items-center space-x-3 mb-6">
          <PieChart className="w-6 h-6 text-lime-accent" />
          <h3 className="text-xl font-bold text-light-text dark:text-dark-text font-editorial">Spending by Category</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Object.entries(insights.categorySpending).map(([category, amount], index) => {
            const percentage = (amount / Object.values(insights.categorySpending).reduce((a, b) => a + b, 0)) * 100;
            return (
              <motion.div
                key={category}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.6 + index * 0.1 }}
                className="flex items-center justify-between p-4 bg-light-glass dark:bg-dark-glass rounded-xl"
              >
                <div>
                  <h4 className="font-semibold text-light-text dark:text-dark-text capitalize">{category}</h4>
                  <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                    {amount.toLocaleString()} LEI
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-lime-accent">{percentage.toFixed(1)}%</p>
                  <div className="w-16 bg-light-border dark:bg-dark-border rounded-full h-2 mt-1">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ duration: 1, delay: 0.7 + index * 0.1 }}
                      className="h-2 bg-lime-accent rounded-full"
                    />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Recommendations */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.7 }}
        className="bg-light-surface/50 dark:bg-dark-surface/50 backdrop-blur-sm border border-light-border dark:border-dark-border rounded-2xl p-6 shadow-glass"
      >
        <div className="flex items-center space-x-3 mb-6">
          <AlertTriangle className="w-6 h-6 text-lime-accent" />
          <h3 className="text-xl font-bold text-light-text dark:text-dark-text font-editorial">Recommendations</h3>
        </div>

        <div className="space-y-4">
          {insights.savingsRate < 10 && (
            <div className="p-4 bg-orange-500/10 border border-orange-500/20 rounded-xl">
              <h4 className="font-semibold text-orange-400 mb-2">Increase Your Savings Rate</h4>
              <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                Your current savings rate is {insights.savingsRate.toFixed(1)}%. Try to aim for at least 10-20% of your income.
              </p>
            </div>
          )}

          {insights.budgetAccuracy < 80 && (
            <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
              <h4 className="font-semibold text-blue-400 mb-2">Improve Budget Planning</h4>
              <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                Your budget accuracy is {insights.budgetAccuracy.toFixed(1)}%. Review your spending patterns to create more realistic budgets.
              </p>
            </div>
          )}

          {insights.incomeGrowth < 0 && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
              <h4 className="font-semibold text-red-400 mb-2">Income Decline Detected</h4>
              <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                Your income has decreased by {Math.abs(insights.incomeGrowth).toFixed(1)}%. Consider reviewing your income sources.
              </p>
            </div>
          )}

          {insights.savingsRate >= 20 && insights.budgetAccuracy >= 80 && insights.incomeGrowth >= 0 && (
            <div className="p-4 bg-lime-accent/10 border border-lime-accent/20 rounded-xl">
              <h4 className="font-semibold text-lime-accent mb-2">Excellent Financial Health!</h4>
              <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                You're doing great! Keep up the good work with your budgeting and savings habits.
              </p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};