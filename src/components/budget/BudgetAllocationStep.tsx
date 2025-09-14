import React from 'react';
import { motion } from 'framer-motion';
import { PiggyBank, Shield, TrendingUp, Zap, Target } from 'lucide-react';
import { AllocationTarget } from '../../types/budget';

// Romanian Lei currency symbol component
const LeiIcon: React.FC<{ className?: string }> = ({ className = "w-4 h-4" }) => (
  <span className={`font-bold ${className.replace('w-4 h-4', 'text-xs')}`}>RON</span>
);

interface BudgetAllocationStepProps {
  allocationTargets: AllocationTarget[];
  setAllocationTargets: (targets: AllocationTarget[]) => void;
  leftoverAmount: number;
}

export const BudgetAllocationStep: React.FC<BudgetAllocationStepProps> = ({
  allocationTargets,
  setAllocationTargets,
  leftoverAmount
}) => {
  const updateAllocationTarget = (id: string, field: keyof AllocationTarget, value: any) => {
    setAllocationTargets(targets => 
      targets.map(target => 
        target.id === id ? { ...target, [field]: value } : target
      )
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-6"
    >
      <div>
        <h3 className="text-xl md:text-2xl font-bold text-light-text dark:text-dark-text font-editorial mb-2">Allocation Targets</h3>
        <p className="text-light-text-secondary dark:text-dark-text-secondary mb-6 text-sm md:text-base">Set how you want to allocate your leftover money</p>

        <div className="grid grid-cols-1 gap-4 md:gap-6">
          {allocationTargets.map((target, index) => {
            const icon = target.id === 'savings' ? PiggyBank :
                        target.id === 'emergency' ? Shield :
                        target.id === 'investments' ? TrendingUp : Zap;
            const IconComponent = icon;
            
            return (
              <motion.div
                key={target.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-light-surface/50 dark:bg-dark-surface/50 border border-light-border dark:border-dark-border rounded-xl p-6"
              >
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-2 bg-lime-accent/20 rounded-lg flex-shrink-0">
                    <IconComponent className="w-5 h-5 text-lime-accent" />
                  </div>
                  <h4 className="text-base md:text-lg font-semibold text-light-text dark:text-dark-text">{target.name}</h4>
                </div>

                <div className="space-y-5">
                  <div>
                    <label className="block text-sm text-light-text-secondary dark:text-dark-text-secondary mb-2">Allocation Type</label>
                    <select
                      value={target.type}
                      onChange={(e) => updateAllocationTarget(target.id, 'type', e.target.value)}
                      className="w-full bg-light-glass dark:bg-dark-glass border border-light-border dark:border-dark-border rounded-lg px-3 py-2 text-light-text dark:text-dark-text focus:outline-none focus:border-lime-accent/50 transition-colors duration-300"
                    >
                      <option value="percentage">Percentage</option>
                      <option value="fixed">Fixed Amount</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm text-light-text-secondary dark:text-dark-text-secondary mb-2">
                      {target.type === 'percentage' ? 'Percentage (%)' : 'Amount (LEI)'}
                    </label>
                    <div className="relative">
                      {target.type === 'percentage' ? (
                        <Target className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-light-text-secondary dark:text-dark-text-secondary" />
                      ) : (
                        <LeiIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-light-text-secondary dark:text-dark-text-secondary" />
                      )}
                      <input
                        type="number"
                        value={target.value || ''}
                        onChange={(e) => updateAllocationTarget(target.id, 'value', parseFloat(e.target.value) || 0)}
                        className="w-full bg-light-glass dark:bg-dark-glass border border-light-border dark:border-dark-border rounded-lg pl-10 pr-3 py-2 text-light-text dark:text-dark-text focus:outline-none focus:border-lime-accent/50 transition-colors duration-300"
                      />
                    </div>
                  </div>

                  <div className="p-3 bg-lime-accent/10 rounded-lg">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                      <span className="text-sm text-light-text-secondary dark:text-dark-text-secondary">Allocated Amount:</span>
                      <span className="font-bold text-lime-accent text-lg">
                      {target.type === 'percentage' 
                        ? ((leftoverAmount * target.value) / 100).toLocaleString() + ' LEI'
                        : target.value.toLocaleString() + ' LEI'
                      }
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        <div className="mt-6 p-6 bg-gradient-to-r from-light-surface/80 to-light-glass dark:from-dark-surface/80 dark:to-dark-glass border border-light-border dark:border-dark-border rounded-xl">
          <h4 className="text-base md:text-lg font-semibold text-light-text dark:text-dark-text mb-4">Allocation Summary</h4>
          <div className="space-y-2">
            {allocationTargets.map((target) => {
              const amount = target.type === 'percentage' 
                ? (leftoverAmount * target.value) / 100 
                : target.value;
              return (
                <div key={target.id} className="flex justify-between">
                  <span className="text-light-text-secondary dark:text-dark-text-secondary text-sm md:text-base">{target.name}:</span>
                  <span className="font-medium text-light-text dark:text-dark-text text-sm md:text-base">{amount.toLocaleString()} LEI</span>
                </div>
              );
            })}
            <div className="border-t border-light-border dark:border-dark-border pt-2 mt-2">
              <div className="flex justify-between font-bold">
                <span className="text-light-text dark:text-dark-text text-sm md:text-base">Total Allocated:</span>
                <span className="text-lime-accent text-sm md:text-base">
                  {allocationTargets.reduce((sum, target) => {
                    const amount = target.type === 'percentage' 
                      ? (leftoverAmount * target.value) / 100 
                      : target.value;
                    return sum + amount;
                  }, 0).toLocaleString()} LEI
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};