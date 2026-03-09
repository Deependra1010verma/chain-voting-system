import { Block } from './Block';
import { Transaction } from './types';

export class Blockchain {
    public chain: Block[];
    private difficulty: number;

    constructor() {
        this.chain = [this.createGenesisBlock()];
        this.difficulty = 2; // Keep it low for fast testing
    }

    private createGenesisBlock(): Block {
        const genesisTransaction: Transaction = {
            type: 'ADMIN_ACTION',
            data: { message: 'Genesis Block Created' },
            timestamp: Date.now()
        };
        return new Block(0, Date.now(), genesisTransaction, '0');
    }

    public getLatestBlock(): Block {
        return this.chain[this.chain.length - 1];
    }

    public addTransaction(transaction: Transaction): void {
        const newBlock = new Block(
            this.chain.length,
            Date.now(),
            transaction,
            this.getLatestBlock().hash
        );

        newBlock.mineBlock(this.difficulty);
        console.log('Block successfully mined!');
        this.chain.push(newBlock);
    }

    public isChainValid(): boolean {
        for (let i = 1; i < this.chain.length; i++) {
            const currentBlock = this.chain[i];
            const previousBlock = this.chain[i - 1];

            if (currentBlock.hash !== currentBlock.calculateHash()) {
                console.error('Hash invalid for block', currentBlock.index);
                console.error('Expected:', currentBlock.hash);
                console.error('Calculated:', currentBlock.calculateHash());
                console.error('Transaction Object:', currentBlock.transaction);
                console.error('Transaction Stringified:', JSON.stringify(currentBlock.transaction));
                return false;
            }

            if (currentBlock.previousHash !== previousBlock.hash) {
                console.error('Previous Hash invalid', currentBlock);
                return false;
            }
        }
        return true;
    }

    // Still necessary for vote counting, so we filter by VOTE type
    public getVotes(): Transaction[] {
        return this.chain
            .slice(1)
            .map(block => block.transaction)
            .filter(tx => tx.type === 'VOTE');
    }
}
