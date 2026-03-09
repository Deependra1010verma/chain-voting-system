import mongoose, { Document, Schema } from 'mongoose';

export interface ISettings extends Document {
    electionName: string;
    startDate: Date;
    endDate: Date;
    isActive: boolean;
}

const SettingsSchema: Schema = new Schema({
    electionName: {
        type: String,
        required: true,
        default: 'General Election'
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
    }
}, {
    timestamps: true
});

export default mongoose.model<ISettings>('Settings', SettingsSchema);
