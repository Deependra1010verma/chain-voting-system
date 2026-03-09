import mongoose, { Document, Schema } from 'mongoose';

export interface ICandidate extends Document {
    name: string;
    party: string;
    position: string;
    image: string;
    voteCount: number;
    userId?: mongoose.Types.ObjectId;
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
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false, // Make it optional to not break existing admin-added candidates initially
        unique: true,
        sparse: true // Allows multiple null values for admin-created candidates without userIds
    }
}, {
    timestamps: true
});

export default mongoose.model<ICandidate>('Candidate', CandidateSchema);
