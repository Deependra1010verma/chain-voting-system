import mongoose, { Document, Schema } from 'mongoose';
import { Transaction } from '../types';

export interface IBlock extends Document {
    index: number;
    timestamp: number;
    transaction: Transaction;
    previousHash: string;
    hash: string;
    nonce: number;
}

const BlockSchema: Schema = new Schema({
    index: {
        type: Number,
        required: true,
        unique: true
    },
    timestamp: {
        type: Number,
        required: true
    },
    transaction: {
        type: Object,
        required: true
    },
    previousHash: {
        type: String,
        required: true
    },
    hash: {
        type: String,
        required: true
    },
    nonce: {
        type: Number,
        required: true
    }
}, {
    timestamps: true
});

export default mongoose.model<IBlock>('Block', BlockSchema);
