import React, { useState } from 'react';
import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings as SettingsIcon } from 'lucide-react';
import { ThemeProvider } from './contexts/ThemeContext';
import { Sidebar } from './components/Sidebar';
import { TopBar } from './components/TopBar';
import { ExchangeRates } from './components/ExchangeRates';
import { BudgetSetupForm } from './components/BudgetSetupForm';
import { MobileBottomNav } from './components/MobileBottomNav';
import { Dashboard } from './components/Dashboard';
import { PaymentTracker } from './components/PaymentTracker';
import { Settings } from './components/Settings';
import { Insights } from './components/Insights';
import { AuthForm } from './components/AuthForm';
import { getCurrentUser } from './lib/supabaseClient';
import ShoppingListComponent from './components/ShoppingList';
import { PWAInstallPrompt } from './components/PWAInstallPrompt';
import { NativeFeatures } from './components/NativeFeatures';
import { useCapacitor } from './hooks/useCapacitor';

function App() {
  const [activeSection, setActiveSection] = useState('budget');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [editingBudgetPlan, setEditingBudgetPlan] = useState<any>(null);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const user = await getCurrentUser();
      setIsAuthenticated(!!user);
      setCurrentUserId(user?.id || null);
    } catch (error) {
      console.error('Error checking auth status:', error);
      setIsAuthenticated(false);
      setCurrentUserId(null);
    } finally {
      setIsCheckingAuth(false);
    }
  };

  const handleAuthSuccess = () => {
    setIsAuthenticated(true);
    setActiveSection('dashboard'); // Navigate to dashboard after login
    // Re-check auth to get the user ID
    checkAuthStatus();
  };

  const handleSignOut = () => {
    setIsAuthenticated(false);
    setCurrentUserId(null);
    setActiveSection('budget');
  };

  const handleEditBudget = (plan: any) => {
    setEditingBudgetPlan(plan);
    setActiveSection('budget');
  };

  // Show loading screen while checking authentication
  if (isCheckingAuth) {
    return (
      <ThemeProvider>
        <div className="min-h-screen bg-light-base dark:bg-dark-base flex items-center justify-center overflow-hidden">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center"
          >
            <div className="w-8 h-8 border-2 border-lime-accent border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-light-text-secondary dark:text-dark-text-secondary">Loading...</p>
          </motion.div>
        </div>
      </ThemeProvider>
    );
  }

  // Show auth form if not authenticated
  if (!isAuthenticated) {
    return (
      <ThemeProvider>
        <AuthForm onAuthSuccess={handleAuthSuccess} />
      </ThemeProvider>
    );
  }

  const renderMainContent = () => {
    switch (activeSection) {
      case 'budget':
        return (
          <BudgetSetupForm 
            onNavigateToDashboard={() => {
              setEditingBudgetPlan(null);
              setActiveSection('dashboard');
            }} 
            editingPlan={editingBudgetPlan}
            currentUserId={currentUserId}
          />
        );
      case 'dashboard':
        return (
          <Dashboard 
            onNavigateBack={() => {
              setEditingBudgetPlan(null);
              setActiveSection('budget');
            }} 
            onEditBudget={handleEditBudget}
            onSignOut={handleSignOut} 
            currentUserId={currentUserId}
            onSectionChange={setActiveSection}
          />
        );
      case 'exchange':
        return <ExchangeRates />;
      case 'payments':
        return (
          <PaymentTracker 
            currentUserId={currentUserId}
            onNavigateBack={() => setActiveSection('dashboard')} 
          />
        );
      case 'insights':
        return <Insights currentUserId={currentUserId} />;
      case 'settings':
        return <Settings onSignOut={handleSignOut} />;
      case 'shopping':
        return <ShoppingListComponent />;
      default:
        return <BudgetSetupForm onNavigateToDashboard={() => setActiveSection('dashboard')} editingPlan={editingBudgetPlan} currentUserId={currentUserId} />;
    }
  };

  return (
    <ThemeProvider>
      <AppContent 
        activeSection={activeSection} 
        setActiveSection={setActiveSection} 
        renderMainContent={renderMainContent}
        onSignOut={handleSignOut}
        currentUserId={currentUserId}
      />
    </ThemeProvider>
  );
}

// Force cache refresh on app load
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(function(registrations) {
    for(let registration of registrations) {
      registration.update();
    }
  });
}

const AppContent: React.FC<{
  activeSection: string;
  setActiveSection: (section: string) => void;
  renderMainContent: () => React.ReactNode;
  onSignOut: () => void;
  currentUserId: string | null;
}> = ({ activeSection, setActiveSection, renderMainContent, onSignOut }) => {
  const { isNative } = useCapacitor();

  return (
    <div className="min-h-screen bg-light-base dark:bg-dark-base text-light-text dark:text-dark-text font-editorial transition-colors duration-300 overflow-x-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none hidden md:block">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-lime-accent/5 dark:bg-lime-accent/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-lime-accent/3 dark:bg-lime-accent/3 rounded-full blur-3xl"></div>
      </div>

      <div className="flex h-screen relative md:flex-row flex-col overflow-x-hidden">
        {/* Sidebar */}
        <div className="hidden md:block">
          <Sidebar activeSection={activeSection} onSectionChange={setActiveSection} onSignOut={onSignOut} />
        </div>
        
        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
          <div className="md:block">
            <TopBar onSignOut={onSignOut} />
          </div>
          
          {/* Content Area */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden pb-24 md:pb-8 pt-4 md:pt-0">
            <div className="p-4 md:p-8 max-w-full overflow-x-hidden">
              {isNative && <NativeFeatures />}
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeSection}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="overflow-x-hidden max-w-full"
                >
                  {renderMainContent()}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
        
        {/* Mobile Bottom Navigation */}
        <div className="md:hidden">
          <MobileBottomNav activeSection={activeSection} onSectionChange={setActiveSection} />
        </div>
      </div>
      
      {/* PWA Install Prompt */}
      <PWAInstallPrompt />
    </div>
  );
};

export default App;