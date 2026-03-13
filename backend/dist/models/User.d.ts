import mongoose, { Document } from 'mongoose';
import { IUser } from '@/types';
export interface IUserDocument extends Omit<IUser, '_id'>, Document {
    _id: mongoose.Types.ObjectId;
    comparePassword(candidatePassword: string): Promise<boolean>;
    getPublicProfile(): Omit<IUser, 'password'>;
}
export declare const User: mongoose.Model<IUserDocument, {}, {}, {}, mongoose.Document<unknown, {}, IUserDocument, {}, {}> & IUserDocument & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=User.d.ts.map