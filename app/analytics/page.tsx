"use client"
import React, { useState, useEffect, useMemo } from 'react';
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { 
  Calendar, 
  TrendingUp, 
  Target, 
  Clock, 
  Award, 
  Zap,
  Filter,
  Download,
  RefreshCw
} from 'lucide-react';
import { useGamification } from '../../contexts/GamificationContext';
import { useTheme } from '../../contexts/ThemeContext';
import Sidebar from '../../components/Sidebar';

interface AnalyticsData {
  weeklyData: any[];
  monthlyData: any[];
  yearlyData: any[];
  taskDistribution: any[];
  focusSessions: any[];
  productivityTrends: any[];
}

export default function AnalyticsPage() {
  const { userStats } = useGamification();
  const { isDark } = useTheme();
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('month');
  const [isLoading, setIsLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);

  // Generate mock data for demonstration
  useEffect(() => {
    const generateAnalyticsData = (): AnalyticsData => {
      const today = new Date();
      
      // Weekly data (last 7 days)
      const weeklyData = Array.from({ length: 7 }, (_, i) => {
        const date = new Date(today);
        date.setDate(date.getDate() - (6 - i));
        return {
          date: date.toLocaleDateString('en', { weekday: 'short' }),
          tasksCompleted: Math.floor(Math.random() * 8) + 2,
          focusMinutes: Math.floor(Math.random() * 120) + 30,
          xpGained: Math.floor(Math.random() * 50) + 10,
          productivity: Math.floor(Math.random() * 30) + 70
        };
      });

      // Monthly data (last 30 days)
      const monthlyData = Array.from({ length: 30 }, (_, i) => {
        const date = new Date(today);
        date.setDate(date.getDate() - (29 - i));
        return {
          date: date.getDate(),
          tasksCompleted: Math.floor(Math.random() * 10) + 1,
          focusMinutes: Math.floor(Math.random() * 180) + 20,
          xpGained: Math.floor(Math.random() * 80) + 5,
          consistency: Math.random() > 0.3 ? 1 : 0
        };
      });

      // Yearly data (last 12 months)
      const monthlyNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const yearlyData = monthlyNames.map((month, i) => ({
        month,
        tasksCompleted: Math.floor(Math.random() * 200) + 50,
        focusMinutes: Math.floor(Math.random() * 3000) + 1000,
        xpGained: Math.floor(Math.random() * 2000) + 500,
        streakDays: Math.floor(Math.random() * 20) + 5
      }));

      // Task distribution by quadrant
      const taskDistribution = [
        { name: 'Important & Urgent', value: Math.floor(Math.random() * 30) + 10, color: '#ef4444' },
        { name: 'Important, Not Urgent', value: Math.floor(Math.random() * 40) + 20, color: '#3b82f6' },
        { name: 'Not Important, Urgent', value: Math.floor(Math.random() * 20) + 5, color: '#f59e0b' },
        { name: 'Not Important, Not Urgent', value: Math.floor(Math.random() * 15) + 2, color: '#6b7280' }
      ];

      // Focus sessions by duration
      const focusSessions = [
        { duration: '15-30 min', sessions: Math.floor(Math.random() * 20) + 10 },
        { duration: '30-45 min', sessions: Math.floor(Math.random() * 30) + 15 },
        { duration: '45-60 min', sessions: Math.floor(Math.random() * 25) + 12 },
        { duration: '60+ min', sessions: Math.floor(Math.random() * 15) + 5 }
      ];

      // Productivity trends
      const productivityTrends = Array.from({ length: 12 }, (_, i) => ({
        month: monthlyNames[i],
        productivity: Math.floor(Math.random() * 20) + 75,
        efficiency: Math.floor(Math.random() * 15) + 80,
        consistency: Math.floor(Math.random() * 25) + 70
      }));

      return {
        weeklyData,
        monthlyData,
        yearlyData,
        taskDistribution,
        focusSessions,
        productivityTrends
      };
    };

    // Simulate loading
    setTimeout(() => {
      setAnalyticsData(generateAnalyticsData());
      setIsLoading(false);
    }, 1000);
  }, []);

  const chartColors = {
    primary: isDark ? '#ffffff' : '#000000',
    secondary: isDark ? '#71717a' : '#6b7280',
    accent: isDark ? '#3b82f6' : '#3b82f6',
    success: isDark ? '#10b981' : '#10b981',
    warning: isDark ? '#f59e0b' : '#f59e0b',
    danger: isDark ? '#ef4444' : '#ef4444'
  };

  const exportData = () => {
    if (!analyticsData) return;
    
    const dataStr = JSON.stringify(analyticsData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `zenith-analytics-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  if (isLoading) {
    return (
      <Sidebar>
        <div className="flex h-full items-center justify-center pt-24">
          <div className="text-center text-zinc-200">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4" />
            <p>Loading Analytics...</p>
          </div>
        </div>
      </Sidebar>
    );
  }

  if (!analyticsData) return null;

  return (
    <Sidebar>
      <div className="text-zinc-200 max-w-7xl mx-auto py-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-serif text-white mb-2">Analytics Dashboard</h1>
            <p className="text-zinc-500">Track your productivity and progress over time</p>
          </div>
          <div className="flex gap-3 mt-4 md:mt-0">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as any)}
              className="bg-zinc-900 border border-zinc-800 text-white px-4 py-2 rounded-lg focus:outline-none focus:border-white"
            >
              <option value="week">Last Week</option>
              <option value="month">Last Month</option>
              <option value="year">Last Year</option>
            </select>
            <button
              onClick={exportData}
              className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 text-white px-4 py-2 rounded-lg hover:bg-zinc-800 transition-colors"
            >
              <Download size={16} />
              Export
            </button>
          </div>
        </div>
        
        {/* Rest of the analytics content continues here */}
        
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <Target className="text-blue-500" size={24} />
              <span className="text-xs text-zinc-500 uppercase">Total</span>
            </div>
            <div className="text-2xl font-bold text-white mb-1">{userStats.tasksCompleted}</div>
            <div className="text-sm text-zinc-500">Tasks Completed</div>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <Clock className="text-green-500" size={24} />
              <span className="text-xs text-zinc-500 uppercase">Total</span>
            </div>
            <div className="text-2xl font-bold text-white mb-1">{Math.floor(userStats.focusMinutes / 60)}h</div>
            <div className="text-sm text-zinc-500">Focus Minutes</div>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <Zap className="text-yellow-500" size={24} />
              <span className="text-xs text-zinc-500 uppercase">Current</span>
            </div>
            <div className="text-2xl font-bold text-white mb-1">{userStats.totalXP.toLocaleString()}</div>
            <div className="text-sm text-zinc-500">XP Points</div>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <Award className="text-purple-500" size={24} />
              <span className="text-xs text-zinc-500 uppercase">Level</span>
            </div>
            <div className="text-2xl font-bold text-white mb-1">{userStats.rank.name}</div>
            <div className="text-sm text-zinc-500">Current Rank</div>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Task Completion Trend */}
          <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-white mb-4">Task Completion Trend</h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={timeRange === 'week' ? analyticsData.weeklyData : timeRange === 'month' ? analyticsData.monthlyData : analyticsData.yearlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey={timeRange === 'year' ? 'month' : timeRange === 'month' ? 'date' : 'date'} stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}
                  labelStyle={{ color: '#f3f4f6' }}
                />
                <Area type="monotone" dataKey="tasksCompleted" stroke={chartColors.accent} fill={chartColors.accent} fillOpacity={0.3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Focus Sessions */}
          <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-white mb-4">Focus Sessions</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analyticsData.focusSessions}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="duration" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}
                  labelStyle={{ color: '#f3f4f6' }}
                />
                <Bar dataKey="sessions" fill={chartColors.success} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Task Distribution */}
          <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-white mb-4">Task Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analyticsData.taskDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {analyticsData.taskDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Productivity Trends */}
          <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-white mb-4">Productivity Trends</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analyticsData.productivityTrends}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="month" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}
                  labelStyle={{ color: '#f3f4f6' }}
                />
                <Legend />
                <Line type="monotone" dataKey="productivity" stroke={chartColors.accent} strokeWidth={2} />
                <Line type="monotone" dataKey="efficiency" stroke={chartColors.success} strokeWidth={2} />
                <Line type="monotone" dataKey="consistency" stroke={chartColors.warning} strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Consistency Heatmap */}
        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-white mb-4">Consistency Heatmap (Last 12 Weeks)</h3>
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: 84 }, (_, i) => {
              const intensity = Math.random();
              const bgColor = intensity > 0.8 ? '#10b981' : intensity > 0.6 ? '#34d399' : intensity > 0.4 ? '#6ee7b7' : intensity > 0.2 ? '#a7f3d0' : '#1f2937';
              return (
                <div
                  key={i}
                  className="aspect-square rounded"
                  style={{ backgroundColor: bgColor }}
                  title={`Day ${i + 1}: ${Math.floor(intensity * 10)} tasks`}
                />
              );
            })}
          </div>
          <div className="flex items-center gap-4 mt-4 text-xs text-zinc-500">
            <span>Less</span>
            <div className="flex gap-1">
              <div className="w-3 h-3 rounded" style={{ backgroundColor: '#1f2937' }} />
              <div className="w-3 h-3 rounded" style={{ backgroundColor: '#a7f3d0' }} />
              <div className="w-3 h-3 rounded" style={{ backgroundColor: '#6ee7b7' }} />
              <div className="w-3 h-3 rounded" style={{ backgroundColor: '#34d399' }} />
              <div className="w-3 h-3 rounded" style={{ backgroundColor: '#10b981' }} />
            </div>
            <span>More</span>
          </div>
        </div>
      </div>
    </Sidebar>
  );
}
