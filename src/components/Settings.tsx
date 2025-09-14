import React, { useState, useEffect } from 'react';
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
  Save,
  LogOut
} from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { ColorPicker } from './ColorPicker';
import { supabase, getCurrentUser } from '../lib/supabaseClient';
import { DataExportService } from '../services/dataExportService';

interface SettingsProps {
  onSignOut: () => void;
}

export const Settings: React.FC<SettingsProps> = ({ onSignOut }) => {
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

  const [displayName, setDisplayName] = useState("John Doe");
  const [email, setEmail] = useState("john.doe@example.com");
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isSigningOut, setIsSigningOut] = useState(false);

  // Load profile from Supabase on mount
  useEffect(() => {
    const fetchProfile = async () => {
      const user = await getCurrentUser();
      if (!user || !supabase) return;
      setCurrentUserId(user.id);
      const { data, error } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      if (!error && data) {
        if (data.display_name) setDisplayName(data.display_name);
        if (data.avatar_url) setPhotoPreview(data.avatar_url);
      }
    };
    fetchProfile();
  }, []);

  const handleNotificationChange = (key: keyof typeof notifications) => {
    setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handlePrivacyChange = (key: keyof typeof privacy) => {
    setPrivacy(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handlePreferenceChange = (key: keyof typeof preferences, value: string | number) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      setProfilePhoto(file.name);
    }
  };

  const handleSaveProfile = async () => {
    try {
      // Get current user
      const user = await getCurrentUser();
      if (!user) {
        alert('You must be logged in to update your profile.');
        return;
      }
      // Prepare update object
      const updates: any = {
        id: user.id,
        display_name: displayName,
      };
      // If photo is uploaded, upload to Supabase Storage (optional)
      if (photoPreview && profilePhoto) {
        if (!supabase) {
          alert('Supabase is not configured.');
          return;
        }
        // Upload to Supabase Storage (avatars bucket)
        const input = document.getElementById('profile-photo-upload') as HTMLInputElement | null;
        const file = input?.files?.[0];
        if (file) {
          const { data, error } = await supabase.storage.from('avatars').upload(`${user.id}/${file.name}`, file, { upsert: true });
          if (error) {
            alert('Photo upload failed: ' + error.message);
          } else {
            const { data: publicUrlData } = supabase.storage.from('avatars').getPublicUrl(`${user.id}/${file.name}`);
            updates.avatar_url = publicUrlData.publicUrl;
          }
        }
      }
      // Update profile in Supabase
      if (!supabase) {
        alert('Supabase is not configured.');
        return;
      }
      const { error } = await supabase.from('profiles').upsert(updates);
      if (error) {
        alert('Profile update failed: ' + error.message);
      } else {
        alert('Profile saved!');
      }
    } catch (err) {
      alert('An unexpected error occurred while saving your profile.');
    }
  };

  const exportData = async () => {
    if (!currentUserId) {
      alert('You must be logged in to export data.');
      return;
    }

    setIsExporting(true);
    try {
      await DataExportService.exportUserData(currentUserId);
      alert('Your data has been exported successfully! Check your downloads folder for the Excel file.');
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export data. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleSignOut = async () => {
    setIsSigningOut(true);
    setTimeout(() => {
      setIsSigningOut(false);
      onSignOut();
    }, 500);
  };

  const deleteAccount = () => {
    if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      alert('Account deletion feature coming soon!');
    }
  };

  return (
    <div className="space-y-6 overflow-x-hidden max-w-full">
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
      </motion.div>

      {/* Profile Settings */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="bg-light-surface/50 dark:bg-dark-surface/50 backdrop-blur-sm border border-light-border dark:border-dark-border rounded-2xl p-6 shadow-glass"
      >
        <div className="flex items-center space-x-3 mb-6">
          <div className="relative w-16 h-16 mr-4">
            <label htmlFor="profile-photo-upload">
              <img
                src={photoPreview || "/default-avatar.png"}
                alt="Profile"
                className="w-16 h-16 rounded-full object-cover border border-light-border dark:border-dark-border cursor-pointer"
              />
              <input
                id="profile-photo-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handlePhotoChange}
              />
            </label>
          </div>
          <User className="w-6 h-6 text-lime-accent" />
          <h3 className="text-xl font-bold text-light-text dark:text-dark-text font-editorial">Profile</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm text-light-text-secondary dark:text-dark-text-secondary mb-2">Display Name</label>
            <input
              type="text"
              value={displayName}
              onChange={e => setDisplayName(e.target.value)}
              className="w-full bg-light-glass dark:bg-dark-glass border border-light-border dark:border-dark-border rounded-lg px-3 py-2 text-light-text dark:text-dark-text focus:outline-none focus:border-lime-accent/50 transition-colors duration-300"
            />
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="mt-4 flex items-center space-x-2 bg-lime-accent text-light-base dark:text-dark-base px-4 py-2 rounded-lg font-medium hover:shadow-glow transition-all"
          onClick={handleSaveProfile}
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
                className={`relative w-14 h-6 rounded-full transition-colors flex-shrink-0 p-1 ${
                  notifications[key as keyof typeof notifications] ? 'bg-lime-accent' : 'bg-gray-300 dark:bg-gray-600'
                }`}
              >
                <motion.div
                  animate={{
                    x: notifications[key as keyof typeof notifications] ? 24 : 0
                  }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  className="w-4 h-4 bg-white rounded-full shadow-md"
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
                className={`relative w-14 h-6 rounded-full transition-colors flex-shrink-0 p-1 ${
                  privacy[key as keyof typeof privacy] ? 'bg-lime-accent' : 'bg-gray-300 dark:bg-gray-600'
                }`}
              >
                <motion.div
                  animate={{
                    x: privacy[key as keyof typeof privacy] ? 24 : 0
                  }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  className="w-4 h-4 bg-white rounded-full shadow-md"
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
            onClick={handleSignOut}
            disabled={isSigningOut}
            className="w-full flex items-center justify-center space-x-2 bg-red-500/10 border border-red-500/20 px-4 py-3 rounded-lg text-red-400 hover:bg-red-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSigningOut ? (
              <>
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                <span>Signing Out...</span>
              </>
            ) : (
              <>
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </>
            )}
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={exportData}
            disabled={isExporting}
            className="w-full flex items-center justify-center space-x-2 bg-light-glass dark:bg-dark-glass border border-light-border dark:border-dark-border px-4 py-3 rounded-lg text-light-text dark:text-dark-text hover:border-lime-accent/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isExporting ? (
              <>
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                <span>Exporting...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>Export My Data</span>
              </>
            )}
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