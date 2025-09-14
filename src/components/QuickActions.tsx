import React from 'react';
import { motion } from 'framer-motion';
import { 
  Plus, 
  Calculator, 
  CreditCard, 
  ShoppingBag, 
  TrendingUp,
  Calendar,
  Target,
  Zap
} from 'lucide-react';

interface QuickActionsProps {
  onAction: (action: string) => void;
}

const quickActions = [
  {
    id: 'new-budget',
    label: 'New Budget',
    description: 'Create a fresh budget plan',
    icon: Calculator,
    color: 'lime',
    action: 'budget'
  },
  {
    id: 'add-payment',
    label: 'Add Payment',
    description: 'Track a new bill or payment',
    icon: CreditCard,
    color: 'blue',
    action: 'payments'
  },
  {
    id: 'shopping-list',
    label: 'Shopping List',
    description: 'Create a new shopping list',
    icon: ShoppingBag,
    color: 'purple',
    action: 'shopping'
  },
  {
    id: 'check-rates',
    label: 'Exchange Rates',
    description: 'View live currency rates',
    icon: TrendingUp,
    color: 'orange',
    action: 'exchange'
  }
];

export const QuickActions: React.FC<QuickActionsProps> = ({ onAction }) => {
  const getColorClasses = (color: string) => {
    const colors = {
      lime: 'from-lime-accent/10 to-lime-accent/5 border-lime-accent/20 text-lime-accent hover:shadow-glow',
      blue: 'from-blue-500/10 to-blue-500/5 border-blue-500/20 text-blue-400 hover:shadow-[0_0_20px_rgba(59,130,246,0.3)]',
      purple: 'from-purple-500/10 to-purple-500/5 border-purple-500/20 text-purple-400 hover:shadow-[0_0_20px_rgba(168,85,247,0.3)]',
      orange: 'from-orange-500/10 to-orange-500/5 border-orange-500/20 text-orange-400 hover:shadow-[0_0_20px_rgba(249,115,22,0.3)]'
    };
    return colors[color as keyof typeof colors] || colors.lime;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-light-surface/50 dark:bg-dark-surface/50 backdrop-blur-sm border border-light-border dark:border-dark-border rounded-2xl p-6 shadow-glass"
    >
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-2 bg-lime-accent/20 rounded-lg">
          <Zap className="w-6 h-6 text-lime-accent" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-light-text dark:text-dark-text font-editorial">Quick Actions</h3>
          <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
            Jump to your most common tasks
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {quickActions.map((action, index) => (
          <motion.button
            key={action.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onAction(action.action)}
            className={`p-6 md:p-6 rounded-xl border bg-gradient-to-br transition-all duration-300 text-left group ${getColorClasses(action.color)}`}
          >
            <div className="flex items-center justify-between mb-5">
              <action.icon className="w-8 h-8 group-hover:scale-110 transition-transform duration-300" />
              <div className="w-2 h-2 rounded-full bg-current opacity-50 group-hover:opacity-100 transition-opacity" />
            </div>
            
            <h4 className="font-bold text-light-text dark:text-dark-text mb-3 group-hover:text-current transition-colors">
              {action.label}
            </h4>
            <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary group-hover:text-current/70 transition-colors">
              {action.description}
            </p>
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
};