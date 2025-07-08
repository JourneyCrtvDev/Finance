import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeftRight, 
  TrendingUp, 
  RefreshCw, 
  AlertCircle, 
  CheckCircle2,
  Clock,
  Calculator
} from 'lucide-react';
import { CurrencyService, CurrencyConversion } from '../services/currencyService';

export const CurrencyConverter: React.FC = () => {
  const [amount, setAmount] = useState<string>('100');
  const [fromCurrency, setFromCurrency] = useState<'EUR' | 'RON'>('EUR');
  const [toCurrency, setToCurrency] = useState<'EUR' | 'RON'>('RON');
  const [conversion, setConversion] = useState<CurrencyConversion | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [currentRate, setCurrentRate] = useState<number | null>(null);

  const currencies = [
    { code: 'EUR', name: 'Euro', symbol: '€' },
    { code: 'RON', name: 'Romanian Leu', symbol: 'RON' }
  ];

  useEffect(() => {
    if (amount && parseFloat(amount) > 0) {
      handleConvert();
    }
  }, [amount, fromCurrency, toCurrency]);

  const handleConvert = async () => {
    const numAmount = parseFloat(amount);
    
    if (!amount || numAmount <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await CurrencyService.convertCurrency(
        numAmount,
        fromCurrency,
        toCurrency
      );
      
      setConversion(result);
      setCurrentRate(result.rate);
      setLastUpdated(result.timestamp);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Conversion failed');
      setConversion(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSwapCurrencies = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
  };

  const handleRefresh = () => {
    CurrencyService.clearCache();
    handleConvert();
  };

  const formatAmount = (value: number, currency: string) => {
    return CurrencyService.formatCurrency(value, currency);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-light-surface/50 dark:bg-dark-surface/50 backdrop-blur-sm border border-light-border dark:border-dark-border rounded-2xl p-6 shadow-glass"
    >
      {/* Header */}
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-2 bg-lime-accent/20 rounded-lg">
          <Calculator className="w-6 h-6 text-lime-accent" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-light-text dark:text-dark-text font-editorial">
            Currency Converter
          </h3>
          <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
            Convert between EUR and RON with live rates
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05, rotate: 180 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleRefresh}
          disabled={isLoading}
          className="ml-auto p-2 bg-light-glass dark:bg-dark-glass rounded-full hover:bg-lime-accent/10 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-5 h-5 text-light-text dark:text-dark-text ${isLoading ? 'animate-spin' : ''}`} />
        </motion.button>
      </div>

      {/* Converter Interface */}
      <div className="space-y-4">
        {/* From Currency */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary">
            From
          </label>
          <div className="flex space-x-3">
            <select
              value={fromCurrency}
              onChange={(e) => setFromCurrency(e.target.value as 'EUR' | 'RON')}
              className="bg-light-glass dark:bg-dark-glass border border-light-border dark:border-dark-border rounded-lg px-3 py-2 text-light-text dark:text-dark-text focus:outline-none focus:border-lime-accent/50 transition-colors duration-300"
            >
              {currencies.map(currency => (
                <option key={currency.code} value={currency.code}>
                  {currency.code} - {currency.name}
                </option>
              ))}
            </select>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
              min="0"
              step="0.01"
              className="flex-1 bg-light-glass dark:bg-dark-glass border border-light-border dark:border-dark-border rounded-lg px-3 py-2 text-light-text dark:text-dark-text focus:outline-none focus:border-lime-accent/50 transition-colors duration-300"
            />
          </div>
        </div>

        {/* Swap Button */}
        <div className="flex justify-center">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleSwapCurrencies}
            className="p-3 bg-lime-accent/10 border border-lime-accent/20 rounded-full hover:bg-lime-accent/20 transition-colors"
          >
            <ArrowLeftRight className="w-5 h-5 text-lime-accent" />
          </motion.button>
        </div>

        {/* To Currency */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary">
            To
          </label>
          <div className="flex space-x-3">
            <select
              value={toCurrency}
              onChange={(e) => setToCurrency(e.target.value as 'EUR' | 'RON')}
              className="bg-light-glass dark:bg-dark-glass border border-light-border dark:border-dark-border rounded-lg px-3 py-2 text-light-text dark:text-dark-text focus:outline-none focus:border-lime-accent/50 transition-colors duration-300"
            >
              {currencies.map(currency => (
                <option key={currency.code} value={currency.code}>
                  {currency.code} - {currency.name}
                </option>
              ))}
            </select>
            <div className="flex-1 bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-lg px-3 py-2 text-light-text dark:text-dark-text">
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-lime-accent border-t-transparent rounded-full animate-spin" />
                  <span className="text-light-text-secondary dark:text-dark-text-secondary">Converting...</span>
                </div>
              ) : conversion ? (
                <span className="font-bold text-lime-accent">
                  {formatAmount(conversion.convertedAmount, conversion.toCurrency)}
                </span>
              ) : (
                <span className="text-light-text-secondary dark:text-dark-text-secondary">
                  Enter amount to convert
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Error Display */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center space-x-2"
          >
            <AlertCircle className="w-4 h-4 text-red-400" />
            <span className="text-red-400 text-sm">{error}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Conversion Details */}
      <AnimatePresence>
        {conversion && !error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="mt-6 p-4 bg-lime-accent/5 border border-lime-accent/20 rounded-lg"
          >
            <div className="flex items-center space-x-2 mb-3">
              <CheckCircle2 className="w-4 h-4 text-lime-accent" />
              <span className="text-sm font-medium text-lime-accent">Conversion Details</span>
            </div>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-light-text-secondary dark:text-dark-text-secondary">Exchange Rate:</span>
                <span className="font-medium text-light-text dark:text-dark-text">
                  1 {conversion.fromCurrency} = {conversion.rate.toFixed(4)} {conversion.toCurrency}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-light-text-secondary dark:text-dark-text-secondary">Amount:</span>
                <span className="font-medium text-light-text dark:text-dark-text">
                  {formatAmount(conversion.amount, conversion.fromCurrency)}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-light-text-secondary dark:text-dark-text-secondary">Converted:</span>
                <span className="font-bold text-lime-accent">
                  {formatAmount(conversion.convertedAmount, conversion.toCurrency)}
                </span>
              </div>
              
              {lastUpdated && (
                <div className="flex items-center justify-between pt-2 border-t border-light-border dark:border-dark-border">
                  <div className="flex items-center space-x-1">
                    <Clock className="w-3 h-3 text-light-text-secondary dark:text-dark-text-secondary" />
                    <span className="text-xs text-light-text-secondary dark:text-dark-text-secondary">
                      Last updated: {lastUpdated.toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <TrendingUp className="w-3 h-3 text-lime-accent" />
                    <span className="text-xs text-lime-accent">Live Rate</span>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quick Conversion Buttons */}
      <div className="mt-4 grid grid-cols-3 gap-2">
        {['100', '500', '1000'].map((quickAmount) => (
          <motion.button
            key={quickAmount}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setAmount(quickAmount)}
            className="p-2 bg-light-glass dark:bg-dark-glass border border-light-border dark:border-dark-border rounded-lg text-sm text-light-text dark:text-dark-text hover:border-lime-accent/30 transition-all"
          >
            {quickAmount}
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
};