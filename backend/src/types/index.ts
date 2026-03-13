export interface IUser {
  _id?: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  timezone: string;
  preferences: {
    theme: 'light' | 'dark';
    dailyCapacityMinutes: number;
    notifications: {
      email: boolean;
      push: boolean;
      taskReminders: boolean;
      habitReminders: boolean;
    };
  };
  subscription?: {
    plan: 'free' | 'pro' | 'enterprise';
    startDate: Date;
    endDate?: Date;
    features: string[];
  };
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ITask {
  _id?: string;
  userId: string;
  title: string;
  description?: string;
  date: Date;
  estimatedMinutes: number;
  quadrant: 'iu' | 'ibnu' | 'nibu' | 'ninu'; // Important/Not Important, Urgent/Not Urgent
  status: 'active' | 'done' | 'cancelled';
  priority: 'low' | 'medium' | 'high';
  tags?: string[];
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IHabit {
  _id?: string;
  userId: string;
  name: string;
  description?: string;
  targetDays: number; // How many days per week
  completedDates: Date[];
  streak: number;
  bestStreak: number;
  isActive: boolean;
  color?: string;
  icon?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IGoal {
  _id?: string;
  userId: string;
  title: string;
  description?: string;
  targetDate: Date;
  category: string;
  status: 'active' | 'completed' | 'paused';
  progress: number; // 0-100
  milestones: {
    title: string;
    completed: boolean;
    completedAt?: Date;
  }[];
  tags?: string[];
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IAuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface ILoginRequest {
  email: string;
  password: string;
}

export interface ISignupRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  timezone?: string;
}

export interface IAuthResponse {
  user: Omit<IUser, 'password'>;
  tokens: IAuthTokens;
}

export interface IApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

export interface IPaginationQuery {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface ITaskQuery extends IPaginationQuery {
  status?: string;
  quadrant?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
}

export interface IStats {
  tasks: {
    total: number;
    completed: number;
    pending: number;
    completionRate: number;
  };
  habits: {
    total: number;
    activeToday: number;
    averageStreak: number;
  };
  goals: {
    total: number;
    completed: number;
    inProgress: number;
  };
  productivity: {
    totalEstimatedMinutes: number;
    totalCompletedMinutes: number;
    efficiency: number;
  };
}
