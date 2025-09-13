import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, DollarSign, Target } from 'lucide-react';
import { BudgetPlan, BudgetSummary } from '../types/budget';

interface MobileQuickStatsProps {
  currentPlan: BudgetPlan | null;
  summary: BudgetSummary | null;
}

export const MobileQuickStats: React.FC<MobileQuickStatsProps> = ({ currentPlan, summary }) => {
  if (!currentPlan || !summary) return null;

  const savingsRate = summary.totalIncome > 0 ? 
    ((summary.totalIncome - summary.totalActualExpenses) / summary.totalIncome) * 100 : 0;

  const stats = [
    {
      label: 'Income',
      value: `${summary.totalIncome.toLocaleString()} LEI`,
      icon: TrendingUp,
      color: 'text-lime-accent',
      bgColor: 'bg-lime-accent/10'
    },
    {
      label: 'Expenses',
      value: `${summary.totalExpenses.toLocaleString()} LEI`,
      icon: TrendingDown,
      color: 'text-red-400',
      bgColor: 'bg-red-500/10'
    },
    {
      label: 'Leftover',
      value: `${summary.leftoverAmount.toLocaleString()} LEI`,
      icon: DollarSign,
      color: summary.leftoverAmount >= 0 ? 'text-blue-400' : 'text-orange-400',
      bgColor: summary.leftoverAmount >= 0 ? 'bg-blue-500/10' : 'bg-orange-500/10'
    },
    {
      label: 'Savings Rate',
      value: `${savingsRate.toFixed(1)}%`,
      icon: Target,
      color: savingsRate >= 20 ? 'text-lime-accent' : savingsRate >= 10 ? 'text-orange-400' : 'text-red-400',
      bgColor: savingsRate >= 20 ? 'bg-lime-accent/10' : savingsRate >= 10 ? 'bg-orange-500/10' : 'bg-red-500/10'
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="md:hidden bg-light-surface/50 dark:bg-dark-surface/50 backdrop-blur-sm border border-light-border dark:border-dark-border rounded-2xl p-4 shadow-glass"
    >
      <h3 className="text-lg font-bold text-light-text dark:text-dark-text font-editorial mb-4">
        Quick Overview
      </h3>
      
      <div className="grid grid-cols-2 gap-3">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className={`p-3 rounded-xl border ${stat.bgColor} border-current/20`}
          >
            <div className="flex items-center space-x-2 mb-2">
              <stat.icon className={`w-4 h-4 ${stat.color}`} />
              <span className="text-xs font-medium text-light-text-secondary dark:text-dark-text-secondary">
                {stat.label}
              </span>
            </div>
            <p className={`text-lg font-bold ${stat.color}`}>
              {stat.value}
            </p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};