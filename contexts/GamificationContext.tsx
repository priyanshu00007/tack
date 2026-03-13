"use client"
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface Rank {
  name: string;
  level: number;
  minXP: number;
  maxXP: number;
  color: string;
  icon: string;
}

interface UserStats {
  totalXP: number;
  currentLevelXP: number;
  tasksCompleted: number;
  focusMinutes: number;
  streakDays: number;
  lastActiveDate: string;
  rank: Rank;
  achievements: Achievement[];
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt: string;
  xpReward: number;
}

interface GamificationContextType {
  userStats: UserStats;
  addXP: (amount: number, source: string) => void;
  completeTask: (taskId: string, estimatedTime: number, actualTime: number) => void;
  completeFocusSession: (duration: number) => void;
  updateStreak: () => void;
  getRankProgress: () => number;
  getNextRank: () => Rank | null;
  checkAchievements: () => void;
}

const RANKS: Rank[] = [
  { name: 'Bronze I', level: 1, minXP: 0, maxXP: 100, color: '#CD7F32', icon: '🥉' },
  { name: 'Bronze II', level: 2, minXP: 100, maxXP: 250, color: '#CD7F32', icon: '🥉' },
  { name: 'Bronze III', level: 3, minXP: 250, maxXP: 500, color: '#CD7F32', icon: '🥉' },
  { name: 'Silver I', level: 4, minXP: 500, maxXP: 1000, color: '#C0C0C0', icon: '🥈' },
  { name: 'Silver II', level: 5, minXP: 1000, maxXP: 1750, color: '#C0C0C0', icon: '🥈' },
  { name: 'Silver III', level: 6, minXP: 1750, maxXP: 3000, color: '#C0C0C0', icon: '🥈' },
  { name: 'Gold I', level: 7, minXP: 3000, maxXP: 5000, color: '#FFD700', icon: '🥇' },
  { name: 'Gold II', level: 8, minXP: 5000, maxXP: 7500, color: '#FFD700', icon: '🥇' },
  { name: 'Gold III', level: 9, minXP: 7500, maxXP: 11000, color: '#FFD700', icon: '🥇' },
  { name: 'Platinum I', level: 10, minXP: 11000, maxXP: 15000, color: '#E5E4E2', icon: '💎' },
  { name: 'Platinum II', level: 11, minXP: 15000, maxXP: 20000, color: '#E5E4E2', icon: '💎' },
  { name: 'Platinum III', level: 12, minXP: 20000, maxXP: 30000, color: '#E5E4E2', icon: '💎' },
  { name: 'Diamond I', level: 13, minXP: 30000, maxXP: 45000, color: '#B9F2FF', icon: '💠' },
  { name: 'Diamond II', level: 14, minXP: 45000, maxXP: 65000, color: '#B9F2FF', icon: '💠' },
  { name: 'Diamond III', level: 15, minXP: 65000, maxXP: 100000, color: '#B9F2FF', icon: '💠' },
  { name: 'Master', level: 16, minXP: 100000, maxXP: Infinity, color: '#FF6B35', icon: '👑' },
  { name: 'Grandmaster', level: 17, minXP: 250000, maxXP: Infinity, color: '#FF1744', icon: '🏆' }
];

const ACHIEVEMENTS: Omit<Achievement, 'unlockedAt'>[] = [
  { id: 'first_task', name: 'First Steps', description: 'Complete your first task', icon: '🎯', xpReward: 10 },
  { id: 'week_streak', name: 'Week Warrior', description: 'Maintain a 7-day streak', icon: '🔥', xpReward: 50 },
  { id: 'month_streak', name: 'Monthly Champion', description: 'Maintain a 30-day streak', icon: '🏅', xpReward: 200 },
  { id: 'focus_novice', name: 'Focus Novice', description: 'Complete 10 focus sessions', icon: '🧘', xpReward: 30 },
  { id: 'focus_master', name: 'Focus Master', description: 'Complete 100 focus sessions', icon: '🎯', xpReward: 150 },
  { id: 'task_warrior', name: 'Task Warrior', description: 'Complete 100 tasks', icon: '⚔️', xpReward: 100 },
  { id: 'productivity_master', name: 'Productivity Master', description: 'Complete 1000 tasks', icon: '🏆', xpReward: 500 },
  { id: 'early_bird', name: 'Early Bird', description: 'Complete 5 tasks before 9 AM', icon: '🌅', xpReward: 25 },
  { id: 'night_owl', name: 'Night Owl', description: 'Complete 5 tasks after 9 PM', icon: '🌙', xpReward: 25 },
  { id: 'perfect_week', name: 'Perfect Week', description: 'Complete all planned tasks for a week', icon: '✨', xpReward: 100 }
];

const GamificationContext = createContext<GamificationContextType | undefined>(undefined);

export const useGamification = () => {
  const context = useContext(GamificationContext);
  if (context === undefined) {
    throw new Error('useGamification must be used within a GamificationProvider');
  }
  return context;
};

interface GamificationProviderProps {
  children: ReactNode;
}

export const GamificationProvider: React.FC<GamificationProviderProps> = ({ children }) => {
  const [userStats, setUserStats] = useState<UserStats>(() => {
    // Return default state during SSR
    return {
      totalXP: 0,
      currentLevelXP: 0,
      tasksCompleted: 0,
      focusMinutes: 0,
      streakDays: 0,
      lastActiveDate: new Date().toDateString(),
      rank: RANKS[0],
      achievements: []
    };
  });

  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    // Load from localStorage only after hydration
    const saved = localStorage.getItem('zenith_gamification');
    if (saved) {
      const parsed = JSON.parse(saved);
      setUserStats({
        ...parsed,
        lastActiveDate: parsed.lastActiveDate || new Date().toDateString()
      });
    }
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    // Save to localStorage whenever stats change, but only after hydration
    if (isHydrated) {
      localStorage.setItem('zenith_gamification', JSON.stringify(userStats));
    }
  }, [userStats, isHydrated]);

  const getCurrentRank = (xp: number): Rank => {
    return RANKS.find(rank => xp >= rank.minXP && xp < rank.maxXP) || RANKS[RANKS.length - 1];
  };

  const addXP = (amount: number, source: string) => {
    setUserStats(prev => {
      const newTotalXP = prev.totalXP + amount;
      const newRank = getCurrentRank(newTotalXP);
      
      return {
        ...prev,
        totalXP: newTotalXP,
        currentLevelXP: newTotalXP - newRank.minXP,
        rank: newRank
      };
    });
  };

  const calculateTaskXP = (estimatedTime: number, actualTime: number): number => {
    const baseXP = 10;
    const timeBonus = Math.max(0, Math.min(20, (estimatedTime - actualTime) / estimatedTime * 20));
    const difficultyMultiplier = Math.min(2, 1 + (estimatedTime / 60)); // Max 2x for 1hr+ tasks
    
    // Apply rank-based scaling (higher ranks get less XP per task)
    const rankScaling = Math.max(0.5, 1 - (userStats.rank.level - 1) * 0.05);
    
    return Math.round((baseXP + timeBonus) * difficultyMultiplier * rankScaling);
  };

  const completeTask = (taskId: string, estimatedTime: number, actualTime: number) => {
    const xpGained = calculateTaskXP(estimatedTime, actualTime);
    addXP(xpGained, `Task: ${taskId}`);
    
    setUserStats(prev => ({
      ...prev,
      tasksCompleted: prev.tasksCompleted + 1
    }));
    
    checkAchievements();
  };

  const calculateFocusXP = (duration: number): number => {
    const baseXP = 5;
    const durationBonus = Math.min(15, duration / 60 * 10); // Max 15 XP for 1hr+
    
    // Apply rank-based scaling
    const rankScaling = Math.max(0.5, 1 - (userStats.rank.level - 1) * 0.03);
    
    return Math.round((baseXP + durationBonus) * rankScaling);
  };

  const completeFocusSession = (duration: number) => {
    const xpGained = calculateFocusXP(duration);
    addXP(xpGained, `Focus: ${duration} minutes`);
    
    setUserStats(prev => ({
      ...prev,
      focusMinutes: prev.focusMinutes + duration
    }));
    
    checkAchievements();
  };

  const updateStreak = () => {
    const today = new Date().toDateString();
    const lastActive = new Date(userStats.lastActiveDate).toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    
    setUserStats(prev => {
      let newStreak = prev.streakDays;
      
      if (today === lastActive) {
        // Already updated today
        return prev;
      } else if (yesterday === lastActive) {
        // Consecutive day
        newStreak += 1;
      } else {
        // Streak broken
        newStreak = 1;
      }
      
      return {
        ...prev,
        streakDays: newStreak,
        lastActiveDate: today
      };
    });
    
    checkAchievements();
  };

  const getRankProgress = (): number => {
    const { rank, totalXP } = userStats;
    const progress = totalXP - rank.minXP;
    const total = rank.maxXP - rank.minXP;
    return total === Infinity ? 100 : (progress / total) * 100;
  };

  const getNextRank = (): Rank | null => {
    const currentIndex = RANKS.findIndex(r => r.level === userStats.rank.level);
    return currentIndex < RANKS.length - 1 ? RANKS[currentIndex + 1] : null;
  };

  const checkAchievements = () => {
    const newAchievements: Achievement[] = [];
    
    ACHIEVEMENTS.forEach(achievement => {
      const alreadyUnlocked = userStats.achievements.some(a => a.id === achievement.id);
      if (alreadyUnlocked) return;
      
      let shouldUnlock = false;
      
      switch (achievement.id) {
        case 'first_task':
          shouldUnlock = userStats.tasksCompleted >= 1;
          break;
        case 'week_streak':
          shouldUnlock = userStats.streakDays >= 7;
          break;
        case 'month_streak':
          shouldUnlock = userStats.streakDays >= 30;
          break;
        case 'focus_novice':
          shouldUnlock = userStats.focusMinutes >= 600; // 10 sessions of 1hr
          break;
        case 'focus_master':
          shouldUnlock = userStats.focusMinutes >= 6000; // 100 sessions of 1hr
          break;
        case 'task_warrior':
          shouldUnlock = userStats.tasksCompleted >= 100;
          break;
        case 'productivity_master':
          shouldUnlock = userStats.tasksCompleted >= 1000;
          break;
        // Add more achievement checks as needed
      }
      
      if (shouldUnlock) {
        newAchievements.push({
          ...achievement,
          unlockedAt: new Date().toISOString()
        });
        addXP(achievement.xpReward, `Achievement: ${achievement.name}`);
      }
    });
    
    if (newAchievements.length > 0) {
      setUserStats(prev => ({
        ...prev,
        achievements: [...prev.achievements, ...newAchievements]
      }));
    }
  };

  const value: GamificationContextType = {
    userStats,
    addXP,
    completeTask,
    completeFocusSession,
    updateStreak,
    getRankProgress,
    getNextRank,
    checkAchievements
  };

  return (
    <GamificationContext.Provider value={value}>
      {children}
    </GamificationContext.Provider>
  );
};
