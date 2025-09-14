import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, RefreshCw } from 'lucide-react';
import { CurrencyConverter } from './CurrencyConverter';
import { SystemDashboard } from './SystemDashboard';
import { CurrencyService, ExchangeRate } from '../services/currencyService';

interface ExtendedExchangeRate extends ExchangeRate {
  change: number;
  changePercent: number;
  high: number;
  low: number;
  bankRate: number;
  spread: number;
}

export const ExchangeRates: React.FC = () => {
  const [exchangeRates, setExchangeRates] = React.useState<ExtendedExchangeRate[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = React.useState<Date | null>(null);

  React.useEffect(() => {
    loadExchangeRates();
  }, []);

  const loadExchangeRates = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const rates = await CurrencyService.getCurrentRates();
      
      // Transform the rates into the extended format with mock data for display
      const extendedRates: ExtendedExchangeRate[] = rates.map(rate => {
        // Generate realistic mock data for display purposes
        const mockChange = (Math.random() - 0.5) * 0.05; // Random change between -0.025 and +0.025
        const mockChangePercent = (mockChange / rate.rate) * 100;
        const mockHigh = rate.rate + Math.abs(mockChange) * 1.5;
        const mockLow = rate.rate - Math.abs(mockChange) * 1.5;
        const mockBankRate = rate.rate - 0.02; // Banks typically offer slightly worse rates
        const mockSpread = rate.rate - mockBankRate;
        
        return {
          ...rate,
          change: mockChange,
          changePercent: mockChangePercent,
          high: mockHigh,
          low: mockLow,
          bankRate: mockBankRate,
          spread: mockSpread
        };
      });
      
      setExchangeRates(extendedRates);
      setLastUpdate(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load exchange rates');
      console.error('Error loading exchange rates:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = () => {
    loadExchangeRates();
  };

  return (
    <div className="space-y-6 overflow-x-hidden max-w-full">
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 overflow-x-hidden">
        {isLoading ? (
          <div className="col-span-full flex items-center justify-center py-12">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="w-8 h-8 border-4 border-lime-accent border-t-transparent rounded-full"
            />
            <span className="ml-3 text-light-text-secondary dark:text-dark-text-secondary">
              Loading live rates...
            </span>
          </div>
        ) : error ? (
          <div className="col-span-full p-6 bg-red-500/10 border border-red-500/20 rounded-xl text-center">
            <p className="text-red-400 mb-4">{error}</p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleRefresh}
              className="bg-red-400 text-white px-4 py-2 rounded-lg hover:bg-red-500 transition-colors"
            >
              Try Again
            </motion.button>
          </div>
        ) : exchangeRates.map((rate, index) => (
          <motion.div
            key={`${rate.from}/${rate.to}`}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            whileHover={{ scale: 1.02 }}
            className="bg-light-surface/50 dark:bg-dark-surface/50 backdrop-blur-sm border border-light-border dark:border-dark-border rounded-xl p-6 hover:border-lime-accent/30 transition-all hover:shadow-glow duration-300"
          >
            {/* Pair Header */}
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold text-light-text dark:text-dark-text font-editorial">
                  {rate.from}/{rate.to}
                </h3>
                <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary">
                  Last update: {rate.lastUpdated.toLocaleTimeString()}
                </p>
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
                  className="text-3xl font-bold text-lime-accent font-editorial"
                >
                  {rate.rate.toFixed(4)}
                </motion.span>
                <span className={`text-sm ${rate.change >= 0 ? 'text-lime-accent' : 'text-red-400'}`}>
                  {rate.change > 0 ? '+' : ''}{rate.change.toFixed(4)}
                </span>
              </div>

              {/* High/Low */}
              <div className="grid grid-cols-2 gap-4 text-sm pt-3 border-t border-light-border dark:border-dark-border">
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
              <div className="pt-3 border-t border-light-border dark:border-dark-border">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-light-text-secondary dark:text-dark-text-secondary">Bank Rate:</span>
                  <span className="text-light-text dark:text-dark-text">{rate.bankRate.toFixed(4)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-light-text-secondary dark:text-dark-text-secondary">Our Advantage:</span>
                  <span className="text-lime-accent font-medium">+{rate.spread.toFixed(4)}</span>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-light-glass dark:bg-dark-glass rounded-full h-1 mt-2">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min((rate.rate - rate.low) / (rate.high - rate.low) * 100, 100)}%` }}
                    transition={{ duration: 1, delay: index * 0.1 + 0.4 }}
                    className="h-1 bg-lime-accent rounded-full"
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
    </div>
  );
};