"use client"
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Check, 
  X, 
  Plus, 
  ChevronLeft, 
  ChevronRight, 
  LayoutGrid, 
  Calendar as CalendarIcon, 
  Clock, 
  Activity, 
  Target, 
  Zap, 
  MoreHorizontal, 
  Trash2, 
  Play, 
  Pause, 
  RefreshCw,
  Music,
  CloudRain,
  Maximize2,
  Menu,
  Sun,
  Moon,
  LogOut,
  User,
  Settings,
  BarChart3,
  Trophy,
  User as UserIcon
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme, themes } from '../contexts/ThemeContext';
import { useGamification } from '../contexts/GamificationContext';
import Sidebar from '../components/Sidebar';
// import { RouteGuard } from '../components/RouteGuard'; // DISABLED

/**
 * ZENITH PRODUCTIVITY SUITE
 * A monochrome, award-winning style productivity application.
 * Architecture: React Single File + LocalStorage
 */

// --- TYPES ---
interface Task {
  id: string;
  title: string;
  est: string;
  quadrant: string;
  date: string;
  status: 'active' | 'done';
  note?: string;
}

interface Habit {
  id: string;
  name: string;
  completedDates: string[];
}

interface Goal {
  id: string;
  title: string;
  targetDate: string;
}

// --- UTILS ---

const generateId = () => {
  // Use crypto.randomUUID() for better randomness and avoid hydration issues
  if (typeof window !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID().replace(/-/g, '').substr(0, 9);
  }
  // Fallback for older browsers
  return Math.random().toString(36).substr(2, 9);
};

const formatDate = (date: Date | null): string => {
  if (!date) return 'Loading...';
  // Use UTC to avoid timezone-based hydration issues
  return new Intl.DateTimeFormat('en-US', { 
    weekday: 'long', 
    month: 'long', 
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC'
  }).format(new Date(date));
};

const getDaysInMonth = (month: number, year: number): number => new Date(year, month + 1, 0).getDate();
const getFirstDayOfMonth = (month: number, year: number): number => new Date(year, month, 1).getDay();

// --- COMPONENTS ---

const Button = ({ children, onClick, variant = 'primary', className = '', ...props }: {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  className?: string;
  [key: string]: any;
}) => {
  const baseStyle = "px-4 py-2 text-sm font-medium transition-all duration-300 flex items-center justify-center gap-2";
    const variants: Record<string, string> = {
      primary: "bg-white text-black hover:bg-zinc-200 border border-transparent",
      secondary: "bg-transparent text-zinc-400 border border-zinc-800 hover:border-zinc-500 hover:text-white",
      ghost: "bg-transparent text-zinc-500 hover:text-white hover:bg-zinc-900",
      danger: "bg-red-900/20 text-red-500 border border-red-900/50 hover:bg-red-900/40"
    };

  return (
    <button 
      onClick={onClick} 
      className={`${baseStyle} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

const Input = ({ ...props }) => (
  <input 
    className="w-full bg-zinc-900 border border-zinc-800 text-white px-4 py-3 text-sm focus:outline-none focus:border-white transition-colors placeholder-zinc-600"
    {...props}
  />
);

const Card = ({ children, className = '', title, action }: {
  children: React.ReactNode;
  className?: string;
  title?: React.ReactNode;
  action?: React.ReactNode;
}) => (
  <div className={`bg-black border border-zinc-800 p-6 flex flex-col ${className}`}>
    {(title || action) && (
      <div className="flex justify-between items-center mb-6">
        {title && <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-500">{title}</h3>}
        {action}
      </div>
    )}
    {children}
  </div>
);

const ProgressBar = ({ progress, color = "bg-white" }: {
  progress: number;
  color?: string;
}) => (
  <div className="h-1 w-full bg-zinc-900 overflow-hidden">
    <div 
      className={`h-full ${color} transition-all duration-500 ease-out`} 
      style={{ width: `${Math.max(0, Math.min(100, progress))}%` }} 
    />
  </div>
);

// --- MAIN APPLICATION ---

export default function ZenithProductivity() {
  // --- AUTH & THEME ---
  const router = useRouter();
  const { user, logout } = useAuth();
  const { theme, toggleTheme, isDark } = useTheme();
  
  // --- STATE ---
  const [activeTab, setActiveTab] = useState('planner');
  const [currentDate, setCurrentDate] = useState<Date | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Data State (with basic seed data logic if empty)
  const [tasks, setTasks] = useState<Task[]>([]);
  const [habits, setHabits] = useState<Habit[]>([
    { id: 'h1', name: 'Read 30 mins', completedDates: [] },
    { id: 'h2', name: 'Workout', completedDates: [] }
  ]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  // Load data from localStorage on mount
  useEffect(() => {
    setIsHydrated(true);
    setCurrentDate(new Date());
    
    try {
      const savedTasks = localStorage.getItem('zenith_tasks');
      if (savedTasks) setTasks(JSON.parse(savedTasks) as Task[]);
      
      const savedHabits = localStorage.getItem('zenith_habits');
      if (savedHabits) setHabits(JSON.parse(savedHabits) as Habit[]);
      
      const savedGoals = localStorage.getItem('zenith_goals');
      if (savedGoals) setGoals(JSON.parse(savedGoals) as Goal[]);
    } catch (error) {
      console.error('Error loading from localStorage:', error);
    }
  }, []);

  // Settings
  const [dailyCapacityMinutes, setDailyCapacityMinutes] = useState(480); // 8 hours

  // Effects for Persistence
  useEffect(() => {
    if (tasks.length > 0) localStorage.setItem('zenith_tasks', JSON.stringify(tasks));
  }, [tasks]);
  useEffect(() => {
    if (habits.length > 0) localStorage.setItem('zenith_habits', JSON.stringify(habits));
  }, [habits]);
  useEffect(() => {
    if (goals.length > 0) localStorage.setItem('zenith_goals', JSON.stringify(goals));
  }, [goals]);

  // --- HELPERS ---

  const getTasksForDate = (date: Date | null): Task[] => {
    if (!date) return [];
    const dateStr = date.toDateString();
    return tasks.filter(t => new Date(t.date).toDateString() === dateStr);
  };

  const addTask = (task: Omit<Task, 'id' | 'date' | 'status'>): void => {
    if (!currentDate) return;
    setTasks([...tasks, { ...task, id: generateId(), date: currentDate.toISOString(), status: 'active' }]);
  };

  const updateTask = (id: string, updates: Partial<Task>): void => {
    setTasks(tasks.map(t => t.id === id ? { ...t, ...updates } : t));
  };

  const deleteTask = (id: string): void => {
    setTasks(tasks.filter(t => t.id !== id));
  };

  const navigateDate = (days: number): void => {
    if (!currentDate) return;
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + days);
    setCurrentDate(newDate);
  };

  // --- VIEWS ---

  /* 1. DAY PLANNER VIEW */
  const DayPlanner = () => {
    const dailyTasks = getTasksForDate(currentDate);
    const [newTaskTitle, setNewTaskTitle] = useState('');
    const [newTaskEst, setNewTaskEst] = useState(30);
    const [newTaskQuadrant, setNewTaskQuadrant] = useState('iu');

    // Stats
    const total = dailyTasks.length;
    const done = dailyTasks.filter(t => t.status === 'done').length;
    const progress = total === 0 ? 0 : (done / total) * 100;
    
    const totalEstMinutes = dailyTasks.reduce((acc, t) => acc + (parseInt(t.est) || 0), 0);
    const remainingMinutes = dailyCapacityMinutes - totalEstMinutes;

    const handleAdd = () => {
      if (!newTaskTitle.trim()) return;
      addTask({ 
        title: newTaskTitle, 
        est: String(newTaskEst), 
        quadrant: newTaskQuadrant,
        note: '' 
      });
      setNewTaskTitle('');
    };

    return (
      <div className="space-y-6 animate-fade-in">
        {/* Header / Nav */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-zinc-800 pb-6">
          <div>
            <h2 className="text-3xl font-serif text-white tracking-tight">Day Planner</h2>
            <p className="text-zinc-500 mt-1 font-mono text-sm">{formatDate(currentDate)}</p>
          </div>
          <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-lg p-1">
            <button onClick={() => navigateDate(-1)} className="p-2 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded transition-colors"><ChevronLeft size={16}/></button>
            <button onClick={() => setCurrentDate(new Date())} className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-white hover:bg-zinc-800 rounded mx-1" disabled={!isHydrated}>Today</button>
            <button onClick={() => navigateDate(1)} className="p-2 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded transition-colors"><ChevronRight size={16}/></button>
          </div>
        </div>

        {/* Dashboard Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="col-span-1 md:col-span-2">
            <div className="flex justify-between items-end mb-2">
              <span className="text-4xl font-serif">{Math.round(progress)}%</span>
              <span className="text-xs text-zinc-500 uppercase tracking-widest">Completion</span>
            </div>
            <ProgressBar progress={progress} />
            <div className="flex gap-4 mt-4 text-xs text-zinc-500 font-mono">
              <span>Total: {total}</span>
              <span className="text-white">Done: {done}</span>
              <span>Active: {total - done}</span>
            </div>
          </Card>
          
          <Card className="flex justify-between items-start">
             <div className="text-xs text-zinc-500 uppercase tracking-widest mb-2">Total Estimated</div>
             <div className="text-2xl font-mono text-white">{Math.floor(totalEstMinutes/60)}h {totalEstMinutes%60}m</div>
             <div className="text-xs text-zinc-600 mt-2">Required focus</div>
          </Card>

          <Card className={`flex justify-between items-start border-l-4 ${remainingMinutes < 0 ? 'border-l-red-500' : 'border-l-white'}`}>
             <div className="text-xs text-zinc-500 uppercase tracking-widest mb-2">Remaining Cap</div>
             <div className={`text-2xl font-mono ${remainingMinutes < 0 ? 'text-red-500' : 'text-white'}`}>
               {Math.floor(remainingMinutes/60)}h {remainingMinutes%60}m
             </div>
             <div className="text-xs text-zinc-600 mt-2">Available today</div>
          </Card>
        </div>

        {/* Task Input */}
        <div className="bg-zinc-900/30 border border-zinc-800 p-4 flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1 w-full">
            <label className="text-xs text-zinc-500 uppercase tracking-wider mb-1 block">Task Title</label>
            <Input 
              value={newTaskTitle} 
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewTaskTitle(e.target.value)} 
              placeholder="What needs to be done?" 
              onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => e.key === 'Enter' && handleAdd()}
            />
          </div>
          <div className="w-full md:w-32">
            <label className="text-xs text-zinc-500 uppercase tracking-wider mb-1 block">Est. (Min)</label>
            <Input 
              type="number" 
              value={newTaskEst} 
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewTaskEst(Number(e.target.value))} 
            />
          </div>
          <div className="w-full md:w-48">
            <label className="text-xs text-zinc-500 uppercase tracking-wider mb-1 block">Quadrant</label>
            <select 
              value={newTaskQuadrant}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setNewTaskQuadrant(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 text-white px-4 py-3 text-sm focus:outline-none focus:border-white appearance-none"
            >
              <option value="iu">Important & Urgent</option>
              <option value="ibnu">Imp, Not Urgent</option>
              <option value="nibu">Not Imp, Urgent</option>
              <option value="ninu">Not Imp, Not Urgent</option>
            </select>
          </div>
          <Button onClick={handleAdd} className="w-full md:w-auto h-[46px]">Add Task</Button>
        </div>

        {/* List */}
        <div className="space-y-1">
          {dailyTasks.length === 0 ? (
            <div className="text-center py-20 border border-dashed border-zinc-800 text-zinc-600">
              <p className="font-serif italic text-lg">"The secret of getting ahead is getting started."</p>
              <p className="text-xs mt-2 uppercase tracking-widest">No tasks for today</p>
            </div>
          ) : (
            dailyTasks.map(task => (
              <div key={task.id} className={`group flex items-center justify-between p-4 border border-zinc-800 bg-black transition-all hover:border-zinc-600 ${task.status === 'done' ? 'opacity-50' : ''}`}>
                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => updateTask(task.id, { status: task.status === 'done' ? 'active' : 'done' })}
                    className={`w-5 h-5 border rounded-sm flex items-center justify-center transition-colors ${task.status === 'done' ? 'bg-white border-white' : 'border-zinc-600 hover:border-white'}`}
                  >
                    {task.status === 'done' && <Check size={12} className="text-black" />}
                  </button>
                  <div>
                    <div className={`font-medium ${task.status === 'done' ? 'line-through text-zinc-500' : 'text-white'}`}>
                      {task.title}
                    </div>
                    <div className="text-xs text-zinc-500 flex gap-2 mt-1">
                      <span className="font-mono">{task.est}m</span>
                      <span>•</span>
                      <span className="uppercase">{task.quadrant}</span>
                    </div>
                  </div>
                </div>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                   <button onClick={() => deleteTask(task.id)} className="text-zinc-600 hover:text-red-500 p-2"><Trash2 size={16} /></button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  };

  /* 2. EISENHOWER MATRIX */
  const Matrix = () => {
    // Filter all ACTIVE tasks regardless of date, or you can limit to today. Let's do all active.
    const activeTasks = tasks.filter(t => t.status !== 'done');
    
    const Quadrant = ({ title, qId, description, items }: {
      title: string;
      qId: string;
      description: string;
      items: Task[];
    }) => (
      <div className="border border-zinc-800 bg-black h-full flex flex-col">
        <div className="p-4 border-b border-zinc-800 bg-zinc-900/20">
          <h3 className="font-bold text-sm uppercase tracking-wider">{title}</h3>
          <p className="text-xs text-zinc-500 mt-1">{description}</p>
        </div>
        <div className="p-4 flex-1 overflow-y-auto min-h-[200px] space-y-2">
          {items.map((t: Task) => (
            <div key={t.id} className="text-sm p-3 border border-zinc-800 bg-zinc-950 flex justify-between group">
              <span>{t.title}</span>
              <span className="text-xs text-zinc-600 font-mono group-hover:text-white">{t.est}m</span>
            </div>
          ))}
          {items.length === 0 && <div className="text-zinc-700 text-xs italic p-4 text-center">No tasks</div>}
        </div>
      </div>
    );

    return (
      <div className="h-[calc(100vh-140px)] animate-fade-in flex flex-col">
        <div className="mb-6">
           <h2 className="text-3xl font-serif text-white tracking-tight">Eisenhower Matrix</h2>
           <p className="text-zinc-500 mt-1">Decide what deserves your energy.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
          <Quadrant title="Important & Urgent" qId="iu" description="Do it now. Crises, deadlines." items={activeTasks.filter(t => t.quadrant === 'iu')} />
          <Quadrant title="Important, Not Urgent" qId="ibnu" description="Schedule it. Planning, growth." items={activeTasks.filter(t => t.quadrant === 'ibnu')} />
          <Quadrant title="Not Important, Urgent" qId="nibu" description="Delegate it. Interruptions." items={activeTasks.filter(t => t.quadrant === 'nibu')} />
          <Quadrant title="Not Important, Not Urgent" qId="ninu" description="Delete it. Distractions." items={activeTasks.filter(t => t.quadrant === 'ninu')} />
        </div>
      </div>
    );
  };

  /* 3. HABIT TRACKER */
  const HabitTracker = () => {
    const [newHabitName, setNewHabitName] = useState('');

    const toggleHabitDate = (habitId: string, dateStr: string): void => {
      setHabits(habits.map(h => {
        if (h.id !== habitId) return h;
        const exists = h.completedDates.includes(dateStr);
        return {
          ...h,
          completedDates: exists 
            ? h.completedDates.filter(d => d !== dateStr)
            : [...h.completedDates, dateStr]
        };
      }));
    };

    const addHabit = (): void => {
      if(!newHabitName.trim()) return;
      setHabits([...habits, { id: generateId(), name: newHabitName, completedDates: [] }]);
      setNewHabitName('');
    };

    // Generate last 14 days for the view
    const days = useMemo(() => {
      if (!isHydrated) return [];
      return Array.from({length: 14}, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (13 - i));
        return d;
      });
    }, [isHydrated]);

    return (
      <div className="space-y-8 animate-fade-in">
        <div className="flex justify-between items-end border-b border-zinc-800 pb-6">
           <div>
            <h2 className="text-3xl font-serif text-white tracking-tight">Habit Tracker</h2>
            <p className="text-zinc-500 mt-1">Consistency is the key to mastery.</p>
           </div>
           <div className="flex gap-2">
             <Input 
               placeholder="New Habit..." 
               className="w-48 !py-2 !h-10" 
               value={newHabitName} 
               onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewHabitName(e.target.value)}
             />
             <Button onClick={addHabit}><Plus size={16}/></Button>
           </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr>
                <th className="p-4 border-b border-zinc-800 text-zinc-500 font-normal uppercase text-xs w-48 sticky left-0 bg-black z-10">Habit</th>
                <th className="p-4 border-b border-zinc-800 text-zinc-500 font-normal uppercase text-xs w-24">Streak</th>
                {days.map(d => (
                  <th key={d.toString()} className="p-2 border-b border-zinc-800 text-center min-w-[40px]">
                    <div className="text-[10px] text-zinc-600 uppercase">{d.toLocaleDateString('en-US', { weekday: 'short' })}</div>
                    <div className={`text-xs ${d.toDateString() === new Date().toDateString() ? 'text-white font-bold' : 'text-zinc-400'}`}>
                      {d.getDate()}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {habits.map(h => {
                const streak = 0; // Simplified logic for demo
                return (
                  <tr key={h.id} className="group hover:bg-zinc-900/30 transition-colors">
                    <td className="p-4 border-b border-zinc-800 font-medium sticky left-0 bg-black group-hover:bg-zinc-900/30 transition-colors z-10">{h.name}</td>
                    <td className="p-4 border-b border-zinc-800 text-zinc-500 text-xs font-mono">{h.completedDates.length} total</td>
                    {days.map(d => {
                      const dStr = d.toDateString();
                      const isDone = h.completedDates.includes(dStr);
                      return (
                        <td key={dStr} className="p-2 border-b border-zinc-800 text-center">
                          <button 
                            onClick={() => toggleHabitDate(h.id, dStr)}
                            className={`w-6 h-6 rounded-sm transition-all duration-300 ${isDone ? 'bg-white scale-100' : 'bg-zinc-900 scale-75 hover:bg-zinc-800'}`}
                          />
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  /* 4. FOCUS MODE (ENHANCED) */
  const FocusMode = () => {
    const { completeFocusSession, updateStreak } = useGamification();
    const [timeLeft, setTimeLeft] = useState(25 * 60);
    const [isActive, setIsActive] = useState(false);
    const [focusMode, setFocusMode] = useState<'short' | 'long'>('short');
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [customDuration, setCustomDuration] = useState(25);
    const [ambience, setAmbience] = useState<'rain' | 'lofi' | null>(null);
    const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);
    const [showTaskSelector, setShowTaskSelector] = useState(false);
    
    // Motivation Lines
    const quotes = [
      "Focus on being productive instead of busy.",
      "The shorter way to do many things is to do only one thing at a time.",
      "Your future is created by what you do today, not tomorrow.",
      "Deep work is the superpower of the 21st century."
    ];
    const [quoteIndex, setQuoteIndex] = useState(0);

    // Get available tasks for today
    const todayTasks = getTasksForDate(currentDate).filter(t => t.status === 'active');

    const predefinedDurations = {
      short: [15, 25, 45],
      long: [60, 90, 120]
    };

    useEffect(() => {
        let interval: NodeJS.Timeout | null = null;
        if (isActive && timeLeft > 0) {
          interval = setInterval(() => setTimeLeft(timeLeft - 1), 1000);
        } else if (timeLeft === 0 && isActive) {
          handleSessionComplete();
        }
        return () => {
          if (interval) clearInterval(interval);
        };
    }, [isActive, timeLeft]);

    useEffect(() => {
        const interval = setInterval(() => {
            setQuoteIndex(prev => (prev + 1) % quotes.length);
        }, 15000);
        return () => {
            if (interval) clearInterval(interval);
        };
    }, []);

    const handleSessionComplete = () => {
      setIsActive(false);
      
      // Calculate session duration
      const sessionDuration = sessionStartTime 
        ? Math.floor((Date.now() - sessionStartTime.getTime()) / 1000 / 60)
        : customDuration;
      
      // Award XP for completing focus session
      completeFocusSession(sessionDuration);
      updateStreak();
      
      // Mark selected task as done if exists
      if (selectedTask) {
        updateTask(selectedTask.id, { status: 'done' });
        setSelectedTask(null);
      }
      
      // Play completion sound (simulated)
      alert(`Focus session completed! You earned ${Math.round(5 + sessionDuration / 60 * 10)} XP!`);
    };

    const startFocusSession = () => {
      if (focusMode === 'long' && !selectedTask) {
        alert('Please select a task for long focus sessions (1+ hours)');
        return;
      }
      
      setSessionStartTime(new Date());
      setIsActive(true);
      setShowTaskSelector(false);
    };

    const stopFocusSession = () => {
      if (focusMode === 'long' && isActive) {
        const confirmed = confirm('Are you sure you want to stop? Long focus sessions cannot be stopped early.');
        if (!confirmed) return;
      }
      
      setIsActive(false);
      setTimeLeft(customDuration * 60);
      setSessionStartTime(null);
    };

    const formatTime = (seconds: number): string => {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const setCustomTimer = (minutes: number) => {
      setCustomDuration(minutes);
      setTimeLeft(minutes * 60);
      setIsActive(false);
    };

    return (
      <div className="flex flex-col items-center justify-center min-h-[600px] animate-fade-in relative">
        {/* Mode Selection */}
        <div className="absolute top-0 left-0 flex gap-2">
          <button
            onClick={() => {
              setFocusMode('short');
              setCustomTimer(25);
              setSelectedTask(null);
            }}
            className={`flex items-center gap-2 text-xs uppercase tracking-widest px-4 py-2 border rounded-full transition-all ${
              focusMode === 'short' 
                ? 'bg-white text-black border-white' 
                : 'text-zinc-500 border-zinc-800 hover:border-zinc-500'
            }`}
            disabled={isActive}
          >
            <Clock size={14} /> Short Mode
          </button>
          <button
            onClick={() => {
              setFocusMode('long');
              setCustomTimer(60);
            }}
            className={`flex items-center gap-2 text-xs uppercase tracking-widest px-4 py-2 border rounded-full transition-all ${
              focusMode === 'long' 
                ? 'bg-white text-black border-white' 
                : 'text-zinc-500 border-zinc-800 hover:border-zinc-500'
            }`}
            disabled={isActive}
          >
            <Target size={14} /> Long Mode
          </button>
        </div>

        {/* Task Selector for Long Mode */}
        {focusMode === 'long' && !isActive && (
          <div className="absolute top-16 left-0 z-10">
            <button
              onClick={() => setShowTaskSelector(!showTaskSelector)}
              className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 text-white px-4 py-2 rounded-lg hover:bg-zinc-800 transition-colors"
            >
              {selectedTask ? selectedTask.title : 'Select Task'}
              <Target size={16} />
            </button>
            
            {showTaskSelector && (
              <div className="absolute top-12 left-0 w-64 bg-zinc-900 border border-zinc-800 rounded-lg shadow-xl max-h-48 overflow-y-auto">
                {todayTasks.length > 0 ? (
                  todayTasks.map(task => (
                    <button
                      key={task.id}
                      onClick={() => {
                        setSelectedTask(task);
                        setShowTaskSelector(false);
                      }}
                      className="w-full text-left px-4 py-3 hover:bg-zinc-800 transition-colors border-b border-zinc-800 last:border-b-0"
                    >
                      <div className="text-sm text-white">{task.title}</div>
                      <div className="text-xs text-zinc-500">{task.est} min</div>
                    </button>
                  ))
                ) : (
                  <div className="p-4 text-center text-zinc-500 text-sm">
                    No active tasks for today
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Ambience Controls */}
        <div className="absolute top-0 right-0 flex gap-4">
            <button 
                onClick={() => setAmbience(ambience === 'rain' ? null : 'rain')}
                className={`flex items-center gap-2 text-xs uppercase tracking-widest px-4 py-2 border rounded-full transition-all ${ambience === 'rain' ? 'bg-white text-black border-white' : 'text-zinc-500 border-zinc-800 hover:border-zinc-500'}`}
            >
                <CloudRain size={14} /> Rain
            </button>
            <button 
                onClick={() => setAmbience(ambience === 'lofi' ? null : 'lofi')}
                className={`flex items-center gap-2 text-xs uppercase tracking-widest px-4 py-2 border rounded-full transition-all ${ambience === 'lofi' ? 'bg-white text-black border-white' : 'text-zinc-500 border-zinc-800 hover:border-zinc-500'}`}
            >
                <Music size={14} /> Lofi
            </button>
        </div>

        {/* Visualizer */}
        {ambience && (
            <div className="absolute top-16 right-0 flex gap-1 h-8 items-end">
                {[...Array(10)].map((_, i) => (
                    <div key={i} className="w-1 bg-zinc-700 animate-pulse" style={{ height: `${Math.random() * 100}%`, animationDuration: `${0.5 + Math.random()}s` }}></div>
                ))}
            </div>
        )}

        {/* Current Task Display */}
        {selectedTask && (
          <div className="mb-4 p-4 bg-zinc-900 border border-zinc-800 rounded-lg max-w-md">
            <div className="text-sm text-zinc-500 mb-1">Current Task</div>
            <div className="text-white font-medium">{selectedTask.title}</div>
            <div className="text-xs text-zinc-500 mt-1">Estimated: {selectedTask.est} minutes</div>
          </div>
        )}

        <div className="text-center space-y-8">
           {/* Duration Selection */}
           {!isActive && (
             <div className="flex flex-col items-center gap-4">
               <div className="text-sm text-zinc-500 uppercase tracking-wider">
                 {focusMode === 'short' ? 'Quick Focus (Under 1 hour)' : 'Deep Focus (1+ hours)'}
               </div>
               <div className="flex gap-3">
                 {predefinedDurations[focusMode].map(duration => (
                   <button
                     key={duration}
                     onClick={() => setCustomTimer(duration)}
                     className={`px-4 py-2 rounded-lg border transition-all ${
                       customDuration === duration
                         ? 'bg-white text-black border-white'
                         : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:border-zinc-600'
                     }`}
                   >
                     {duration}m
                   </button>
                 ))}
               </div>
             </div>
           )}

           {/* Timer Display */}
           <div className="text-[120px] md:text-[180px] font-mono leading-none tracking-tighter text-white">
             {formatTime(timeLeft)}
           </div>

           {/* Progress Bar */}
           {isActive && (
             <div className="w-64 h-2 bg-zinc-800 rounded-full overflow-hidden">
               <div 
                 className="h-full bg-white transition-all duration-1000"
                 style={{ 
                   width: `${((customDuration * 60 - timeLeft) / (customDuration * 60)) * 100}%` 
                 }}
               />
             </div>
           )}

           {/* Motivational Quote */}
           <div className="h-16 flex items-center justify-center text-zinc-500 italic font-serif text-lg transition-opacity duration-1000">
               "{quotes[quoteIndex]}"
           </div>

           {/* Control Buttons */}
           <div className="flex justify-center gap-6">
             {!isActive ? (
               <button
                 onClick={startFocusSession}
                 className="w-16 h-16 rounded-full bg-white text-black flex items-center justify-center hover:scale-110 transition-transform"
                 disabled={focusMode === 'long' && !selectedTask}
               >
                 <Play fill="black" className="ml-1"/>
               </button>
             ) : (
               <>
                 <button
                   onClick={stopFocusSession}
                   className="w-16 h-16 rounded-full bg-red-900/20 border border-red-900/50 text-red-500 flex items-center justify-center hover:bg-red-900/40 transition-colors"
                   disabled={focusMode === 'long'}
                 >
                   <Pause size={24} />
                 </button>
                 {focusMode === 'short' && (
                   <button
                     onClick={stopFocusSession}
                     className="w-16 h-16 rounded-full border border-zinc-700 text-white flex items-center justify-center hover:bg-zinc-800 transition-colors"
                   >
                     <RefreshCw size={20} />
                   </button>
                 )}
               </>
             )}
           </div>

           {/* Mode Info */}
           <div className="text-xs text-zinc-600 max-w-md text-center">
             {focusMode === 'short' 
               ? 'Short focus sessions for quick tasks. You can stop anytime.'
               : 'Long focus sessions for deep work. Cannot be stopped early to maintain discipline.'
             }
           </div>
        </div>
      </div>
    );
  };

  /* 5. GOALS COUNTDOWN */
  const Goals = () => {
    const [title, setTitle] = useState('');
    const [date, setDate] = useState('');

    const addGoal = (): void => {
        if(!title || !date) return;
        setGoals([...goals, { id: generateId(), title, targetDate: date }]);
        setTitle('');
        setDate('');
    };

    const deleteGoal = (id: string): void => setGoals(goals.filter(g => g.id !== id));

    const getTimeRemaining = (endtime: string): { total: number; days: number; hours: number; minutes: number; seconds: number } => {
        const total = Date.parse(endtime) - Date.now();
        const seconds = Math.floor((total / 1000) % 60);
        const minutes = Math.floor((total / 1000 / 60) % 60);
        const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
        const days = Math.floor(total / (1000 * 60 * 60 * 24));
        return { total, days, hours, minutes, seconds };
    };

    return (
        <div className="space-y-8 animate-fade-in">
             <div className="border-b border-zinc-800 pb-6">
                <h2 className="text-3xl font-serif text-white tracking-tight">Milestones</h2>
                <p className="text-zinc-500 mt-1">Keep your eyes on the prize.</p>
            </div>

            <div className="bg-zinc-900/30 p-6 border border-zinc-800 flex flex-col md:flex-row gap-4 items-end">
                 <div className="flex-1 w-full">
                    <label className="text-xs text-zinc-500 uppercase tracking-wider mb-1 block">Goal Name</label>
                    <Input value={title} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)} placeholder="Launch new feature" />
                 </div>
                 <div className="w-full md:w-48">
                    <label className="text-xs text-zinc-500 uppercase tracking-wider mb-1 block">Target Date</label>
                    <Input type="date" value={date} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDate(e.target.value)} className="!text-white [color-scheme:dark]" />
                 </div>
                 <Button onClick={addGoal} variant="primary">Add Goal</Button>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {goals.map(goal => {
                    const t = getTimeRemaining(goal.targetDate);
                    return (
                        <div key={goal.id} className="p-6 border border-zinc-800 bg-black flex flex-col md:flex-row items-center justify-between group">
                            <div className="text-center md:text-left mb-4 md:mb-0">
                                <h3 className="text-xl font-medium text-white">{goal.title}</h3>
                                <p className="text-sm text-zinc-500">{new Date(goal.targetDate).toDateString()}</p>
                            </div>
                            <div className="flex gap-8 text-center">
                                {[
                                    { l: 'Days', v: t.days },
                                    { l: 'Hours', v: t.hours },
                                    { l: 'Mins', v: t.minutes }
                                ].map((item, i) => (
                                    <div key={i}>
                                        <div className="text-3xl font-mono font-light text-white">{Math.max(0, item.v)}</div>
                                        <div className="text-[10px] uppercase tracking-widest text-zinc-600">{item.l}</div>
                                    </div>
                                ))}
                            </div>
                            <button onClick={() => deleteGoal(goal.id)} className="opacity-0 group-hover:opacity-100 p-2 text-zinc-600 hover:text-red-500 transition-opacity absolute top-4 right-4 md:static">
                                <Trash2 size={16} />
                            </button>
                        </div>
                    );
                })}
                {goals.length === 0 && (
                    <div className="text-center py-12 text-zinc-600 text-sm">No active goals. Set a target to begin.</div>
                )}
            </div>
        </div>
    );
  };

  // --- RENDER ---

  const NavItem = ({ id, icon: Icon, label }: {
    id: string;
    icon: React.ComponentType<any>;
    label: string;
  }) => (
    <button
      onClick={() => { setActiveTab(id); setSidebarOpen(false); }}
      className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors ${
        activeTab === id 
          ? 'text-white bg-zinc-900 border-r-2 border-white' 
          : 'text-zinc-500 hover:text-white hover:bg-zinc-900/50'
      }`}
    >
      <Icon size={18} />
      <span>{label}</span>
    </button>
  );

  // Prevent render until hydrated
  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-black text-zinc-200 font-sans flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-black font-bold font-serif text-xl">Z</span>
          </div>
          <p className="text-zinc-500">Loading Zenith...</p>
        </div>
      </div>
    );
  }

  return (
    // <RouteGuard> // DISABLED
      <>
        <Sidebar activeTab={activeTab} onTabChange={setActiveTab}>
          <div className="max-w-5xl mx-auto p-6 md:p-12 pb-24">
            {activeTab === 'planner' && <DayPlanner />}
            {activeTab === 'matrix' && <Matrix />}
            {activeTab === 'habits' && <HabitTracker />}
            {activeTab === 'focus' && <FocusMode />}
            {activeTab === 'goals' && <Goals />}
          </div>
        </Sidebar>

      {/* Global Ambience Indicator (if active but hidden) */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fadeIn 0.4s ease-out forwards;
        }
        /* Custom scrollbar for monochrome look */
        ::-webkit-scrollbar { width: 8px; }
        ::-webkit-scrollbar-track { background: #000; }
        ::-webkit-scrollbar-thumb { background: #333; border-radius: 4px; }
        ::-webkit-scrollbar-thumb:hover { background: #555; }
        input[type="date"]::-webkit-calendar-picker-indicator { filter: invert(1); cursor: pointer; }
      `}</style>
      </>
    // </RouteGuard> // DISABLED
    // </RouteGuard> // DISABLED
  );
}