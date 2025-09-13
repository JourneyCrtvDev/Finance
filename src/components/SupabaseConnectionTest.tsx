import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Database, CheckCircle2, AlertTriangle, RefreshCw } from 'lucide-react';
import { supabase, getCurrentUser } from '../lib/supabaseClient';

interface ConnectionTestResult {
  component: string;
  status: 'pass' | 'fail' | 'testing';
  message: string;
  details?: any;
}

export const SupabaseConnectionTest: React.FC = () => {
  const [results, setResults] = useState<ConnectionTestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    runConnectionTest();
  }, []);

  const runConnectionTest = async () => {
    setIsRunning(true);
    const testResults: ConnectionTestResult[] = [];

    // Test 1: Environment Variables
    testResults.push({
      component: 'Environment Variables',
      status: 'testing',
      message: 'Checking Supabase configuration...'
    });

    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      testResults[0] = {
        component: 'Environment Variables',
        status: 'fail',
        message: 'Missing Supabase credentials',
        details: { hasUrl: !!supabaseUrl, hasKey: !!supabaseKey }
      };
    } else {
      testResults[0] = {
        component: 'Environment Variables',
        status: 'pass',
        message: 'Supabase credentials found',
        details: { url: supabaseUrl.substring(0, 30) + '...', hasKey: true }
      };
    }

    setResults([...testResults]);

    // Test 2: Client Initialization
    testResults.push({
      component: 'Client Initialization',
      status: 'testing',
      message: 'Testing Supabase client...'
    });

    try {
      if (supabase && typeof supabase === 'object' && 'auth' in supabase) {
        testResults[1] = {
          component: 'Client Initialization',
          status: 'pass',
          message: 'Supabase client initialized successfully'
        };
      } else {
        testResults[1] = {
          component: 'Client Initialization',
          status: 'fail',
          message: 'Supabase client not properly initialized'
        };
      }
    } catch (error) {
      testResults[1] = {
        component: 'Client Initialization',
        status: 'fail',
        message: `Client initialization error: ${error}`
      };
    }

    setResults([...testResults]);

    // Test 3: Database Connection
    testResults.push({
      component: 'Database Connection',
      status: 'testing',
      message: 'Testing database connectivity...'
    });

    try {
      if (supabaseUrl && supabaseKey && supabase) {
        const { data, error } = await supabase.from('profiles').select('count').limit(1);
        
        if (error) {
          testResults[2] = {
            component: 'Database Connection',
            status: 'fail',
            message: `Database error: ${error.message}`,
            details: error
          };
        } else {
          testResults[2] = {
            component: 'Database Connection',
            status: 'pass',
            message: 'Database connection successful'
          };
        }
      } else {
        testResults[2] = {
          component: 'Database Connection',
          status: 'fail',
          message: 'Cannot test - missing credentials or client'
        };
      }
    } catch (error) {
      testResults[2] = {
        component: 'Database Connection',
        status: 'fail',
        message: `Connection test failed: ${error}`,
        details: error
      };
    }

    setResults([...testResults]);

    // Test 4: Authentication
    testResults.push({
      component: 'Authentication',
      status: 'testing',
      message: 'Testing authentication service...'
    });

    try {
      if (supabaseUrl && supabaseKey && supabase) {
        const { data: { session } } = await supabase.auth.getSession();
        const user = await getCurrentUser();
        
        testResults[3] = {
          component: 'Authentication',
          status: 'pass',
          message: user ? `Authenticated as user: ${user.email}` : 'Auth service working (no active session)',
          details: { hasSession: !!session, userId: user?.id }
        };
      } else {
        testResults[3] = {
          component: 'Authentication',
          status: 'fail',
          message: 'Cannot test - missing credentials'
        };
      }
    } catch (error) {
      testResults[3] = {
        component: 'Authentication',
        status: 'fail',
        message: `Auth test failed: ${error}`,
        details: error
      };
    }

    setResults([...testResults]);

    // Test 5: Budget Plans Table
    testResults.push({
      component: 'Budget Plans Table',
      status: 'testing',
      message: 'Testing budget_plans table access...'
    });

    try {
      if (supabaseUrl && supabaseKey && supabase) {
        const { data, error } = await supabase.from('budget_plans').select('count').limit(1);
        
        if (error) {
          testResults[4] = {
            component: 'Budget Plans Table',
            status: 'fail',
            message: `Table access error: ${error.message}`,
            details: error
          };
        } else {
          testResults[4] = {
            component: 'Budget Plans Table',
            status: 'pass',
            message: 'Budget plans table accessible'
          };
        }
      } else {
        testResults[4] = {
          component: 'Budget Plans Table',
          status: 'fail',
          message: 'Cannot test - missing credentials'
        };
      }
    } catch (error) {
      testResults[4] = {
        component: 'Budget Plans Table',
        status: 'fail',
        message: `Table test failed: ${error}`,
        details: error
      };
    }

    setResults([...testResults]);
    setIsRunning(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass':
        return <CheckCircle2 className="w-5 h-5 text-lime-accent" />;
      case 'fail':
        return <AlertTriangle className="w-5 h-5 text-red-400" />;
      case 'testing':
        return <div className="w-5 h-5 border-2 border-orange-400 border-t-transparent rounded-full animate-spin" />;
      default:
        return <Database className="w-5 h-5 text-light-text-secondary dark:text-dark-text-secondary" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pass':
        return 'border-lime-accent/20 bg-lime-accent/5';
      case 'fail':
        return 'border-red-500/20 bg-red-500/5';
      case 'testing':
        return 'border-orange-500/20 bg-orange-500/5';
      default:
        return 'border-light-border dark:border-dark-border bg-light-glass dark:bg-dark-glass';
    }
  };

  const passedCount = results.filter(r => r.status === 'pass').length;
  const failedCount = results.filter(r => r.status === 'fail').length;

  return (
    <div className="bg-light-surface/50 dark:bg-dark-surface/50 backdrop-blur-sm border border-light-border dark:border-dark-border rounded-2xl p-6 shadow-glass">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Database className="w-6 h-6 text-lime-accent" />
          <div>
            <h3 className="text-xl font-bold text-light-text dark:text-dark-text font-editorial">
              Supabase Connection Test
            </h3>
            <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
              Diagnosing database connection issues
            </p>
          </div>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={runConnectionTest}
          disabled={isRunning}
          className="flex items-center space-x-2 bg-lime-accent text-light-base dark:text-dark-base px-4 py-2 rounded-lg font-medium hover:shadow-glow transition-all disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isRunning ? 'animate-spin' : ''}`} />
          <span>Test Again</span>
        </motion.button>
      </div>

      {/* Overall Status */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center">
          <div className="text-2xl font-bold text-lime-accent mb-1">{passedCount}</div>
          <div className="text-sm text-light-text-secondary dark:text-dark-text-secondary">Passed</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-red-400 mb-1">{failedCount}</div>
          <div className="text-sm text-light-text-secondary dark:text-dark-text-secondary">Failed</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-light-text dark:text-dark-text mb-1">{results.length}</div>
          <div className="text-sm text-light-text-secondary dark:text-dark-text-secondary">Total Tests</div>
        </div>
      </div>

      {/* Test Results */}
      <div className="space-y-3">
        {results.map((result, index) => (
          <motion.div
            key={`${result.component}-${index}`}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className={`p-4 rounded-xl border ${getStatusColor(result.status)}`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {getStatusIcon(result.status)}
                <div>
                  <h4 className="font-semibold text-light-text dark:text-dark-text">
                    {result.component}
                  </h4>
                  <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                    {result.message}
                  </p>
                  {result.details && (
                    <pre className="text-xs text-light-text-secondary dark:text-dark-text-secondary mt-2 bg-light-glass dark:bg-dark-glass p-2 rounded overflow-x-auto">
                      {JSON.stringify(result.details, null, 2)}
                    </pre>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Recommendations */}
      {failedCount > 0 && (
        <div className="mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
          <h4 className="font-semibold text-red-400 mb-2">Connection Issues Detected</h4>
          <div className="space-y-2 text-sm text-light-text-secondary dark:text-dark-text-secondary">
            {!import.meta.env.VITE_SUPABASE_URL && (
              <p>• Missing VITE_SUPABASE_URL - Click "Connect to Supabase" to fix</p>
            )}
            {!import.meta.env.VITE_SUPABASE_ANON_KEY && (
              <p>• Missing VITE_SUPABASE_ANON_KEY - Click "Connect to Supabase" to fix</p>
            )}
            <p>• Try refreshing the page after connecting to Supabase</p>
            <p>• Make sure you have an active internet connection</p>
          </div>
        </div>
      )}

      {passedCount === results.length && results.length > 0 && (
        <div className="mt-6 p-4 bg-lime-accent/10 border border-lime-accent/20 rounded-xl">
          <h4 className="font-semibold text-lime-accent mb-2">✅ All Tests Passed!</h4>
          <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
            Your Supabase connection is working properly. You should be able to create budget plans now.
          </p>
        </div>
      )}
    </div>
  );
};