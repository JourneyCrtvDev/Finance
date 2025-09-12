import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, X, Smartphone } from 'lucide-react';
import { usePWA } from '../hooks/usePWA';

export const PWAInstallPrompt: React.FC = () => {
  const { canInstall, installApp } = usePWA();
  const [showPrompt, setShowPrompt] = React.useState(false);
  const [dismissed, setDismissed] = React.useState(false);

  React.useEffect(() => {
    if (canInstall && !dismissed) {
      // Show prompt after 30 seconds of usage
      const timer = setTimeout(() => {
        setShowPrompt(true);
      }, 30000);

      return () => clearTimeout(timer);
    }
  }, [canInstall, dismissed]);

  const handleInstall = async () => {
    const success = await installApp();
    if (success) {
      setShowPrompt(false);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    setDismissed(true);
    // Remember dismissal for 7 days
    localStorage.setItem('pwa-install-dismissed', Date.now().toString());
  };

  // Check if user dismissed recently
  React.useEffect(() => {
    const dismissedTime = localStorage.getItem('pwa-install-dismissed');
    if (dismissedTime) {
      const daysSinceDismissed = (Date.now() - parseInt(dismissedTime)) / (1000 * 60 * 60 * 24);
      if (daysSinceDismissed < 7) {
        setDismissed(true);
      }
    }
  }, []);

  return (
    <AnimatePresence>
      {showPrompt && canInstall && (
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 100 }}
          className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-sm z-50"
        >
          <div className="bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-2xl p-6 shadow-2xl backdrop-blur-sm">
            <div className="flex items-start space-x-4">
              <div className="p-3 bg-lime-accent/20 rounded-full flex-shrink-0">
                <Smartphone className="w-6 h-6 text-lime-accent" />
              </div>
              
              <div className="flex-1">
                <h3 className="text-lg font-bold text-light-text dark:text-dark-text font-editorial mb-2">
                  Install FinanceHub
                </h3>
                <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary mb-4">
                  Get the full app experience! Install FinanceHub on your device for faster access and offline features.
                </p>
                
                <div className="flex space-x-3">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleInstall}
                    className="flex items-center space-x-2 bg-lime-accent text-light-base dark:text-dark-base px-4 py-2 rounded-lg font-medium hover:shadow-glow transition-all"
                  >
                    <Download className="w-4 h-4" />
                    <span>Install</span>
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleDismiss}
                    className="px-4 py-2 text-light-text-secondary dark:text-dark-text-secondary hover:text-light-text dark:hover:text-dark-text transition-colors"
                  >
                    Not now
                  </motion.button>
                </div>
              </div>
              
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleDismiss}
                className="p-1 text-light-text-secondary dark:text-dark-text-secondary hover:text-light-text dark:hover:text-dark-text transition-colors"
              >
                <X className="w-5 h-5" />
              </motion.button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};