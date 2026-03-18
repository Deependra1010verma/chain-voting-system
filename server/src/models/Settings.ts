import mongoose, { Document, Schema } from 'mongoose';

export interface ISettings extends Document {
    electionName: string;
    currentElectionId: string;
    startDate: Date;
    endDate: Date;
    isActive: boolean;
    resultDeclared: boolean;
    declaredWinnerId?: mongoose.Types.ObjectId;
    declaredAt?: Date;
}

const SettingsSchema: Schema = new Schema({
    electionName: {
        type: String,
        required: true,
        default: 'New Election'
    },
    currentElectionId: {
        type: String,
        required: true,
        default: () => new mongoose.Types.ObjectId().toString()
    },
    startDate: {
        type: Date,
        required: true,
        default: Date.now
    },
    endDate: {
        type: Date,
        required: true,
        // Default to a week from now by default if not set
        default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    },
    isActive: {
        type: Boolean,
        default: true
    },
    resultDeclared: {
        type: Boolean,
        default: false
    },
    declaredWinnerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Candidate',
        required: false
    },
    declaredAt: {
        type: Date,
        required: false
    }
}, {
    timestamps: true
});

export default mongoose.model<ISettings>('Settings', SettingsSchema);
