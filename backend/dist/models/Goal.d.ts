import mongoose, { Document } from 'mongoose';
import { IGoal } from '@/types';
export interface IGoalDocument extends IGoal, Document {
}
export declare const Goal: mongoose.Model<IGoalDocument, {}, {}, {}, mongoose.Document<unknown, {}, IGoalDocument, {}, {}> & IGoalDocument & Required<{
    _id: string;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=Goal.d.ts.map