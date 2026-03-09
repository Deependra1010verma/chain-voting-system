import mongoose, { Document, Schema } from 'mongoose';

export interface ICandidate extends Document {
    name: string;
    party: string;
    position: string;
    image: string;
    voteCount: number;
}

const CandidateSchema: Schema = new Schema({
    name: {
        type: String,
        required: true
    },
    party: {
        type: String,
        required: true
    },
    position: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: true
    },
    voteCount: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

export default mongoose.model<ICandidate>('Candidate', CandidateSchema);
