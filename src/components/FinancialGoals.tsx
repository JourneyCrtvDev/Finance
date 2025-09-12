import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Target, 
  Plus, 
  Edit3, 
  Trash2, 
  Calendar,
  TrendingUp,
  CheckCircle2,
  Clock,
  DollarSign
} from 'lucide-react';

interface FinancialGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string;
  category: 'savings' | 'investment' | 'purchase' | 'debt' | 'emergency';
  priority: 'low' | 'medium' | 'high';
  description?: string;
  isCompleted: boolean;
  createdAt: Date;
}

interface FinancialGoalsProps {
  currentUserId: string | null;
}

const goalCategories = {
  savings: { label: 'Savings', color: 'lime', icon: Target },
  investment: { label: 'Investment', color: 'blue', icon: TrendingUp },
  purchase: { label: 'Purchase', color: 'purple', icon: DollarSign },
  debt: { label: 'Debt Payoff', color: 'red', icon: Target },
  emergency: { label: 'Emergency Fund', color: 'orange', icon: Target }
};

export const FinancialGoals: React.FC<FinancialGoalsProps> = ({ currentUserId }) => {
  const [goals, setGoals] = useState<FinancialGoal[]>([
    {
      id: '1',
      name: 'Emergency Fund',
      targetAmount: 15000,
      currentAmount: 8500,
      targetDate: '2024-12-31',
      category: 'emergency',
      priority: 'high',
      description: 'Build 6 months of expenses as emergency fund',
      isCompleted: false,
      createdAt: new Date('2024-01-01')
    },
    {
      id: '2',
      name: 'New Laptop',
      targetAmount: 5000,
      currentAmount: 3200,
      targetDate: '2024-08-15',
      category: 'purchase',
      priority: 'medium',
      description: 'MacBook Pro for work',
      isCompleted: false,
      createdAt: new Date('2024-02-15')
    },
    {
      id: '3',
      name: 'Investment Portfolio',
      targetAmount: 25000,
      currentAmount: 12000,
      targetDate: '2025-06-30',
      category: 'investment',
      priority: 'medium',
      description: 'Diversified investment portfolio',
      isCompleted: false,
      createdAt: new Date('2024-01-15')
    }
  ]);
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingGoal, setEditingGoal] = useState<FinancialGoal | null>(null);
  const [newGoal, setNewGoal] = useState<Partial<FinancialGoal>>({
    name: '',
    targetAmount: 0,
    currentAmount: 0,
    targetDate: '',
    category: 'savings',
    priority: 'medium',
    description: ''
  });

  const calculateProgress = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100);
  };

  const getDaysRemaining = (targetDate: string) => {
    const today = new Date();
    const target = new Date(targetDate);
    const diffTime = target.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 100) return 'text-lime-accent';
    if (progress >= 75) return 'text-blue-400';
    if (progress >= 50) return 'text-orange-400';
    return 'text-red-400';
  };

  const handleAddGoal = () => {
    if (!newGoal.name || !newGoal.targetAmount || !newGoal.targetDate) return;

    const goal: FinancialGoal = {
      id: Date.now().toString(),
      name: newGoal.name,
      targetAmount: newGoal.targetAmount,
      currentAmount: newGoal.currentAmount || 0,
      targetDate: newGoal.targetDate,
      category: newGoal.category || 'savings',
      priority: newGoal.priority || 'medium',
      description: newGoal.description || '',
      isCompleted: false,
      createdAt: new Date()
    };

    setGoals([...goals, goal]);
    setNewGoal({
      name: '',
      targetAmount: 0,
      currentAmount: 0,
      targetDate: '',
      category: 'savings',
      priority: 'medium',
      description: ''
    });
    setShowAddForm(false);
  };

  const handleUpdateProgress = (goalId: string, newAmount: number) => {
    setGoals(goals.map(goal => {
      if (goal.id === goalId) {
        const updated = { ...goal, currentAmount: newAmount };
        if (newAmount >= goal.targetAmount && !goal.isCompleted) {
          updated.isCompleted = true;
        }
        return updated;
      }
      return goal;
    }));
  };

  const handleDeleteGoal = (goalId: string) => {
    setGoals(goals.filter(goal => goal.id !== goalId));
  };

  const sortedGoals = [...goals].sort((a, b) => {
    // Completed goals go to bottom
    if (a.isCompleted !== b.isCompleted) {
      return a.isCompleted ? 1 : -1;
    }
    // Sort by priority
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });

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
            <div className="p-2 bg-lime-accent/20 rounded-lg">
              <Target className="w-6 h-6 text-lime-accent" />
            </div>
            <h2 className="text-3xl font-bold text-light-text dark:text-dark-text font-editorial">Financial Goals</h2>
          </div>
          <p className="text-light-text-secondary dark:text-dark-text-secondary">
            Track your progress towards financial milestones
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowAddForm(true)}
          className="flex items-center space-x-2 bg-lime-accent text-light-base dark:text-dark-base px-4 py-2 rounded-xl font-medium hover:shadow-glow transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add Goal</span>
        </motion.button>
      </motion.div>

      {/* Add Goal Form */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-light-surface/50 dark:bg-dark-surface/50 backdrop-blur-sm border border-light-border dark:border-dark-border rounded-2xl p-6 shadow-glass"
          >
            <h3 className="text-xl font-bold text-light-text dark:text-dark-text font-editorial mb-4">Add New Goal</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-light-text-secondary dark:text-dark-text-secondary mb-2">Goal Name</label>
                <input
                  type="text"
                  value={newGoal.name || ''}
                  onChange={(e) => setNewGoal({ ...newGoal, name: e.target.value })}
                  placeholder="e.g., Emergency Fund, New Car"
                  className="w-full bg-light-glass dark:bg-dark-glass border border-light-border dark:border-dark-border rounded-lg px-3 py-2 text-light-text dark:text-dark-text focus:outline-none focus:border-lime-accent/50 transition-colors duration-300"
                />
              </div>
              <div>
                <label className="block text-sm text-light-text-secondary dark:text-dark-text-secondary mb-2">Target Amount (LEI)</label>
                <input
                  type="number"
                  value={newGoal.targetAmount || ''}
                  onChange={(e) => setNewGoal({ ...newGoal, targetAmount: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-light-glass dark:bg-dark-glass border border-light-border dark:border-dark-border rounded-lg px-3 py-2 text-light-text dark:text-dark-text focus:outline-none focus:border-lime-accent/50 transition-colors duration-300"
                />
              </div>
              <div>
                <label className="block text-sm text-light-text-secondary dark:text-dark-text-secondary mb-2">Current Amount (LEI)</label>
                <input
                  type="number"
                  value={newGoal.currentAmount || ''}
                  onChange={(e) => setNewGoal({ ...newGoal, currentAmount: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-light-glass dark:bg-dark-glass border border-light-border dark:border-dark-border rounded-lg px-3 py-2 text-light-text dark:text-dark-text focus:outline-none focus:border-lime-accent/50 transition-colors duration-300"
                />
              </div>
              <div>
                <label className="block text-sm text-light-text-secondary dark:text-dark-text-secondary mb-2">Target Date</label>
                <input
                  type="date"
                  value={newGoal.targetDate || ''}
                  onChange={(e) => setNewGoal({ ...newGoal, targetDate: e.target.value })}
                  className="w-full bg-light-glass dark:bg-dark-glass border border-light-border dark:border-dark-border rounded-lg px-3 py-2 text-light-text dark:text-dark-text focus:outline-none focus:border-lime-accent/50 transition-colors duration-300"
                />
              </div>
              <div>
                <label className="block text-sm text-light-text-secondary dark:text-dark-text-secondary mb-2">Category</label>
                <select
                  value={newGoal.category || 'savings'}
                  onChange={(e) => setNewGoal({ ...newGoal, category: e.target.value as any })}
                  className="w-full bg-light-glass dark:bg-dark-glass border border-light-border dark:border-dark-border rounded-lg px-3 py-2 text-light-text dark:text-dark-text focus:outline-none focus:border-lime-accent/50 transition-colors duration-300"
                >
                  {Object.entries(goalCategories).map(([key, cat]) => (
                    <option key={key} value={key}>{cat.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-light-text-secondary dark:text-dark-text-secondary mb-2">Priority</label>
                <select
                  value={newGoal.priority || 'medium'}
                  onChange={(e) => setNewGoal({ ...newGoal, priority: e.target.value as any })}
                  className="w-full bg-light-glass dark:bg-dark-glass border border-light-border dark:border-dark-border rounded-lg px-3 py-2 text-light-text dark:text-dark-text focus:outline-none focus:border-lime-accent/50 transition-colors duration-300"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm text-light-text-secondary dark:text-dark-text-secondary mb-2">Description (Optional)</label>
                <input
                  type="text"
                  value={newGoal.description || ''}
                  onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
                  placeholder="Brief description of your goal..."
                  className="w-full bg-light-glass dark:bg-dark-glass border border-light-border dark:border-dark-border rounded-lg px-3 py-2 text-light-text dark:text-dark-text focus:outline-none focus:border-lime-accent/50 transition-colors duration-300"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 bg-light-glass dark:bg-dark-glass border border-light-border dark:border-dark-border rounded-lg text-light-text dark:text-dark-text hover:border-red-400/30 transition-all"
              >
                Cancel
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleAddGoal}
                disabled={!newGoal.name || !newGoal.targetAmount || !newGoal.targetDate}
                className="px-4 py-2 bg-lime-accent text-light-base dark:text-dark-base rounded-lg font-medium hover:shadow-glow transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add Goal
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Goals Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {sortedGoals.map((goal, index) => {
          const progress = calculateProgress(goal.currentAmount, goal.targetAmount);
          const daysRemaining = getDaysRemaining(goal.targetDate);
          const category = goalCategories[goal.category];
          const IconComponent = category.icon;
          
          return (
            <motion.div
              key={goal.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className={`bg-light-surface/50 dark:bg-dark-surface/50 backdrop-blur-sm border border-light-border dark:border-dark-border rounded-2xl p-6 shadow-glass transition-all ${
                goal.isCompleted ? 'opacity-75' : ''
              }`}
            >
              {/* Goal Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${
                    goal.isCompleted 
                      ? 'bg-lime-accent/20' 
                      : category.color === 'lime' ? 'bg-lime-accent/20' :
                        category.color === 'blue' ? 'bg-blue-500/20' :
                        category.color === 'purple' ? 'bg-purple-500/20' :
                        category.color === 'red' ? 'bg-red-500/20' : 'bg-orange-500/20'
                  }`}>
                    {goal.isCompleted ? (
                      <CheckCircle2 className="w-6 h-6 text-lime-accent" />
                    ) : (
                      <IconComponent className={`w-6 h-6 ${
                        category.color === 'lime' ? 'text-lime-accent' :
                        category.color === 'blue' ? 'text-blue-400' :
                        category.color === 'purple' ? 'text-purple-400' :
                        category.color === 'red' ? 'text-red-400' : 'text-orange-400'
                      }`} />
                    )}
                  </div>
                  <div>
                    <h3 className={`text-lg font-bold font-editorial ${
                      goal.isCompleted 
                        ? 'text-light-text-secondary dark:text-dark-text-secondary line-through' 
                        : 'text-light-text dark:text-dark-text'
                    }`}>
                      {goal.name}
                    </h3>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        category.color === 'lime' ? 'bg-lime-accent/20 text-lime-accent' :
                        category.color === 'blue' ? 'bg-blue-500/20 text-blue-400' :
                        category.color === 'purple' ? 'bg-purple-500/20 text-purple-400' :
                        category.color === 'red' ? 'bg-red-500/20 text-red-400' : 'bg-orange-500/20 text-orange-400'
                      }`}>
                        {category.label}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        goal.priority === 'high' ? 'bg-red-500/20 text-red-400' :
                        goal.priority === 'medium' ? 'bg-orange-500/20 text-orange-400' : 'bg-blue-500/20 text-blue-400'
                      }`}>
                        {goal.priority} priority
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setEditingGoal(goal)}
                    className="p-2 text-light-text-secondary dark:text-dark-text-secondary hover:text-lime-accent hover:bg-lime-accent/10 rounded-lg transition-colors"
                  >
                    <Edit3 className="w-4 h-4" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleDeleteGoal(goal.id)}
                    className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </motion.button>
                </div>
              </div>

              {/* Progress */}
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-light-text-secondary dark:text-dark-text-secondary">Progress</span>
                  <span className={`text-sm font-bold ${getProgressColor(progress)}`}>
                    {progress.toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-light-glass dark:bg-dark-glass rounded-full h-3">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 1, delay: index * 0.1 }}
                    className={`h-3 rounded-full ${
                      goal.isCompleted ? 'bg-lime-accent' :
                      progress >= 75 ? 'bg-blue-400' :
                      progress >= 50 ? 'bg-orange-400' : 'bg-red-400'
                    }`}
                  />
                </div>
              </div>

              {/* Amount Details */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <span className="text-xs text-light-text-secondary dark:text-dark-text-secondary block">Current</span>
                  <span className="text-lg font-bold text-lime-accent">
                    {goal.currentAmount.toLocaleString()} LEI
                  </span>
                </div>
                <div>
                  <span className="text-xs text-light-text-secondary dark:text-dark-text-secondary block">Target</span>
                  <span className="text-lg font-bold text-light-text dark:text-dark-text">
                    {goal.targetAmount.toLocaleString()} LEI
                  </span>
                </div>
              </div>

              {/* Time Remaining */}
              <div className="flex items-center justify-between text-sm mb-4">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-light-text-secondary dark:text-dark-text-secondary" />
                  <span className="text-light-text-secondary dark:text-dark-text-secondary">
                    Target: {new Date(goal.targetDate).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock className="w-4 h-4 text-light-text-secondary dark:text-dark-text-secondary" />
                  <span className={`font-medium ${
                    goal.isCompleted ? 'text-lime-accent' :
                    daysRemaining < 0 ? 'text-red-400' :
                    daysRemaining <= 30 ? 'text-orange-400' : 'text-light-text dark:text-dark-text'
                  }`}>
                    {goal.isCompleted ? 'Completed!' :
                     daysRemaining < 0 ? `${Math.abs(daysRemaining)} days overdue` :
                     daysRemaining === 0 ? 'Due today' :
                     `${daysRemaining} days left`}
                  </span>
                </div>
              </div>

              {/* Description */}
              {goal.description && (
                <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary mb-4">
                  {goal.description}
                </p>
              )}

              {/* Quick Update Progress */}
              {!goal.isCompleted && (
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    placeholder="Update amount..."
                    className="flex-1 bg-light-glass dark:bg-dark-glass border border-light-border dark:border-dark-border rounded-lg px-3 py-2 text-sm text-light-text dark:text-dark-text focus:outline-none focus:border-lime-accent/50 transition-colors duration-300"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        const input = e.target as HTMLInputElement;
                        const newAmount = parseFloat(input.value);
                        if (newAmount >= 0) {
                          handleUpdateProgress(goal.id, newAmount);
                          input.value = '';
                        }
                      }
                    }}
                  />
                  <span className="text-xs text-light-text-secondary dark:text-dark-text-secondary">
                    Press Enter to update
                  </span>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Goals Summary */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="bg-light-surface/50 dark:bg-dark-surface/50 backdrop-blur-sm border border-light-border dark:border-dark-border rounded-2xl p-6 shadow-glass"
      >
        <h3 className="text-xl font-bold text-light-text dark:text-dark-text font-editorial mb-4">Goals Summary</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-lime-accent mb-1">
              {goals.filter(g => g.isCompleted).length}
            </div>
            <div className="text-sm text-light-text-secondary dark:text-dark-text-secondary">Completed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-400 mb-1">
              {goals.filter(g => !g.isCompleted).length}
            </div>
            <div className="text-sm text-light-text-secondary dark:text-dark-text-secondary">In Progress</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-400 mb-1">
              {goals.reduce((sum, g) => sum + g.currentAmount, 0).toLocaleString()}
            </div>
            <div className="text-sm text-light-text-secondary dark:text-dark-text-secondary">Total Saved (LEI)</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-400 mb-1">
              {goals.reduce((sum, g) => sum + g.targetAmount, 0).toLocaleString()}
            </div>
            <div className="text-sm text-light-text-secondary dark:text-dark-text-secondary">Total Target (LEI)</div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};