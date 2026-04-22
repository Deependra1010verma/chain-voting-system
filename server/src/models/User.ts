import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
    username: string;
    email: string;
    passwordHash: string;
    hasVoted: boolean;
    votedElections: string[];
    isAdmin: boolean;
    isVerified: boolean;
    verificationStatus: 'pending' | 'verified';
    verifiedAt?: Date | null;
    verifiedBy?: mongoose.Types.ObjectId | null;
}

const UserSchema: Schema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    passwordHash: {
        type: String,
        required: true
    },
    hasVoted: {
        type: Boolean,
        default: false
    },
    votedElections: {
        type: [String],
        default: []
    },
    isAdmin: {
        type: Boolean,
        default: false
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    verificationStatus: {
        type: String,
        enum: ['pending', 'verified'],
        default: 'pending'
    },
    verifiedAt: {
        type: Date,
        default: null
    },
    verifiedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        default: null
    }
}, {
    timestamps: true
});

export default mongoose.model<IUser>('User', UserSchema);
