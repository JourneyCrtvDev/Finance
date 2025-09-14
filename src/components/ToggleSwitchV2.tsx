import React from 'react';
import { motion } from 'framer-motion';

interface ToggleSwitchV2Props {
  checked: boolean;
  onChange: () => void;
  disabled?: boolean;
}

export const ToggleSwitchV2: React.FC<ToggleSwitchV2Props> = ({ 
  checked, 
  onChange, 
  disabled = false 
}) => {
  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      onClick={onChange}
      disabled={disabled}
      className={`relative w-16 h-8 rounded-2xl transition-all duration-300 flex-shrink-0 p-1 border-2 ${
        checked 
          ? 'bg-lime-accent/20 border-lime-accent shadow-glow' 
          : 'bg-light-glass dark:bg-dark-glass border-light-border dark:border-dark-border'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-lg'}`}
    >
      <motion.div
        animate={{
          x: checked ? 24 : 0,
          backgroundColor: checked ? 'var(--lime-accent, #65A30D)' : '#9CA3AF'
        }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
        className="w-6 h-6 rounded-full shadow-md flex items-center justify-center"
      >
        <motion.div
          animate={{
            scale: checked ? 1 : 0,
            opacity: checked ? 1 : 0
          }}
          transition={{ duration: 0.2 }}
          className="w-3 h-3 bg-white rounded-full"
        />
      </motion.div>
    </motion.button>
  );
};