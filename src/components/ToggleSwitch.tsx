import React from 'react';
import { motion } from 'framer-motion';

interface ToggleSwitchProps {
  checked: boolean;
  onChange: () => void;
  disabled?: boolean;
}

export const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ 
  checked, 
  onChange, 
  disabled = false 
}) => {
  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      onClick={onChange}
      disabled={disabled}
      className={`relative w-12 h-5 rounded-full transition-colors flex-shrink-0 p-0.5 ${
        checked ? 'bg-lime-accent' : 'bg-gray-300 dark:bg-gray-600'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      <motion.div
        animate={{
          x: checked ? 20 : 0
        }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        className="w-4 h-4 bg-white rounded-full shadow-sm"
      />
    </motion.button>
  );
};