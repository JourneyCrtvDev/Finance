import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, RefreshCw } from 'lucide-react';
import { CurrencyConverter } from './CurrencyConverter';
import { SystemDashboard } from './SystemDashboard';

// Displays live currency exchange rates with bank comparisons and a quick exchange calculator
const exchangeRates = [
  { 
    pair: 'EUR/RON', 
    rate: 4.9756, 
    change: +0.0123, 
    changePercent: +0.25,
    high: 4.9780,
    low: 4.9650,
    bankRate: 4.9500,
    spread: 0.0256
  },
  { 
    pair: 'USD/RON', 
    rate: 4.5634, 
    change: -0.0218, 
    changePercent: -0.48,
    high: 4.5851,
    low: 4.5518,
    bankRate: 4.5400,
    spread: 0.0234
  },
  { 
    pair: 'GBP/RON', 
    rate: 5.7892, 
    change: +0.0345, 
    changePercent: +0.60,
    high: 5.7995,
    low: 5.7721,
    bankRate: 5.7650,
    spread: 0.0242
  },
  { 
    pair: 'CHF/RON', 
    rate: 5.1234, 
    change: +0.0156, 
    changePercent: +0.31,
    high: 5.1289,
    low: 5.1078,
    bankRate: 5.1000,
    spread: 0.0234
  },
];

export const ExchangeRates: React.FC = () => {
  const [lastUpdate, setLastUpdate] = React.useState(new Date());

  const handleRefresh = () => {
    setLastUpdate(new Date());
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center justify-between"
      >
        <div>
          <h2 className="text-3xl font-bold text-light-text dark:text-dark-text font-editorial">Live Exchange Rates</h2>
          <p className="text-light-text-secondary dark:text-dark-text-secondary mt-1">Real-time rates vs major banks</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05, rotate: 180 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleRefresh}
          className="p-3 bg-light-glass dark:bg-dark-glass rounded-full hover:bg-lime-accent/10 transition-colors duration-300"
        >
          <RefreshCw className="w-5 h-5 text-light-text dark:text-dark-text" />
        </motion.button>
      </motion.div>

      {/* Rates Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {exchangeRates.map((rate, index) => (
          <motion.div
            key={rate.pair}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            whileHover={{ scale: 1.02 }}
            className="bg-light-surface/50 dark:bg-dark-surface/50 backdrop-blur-sm border border-light-border dark:border-dark-border rounded-xl p-4 md:p-6 hover:border-lime-accent/30 transition-all hover:shadow-glow duration-300"
          >
            {/* Pair Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 space-y-2 sm:space-y-0">
              <div>
                <h3 className="text-lg md:text-xl font-bold text-light-text dark:text-dark-text font-editorial">{rate.pair}</h3>
                <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary">Last update: {lastUpdate.toLocaleTimeString()}</p>
              </div>
              <div className={`flex items-center space-x-1 ${rate.change >= 0 ? 'text-lime-accent' : 'text-red-400'}`}>
                {rate.change >= 0 ? (
                  <TrendingUp className="w-5 h-5" />
                ) : (
                  <TrendingDown className="w-5 h-5" />
                )}
                <span className="font-medium">{rate.changePercent > 0 ? '+' : ''}{rate.changePercent}%</span>
              </div>
            </div>

            {/* Rate Display */}
            <div className="space-y-3">
              <div className="flex items-baseline space-x-2">
                <motion.span
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.5, delay: index * 0.1 + 0.2 }}
                  className="text-2xl md:text-3xl font-bold text-lime-accent font-editorial"
                >
                  {rate.rate.toFixed(4)}
                </motion.span>
                <span className={`text-sm ${rate.change >= 0 ? 'text-lime-accent' : 'text-red-400'}`}>
                  {rate.change > 0 ? '+' : ''}{rate.change.toFixed(4)}
                </span>
              </div>

              {/* High/Low */}
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-light-text-secondary dark:text-dark-text-secondary">High: </span>
                  <span className="text-light-text dark:text-dark-text font-medium">{rate.high.toFixed(4)}</span>
                </div>
                <div>
                  <span className="text-light-text-secondary dark:text-dark-text-secondary">Low: </span>
                  <span className="text-light-text dark:text-dark-text font-medium">{rate.low.toFixed(4)}</span>
                </div>
              </div>

              {/* Bank Comparison */}
              <div className="pt-3 border-t border-dark-border">
                <div className="pt-3 border-t border-light-border dark:border-dark-border">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-light-text-secondary dark:text-dark-text-secondary">Bank Rate:</span>
                    <span className="text-light-text dark:text-dark-text">{rate.bankRate.toFixed(4)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-light-text-secondary dark:text-dark-text-secondary">Our Advantage:</span>
                    <span className="text-lime-accent font-medium">+{rate.spread.toFixed(4)}</span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-light-glass dark:bg-dark-glass rounded-full h-1">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min((rate.rate - rate.low) / (rate.high - rate.low) * 100, 100)}%` }}
                    transition={{ duration: 1, delay: index * 0.1 + 0.4 }}
                    className="h-1 bg-lime-accent rounded-full opacity-70"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Currency Converter */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <CurrencyConverter />
      </motion.div>
      {/* System Diagnostics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        <SystemDashboard />
      </motion.div>
    </div>
  );
};