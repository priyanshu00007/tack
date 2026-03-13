"use client"
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Settings, 
  User, 
  Bell, 
  Shield, 
  Palette, 
  Download,
  Upload,
  Trash2,
  Moon,
  Sun,
  Monitor,
  Mail,
  Lock,
  Info,
  ArrowLeft
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import Sidebar from '../../components/Sidebar';

interface UserSettings {
  notifications: {
    email: boolean;
    push: boolean;
    taskReminders: boolean;
    dailySummary: boolean;
    achievementAlerts: boolean;
  };
  privacy: {
    profilePublic: boolean;
    showStats: boolean;
    showAchievements: boolean;
  };
  preferences: {
    defaultFocusDuration: number;
    autoStartBreaks: boolean;
    soundEnabled: boolean;
    vibrationEnabled: boolean;
    language: string;
    timezone: string;
  };
  data: {
    autoBackup: boolean;
    exportFormat: string;
    lastBackup?: string;
  };
}

export default function SettingsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { theme, setTheme, isDark } = useTheme();

  // Theme helpers
  const bg = isDark ? 'bg-black' : 'bg-gray-50';
  const text = isDark ? 'text-zinc-200' : 'text-zinc-800';
  const textHeading = isDark ? 'text-white' : 'text-zinc-900';
  const textMuted = isDark ? 'text-zinc-500' : 'text-zinc-500';
  const cardBg = isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-gray-200 shadow-sm';
  const inputBg = isDark ? 'bg-zinc-800 border-zinc-700 text-white' : 'bg-gray-50 border-gray-300 text-zinc-900';
  const itemBg = isDark ? 'bg-zinc-800' : 'bg-gray-100';
  const labelText = isDark ? 'text-zinc-300' : 'text-zinc-700';

  const [settings, setSettings] = useState<UserSettings>({
    notifications: {
      email: true,
      push: false,
      taskReminders: true,
      dailySummary: false,
      achievementAlerts: true
    },
    privacy: {
      profilePublic: false,
      showStats: true,
      showAchievements: true
    },
    preferences: {
      defaultFocusDuration: 25,
      autoStartBreaks: false,
      soundEnabled: true,
      vibrationEnabled: true,
      language: 'en',
      timezone: 'UTC'
    },
    data: {
      autoBackup: true,
      exportFormat: 'json'
    }
  });

  const [mounted, setMounted] = useState(false);

  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    setMounted(true);
    const savedSettings = localStorage.getItem('zenith_settings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    } else {
      // Set client-side timezone now that we're in the browser
      setSettings(prev => ({
        ...prev,
        preferences: {
          ...prev.preferences,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
        }
      }));
    }
  }, []);

  const saveSettings = () => {
    localStorage.setItem('zenith_settings', JSON.stringify(settings));
  };

  const updateSettings = (category: keyof UserSettings, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }));
  };

  const exportData = () => {
    const allData = {
      settings,
      profile: localStorage.getItem('zenith_profile'),
      gamification: localStorage.getItem('zenith_gamification'),
      tasks: localStorage.getItem('zenith_tasks'),
      habits: localStorage.getItem('zenith_habits'),
      goals: localStorage.getItem('zenith_goals')
    };

    const dataStr = JSON.stringify(allData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `zenith-backup-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const importData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        try {
          const data = JSON.parse(reader.result as string);
          if (data.settings) {
            setSettings(data.settings);
            localStorage.setItem('zenith_settings', JSON.stringify(data.settings));
          }
          if (data.profile) localStorage.setItem('zenith_profile', data.profile);
          if (data.gamification) localStorage.setItem('zenith_gamification', data.gamification);
          if (data.tasks) localStorage.setItem('zenith_tasks', data.tasks);
          if (data.habits) localStorage.setItem('zenith_habits', data.habits);
          if (data.goals) localStorage.setItem('zenith_goals', data.goals);
          alert('Data imported successfully! Refresh to see changes.');
        } catch (error) {
          alert('Error importing data. Please check the file format.');
        }
      };
      reader.readAsText(file);
    }
  };

  const clearAllData = () => {
    if (confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
      localStorage.clear();
      alert('All data cleared. You will be redirected to login.');
      router.push('/login');
    }
  };

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    if (newPassword.length < 6) {
      alert('Password must be at least 6 characters');
      return;
    }
    alert('Password changed successfully!');
    setShowPasswordForm(false);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  // Toggle switch component
  const Toggle = ({ checked, onChange }: { checked: boolean; onChange: (val: boolean) => void }) => (
    <button
      onClick={() => onChange(!checked)}
      className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${
        checked 
          ? (isDark ? 'bg-white' : 'bg-zinc-900') 
          : (isDark ? 'bg-zinc-700' : 'bg-gray-300')
      }`}
    >
      <div className={`absolute top-0.5 w-5 h-5 rounded-full transition-all duration-200 ${
        checked 
          ? `left-[22px] ${isDark ? 'bg-black' : 'bg-white'}` 
          : `left-0.5 ${isDark ? 'bg-zinc-400' : 'bg-white'}`
      }`} />
    </button>
  );

  return (
    <Sidebar>
      <div className={text}>
        <div className="max-w-4xl mx-auto p-6">

        {/* Header */}
        <div className="mb-8">
          <h1 className={`text-3xl font-serif ${textHeading} mb-2`}>Settings</h1>
          <p className={textMuted}>Manage your preferences and account settings</p>
        </div>

        <div className="space-y-6">
          {/* Appearance */}
          <div className={`${cardBg} border rounded-xl p-6`}>
            <h3 className={`text-lg font-semibold ${textHeading} mb-4 flex items-center gap-2`}>
              <Palette size={20} />
              Appearance
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium ${labelText} mb-3`}>Theme</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { id: 'zenith-dark', label: 'Zenith Dark', icon: <Moon size={20} />, activeClass: isDark ? 'bg-white text-black border-white' : 'bg-zinc-900 text-white border-zinc-900' },
                    { id: 'zenith-light', label: 'Zenith Light', icon: <Sun size={20} />, activeClass: isDark ? 'bg-white text-black border-white' : 'bg-zinc-900 text-white border-zinc-900' },
                    { id: 'dark', label: 'Dark', icon: <Monitor size={20} />, activeClass: 'bg-blue-600 text-white border-blue-600' },
                    { id: 'light', label: 'Light', icon: <Sun size={20} />, activeClass: 'bg-blue-600 text-white border-blue-600' },
                  ].map(t => (
                    <button
                      key={t.id}
                      onClick={() => setTheme(t.id as any)}
                      className={`p-3 rounded-xl border transition-all ${
                        theme === t.id 
                          ? t.activeClass
                          : isDark 
                            ? 'bg-zinc-800 border-zinc-700 text-zinc-300 hover:border-zinc-500' 
                            : 'bg-gray-100 border-gray-300 text-zinc-700 hover:border-gray-400'
                      }`}
                    >
                      <div className="flex justify-center mb-1">{t.icon}</div>
                      <div className="text-xs">{t.label}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Notifications */}
          <div className={`${cardBg} border rounded-xl p-6`}>
            <h3 className={`text-lg font-semibold ${textHeading} mb-4 flex items-center gap-2`}>
              <Bell size={20} />
              Notifications
            </h3>
            
            <div className="space-y-4">
              {[
                { key: 'email', label: 'Email Notifications', desc: 'Receive email notifications' },
                { key: 'push', label: 'Push Notifications', desc: 'Receive push notifications' },
                { key: 'taskReminders', label: 'Task Reminders', desc: 'Get reminded about tasks' },
                { key: 'dailySummary', label: 'Daily Summary', desc: 'Daily productivity summary' },
                { key: 'achievementAlerts', label: 'Achievement Alerts', desc: 'Achievement unlock notifications' }
              ].map(item => (
                <label key={item.key} className="flex items-center justify-between cursor-pointer">
                  <div>
                    <div className={`text-sm font-medium ${textHeading}`}>{item.label}</div>
                    <div className={`text-xs ${textMuted}`}>{item.desc}</div>
                  </div>
                  <Toggle
                    checked={settings.notifications[item.key as keyof typeof settings.notifications]}
                    onChange={(val) => {
                      updateSettings('notifications', item.key, val);
                      saveSettings();
                    }}
                  />
                </label>
              ))}
            </div>
          </div>

          {/* Privacy */}
          <div className={`${cardBg} border rounded-xl p-6`}>
            <h3 className={`text-lg font-semibold ${textHeading} mb-4 flex items-center gap-2`}>
              <Shield size={20} />
              Privacy
            </h3>
            
            <div className="space-y-4">
              {[
                { key: 'profilePublic', label: 'Public Profile', desc: 'Make your profile public' },
                { key: 'showStats', label: 'Show Statistics', desc: 'Show your statistics to others' },
                { key: 'showAchievements', label: 'Show Achievements', desc: 'Display your achievements publicly' }
              ].map(item => (
                <label key={item.key} className="flex items-center justify-between cursor-pointer">
                  <div>
                    <div className={`text-sm font-medium ${textHeading}`}>{item.label}</div>
                    <div className={`text-xs ${textMuted}`}>{item.desc}</div>
                  </div>
                  <Toggle
                    checked={settings.privacy[item.key as keyof typeof settings.privacy]}
                    onChange={(val) => {
                      updateSettings('privacy', item.key, val);
                      saveSettings();
                    }}
                  />
                </label>
              ))}
            </div>
          </div>

          {/* Preferences */}
          <div className={`${cardBg} border rounded-xl p-6`}>
            <h3 className={`text-lg font-semibold ${textHeading} mb-4 flex items-center gap-2`}>
              <Settings size={20} />
              Preferences
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium ${labelText} mb-2`}>Default Focus Duration</label>
                <select
                  value={settings.preferences.defaultFocusDuration}
                  onChange={(e) => {
                    updateSettings('preferences', 'defaultFocusDuration', parseInt(e.target.value));
                    saveSettings();
                  }}
                  className={`w-full ${inputBg} border rounded-xl px-3 py-2`}
                >
                  <option value={15}>15 minutes</option>
                  <option value={25}>25 minutes</option>
                  <option value={45}>45 minutes</option>
                  <option value={60}>60 minutes</option>
                  <option value={90}>90 minutes</option>
                  <option value={120}>120 minutes</option>
                </select>
              </div>
              
              <div>
                <label className={`block text-sm font-medium ${labelText} mb-2`}>Timezone</label>
                <select
                  value={settings.preferences.timezone}
                  onChange={(e) => {
                    updateSettings('preferences', 'timezone', e.target.value);
                    saveSettings();
                  }}
                  className={`w-full ${inputBg} border rounded-xl px-3 py-2`}
                >
                  <option value={Intl.DateTimeFormat().resolvedOptions().timeZone}>
                    {Intl.DateTimeFormat().resolvedOptions().timeZone}
                  </option>
                  <option value="UTC">UTC</option>
                  <option value="America/New_York">Eastern Time</option>
                  <option value="America/Los_Angeles">Pacific Time</option>
                  <option value="Europe/London">London</option>
                  <option value="Asia/Kolkata">India (IST)</option>
                  <option value="Asia/Tokyo">Tokyo</option>
                </select>
              </div>
              
              {[
                { key: 'autoStartBreaks', label: 'Auto-start breaks' },
                { key: 'soundEnabled', label: 'Enable sound effects' },
                { key: 'vibrationEnabled', label: 'Enable vibration (mobile)' }
              ].map(item => (
                <label key={item.key} className="flex items-center justify-between cursor-pointer">
                  <div className={`text-sm font-medium ${textHeading}`}>{item.label}</div>
                  <Toggle
                    checked={settings.preferences[item.key as keyof typeof settings.preferences] as boolean}
                    onChange={(val) => {
                      updateSettings('preferences', item.key, val);
                      saveSettings();
                    }}
                  />
                </label>
              ))}
            </div>
          </div>

          {/* Account */}
          <div className={`${cardBg} border rounded-xl p-6`}>
            <h3 className={`text-lg font-semibold ${textHeading} mb-4 flex items-center gap-2`}>
              <User size={20} />
              Account
            </h3>
            
            <div className="space-y-4">
              <div className={`flex items-center justify-between p-3 ${itemBg} rounded-xl`}>
                <div>
                  <div className={`text-sm font-medium ${textHeading}`}>Email</div>
                  <div className={`text-xs ${textMuted}`}>{user?.email || 'Not set'}</div>
                </div>
                <Mail size={16} className={textMuted} />
              </div>
              
              <button
                onClick={() => setShowPasswordForm(!showPasswordForm)}
                className={`w-full flex items-center justify-between p-3 ${itemBg} rounded-xl hover:opacity-80 transition-opacity`}
              >
                <div className={`text-sm font-medium ${textHeading}`}>Change Password</div>
                <Lock size={16} className={textMuted} />
              </button>
              
              {showPasswordForm && (
                <form onSubmit={handlePasswordChange} className={`space-y-3 p-4 ${itemBg} rounded-xl`}>
                  <input
                    type="password"
                    placeholder="Current Password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className={`w-full ${inputBg} border rounded-xl px-3 py-2`}
                    required
                  />
                  <input
                    type="password"
                    placeholder="New Password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className={`w-full ${inputBg} border rounded-xl px-3 py-2`}
                    required
                  />
                  <input
                    type="password"
                    placeholder="Confirm New Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={`w-full ${inputBg} border rounded-xl px-3 py-2`}
                    required
                  />
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className={`flex-1 ${isDark ? 'bg-white text-black hover:bg-zinc-200' : 'bg-zinc-900 text-white hover:bg-zinc-800'} py-2 rounded-xl font-medium transition-colors`}
                    >
                      Update Password
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowPasswordForm(false)}
                      className={`flex-1 ${isDark ? 'bg-zinc-700 text-white hover:bg-zinc-600' : 'bg-gray-200 text-zinc-900 hover:bg-gray-300'} py-2 rounded-xl font-medium transition-colors`}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>

          {/* Data Management */}
          <div className={`${cardBg} border rounded-xl p-6`}>
            <h3 className={`text-lg font-semibold ${textHeading} mb-4 flex items-center gap-2`}>
              <Download size={20} />
              Data Management
            </h3>
            
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={exportData}
                  className={`flex-1 flex items-center justify-center gap-2 ${isDark ? 'bg-zinc-800 border-zinc-700 text-white hover:bg-zinc-700' : 'bg-gray-100 border-gray-300 text-zinc-900 hover:bg-gray-200'} border px-4 py-2 rounded-xl transition-colors`}
                >
                  <Download size={16} />
                  Export Data
                </button>
                
                <label className={`flex-1 flex items-center justify-center gap-2 ${isDark ? 'bg-zinc-800 border-zinc-700 text-white hover:bg-zinc-700' : 'bg-gray-100 border-gray-300 text-zinc-900 hover:bg-gray-200'} border px-4 py-2 rounded-xl transition-colors cursor-pointer`}>
                  <Upload size={16} />
                  Import Data
                  <input
                    type="file"
                    accept=".json"
                    onChange={importData}
                    className="hidden"
                  />
                </label>
              </div>
              
              <div className={`flex items-center justify-between p-3 ${itemBg} rounded-xl`}>
                <div>
                  <div className={`text-sm font-medium ${textHeading}`}>Auto Backup</div>
                  <div className={`text-xs ${textMuted}`}>Automatically backup your data</div>
                </div>
                <Toggle
                  checked={settings.data.autoBackup}
                  onChange={(val) => {
                    updateSettings('data', 'autoBackup', val);
                    saveSettings();
                  }}
                />
              </div>
              
              <button
                onClick={clearAllData}
                className="w-full flex items-center justify-center gap-2 bg-red-500/10 border border-red-500/30 text-red-500 px-4 py-2 rounded-xl hover:bg-red-500/20 transition-colors"
              >
                <Trash2 size={16} />
                Clear All Data
              </button>
            </div>
          </div>

          {/* About */}
          <div className={`${cardBg} border rounded-xl p-6`}>
            <h3 className={`text-lg font-semibold ${textHeading} mb-4 flex items-center gap-2`}>
              <Info size={20} />
              About Zenith
            </h3>
            
            <div className={`space-y-3 text-sm ${textMuted}`}>
              <div className="flex justify-between">
                <span>Version</span>
                <span>1.0.0</span>
              </div>
              <div className="flex justify-between">
                <span>Last Updated</span>
                <span>{mounted ? new Date().toLocaleDateString() : ''}</span>
              </div>
              <div className={`pt-3 border-t ${isDark ? 'border-zinc-800' : 'border-gray-200'}`}>
                <p className="text-center">
                  A productivity suite designed to help you master your time and achieve your goals.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>
    </Sidebar>
  );
}
