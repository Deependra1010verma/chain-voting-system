import crypto from 'crypto';
import { Vote } from './types';

export class Block {
    public index: number;
    public timestamp: number;
    public vote: Vote; // In a real blockchain, this would be an array of transactions, but for voting, one vote per block is simple/fine.
    public previousHash: string;
    public hash: string;
    public nonce: number;

    constructor(index: number, timestamp: number, vote: Vote, previousHash: string = '') {
        this.index = index;
        this.timestamp = timestamp;
        this.vote = vote;
        this.previousHash = previousHash;
        this.hash = this.calculateHash();
        this.nonce = 0;
    }

    calculateHash(): string {
        return crypto
            .createHash('sha256')
            .update(
                this.index +
                this.previousHash +
                this.timestamp +
                JSON.stringify(this.vote) +
                this.nonce
            )
            .digest('hex');
    }

    mineBlock(difficulty: number): void {
        while (this.hash.substring(0, difficulty) !== Array(difficulty + 1).join('0')) {
            this.nonce++;
            this.hash = this.calculateHash();
        }
        console.log('Block mined: ' + this.hash);
    }
}
