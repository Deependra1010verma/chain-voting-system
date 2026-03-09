import { Block } from './Block';
import { Vote } from './types';

export class Blockchain {
    public chain: Block[];
    private difficulty: number;

    constructor() {
        this.chain = [this.createGenesisBlock()];
        this.difficulty = 2; // Keep it low for fast testing
    }

    private createGenesisBlock(): Block {
        const genesisVote: Vote = {
            voterId: 'Genesis',
            candidate: 'None',
            timestamp: Date.now()
        };
        return new Block(0, Date.now(), genesisVote, '0');
    }

    public getLatestBlock(): Block {
        return this.chain[this.chain.length - 1];
    }

    public addVote(vote: Vote): void {
        const newBlock = new Block(
            this.chain.length,
            Date.now(),
            vote,
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
                console.error('Hash invalid', currentBlock);
                return false;
            }

            if (currentBlock.previousHash !== previousBlock.hash) {
                console.error('Previous Hash invalid', currentBlock);
                return false;
            }
        }
        return true;
    }

    public getVotes(): Vote[] {
        // Skip genesis block
        return this.chain.slice(1).map(block => block.vote);
    }
}
