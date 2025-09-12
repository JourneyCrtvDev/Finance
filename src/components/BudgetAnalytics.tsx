import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Calendar,
  DollarSign,
  Percent,
  Target,
  AlertTriangle,
  CheckCircle2
} from 'lucide-react';
import { BudgetPlan } from '../types/budget';
import { BudgetService } from '../services/budgetService';

interface BudgetAnalyticsProps {
  currentUserId: string | null;
  currentPlan: BudgetPlan | null;
}

interface MonthlyTrend {
  month: string;
  income: number;
  expenses: number;
  savings: number;
  savingsRate: number;
}

interface CategoryAnalysis {
  category: string;
  planned: number;
  actual: number;
  variance: number;
  variancePercent: number;
}

export const BudgetAnalytics: React.FC<BudgetAnalyticsProps> = ({ currentUserId, currentPlan }) => {
  const [trends, setTrends] = useState<MonthlyTrend[]>([]);
  const [categoryAnalysis, setCategoryAnalysis] = useState<CategoryAnalysis[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (currentUserId) {
      loadAnalyticsData();
    }
  }, [currentUserId, currentPlan]);

  const loadAnalyticsData = async () => {
    if (!currentUserId) return;
    
    setIsLoading(true);
    try {
      const plans = await BudgetService.getUserBudgetPlans(currentUserId);
      
      // Calculate monthly trends
      const monthlyTrends = plans.slice(0, 6).map(plan => {
        const totalActual = plan.expense_items.reduce((sum, item) => sum + item.actual, 0);
        const savings = plan.total_income - totalActual;
        const savingsRate = plan.total_income > 0 ? (savings / plan.total_income) * 100 : 0;
        
        return {
          month: `${plan.month}/${plan.year}`,
          income: plan.total_income,
          expenses: totalActual,
          savings,
          savingsRate
        };
      }).reverse();
      
      setTrends(monthlyTrends);

      // Calculate category analysis for current plan
      if (currentPlan) {
        const categoryData: Record<string, { planned: number; actual: number }> = {};
        
        currentPlan.expense_items.forEach(item => {
          if (!categoryData[item.category]) {
            categoryData[item.category] = { planned: 0, actual: 0 };
          }
          categoryData[item.category].planned += item.planned;
          categoryData[item.category].actual += item.actual;
        });

        const analysis = Object.entries(categoryData).map(([category, data]) => {
          const variance = data.actual - data.planned;
          const variancePercent = data.planned > 0 ? (variance / data.planned) * 100 : 0;
          
          return {
            category,
            planned: data.planned,
            actual: data.actual,
            variance,
            variancePercent
          };
        });

        setCategoryAnalysis(analysis);
      }
    } catch (error) {
      console.error('Error loading analytics data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <div className="w-8 h-8 border-2 border-lime-accent border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-light-text-secondary dark:text-dark-text-secondary">Loading analytics...</p>
        </motion.div>
      </div>
    );
  }

  const latestTrend = trends[trends.length - 1];
  const previousTrend = trends[trends.length - 2];
  const savingsGrowth = previousTrend ? 
    ((latestTrend?.savingsRate || 0) - previousTrend.savingsRate) : 0;

  return (
    <div className="space-y-6">
      {/* Analytics Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center space-x-3"
      >
        <div className="p-2 bg-lime-accent/20 rounded-lg">
          <BarChart3 className="w-6 h-6 text-lime-accent" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-light-text dark:text-dark-text font-editorial">Budget Analytics</h3>
          <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
            Insights from your spending patterns
          </p>
        </div>
      </motion.div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-gradient-to-br from-lime-accent/10 to-lime-accent/5 border border-lime-accent/20 rounded-xl p-4"
        >
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-semibold text-light-text dark:text-dark-text">Current Savings Rate</h4>
            <Percent className="w-5 h-5 text-lime-accent" />
          </div>
          <p className="text-2xl font-bold text-lime-accent">
            {latestTrend?.savingsRate.toFixed(1) || '0.0'}%
          </p>
          {savingsGrowth !== 0 && (
            <div className={`flex items-center space-x-1 mt-2 ${savingsGrowth > 0 ? 'text-lime-accent' : 'text-red-400'}`}>
              {savingsGrowth > 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              <span className="text-xs font-medium">
                {savingsGrowth > 0 ? '+' : ''}{savingsGrowth.toFixed(1)}% vs last month
              </span>
            </div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border border-blue-500/20 rounded-xl p-4"
        >
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-semibold text-light-text dark:text-dark-text">Avg Monthly Savings</h4>
            <DollarSign className="w-5 h-5 text-blue-400" />
          </div>
          <p className="text-2xl font-bold text-blue-400">
            {trends.length > 0 ? 
              (trends.reduce((sum, t) => sum + t.savings, 0) / trends.length).toLocaleString() : '0'} LEI
          </p>
          <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary mt-2">
            Over {trends.length} months
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="bg-gradient-to-br from-purple-500/10 to-purple-500/5 border border-purple-500/20 rounded-xl p-4"
        >
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-semibold text-light-text dark:text-dark-text">Budget Accuracy</h4>
            <Target className="w-5 h-5 text-purple-400" />
          </div>
          <p className="text-2xl font-bold text-purple-400">
            {currentPlan && currentPlan.expense_items.length > 0 ? 
              (100 - Math.abs(categoryAnalysis.reduce((sum, cat) => sum + Math.abs(cat.variancePercent), 0) / categoryAnalysis.length)).toFixed(1) : '0.0'}%
          </p>
          <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary mt-2">
            Planned vs actual accuracy
          </p>
        </motion.div>
      </div>

      {/* Monthly Trends Chart */}
      {trends.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="bg-light-surface/50 dark:bg-dark-surface/50 backdrop-blur-sm border border-light-border dark:border-dark-border rounded-2xl p-6 shadow-glass"
        >
          <h4 className="text-lg font-bold text-light-text dark:text-dark-text font-editorial mb-4">
            6-Month Savings Trend
          </h4>
          
          <div className="space-y-4">
            {trends.map((trend, index) => {
              const maxSavings = Math.max(...trends.map(t => t.savings));
              const barWidth = maxSavings > 0 ? (trend.savings / maxSavings) * 100 : 0;
              
              return (
                <motion.div
                  key={trend.month}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.5 + index * 0.1 }}
                  className="flex items-center space-x-4"
                >
                  <div className="w-16 text-sm text-light-text-secondary dark:text-dark-text-secondary">
                    {trend.month}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-light-text dark:text-dark-text">
                        {trend.savings.toLocaleString()} LEI
                      </span>
                      <span className={`text-xs font-medium ${
                        trend.savingsRate >= 20 ? 'text-lime-accent' :
                        trend.savingsRate >= 10 ? 'text-orange-400' : 'text-red-400'
                      }`}>
                        {trend.savingsRate.toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full bg-light-glass dark:bg-dark-glass rounded-full h-2">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${barWidth}%` }}
                        transition={{ duration: 0.8, delay: 0.6 + index * 0.1 }}
                        className={`h-2 rounded-full ${
                          trend.savingsRate >= 20 ? 'bg-lime-accent' :
                          trend.savingsRate >= 10 ? 'bg-orange-400' : 'bg-red-400'
                        }`}
                      />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Category Variance Analysis */}
      {categoryAnalysis.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="bg-light-surface/50 dark:bg-dark-surface/50 backdrop-blur-sm border border-light-border dark:border-dark-border rounded-2xl p-6 shadow-glass"
        >
          <h4 className="text-lg font-bold text-light-text dark:text-dark-text font-editorial mb-4">
            Category Performance
          </h4>
          
          <div className="space-y-3">
            {categoryAnalysis.map((category, index) => (
              <motion.div
                key={category.category}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.7 + index * 0.05 }}
                className="p-4 bg-light-glass dark:bg-dark-glass rounded-xl"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${
                      Math.abs(category.variancePercent) <= 10 ? 'bg-lime-accent/20' :
                      Math.abs(category.variancePercent) <= 25 ? 'bg-orange-500/20' : 'bg-red-500/20'
                    }`}>
                      {Math.abs(category.variancePercent) <= 10 ? (
                        <CheckCircle2 className="w-4 h-4 text-lime-accent" />
                      ) : (
                        <AlertTriangle className={`w-4 h-4 ${
                          Math.abs(category.variancePercent) <= 25 ? 'text-orange-400' : 'text-red-400'
                        }`} />
                      )}
                    </div>
                    <div>
                      <h5 className="font-semibold text-light-text dark:text-dark-text capitalize">
                        {category.category}
                      </h5>
                      <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary">
                        Planned: {category.planned.toLocaleString()} LEI • 
                        Actual: {category.actual.toLocaleString()} LEI
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className={`text-lg font-bold ${
                      category.variance <= 0 ? 'text-lime-accent' : 'text-red-400'
                    }`}>
                      {category.variance > 0 ? '+' : ''}{category.variance.toLocaleString()} LEI
                    </div>
                    <div className={`text-sm ${
                      Math.abs(category.variancePercent) <= 10 ? 'text-lime-accent' :
                      Math.abs(category.variancePercent) <= 25 ? 'text-orange-400' : 'text-red-400'
                    }`}>
                      {category.variancePercent > 0 ? '+' : ''}{category.variancePercent.toFixed(1)}%
                    </div>
                  </div>
                </div>
                
                {/* Variance Bar */}
                <div className="w-full bg-light-border dark:bg-dark-border rounded-full h-1">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ 
                      width: `${Math.min(Math.abs(category.variancePercent), 100)}%`,
                      marginLeft: category.variance < 0 ? `${100 - Math.min(Math.abs(category.variancePercent), 100)}%` : '0%'
                    }}
                    transition={{ duration: 0.8, delay: 0.8 + index * 0.1 }}
                    className={`h-1 rounded-full ${
                      category.variance <= 0 ? 'bg-lime-accent' : 'bg-red-400'
                    }`}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Recommendations */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.8 }}
        className="bg-light-surface/50 dark:bg-dark-surface/50 backdrop-blur-sm border border-light-border dark:border-dark-border rounded-2xl p-6 shadow-glass"
      >
        <h4 className="text-lg font-bold text-light-text dark:text-dark-text font-editorial mb-4">
          Smart Recommendations
        </h4>
        
        <div className="space-y-3">
          {latestTrend && latestTrend.savingsRate < 10 && (
            <div className="p-4 bg-orange-500/10 border border-orange-500/20 rounded-xl">
              <div className="flex items-center space-x-3">
                <AlertTriangle className="w-5 h-5 text-orange-400" />
                <div>
                  <h5 className="font-semibold text-orange-400">Increase Savings Rate</h5>
                  <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                    Your savings rate is {latestTrend.savingsRate.toFixed(1)}%. Aim for 10-20% for better financial health.
                  </p>
                </div>
              </div>
            </div>
          )}

          {categoryAnalysis.some(cat => cat.variancePercent > 25) && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
              <div className="flex items-center space-x-3">
                <AlertTriangle className="w-5 h-5 text-red-400" />
                <div>
                  <h5 className="font-semibold text-red-400">Budget Overspending Detected</h5>
                  <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                    Some categories are significantly over budget. Review your {categoryAnalysis.filter(cat => cat.variancePercent > 25).map(cat => cat.category).join(', ')} spending.
                  </p>
                </div>
              </div>
            </div>
          )}

          {latestTrend && latestTrend.savingsRate >= 20 && categoryAnalysis.every(cat => Math.abs(cat.variancePercent) <= 15) && (
            <div className="p-4 bg-lime-accent/10 border border-lime-accent/20 rounded-xl">
              <div className="flex items-center space-x-3">
                <CheckCircle2 className="w-5 h-5 text-lime-accent" />
                <div>
                  <h5 className="font-semibold text-lime-accent">Excellent Financial Management!</h5>
                  <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                    You're maintaining a great savings rate and staying within budget. Keep up the excellent work!
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};