import mongoose, { Document, Schema } from 'mongoose';
import { ITask } from '../types';

export interface ITaskDocument extends ITask, Document { }

const taskSchema = new Schema<ITaskDocument>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    index: true
  },
  title: {
    type: String,
    required: [true, 'Task title is required'],
    trim: true,
    maxlength: [200, 'Task title cannot exceed 200 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Task description cannot exceed 1000 characters']
  },
  date: {
    type: Date,
    required: [true, 'Task date is required'],
    index: true
  },
  estimatedMinutes: {
    type: Number,
    required: [true, 'Estimated time is required'],
    min: [5, 'Estimated time must be at least 5 minutes'],
    max: [480, 'Estimated time cannot exceed 8 hours']
  },
  quadrant: {
    type: String,
    enum: {
      values: ['iu', 'ibnu', 'nibu', 'ninu'],
      message: 'Invalid quadrant value'
    },
    required: [true, 'Quadrant is required'],
    index: true
  },
  status: {
    type: String,
    enum: {
      values: ['active', 'done', 'cancelled'],
      message: 'Invalid status value'
    },
    default: 'active',
    index: true
  },
  priority: {
    type: String,
    enum: {
      values: ['low', 'medium', 'high'],
      message: 'Invalid priority value'
    },
    default: 'medium',
    index: true
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  completedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Compound indexes for better query performance
taskSchema.index({ userId: 1, date: -1 });
taskSchema.index({ userId: 1, status: 1 });
taskSchema.index({ userId: 1, quadrant: 1 });
taskSchema.index({ userId: 1, date: 1, status: 1 });

// Virtual for checking if task is overdue
taskSchema.virtual('isOverdue').get(function () {
  return this.status === 'active' && new Date(this.date) < new Date();
});

// Virtual for formatted estimated time
taskSchema.virtual('formattedTime').get(function () {
  const hours = Math.floor(this.estimatedMinutes / 60);
  const minutes = this.estimatedMinutes % 60;
  return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
});

// Pre-save middleware to set completedAt when status changes to done
taskSchema.pre('save', function (next) {
  if (this.isModified('status') && this.status === 'done' && !this.completedAt) {
    this.completedAt = new Date();
  } else if (this.isModified('status') && this.status !== 'done') {
    this.completedAt = null;
  }
  next();
});

// Static methods for common queries
taskSchema.statics.findByUser = function (userId: string) {
  return this.find({ userId }).sort({ date: -1, createdAt: -1 });
};

taskSchema.statics.findActiveByUser = function (userId: string) {
  return this.find({ userId, status: 'active' }).sort({ date: 1, priority: -1 });
};

taskSchema.statics.findByDateRange = function (userId: string, startDate: Date, endDate: Date) {
  return this.find({
    userId,
    date: { $gte: startDate, $lte: endDate }
  }).sort({ date: 1 });
};

taskSchema.statics.getStatsByUser = async function (userId: string) {
  const stats = await this.aggregate([
    { $match: { userId: new mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalMinutes: { $sum: '$estimatedMinutes' }
      }
    }
  ]);

  return stats.reduce((acc, stat) => {
    acc[stat._id] = {
      count: stat.count,
      totalMinutes: stat.totalMinutes
    };
    return acc;
  }, {});
};

export const Task = mongoose.model<ITaskDocument>('Task', taskSchema);
