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
exports.Task = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const taskSchema = new mongoose_1.Schema({
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
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
    }
    else if (this.isModified('status') && this.status !== 'done') {
        this.completedAt = null;
    }
    next();
});
// Static methods for common queries
taskSchema.statics.findByUser = function (userId) {
    return this.find({ userId }).sort({ date: -1, createdAt: -1 });
};
taskSchema.statics.findActiveByUser = function (userId) {
    return this.find({ userId, status: 'active' }).sort({ date: 1, priority: -1 });
};
taskSchema.statics.findByDateRange = function (userId, startDate, endDate) {
    return this.find({
        userId,
        date: { $gte: startDate, $lte: endDate }
    }).sort({ date: 1 });
};
taskSchema.statics.getStatsByUser = async function (userId) {
    const stats = await this.aggregate([
        { $match: { userId: new mongoose_1.default.Types.ObjectId(userId) } },
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
exports.Task = mongoose_1.default.model('Task', taskSchema);
//# sourceMappingURL=Task.js.map