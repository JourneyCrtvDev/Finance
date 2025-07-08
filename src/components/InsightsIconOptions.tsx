import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Brain,
  BarChart3,
  TrendingUp,
  PieChart,
  Activity,
  Target,
  Zap,
  Eye,
  Lightbulb,
  Search,
  Compass,
  Telescope,
  Radar,
  Gauge,
  LineChart
} from 'lucide-react';

// This component shows different icon options for the Insights section
export const InsightsIconOptions: React.FC = () => {
  const [selectedIcon, setSelectedIcon] = useState('Brain');

  const iconOptions = [
    { name: 'Brain', icon: Brain, description: 'Smart insights and AI-powered analysis' },
    { name: 'BarChart3', icon: BarChart3, description: 'Traditional bar chart analytics' },
    { name: 'TrendingUp', icon: TrendingUp, description: 'Growth and trend analysis' },
    { name: 'PieChart', icon: PieChart, description: 'Distribution and breakdown analysis' },
    { name: 'Activity', icon: Activity, description: 'Activity monitoring and pulse' },
    { name: 'Target', icon: Target, description: 'Goal tracking and targets' },
    { name: 'Zap', icon: Zap, description: 'Quick insights and instant analysis' },
    { name: 'Eye', icon: Eye, description: 'Visibility and observation' },
    { name: 'Lightbulb', icon: Lightbulb, description: 'Ideas and recommendations' },
    { name: 'Search', icon: Search, description: 'Discovery and exploration' },
    { name: 'Compass', icon: Compass, description: 'Navigation and direction' },
    { name: 'Telescope', icon: Telescope, description: 'Future planning and foresight' },
    { name: 'Radar', icon: Radar, description: 'Detection and monitoring' },
    { name: 'Gauge', icon: Gauge, description: 'Performance measurement' },
    { name: 'LineChart', icon: LineChart, description: 'Time series and trends' }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-light-text dark:text-dark-text font-editorial mb-2">
          Choose Your Insights Icon
        </h2>
        <p className="text-light-text-secondary dark:text-dark-text-secondary">
          Select the icon that best represents your insights section
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {iconOptions.map((option) => (
          <motion.button
            key={option.name}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setSelectedIcon(option.name)}
            className={`p-6 rounded-xl border-2 transition-all text-center ${
              selectedIcon === option.name
                ? 'border-lime-accent bg-lime-accent/10'
                : 'border-light-border dark:border-dark-border bg-light-glass dark:bg-dark-glass hover:border-lime-accent/30'
            }`}
          >
            <option.icon className={`w-8 h-8 mx-auto mb-3 ${
              selectedIcon === option.name ? 'text-lime-accent' : 'text-light-text dark:text-dark-text'
            }`} />
            <h3 className={`font-semibold mb-2 ${
              selectedIcon === option.name ? 'text-lime-accent' : 'text-light-text dark:text-dark-text'
            }`}>
              {option.name}
            </h3>
            <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary">
              {option.description}
            </p>
          </motion.button>
        ))}
      </div>

      <div className="bg-light-surface/50 dark:bg-dark-surface/50 backdrop-blur-sm border border-light-border dark:border-dark-border rounded-2xl p-6">
        <h3 className="text-lg font-bold text-light-text dark:text-dark-text mb-4">
          Preview: {selectedIcon}
        </h3>
        <div className="flex items-center space-x-3 p-4 bg-light-glass dark:bg-dark-glass rounded-xl">
          {React.createElement(iconOptions.find(opt => opt.name === selectedIcon)?.icon || Brain, {
            className: "w-6 h-6 text-lime-accent"
          })}
          <span className="text-light-text dark:text-dark-text font-medium">Insights</span>
        </div>
        <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary mt-3">
          {iconOptions.find(opt => opt.name === selectedIcon)?.description}
        </p>
      </div>
    </div>
  );
};