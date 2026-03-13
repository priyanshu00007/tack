"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.Goal = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const goalSchema = new mongoose_1.Schema({
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User ID is required'],
        index: true
    },
    title: {
        type: String,
        required: [true, 'Goal title is required'],
        trim: true,
        maxlength: [200, 'Goal title cannot exceed 200 characters']
    },
    description: {
        type: String,
        trim: true,
        maxlength: [1000, 'Goal description cannot exceed 1000 characters']
    },
    targetDate: {
        type: Date,
        required: [true, 'Target date is required'],
        index: true
    },
    category: {
        type: String,
        required: [true, 'Category is required'],
        trim: true,
        maxlength: [50, 'Category cannot exceed 50 characters']
    },
    status: {
        type: String,
        enum: {
            values: ['active', 'completed', 'paused'],
            message: 'Invalid status value'
        },
        default: 'active',
        index: true
    },
    progress: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
    },
    milestones: [{
            title: {
                type: String,
                required: true,
                maxlength: [200, 'Milestone title cannot exceed 200 characters']
            },
            completed: {
                type: Boolean,
                default: false
            },
            completedAt: {
                type: Date,
                default: null
            }
        }],
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
// Indexes for better query performance
goalSchema.index({ userId: 1, status: 1 });
goalSchema.index({ userId: 1, targetDate: 1 });
goalSchema.index({ userId: 1, category: 1 });
// Virtual for days remaining
goalSchema.virtual('daysRemaining').get(function () {
    const now = new Date();
    const target = new Date(this.targetDate);
    const diffTime = target.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
});
// Virtual for completion percentage based on milestones
goalSchema.virtual('milestoneProgress').get(function () {
    if (this.milestones.length === 0)
        return 0;
    const completedMilestones = this.milestones.filter(m => m.completed).length;
    return Math.round((completedMilestones / this.milestones.length) * 100);
});
// Virtual for is overdue
goalSchema.virtual('isOverdue').get(function () {
    return this.status === 'active' && new Date(this.targetDate) < new Date();
});
// Pre-save middleware to update progress and completion
goalSchema.pre('save', function (next) {
    // Update milestone progress
    this.progress = this.milestoneProgress;
    // Handle completion
    if (this.isModified('status') && this.status === 'completed' && !this.completedAt) {
        this.completedAt = new Date();
        this.progress = 100;
        // Mark all milestones as completed
        this.milestones.forEach(milestone => {
            if (!milestone.completed) {
                milestone.completed = true;
                milestone.completedAt = new Date();
            }
        });
    }
    else if (this.isModified('status') && this.status !== 'completed') {
        this.completedAt = null;
    }
    next();
});
// Instance method to add milestone
goalSchema.methods.addMilestone = function (title) {
    this.milestones.push({ title, completed: false });
    return this.save();
};
// Instance method to toggle milestone
goalSchema.methods.toggleMilestone = function (milestoneIndex) {
    if (milestoneIndex >= 0 && milestoneIndex < this.milestones.length) {
        const milestone = this.milestones[milestoneIndex];
        milestone.completed = !milestone.completed;
        milestone.completedAt = milestone.completed ? new Date() : null;
        // Check if all milestones are completed
        const allCompleted = this.milestones.every(m => m.completed);
        if (allCompleted && this.status === 'active') {
            this.status = 'completed';
            this.completedAt = new Date();
            this.progress = 100;
        }
        return this.save();
    }
    throw new Error('Invalid milestone index');
};
// Instance method to update progress manually
goalSchema.methods.updateProgress = function (progress) {
    this.progress = Math.max(0, Math.min(100, progress));
    if (this.progress === 100 && this.status === 'active') {
        this.status = 'completed';
        this.completedAt = new Date();
    }
    return this.save();
};
// Static methods for common queries
goalSchema.statics.findByUser = function (userId) {
    return this.find({ userId }).sort({ targetDate: 1, createdAt: -1 });
};
goalSchema.statics.findActiveByUser = function (userId) {
    return this.find({ userId, status: 'active' }).sort({ targetDate: 1 });
};
goalSchema.statics.findOverdueByUser = function (userId) {
    return this.find({
        userId,
        status: 'active',
        targetDate: { $lt: new Date() }
    }).sort({ targetDate: 1 });
};
goalSchema.statics.getStatsByUser = async function (userId) {
    const stats = await this.aggregate([
        { $match: { userId: new mongoose_1.default.Types.ObjectId(userId) } },
        {
            $group: {
                _id: '$status',
                count: { $sum: 1 },
                avgProgress: { $avg: '$progress' }
            }
        }
    ]);
    return stats.reduce((acc, stat) => {
        acc[stat._id] = {
            count: stat.count,
            avgProgress: Math.round(stat.avgProgress || 0)
        };
        return acc;
    }, {});
};
exports.Goal = mongoose_1.default.model('Goal', goalSchema);
//# sourceMappingURL=Goal.js.map