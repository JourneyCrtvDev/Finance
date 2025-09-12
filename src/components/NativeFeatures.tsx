import React from 'react';
import { motion } from 'framer-motion';
import { Smartphone, Bell, Camera, Share } from 'lucide-react';
import { useCapacitor } from '../hooks/useCapacitor';

export const NativeFeatures: React.FC = () => {
  const { isNative, isIOS } = useCapacitor();

  if (!isNative) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-lime-accent/10 border border-lime-accent/20 rounded-xl p-4 mb-6"
    >
      <div className="flex items-center space-x-3 mb-3">
        <Smartphone className="w-5 h-5 text-lime-accent" />
        <h3 className="font-semibold text-light-text dark:text-dark-text">
          Native {isIOS ? 'iOS' : 'Mobile'} Features
        </h3>
      </div>
      
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="flex items-center space-x-2">
          <Bell className="w-4 h-4 text-lime-accent" />
          <span className="text-light-text dark:text-dark-text">Push Notifications</span>
        </div>
        <div className="flex items-center space-x-2">
          <Camera className="w-4 h-4 text-lime-accent" />
          <span className="text-light-text dark:text-dark-text">Camera Access</span>
        </div>
        <div className="flex items-center space-x-2">
          <Share className="w-4 h-4 text-lime-accent" />
          <span className="text-light-text dark:text-dark-text">Native Sharing</span>
        </div>
        <div className="flex items-center space-x-2">
          <Smartphone className="w-4 h-4 text-lime-accent" />
          <span className="text-light-text dark:text-dark-text">Offline Storage</span>
        </div>
      </div>
    </motion.div>
  );
};