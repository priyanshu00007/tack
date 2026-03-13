"use client"
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  User, 
  Mail, 
  Calendar, 
  Award, 
  TrendingUp, 
  LogOut,
  Edit,
  Camera,
  MapPin,
  Link as LinkIcon,
  Activity,
  Check,
  Wifi,
  WifiOff,
  Save,
  Trophy,
  Star,
  ArrowLeft,
  Shield
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useGamification } from '../../contexts/GamificationContext';
import { useTheme } from '../../contexts/ThemeContext';
import { offlineSyncService } from '../../lib/offlineSync';
import Sidebar from '../../components/Sidebar';

interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatar?: string;
  bio?: string;
  location?: string;
  website?: string;
  timezone?: string;
  joinDate?: string;
  isPublic?: boolean;
}

export default function ProfilePage() {
  const router = useRouter();
  const { user, logout, isOnline: authOnline } = useAuth();
  const { userStats, getRankProgress, getNextRank } = useGamification();
  const { isDark } = useTheme();
  
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<UserProfile>>({});
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [isSaving, setIsSaving] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'synced' | 'error'>('idle');

  // Initialize service and listen for online/offline events
  useEffect(() => {
    offlineSyncService.init().catch(console.error);
    
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Load profile from auth context and localStorage
  useEffect(() => {
    if (!user) return;

    // Try to load from offline storage first
    const offlineProfile = localStorage.getItem('zenith_offline_profile');
    const savedProfile = localStorage.getItem('zenith_profile');
    
    let profileData: UserProfile;
    
    if (savedProfile) {
      profileData = JSON.parse(savedProfile);
    } else if (offlineProfile) {
      const parsed = JSON.parse(offlineProfile);
      profileData = {
        id: parsed.id || user.id,
        firstName: parsed.firstName || user.firstName || '',
        lastName: parsed.lastName || user.lastName || '',
        email: parsed.email || user.email,
        avatar: parsed.avatar || user.avatar,
        timezone: parsed.timezone || user.timezone,
        joinDate: parsed.createdAt || user.createdAt || new Date().toISOString(),
      };
    } else {
      profileData = {
        id: user.id || user.email,
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email,
        avatar: user.avatar,
        timezone: user.timezone,
        joinDate: user.createdAt || new Date().toISOString(),
      };
    }

    setProfile(profileData);
    if (!savedProfile) {
      localStorage.setItem('zenith_profile', JSON.stringify(profileData));
    }
  }, [user]);

  const handleSaveProfile = async () => {
    if (!profile) return;
    
    setIsSaving(true);
    setSyncStatus('syncing');

    try {
      const updatedProfile = { ...profile, ...editForm };
      setProfile(updatedProfile);
      localStorage.setItem('zenith_profile', JSON.stringify(updatedProfile));

      // Save to offline storage queue
      await offlineSyncService.saveLocal(
        profile.id,
        'profile',
        updatedProfile
      );

      // Try to sync if online
      if (isOnline) {
        const token = localStorage.getItem('zenith_access_token');
        if (token) {
          const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
          try {
            const response = await fetch(`${API_BASE_URL}/users/profile`, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify(updatedProfile),
            });

            if (response.ok) {
              await offlineSyncService.markAsSynced(profile.id);
              setSyncStatus('synced');
            } else {
              setSyncStatus('synced'); // Still mark as locally saved
            }
          } catch {
            setSyncStatus('synced'); // Saved locally even if sync fails
          }
        } else {
          setSyncStatus('synced'); // Just local save
        }
      } else {
        setSyncStatus('synced');
      }

      setIsEditing(false);
      setEditForm({});
    } catch (error) {
      console.error('Failed to save profile:', error);
      setSyncStatus('error');
    } finally {
      setIsSaving(false);
      setTimeout(() => setSyncStatus('idle'), 3000);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (profile) {
          const updatedProfile = { ...profile, avatar: reader.result as string };
          setProfile(updatedProfile);
          setEditForm({ ...editForm, avatar: reader.result as string });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const nextRank = getNextRank();
  const rankProgress = getRankProgress();

  // Theme-driven colors
  const bg = isDark ? 'bg-black' : 'bg-white';
  const text = isDark ? 'text-zinc-200' : 'text-zinc-900';
  const textHeading = isDark ? 'text-white' : 'text-zinc-900';
  const textMuted = isDark ? 'text-zinc-500' : 'text-zinc-600';
  const textSecondary = isDark ? 'text-zinc-400' : 'text-zinc-600';
  const surface = isDark ? 'bg-zinc-900' : 'bg-gray-50';
  const border = isDark ? 'border-zinc-800' : 'border-gray-200';
  const inputBg = isDark ? 'bg-zinc-800 border-zinc-700 text-white' : 'bg-white border-gray-300 text-zinc-900';
  const cardBg = isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-gray-200 shadow-sm';
  const accentBg = isDark ? 'bg-white text-black hover:bg-zinc-200' : 'bg-zinc-900 text-white hover:bg-zinc-800';
  const accentInverse = isDark ? 'bg-zinc-900 border-zinc-800 text-white hover:bg-zinc-800' : 'bg-gray-100 border-gray-300 text-zinc-900 hover:bg-gray-200';
  const progressTrack = isDark ? 'bg-zinc-800' : 'bg-gray-200';
  const avatarBorder = isDark ? 'border-zinc-800' : 'border-gray-200';
  const avatarDefault = isDark ? 'bg-white text-black' : 'bg-zinc-900 text-white';

  if (!user || !profile) {
    return (
      <Sidebar>
        <div className={`flex items-center justify-center pt-32 ${text}`}>
          <div className="text-center">
            <div className={`w-12 h-12 ${avatarDefault} rounded-full flex items-center justify-center mx-auto mb-4`}>
              <span className="font-bold font-serif text-2xl">Z</span>
            </div>
            <p className={textMuted}>Loading profile...</p>
            <button
              onClick={() => router.push('/login')}
              className={`mt-4 px-4 py-2 rounded-lg text-sm transition-colors ${accentBg}`}
            >
              Sign In
            </button>
          </div>
        </div>
      </Sidebar>
    );
  }

  return (
    <Sidebar>
      <div className={text}>
        <div className="max-w-5xl mx-auto p-6">

        {/* Online/Offline Status */}
        <div className="mb-6 flex items-center gap-2">
          {isOnline ? (
            <>
              <Wifi size={16} className="text-emerald-500" />
              <span className="text-sm text-emerald-500">Connected — changes sync automatically</span>
            </>
          ) : (
            <>
              <WifiOff size={16} className="text-amber-500" />
              <span className="text-sm text-amber-500">Offline — changes saved locally, will sync when online</span>
            </>
          )}
        </div>

        {/* Sync Status Toasts */}
        {syncStatus === 'synced' && (
          <div className="mb-6 flex items-center gap-2 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-500">
            <Check size={16} />
            <span className="text-sm">Profile saved successfully</span>
          </div>
        )}
        {syncStatus === 'error' && (
          <div className="mb-6 flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-500">
            <span className="text-sm">Save error — will retry when online</span>
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className={`text-3xl font-serif ${textHeading} mb-2`}>Profile</h1>
            <p className={textMuted}>Manage your personal information</p>
          </div>
          <div className="flex gap-3 mt-4 md:mt-0">
            {isEditing && (
              <button
                onClick={handleSaveProfile}
                disabled={isSaving}
                className={`flex items-center gap-2 ${accentBg} px-4 py-2 rounded-lg transition-colors disabled:opacity-50`}
              >
                <Save size={16} />
                {isSaving ? 'Saving...' : 'Save'}
              </button>
            )}
            <button
              onClick={() => { setIsEditing(!isEditing); if (isEditing) setEditForm({}); }}
              className={`flex items-center gap-2 border px-4 py-2 rounded-lg transition-colors ${accentInverse}`}
            >
              <Edit size={16} />
              {isEditing ? 'Cancel' : 'Edit'}
            </button>
            <button
              onClick={() => { logout(); router.push('/login'); }}
              className="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors bg-red-500/10 border border-red-500/30 text-red-500 hover:bg-red-500/20"
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <div className={`${cardBg} border rounded-xl p-6`}>
              {/* Avatar */}
              <div className="flex flex-col items-center mb-6">
                <div className="relative">
                  {profile.avatar ? (
                    <img
                      src={profile.avatar}
                      alt={profile.firstName}
                      className={`w-24 h-24 rounded-full object-cover border-4 ${avatarBorder}`}
                    />
                  ) : (
                    <div className={`w-24 h-24 ${avatarDefault} rounded-full flex items-center justify-center text-3xl font-serif font-bold`}>
                      {profile.firstName?.[0]?.toUpperCase() || 'Z'}
                    </div>
                  )}
                  {isEditing && (
                    <label className={`absolute bottom-0 right-0 ${avatarDefault} p-2 rounded-full cursor-pointer hover:opacity-80 transition-opacity shadow-lg`}>
                      <Camera size={16} />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarUpload}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
                
                {isEditing ? (
                  <div className="mt-4 w-full space-y-2">
                    <input
                      type="text"
                      value={editForm.firstName ?? profile.firstName}
                      onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
                      placeholder="First Name"
                      className={`w-full px-3 py-2 rounded-lg ${inputBg} border text-sm`}
                    />
                    <input
                      type="text"
                      value={editForm.lastName ?? profile.lastName}
                      onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })}
                      placeholder="Last Name"
                      className={`w-full px-3 py-2 rounded-lg ${inputBg} border text-sm`}
                    />
                  </div>
                ) : (
                  <h2 className={`mt-4 text-xl font-bold text-center ${textHeading}`}>
                    {profile.firstName} {profile.lastName}
                  </h2>
                )}
                
                <p className={`${textMuted} text-center flex items-center gap-2 mt-2 text-sm`}>
                  <Mail size={14} />
                  {profile.email || 'No email set'}
                </p>

                {user.provider && (
                  <span className={`mt-2 text-xs px-3 py-1 rounded-full ${
                    user.provider === 'google' 
                      ? 'bg-blue-500/10 text-blue-500 border border-blue-500/30' 
                      : isDark ? 'bg-zinc-800 text-zinc-400' : 'bg-gray-100 text-zinc-600'
                  }`}>
                    {user.provider === 'google' ? '🔗 Google Account' : '📱 Local Account'}
                  </span>
                )}
              </div>

              {/* Profile Fields */}
              <div className="space-y-4">
                {isEditing ? (
                  <>
                    <div>
                      <label className={`block text-xs uppercase mb-1 ${textMuted}`}>Bio</label>
                      <textarea
                        value={editForm.bio ?? profile.bio ?? ''}
                        onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                        className={`w-full rounded-lg px-3 py-2 text-sm resize-none border ${inputBg}`}
                        rows={3}
                        placeholder="Tell us about yourself..."
                      />
                    </div>
                    <div>
                      <label className={`block text-xs uppercase mb-1 ${textMuted}`}>Location</label>
                      <input
                        type="text"
                        value={editForm.location ?? profile.location ?? ''}
                        onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                        className={`w-full rounded-lg px-3 py-2 text-sm border ${inputBg}`}
                        placeholder="City, Country"
                      />
                    </div>
                    <div>
                      <label className={`block text-xs uppercase mb-1 ${textMuted}`}>Website</label>
                      <input
                        type="url"
                        value={editForm.website ?? profile.website ?? ''}
                        onChange={(e) => setEditForm({ ...editForm, website: e.target.value })}
                        className={`w-full rounded-lg px-3 py-2 text-sm border ${inputBg}`}
                        placeholder="https://yourwebsite.com"
                      />
                    </div>
                  </>
                ) : (
                  <>
                    {profile.bio && (
                      <div>
                        <p className={`text-sm ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`}>{profile.bio}</p>
                      </div>
                    )}
                    
                    <div className="space-y-2 text-sm">
                      {profile.location && (
                        <div className={`flex items-center gap-2 ${textSecondary}`}>
                          <MapPin size={14} />
                          {profile.location}
                        </div>
                      )}
                      {profile.website && (
                        <div className={`flex items-center gap-2 ${textSecondary}`}>
                          <LinkIcon size={14} />
                          <a
                            href={profile.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`hover:underline ${isDark ? 'hover:text-white' : 'hover:text-black'}`}
                          >
                            {profile.website.replace(/^https?:\/\//, '')}
                          </a>
                        </div>
                      )}
                      {profile.joinDate && (
                        <div className={`flex items-center gap-2 ${textSecondary}`}>
                          <Calendar size={14} />
                          Joined {new Date(profile.joinDate).toLocaleDateString()}
                        </div>
                      )}
                      {profile.timezone && (
                        <div className={`flex items-center gap-2 ${textSecondary}`}>
                          <Activity size={14} />
                          {profile.timezone}
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Stats Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Rank Progress */}
            <div className={`${cardBg} border rounded-xl p-6`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className={`text-lg font-semibold ${textHeading}`}>Rank Progress</h3>
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{userStats.rank.icon}</span>
                  <div>
                    <div className={`text-sm font-medium ${textHeading}`}>{userStats.rank.name}</div>
                    <div className={`text-xs ${textMuted}`}>Level {userStats.rank.level}</div>
                  </div>
                </div>
              </div>
              
              <div>
                <div className={`flex justify-between text-sm mb-2 ${textSecondary}`}>
                  <span>Progress</span>
                  <span>
                    {userStats.totalXP.toLocaleString()} / {nextRank ? nextRank.minXP.toLocaleString() : '∞'} XP
                  </span>
                </div>
                <div className={`h-3 rounded-full overflow-hidden ${progressTrack}`}>
                  <div
                    className="h-full transition-all duration-500 rounded-full"
                    style={{
                      width: `${rankProgress}%`,
                      backgroundColor: userStats.rank.color
                    }}
                  />
                </div>
                {nextRank && (
                  <div className={`text-sm mt-2 ${textMuted}`}>
                    Next: {nextRank.name} ({nextRank.icon}) — {(nextRank.minXP - userStats.totalXP).toLocaleString()} XP to go
                  </div>
                )}
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { icon: '🎯', value: userStats.tasksCompleted, label: 'Tasks Done' },
                { icon: '⏰', value: `${Math.floor(userStats.focusMinutes / 60)}h`, label: 'Focus Time' },
                { icon: '🔥', value: userStats.streakDays, label: 'Day Streak' },
                { icon: '⚡', value: userStats.totalXP.toLocaleString(), label: 'Total XP' },
              ].map((stat) => (
                <div key={stat.label} className={`${cardBg} border rounded-xl p-4 text-center`}>
                  <div className="text-2xl mb-2">{stat.icon}</div>
                  <div className={`text-xl font-bold ${textHeading}`}>{stat.value}</div>
                  <div className={`text-xs ${textMuted}`}>{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Recent Achievements */}
            <div className={`${cardBg} border rounded-xl p-6`}>
              <h3 className={`text-lg font-semibold ${textHeading} mb-4 flex items-center gap-2`}>
                <Trophy size={20} />
                Recent Achievements
              </h3>
              
              {userStats.achievements.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {userStats.achievements.slice(-4).reverse().map((achievement) => (
                    <div key={achievement.id} className={`${isDark ? 'bg-zinc-800 border-zinc-700' : 'bg-gray-50 border-gray-200'} border rounded-lg p-4`}>
                      <div className="flex items-start gap-3">
                        <div className="text-2xl">{achievement.icon}</div>
                        <div className="flex-1">
                          <h4 className={`font-medium ${textHeading} text-sm`}>{achievement.name}</h4>
                          <p className={`text-xs ${textMuted} mt-1`}>{achievement.description}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-xs text-emerald-500">+{achievement.xpReward} XP</span>
                            <span className={`text-xs ${textMuted}`}>
                              {new Date(achievement.unlockedAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className={`text-center py-8 ${textMuted}`}>
                  <Star size={48} className="mx-auto mb-4 opacity-30" />
                  <p>No achievements yet. Start completing tasks to unlock them!</p>
                </div>
              )}
            </div>

            {/* Performance Overview */}
            <div className={`${cardBg} border rounded-xl p-6`}>
              <h3 className={`text-lg font-semibold ${textHeading} mb-4 flex items-center gap-2`}>
                <TrendingUp size={20} />
                Performance Overview
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className={`text-3xl font-bold ${textHeading} mb-2`}>
                    {userStats.tasksCompleted > 0 ? Math.round((userStats.tasksCompleted / Math.max(1, userStats.tasksCompleted + 10)) * 100) : 0}%
                  </div>
                  <div className={`text-sm ${textMuted}`}>Task Completion Rate</div>
                </div>
                
                <div className="text-center">
                  <div className={`text-3xl font-bold ${textHeading} mb-2`}>
                    {userStats.focusMinutes > 0 ? Math.round(userStats.focusMinutes / 60) : 0}
                  </div>
                  <div className={`text-sm ${textMuted}`}>Hours of Focus</div>
                </div>
                
                <div className="text-center">
                  <div className={`text-3xl font-bold ${textHeading} mb-2`}>
                    {userStats.streakDays > 0 ? Math.min(100, userStats.streakDays * 5) : 0}%
                  </div>
                  <div className={`text-sm ${textMuted}`}>Consistency Score</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>
    </Sidebar>
  );
}
