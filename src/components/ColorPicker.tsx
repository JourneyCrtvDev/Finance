import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Palette } from 'lucide-react';
import { THEME_COLORS, applyThemeColor } from '../constants/colors';

export const ColorPicker: React.FC = () => {
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [selectedColor, setSelectedColor] = useState(THEME_COLORS[0]);

  const handleColorChange = (color: typeof THEME_COLORS[0]) => {
    setSelectedColor(color);
    applyThemeColor(color);
    setShowColorPicker(false);
  };

  return (
    <>
      {/* Color Picker Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setShowColorPicker(!showColorPicker)}
        className="relative p-2 bg-light-glass dark:bg-dark-glass rounded-full hover:bg-lime-accent/10 transition-colors duration-300"
      >
        <Palette className="w-5 h-5 text-light-text dark:text-dark-text" />
        <div 
          className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-light-surface dark:border-dark-surface"
          style={{ backgroundColor: selectedColor.value }}
        />
      </motion.button>

      {/* Color Picker Dropdown */}
      <AnimatePresence>
        {showColorPicker && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40"
              onClick={() => setShowColorPicker(false)}
            />
            
            {/* Dropdown */}
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className="absolute top-full right-0 mt-2 bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-xl p-4 shadow-glass z-50 min-w-[200px]"
            >
              <h3 className="text-sm font-bold text-light-text dark:text-dark-text mb-3">Choose Theme Color</h3>
              
              <div className="grid grid-cols-3 gap-3">
                {THEME_COLORS.map((color) => (
                  <motion.button
                    key={color.name}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleColorChange(color)}
                    className={`flex flex-col items-center space-y-2 p-3 rounded-lg border-2 transition-all ${
                      selectedColor.value === color.value
                        ? 'border-current'
                        : 'border-light-border dark:border-dark-border hover:border-current/50'
                    }`}
                    style={{ color: color.value }}
                  >
                    <div className={`w-6 h-6 rounded-full ${color.class}`} />
                    <span className="text-xs font-medium text-light-text dark:text-dark-text">
                      {color.name}
                    </span>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};