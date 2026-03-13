import mongoose, { Document, Schema } from 'mongoose';
import { IHabit } from '../types';

export interface IHabitDocument extends IHabit, Document { }

const habitSchema = new Schema<IHabitDocument>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    index: true
  },
  name: {
    type: String,
    required: [true, 'Habit name is required'],
    trim: true,
    maxlength: [100, 'Habit name cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Habit description cannot exceed 500 characters']
  },
  targetDays: {
    type: Number,
    required: [true, 'Target days is required'],
    min: [1, 'Target days must be at least 1'],
    max: [7, 'Target days cannot exceed 7']
  },
  completedDates: [{
    type: Date,
    default: []
  }],
  streak: {
    type: Number,
    default: 0,
    min: 0
  },
  bestStreak: {
    type: Number,
    default: 0,
    min: 0
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  color: {
    type: String,
    default: '#3B82F6',
    match: [/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Invalid color format']
  },
  icon: {
    type: String,
    default: '🎯',
    maxlength: [2, 'Icon cannot exceed 2 characters']
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
habitSchema.index({ userId: 1, isActive: 1 });
habitSchema.index({ userId: 1, completedDates: 1 });

// Virtual for completion rate (last 30 days)
habitSchema.virtual('completionRate').get(function () {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const recentCompletions = this.completedDates.filter(
    date => new Date(date) >= thirtyDaysAgo
  );

  return Math.round((recentCompletions.length / 30) * 100);
});

// Virtual for today's completion status
habitSchema.virtual('isCompletedToday').get(function () {
  const today = new Date().toDateString();
  return this.completedDates.some(date =>
    new Date(date).toDateString() === today
  );
});

// Virtual for current week completions
habitSchema.virtual('weekCompletions').get(function () {
  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());
  weekStart.setHours(0, 0, 0, 0);

  return this.completedDates.filter(date =>
    new Date(date) >= weekStart
  ).length;
});

// Pre-save middleware to update streak
habitSchema.pre('save', function (next) {
  if (this.isModified('completedDates')) {
    this.streak = this.calculateStreak();
    this.bestStreak = Math.max(this.streak, this.bestStreak);
  }
  next();
});

// Instance method to calculate streak
habitSchema.methods.calculateStreak = function (): number {
  if (this.completedDates.length === 0) return 0;

  const sortedDates = [...this.completedDates]
    .map(date => new Date(date))
    .sort((a, b) => b.getTime() - a.getTime());

  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Check if completed today or yesterday
  const lastCompleted = sortedDates[0];
  lastCompleted.setHours(0, 0, 0, 0);

  const daysDiff = Math.floor((today.getTime() - lastCompleted.getTime()) / (1000 * 60 * 60 * 24));

  if (daysDiff > 1) return 0; // Streak broken

  streak = 1;

  // Count consecutive days
  for (let i = 1; i < sortedDates.length; i++) {
    const current = sortedDates[i];
    const previous = sortedDates[i - 1];

    current.setHours(0, 0, 0, 0);
    previous.setHours(0, 0, 0, 0);

    const diff = Math.floor((previous.getTime() - current.getTime()) / (1000 * 60 * 60 * 24));

    if (diff === 1) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
};

// Instance method to toggle completion for today
habitSchema.methods.toggleToday = function (): boolean {
  const today = new Date();
  const todayStr = today.toDateString();

  const existingIndex = this.completedDates.findIndex(date =>
    new Date(date).toDateString() === todayStr
  );

  if (existingIndex > -1) {
    this.completedDates.splice(existingIndex, 1);
    return false; // Uncompleted
  } else {
    this.completedDates.push(today);
    return true; // Completed
  }
};

// Static methods for common queries
habitSchema.statics.findByUser = function (userId: string) {
  return this.find({ userId }).sort({ createdAt: -1 });
};

habitSchema.statics.findActiveByUser = function (userId: string) {
  return this.find({ userId, isActive: true }).sort({ createdAt: -1 });
};

habitSchema.statics.getTodayHabits = function (userId: string) {
  return this.find({ userId, isActive: true }).sort({ createdAt: 1 });
};

export const Habit = mongoose.model<IHabitDocument>('Habit', habitSchema);
