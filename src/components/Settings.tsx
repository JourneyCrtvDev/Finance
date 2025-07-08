import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  User, 
  Bell, 
  Shield, 
  Palette, 
  Globe, 
  Download, 
  Trash2, 
  Eye, 
  EyeOff,
  Mail,
  Smartphone,
  Calendar,
  DollarSign,
  Save
} from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { ColorPicker } from './ColorPicker';
import { isSupabaseConfigured } from '../lib/supabaseClient';

export const Settings: React.FC = () => {
  const [notifications, setNotifications] = useState({
    paymentReminders: true,
    budgetAlerts: true,
    monthlyReports: false,
    emailNotifications: true,
    pushNotifications: false
  });

  const [privacy, setPrivacy] = useState({
    showAmounts: true,
    dataSharing: false,
    analytics: true
  });

  const [preferences, setPreferences] = useState({
    currency: 'RON',
    dateFormat: 'DD/MM/YYYY',
    startOfWeek: 'Monday',
    reminderDays: 3
  });

  const handleNotificationChange = (key: keyof typeof notifications) => {
    setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handlePrivacyChange = (key: keyof typeof privacy) => {
    setPrivacy(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handlePreferenceChange = (key: keyof typeof preferences, value: string | number) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
  };

  const exportData = () => {
    // Placeholder for data export functionality
    alert('Data export feature coming soon!');
  };

  const deleteAccount = () => {
    if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      alert('Account deletion feature coming soon!');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-3xl font-bold text-light-text dark:text-dark-text font-editorial">Settings</h2>
        <p className="text-light-text-secondary dark:text-dark-text-secondary mt-1">
          Customize your FinanceHub experience
        </p>
        {!isSupabaseConfigured && (
          <div className="mt-2 p-2 bg-orange-500/10 border border-orange-500/20 rounded-lg">
            <p className="text-orange-400 text-sm">
              Demo Mode: Settings changes are not persisted
            </p>
          </div>
        )}
      </motion.div>

      {/* Profile Settings */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="bg-light-surface/50 dark:bg-dark-surface/50 backdrop-blur-sm border border-light-border dark:border-dark-border rounded-2xl p-6 shadow-glass"
      >
        <div className="flex items-center space-x-3 mb-6">
          <User className="w-6 h-6 text-lime-accent" />
          <h3 className="text-xl font-bold text-light-text dark:text-dark-text font-editorial">Profile</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm text-light-text-secondary dark:text-dark-text-secondary mb-2">Display Name</label>
            <input
              type="text"
              defaultValue="John Doe"
              className="w-full bg-light-glass dark:bg-dark-glass border border-light-border dark:border-dark-border rounded-lg px-3 py-2 text-light-text dark:text-dark-text focus:outline-none focus:border-lime-accent/50 transition-colors duration-300"
            />
          </div>
          <div>
            <label className="block text-sm text-light-text-secondary dark:text-dark-text-secondary mb-2">Email</label>
            <input
              type="email"
              defaultValue="john.doe@example.com"
              className="w-full bg-light-glass dark:bg-dark-glass border border-light-border dark:border-dark-border rounded-lg px-3 py-2 text-light-text dark:text-dark-text focus:outline-none focus:border-lime-accent/50 transition-colors duration-300"
            />
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="mt-4 flex items-center space-x-2 bg-lime-accent text-light-base dark:text-dark-base px-4 py-2 rounded-lg font-medium hover:shadow-glow transition-all"
        >
          <Save className="w-4 h-4" />
          <span>Save Profile</span>
        </motion.button>
      </motion.div>

      {/* Appearance Settings */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="bg-light-surface/50 dark:bg-dark-surface/50 backdrop-blur-sm border border-light-border dark:border-dark-border rounded-2xl p-6 shadow-glass"
      >
        <div className="flex items-center space-x-3 mb-6">
          <Palette className="w-6 h-6 text-lime-accent" />
          <h3 className="text-xl font-bold text-light-text dark:text-dark-text font-editorial">Appearance</h3>
        </div>

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-light-text dark:text-dark-text">Theme</h4>
              <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">Choose your preferred theme</p>
            </div>
            <ThemeToggle />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-light-text dark:text-dark-text">Accent Color</h4>
              <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">Customize the app's accent color</p>
            </div>
            <ColorPicker />
          </div>
        </div>
      </motion.div>

      {/* Notification Settings */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="bg-light-surface/50 dark:bg-dark-surface/50 backdrop-blur-sm border border-light-border dark:border-dark-border rounded-2xl p-6 shadow-glass"
      >
        <div className="flex items-center space-x-3 mb-6">
          <Bell className="w-6 h-6 text-lime-accent" />
          <h3 className="text-xl font-bold text-light-text dark:text-dark-text font-editorial">Notifications</h3>
        </div>

        <div className="space-y-4">
          {[
            { key: 'paymentReminders', label: 'Payment Reminders', desc: 'Get notified before bills are due', icon: Calendar },
            { key: 'budgetAlerts', label: 'Budget Alerts', desc: 'Alerts when approaching budget limits', icon: DollarSign },
            { key: 'monthlyReports', label: 'Monthly Reports', desc: 'Receive monthly spending summaries', icon: Mail },
            { key: 'emailNotifications', label: 'Email Notifications', desc: 'Receive notifications via email', icon: Mail },
            { key: 'pushNotifications', label: 'Push Notifications', desc: 'Browser push notifications', icon: Smartphone }
          ].map(({ key, label, desc, icon: Icon }) => (
            <div key={key} className="flex items-center justify-between p-3 bg-light-glass dark:bg-dark-glass rounded-lg">
              <div className="flex items-center space-x-3">
                <Icon className="w-5 h-5 text-lime-accent" />
                <div>
                  <h4 className="font-medium text-light-text dark:text-dark-text">{label}</h4>
                  <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">{desc}</p>
                </div>
              </div>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => handleNotificationChange(key as keyof typeof notifications)}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  notifications[key as keyof typeof notifications] ? 'bg-lime-accent' : 'bg-light-border dark:bg-dark-border'
                }`}
              >
                <motion.div
                  animate={{
                    x: notifications[key as keyof typeof notifications] ? 24 : 2
                  }}
                  transition={{ duration: 0.2 }}
                  className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm"
                />
              </motion.button>
            </div>
          ))}
        </div>

        <div className="mt-6 p-3 bg-light-glass dark:bg-dark-glass rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-light-text dark:text-dark-text">Reminder Days</h4>
              <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">Days before due date to remind</p>
            </div>
            <select
              value={preferences.reminderDays}
              onChange={(e) => handlePreferenceChange('reminderDays', parseInt(e.target.value))}
              className="bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-lg px-3 py-1 text-light-text dark:text-dark-text focus:outline-none focus:border-lime-accent/50"
            >
              <option value={1}>1 day</option>
              <option value={3}>3 days</option>
              <option value={7}>7 days</option>
              <option value={14}>14 days</option>
            </select>
          </div>
        </div>
      </motion.div>

      {/* Privacy Settings */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="bg-light-surface/50 dark:bg-dark-surface/50 backdrop-blur-sm border border-light-border dark:border-dark-border rounded-2xl p-6 shadow-glass"
      >
        <div className="flex items-center space-x-3 mb-6">
          <Shield className="w-6 h-6 text-lime-accent" />
          <h3 className="text-xl font-bold text-light-text dark:text-dark-text font-editorial">Privacy & Security</h3>
        </div>

        <div className="space-y-4">
          {[
            { key: 'showAmounts', label: 'Show Amounts', desc: 'Display actual amounts in the interface', icon: Eye },
            { key: 'dataSharing', label: 'Anonymous Analytics', desc: 'Help improve the app with usage data', icon: Globe },
            { key: 'analytics', label: 'Performance Analytics', desc: 'Track app performance and errors', icon: Globe }
          ].map(({ key, label, desc, icon: Icon }) => (
            <div key={key} className="flex items-center justify-between p-3 bg-light-glass dark:bg-dark-glass rounded-lg">
              <div className="flex items-center space-x-3">
                <Icon className="w-5 h-5 text-lime-accent" />
                <div>
                  <h4 className="font-medium text-light-text dark:text-dark-text">{label}</h4>
                  <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">{desc}</p>
                </div>
              </div>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => handlePrivacyChange(key as keyof typeof privacy)}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  privacy[key as keyof typeof privacy] ? 'bg-lime-accent' : 'bg-light-border dark:bg-dark-border'
                }`}
              >
                <motion.div
                  animate={{
                    x: privacy[key as keyof typeof privacy] ? 24 : 2
                  }}
                  transition={{ duration: 0.2 }}
                  className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm"
                />
              </motion.button>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Preferences */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="bg-light-surface/50 dark:bg-dark-surface/50 backdrop-blur-sm border border-light-border dark:border-dark-border rounded-2xl p-6 shadow-glass"
      >
        <div className="flex items-center space-x-3 mb-6">
          <Globe className="w-6 h-6 text-lime-accent" />
          <h3 className="text-xl font-bold text-light-text dark:text-dark-text font-editorial">Preferences</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm text-light-text-secondary dark:text-dark-text-secondary mb-2">Currency</label>
            <select
              value={preferences.currency}
              onChange={(e) => handlePreferenceChange('currency', e.target.value)}
              className="w-full bg-light-glass dark:bg-dark-glass border border-light-border dark:border-dark-border rounded-lg px-3 py-2 text-light-text dark:text-dark-text focus:outline-none focus:border-lime-accent/50"
            >
              <option value="RON">Romanian Leu (RON)</option>
              <option value="EUR">Euro (EUR)</option>
              <option value="USD">US Dollar (USD)</option>
              <option value="GBP">British Pound (GBP)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-light-text-secondary dark:text-dark-text-secondary mb-2">Date Format</label>
            <select
              value={preferences.dateFormat}
              onChange={(e) => handlePreferenceChange('dateFormat', e.target.value)}
              className="w-full bg-light-glass dark:bg-dark-glass border border-light-border dark:border-dark-border rounded-lg px-3 py-2 text-light-text dark:text-dark-text focus:outline-none focus:border-lime-accent/50"
            >
              <option value="DD/MM/YYYY">DD/MM/YYYY</option>
              <option value="MM/DD/YYYY">MM/DD/YYYY</option>
              <option value="YYYY-MM-DD">YYYY-MM-DD</option>
            </select>
          </div>
        </div>
      </motion.div>

      {/* Data Management */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="bg-light-surface/50 dark:bg-dark-surface/50 backdrop-blur-sm border border-light-border dark:border-dark-border rounded-2xl p-6 shadow-glass"
      >
        <div className="flex items-center space-x-3 mb-6">
          <Download className="w-6 h-6 text-lime-accent" />
          <h3 className="text-xl font-bold text-light-text dark:text-dark-text font-editorial">Data Management</h3>
        </div>

        <div className="space-y-4">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={exportData}
            className="w-full flex items-center justify-center space-x-2 bg-light-glass dark:bg-dark-glass border border-light-border dark:border-dark-border px-4 py-3 rounded-lg text-light-text dark:text-dark-text hover:border-lime-accent/30 transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Export My Data</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={deleteAccount}
            className="w-full flex items-center justify-center space-x-2 bg-red-500/10 border border-red-500/20 px-4 py-3 rounded-lg text-red-400 hover:bg-red-500/20 transition-all"
          >
            <Trash2 className="w-4 h-4" />
            <span>Delete Account</span>
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};