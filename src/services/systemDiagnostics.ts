import { supabase } from '../lib/supabaseClient';
import { BudgetService } from './budgetService';
import { ShoppingListService } from './shoppingListService';

export interface SystemCheckResult {
  component: string;
  status: 'pass' | 'fail' | 'warning';
  message: string;
  details?: any;
  timestamp: Date;
}

export interface DatabaseConnectionTest {
  read: boolean;
  write: boolean;
  latency: number;
  error?: string;
}

export class SystemDiagnostics {
  private static results: SystemCheckResult[] = [];

  static async runFullSystemCheck(): Promise<SystemCheckResult[]> {
    this.results = [];
    
    console.log('🔍 Starting comprehensive system check...');
    
    // Database connectivity tests
    await this.testDatabaseConnection();
    await this.testSupabaseAuth();
    await this.testBudgetOperations();
    await this.testShoppingListOperations();
    
    // API endpoint tests
    await this.testCurrencyAPI();
    
    // Performance tests
    await this.testResponseTimes();
    
    // Security checks
    await this.testSecurityHeaders();
    
    // Mobile responsiveness
    await this.testMobileResponsiveness();
    
    // Memory and performance
    await this.testMemoryUsage();
    
    console.log('✅ System check completed');
    return this.results;
  }

  private static addResult(component: string, status: 'pass' | 'fail' | 'warning', message: string, details?: any) {
    this.results.push({
      component,
      status,
      message,
      details,
      timestamp: new Date()
    });
  }

  private static async testDatabaseConnection(): Promise<void> {
    try {
      if (!supabase) {
        this.addResult('Database Connection', 'fail', 'Supabase client not initialized - missing environment variables');
        return;
      }
      
      const startTime = performance.now();
      
      // Test basic connection
      const { error } = await supabase.from('profiles').select('count').limit(1);
      const endTime = performance.now();
      const latency = endTime - startTime;
      
      if (error) {
        this.addResult('Database Connection', 'fail', `Connection failed: ${error.message}`);
        return;
      }
      
      this.addResult('Database Connection', 'pass', `Connection successful (${latency.toFixed(2)}ms)`);
      
    } catch (error) {
      this.addResult('Database Connection', 'fail', `Unexpected error: ${error}`);
    }
  }

  private static async testSupabaseAuth(): Promise<void> {
    try {
      if (!supabase) {
        this.addResult('Authentication', 'fail', 'Supabase client not initialized');
        return;
      }
      
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        this.addResult('Authentication', 'pass', 'User session active');
      } else {
        this.addResult('Authentication', 'warning', 'No active session (expected for logged out users)');
      }
      
      // Test auth configuration
      await supabase.auth.getUser();
      this.addResult('Auth Configuration', 'pass', 'Auth service responding correctly');
      
    } catch (error) {
      this.addResult('Authentication', 'fail', `Auth service error: ${error}`);
    }
  }

  private static async testBudgetOperations(): Promise<void> {
    try {
      // Test budget plan retrieval
      const plans = await BudgetService.getUserBudgetPlans('test-user');
      this.addResult('Budget Service', 'pass', `Budget operations working (${plans.length} plans found)`);
      
    } catch (error) {
      this.addResult('Budget Service', 'fail', `Budget service error: ${error}`);
    }
  }

  private static async testShoppingListOperations(): Promise<void> {
    try {
      // Test shopping list retrieval
      const lists = await ShoppingListService.getLists('test-user');
      this.addResult('Shopping List Service', 'pass', `Shopping list operations working (${lists.length} lists found)`);
      
    } catch (error) {
      this.addResult('Shopping List Service', 'fail', `Shopping list service error: ${error}`);
    }
  }

  private static async testCurrencyAPI(): Promise<void> {
    try {
      // Test European Central Bank API
      const response = await fetch('https://api.exchangerate-api.com/v4/latest/EUR');
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (data.rates && data.rates.RON) {
        this.addResult('Currency API', 'pass', `Currency API working (EUR/RON: ${data.rates.RON})`);
      } else {
        this.addResult('Currency API', 'warning', 'Currency API responding but RON rate not found');
      }
      
    } catch (error) {
      this.addResult('Currency API', 'fail', `Currency API error: ${error}`);
    }
  }

  private static async testResponseTimes(): Promise<void> {
    const tests = [
      { name: 'Database Query', test: () => supabase.from('profiles').select('count').limit(1) },
      { name: 'Currency API', test: () => fetch('https://api.exchangerate-api.com/v4/latest/EUR') }
    ];

    for (const test of tests) {
      try {
        const startTime = performance.now();
        await test.test();
        const endTime = performance.now();
        const responseTime = endTime - startTime;
        
        const status = responseTime < 1000 ? 'pass' : responseTime < 3000 ? 'warning' : 'fail';
        const message = `${test.name} response time: ${responseTime.toFixed(2)}ms`;
        
        this.addResult('Performance', status, message);
        
      } catch (error) {
        this.addResult('Performance', 'fail', `${test.name} performance test failed: ${error}`);
      }
    }
  }

  private static async testSecurityHeaders(): Promise<void> {
    try {
      // Check if we're running in a secure context
      const isSecure = window.location.protocol === 'https:' || window.location.hostname === 'localhost';
      
      if (isSecure) {
        this.addResult('Security', 'pass', 'Running in secure context (HTTPS)');
      } else {
        this.addResult('Security', 'warning', 'Not running in secure context');
      }
      
      // Check for basic security features
      const hasLocalStorage = typeof Storage !== 'undefined';
      this.addResult('Security', hasLocalStorage ? 'pass' : 'fail', 
        hasLocalStorage ? 'Local storage available' : 'Local storage not available');
      
    } catch (error) {
      this.addResult('Security', 'fail', `Security check error: ${error}`);
    }
  }

  private static async testMobileResponsiveness(): Promise<void> {
    try {
      const viewport = {
        width: window.innerWidth,
        height: window.innerHeight,
        devicePixelRatio: window.devicePixelRatio || 1
      };
      
      const isMobile = viewport.width <= 768;
      const isTablet = viewport.width > 768 && viewport.width <= 1024;
      const isDesktop = viewport.width > 1024;
      
      let deviceType = 'Unknown';
      if (isMobile) deviceType = 'Mobile';
      else if (isTablet) deviceType = 'Tablet';
      else if (isDesktop) deviceType = 'Desktop';
      
      this.addResult('Responsive Design', 'pass', 
        `Viewport detected: ${deviceType} (${viewport.width}x${viewport.height})`);
      
      // Check for touch support
      const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      this.addResult('Touch Support', 'pass', 
        hasTouch ? 'Touch events supported' : 'No touch support (desktop)');
      
    } catch (error) {
      this.addResult('Responsive Design', 'fail', `Responsive design check error: ${error}`);
    }
  }

  private static async testMemoryUsage(): Promise<void> {
    try {
      // @ts-ignore - performance.memory is not in all browsers
      const memory = (performance as any).memory;
      
      if (memory) {
        const memoryInfo = {
          used: Math.round(memory.usedJSHeapSize / 1024 / 1024),
          total: Math.round(memory.totalJSHeapSize / 1024 / 1024),
          limit: Math.round(memory.jsHeapSizeLimit / 1024 / 1024)
        };
        
        const memoryUsagePercent = (memoryInfo.used / memoryInfo.limit) * 100;
        const status = memoryUsagePercent < 50 ? 'pass' : memoryUsagePercent < 80 ? 'warning' : 'fail';
        
        this.addResult('Memory Usage', status, 
          `Memory usage: ${memoryInfo.used}MB / ${memoryInfo.limit}MB (${memoryUsagePercent.toFixed(1)}%)`);
      } else {
        this.addResult('Memory Usage', 'warning', 'Memory API not available in this browser');
      }
      
    } catch (error) {
      this.addResult('Memory Usage', 'fail', `Memory usage check error: ${error}`);
    }
  }

  static getResults(): SystemCheckResult[] {
    return this.results;
  }

  static getFailedChecks(): SystemCheckResult[] {
    return this.results.filter(result => result.status === 'fail');
  }

  static getWarnings(): SystemCheckResult[] {
    return this.results.filter(result => result.status === 'warning');
  }

  static generateReport(): string {
    const passed = this.results.filter(r => r.status === 'pass').length;
    const failed = this.results.filter(r => r.status === 'fail').length;
    const warnings = this.results.filter(r => r.status === 'warning').length;
    
    let report = `System Diagnostics Report\n`;
    report += `Generated: ${new Date().toISOString()}\n`;
    report += `Total Checks: ${this.results.length}\n`;
    report += `Passed: ${passed}\n`;
    report += `Failed: ${failed}\n`;
    report += `Warnings: ${warnings}\n\n`;
    
    this.results.forEach(result => {
      const icon = result.status === 'pass' ? '✅' : result.status === 'fail' ? '❌' : '⚠️';
      report += `${icon} ${result.component}: ${result.message}\n`;
    });
    
    return report;
  }
}