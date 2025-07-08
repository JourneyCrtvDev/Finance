import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Database, 
  Globe, 
  Monitor, 
  RefreshCw,
  Download,
  Shield,
  Zap,
  TrendingUp
} from 'lucide-react';
import { SystemDiagnostics, SystemCheckResult } from '../services/systemDiagnostics';

export const SystemDashboard: React.FC = () => {
  const [results, setResults] = useState<SystemCheckResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [lastCheck, setLastCheck] = useState<Date | null>(null);
  const [showDetails, setShowDetails] = useState<string | null>(null);

  useEffect(() => {
    runSystemCheck();
  }, []);

  const runSystemCheck = async () => {
    setIsRunning(true);
    try {
      const checkResults = await SystemDiagnostics.runFullSystemCheck();
      setResults(checkResults);
      setLastCheck(new Date());
    } catch (error) {
      console.error('System check failed:', error);
    } finally {
      setIsRunning(false);
    }
  };

  const downloadReport = () => {
    const report = SystemDiagnostics.generateReport();
    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `system-report-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass':
        return <CheckCircle2 className="w-5 h-5 text-lime-accent" />;
      case 'fail':
        return <AlertTriangle className="w-5 h-5 text-red-400" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-orange-400" />;
      default:
        return <Clock className="w-5 h-5 text-light-text-secondary dark:text-dark-text-secondary" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pass':
        return 'border-lime-accent/20 bg-lime-accent/5';
      case 'fail':
        return 'border-red-500/20 bg-red-500/5';
      case 'warning':
        return 'border-orange-500/20 bg-orange-500/5';
      default:
        return 'border-light-border dark:border-dark-border bg-light-glass dark:bg-dark-glass';
    }
  };

  const getCategoryIcon = (component: string) => {
    if (component.toLowerCase().includes('database')) return Database;
    if (component.toLowerCase().includes('auth')) return Shield;
    if (component.toLowerCase().includes('api') || component.toLowerCase().includes('currency')) return Globe;
    if (component.toLowerCase().includes('performance')) return Zap;
    if (component.toLowerCase().includes('security')) return Shield;
    if (component.toLowerCase().includes('responsive')) return Monitor;
    return Activity;
  };

  const passedCount = results.filter(r => r.status === 'pass').length;
  const failedCount = results.filter(r => r.status === 'fail').length;
  const warningCount = results.filter(r => r.status === 'warning').length;
  const totalCount = results.length;

  const overallHealth = totalCount > 0 ? (passedCount / totalCount) * 100 : 0;

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
              <Activity className="w-6 h-6 text-lime-accent" />
            </div>
            <h2 className="text-3xl font-bold text-light-text dark:text-dark-text font-editorial">
              System Diagnostics
            </h2>
          </div>
          <p className="text-light-text-secondary dark:text-dark-text-secondary">
            Comprehensive health check and performance monitoring
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={downloadReport}
            disabled={results.length === 0}
            className="flex items-center space-x-2 px-4 py-2 bg-light-glass dark:bg-dark-glass border border-light-border dark:border-dark-border rounded-lg text-light-text dark:text-dark-text hover:border-lime-accent/30 transition-all disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>Export Report</span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05, rotate: 180 }}
            whileTap={{ scale: 0.95 }}
            onClick={runSystemCheck}
            disabled={isRunning}
            className="flex items-center space-x-2 bg-lime-accent text-light-base dark:text-dark-base px-4 py-2 rounded-lg font-medium hover:shadow-glow transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isRunning ? 'animate-spin' : ''}`} />
            <span>{isRunning ? 'Running...' : 'Run Check'}</span>
          </motion.button>
        </div>
      </motion.div>

      {/* Overall Health */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="bg-light-surface/50 dark:bg-dark-surface/50 backdrop-blur-sm border border-light-border dark:border-dark-border rounded-2xl p-6 shadow-glass"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-light-text dark:text-dark-text font-editorial">
            System Health Overview
          </h3>
          {lastCheck && (
            <div className="flex items-center space-x-2 text-sm text-light-text-secondary dark:text-dark-text-secondary">
              <Clock className="w-4 h-4" />
              <span>Last check: {lastCheck.toLocaleTimeString()}</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-lime-accent mb-1">{overallHealth.toFixed(1)}%</div>
            <div className="text-sm text-light-text-secondary dark:text-dark-text-secondary">Overall Health</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-lime-accent mb-1">{passedCount}</div>
            <div className="text-sm text-light-text-secondary dark:text-dark-text-secondary">Passed</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-orange-400 mb-1">{warningCount}</div>
            <div className="text-sm text-light-text-secondary dark:text-dark-text-secondary">Warnings</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-red-400 mb-1">{failedCount}</div>
            <div className="text-sm text-light-text-secondary dark:text-dark-text-secondary">Failed</div>
          </div>
        </div>

        {/* Health Bar */}
        <div className="w-full bg-light-glass dark:bg-dark-glass rounded-full h-3 mb-2">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${overallHealth}%` }}
            transition={{ duration: 1, delay: 0.5 }}
            className={`h-3 rounded-full ${
              overallHealth >= 80 ? 'bg-lime-accent' : 
              overallHealth >= 60 ? 'bg-orange-400' : 'bg-red-400'
            }`}
          />
        </div>
        <div className="text-center text-sm text-light-text-secondary dark:text-dark-text-secondary">
          {overallHealth >= 80 ? 'Excellent' : 
           overallHealth >= 60 ? 'Good' : 
           overallHealth >= 40 ? 'Fair' : 'Poor'} system health
        </div>
      </motion.div>

      {/* Detailed Results */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="bg-light-surface/50 dark:bg-dark-surface/50 backdrop-blur-sm border border-light-border dark:border-dark-border rounded-2xl p-6 shadow-glass"
      >
        <h3 className="text-xl font-bold text-light-text dark:text-dark-text font-editorial mb-6">
          Detailed Check Results
        </h3>

        {isRunning ? (
          <div className="text-center py-12">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="w-12 h-12 border-4 border-lime-accent border-t-transparent rounded-full mx-auto mb-4"
            />
            <p className="text-light-text-secondary dark:text-dark-text-secondary">
              Running comprehensive system diagnostics...
            </p>
          </div>
        ) : results.length === 0 ? (
          <div className="text-center py-12">
            <Activity className="w-16 h-16 text-light-text-secondary dark:text-dark-text-secondary mx-auto mb-4 opacity-50" />
            <p className="text-light-text-secondary dark:text-dark-text-secondary">
              No diagnostics data available. Run a system check to get started.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {results.map((result, index) => {
              const IconComponent = getCategoryIcon(result.component);
              return (
                <motion.div
                  key={`${result.component}-${index}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${getStatusColor(result.status)}`}
                  onClick={() => setShowDetails(showDetails === result.component ? null : result.component)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <IconComponent className="w-5 h-5 text-light-text-secondary dark:text-dark-text-secondary" />
                      <div>
                        <h4 className="font-semibold text-light-text dark:text-dark-text">
                          {result.component}
                        </h4>
                        <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                          {result.message}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-light-text-secondary dark:text-dark-text-secondary">
                        {result.timestamp.toLocaleTimeString()}
                      </span>
                      {getStatusIcon(result.status)}
                    </div>
                  </div>

                  {/* Expandable Details */}
                  <AnimatePresence>
                    {showDetails === result.component && result.details && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-4 pt-4 border-t border-light-border dark:border-dark-border"
                      >
                        <pre className="text-xs bg-light-glass dark:bg-dark-glass p-3 rounded-lg overflow-x-auto text-light-text dark:text-dark-text">
                          {JSON.stringify(result.details, null, 2)}
                        </pre>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.div>

      {/* Quick Actions */}
      {failedCount > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6"
        >
          <div className="flex items-center space-x-3 mb-4">
            <AlertTriangle className="w-6 h-6 text-red-400" />
            <h3 className="text-xl font-bold text-red-400 font-editorial">
              Issues Detected
            </h3>
          </div>
          <p className="text-light-text-secondary dark:text-dark-text-secondary mb-4">
            {failedCount} critical issue{failedCount !== 1 ? 's' : ''} found that require attention.
          </p>
          <div className="space-y-2">
            {results.filter(r => r.status === 'fail').map((result, index) => (
              <div key={index} className="flex items-center space-x-2 text-sm">
                <AlertTriangle className="w-4 h-4 text-red-400" />
                <span className="text-light-text dark:text-dark-text">
                  <strong>{result.component}:</strong> {result.message}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};