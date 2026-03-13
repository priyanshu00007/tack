import mongoose, { Document } from 'mongoose';
import { IHabit } from '@/types';
export interface IHabitDocument extends IHabit, Document {
}
export declare const Habit: mongoose.Model<IHabitDocument, {}, {}, {}, mongoose.Document<unknown, {}, IHabitDocument, {}, {}> & IHabitDocument & Required<{
    _id: string;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=Habit.d.ts.map