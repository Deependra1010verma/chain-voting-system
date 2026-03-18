import mongoose, { Document, Schema } from 'mongoose';

export interface IElectionHistory extends Document {
    electionName: string;
    electionId: string;
    winner: {
        name: string;
        party: string;
        voteCount: number;
    };
    results: Array<{
        name: string;
        party: string;
        voteCount: number;
    }>;
    declaredAt: Date;
}

const ElectionHistorySchema: Schema = new Schema({
    electionName: {
        type: String,
        required: true
    },
    electionId: {
        type: String,
        required: true
    },
    winner: {
        name: String,
        party: String,
        voteCount: Number
    },
    results: [{
        name: String,
        party: String,
        voteCount: Number
    }],
    declaredAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

export default mongoose.model<IElectionHistory>('ElectionHistory', ElectionHistorySchema);
