import crypto from 'crypto';
import { Transaction } from './types';

export class Block {
    public index: number;
    public timestamp: number;
    public transaction: Transaction; // Now represents a generic action (Vote, Registration, Admin Action)
    public previousHash: string;
    public hash: string;
    public nonce: number;

    constructor(index: number, timestamp: number, transaction: Transaction, previousHash: string = '') {
        this.index = index;
        this.timestamp = timestamp;
        this.transaction = transaction;
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
                JSON.stringify(this.transaction) +
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
