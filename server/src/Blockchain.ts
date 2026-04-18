import { Block } from './Block';
import { Transaction } from './types';
import BlockModel from './models/BlockModel';

export class Blockchain {
    public chain: Block[] = [];
    private difficulty: number = 2; // Keep it low for fast testing
    private initialized: boolean = false;
    private initPromise: Promise<void> | null = null;

    constructor() {
        // Initialization is now handled by the async init() method
    }

    /**
     * Initializes the blockchain by loading existing blocks from MongoDB.
     * If no blocks exist, it creates and saves the Genesis block.
     */
    public async init(): Promise<void> {
        if (this.initialized) {
            return;
        }

        if (this.initPromise) {
            await this.initPromise;
            return;
        }

        this.initPromise = (async () => {
        const dbBlocks = await BlockModel.find().sort({ index: 1 });

        if (dbBlocks.length > 0) {
            this.chain = dbBlocks.map(dbBlock => {
                const block = new Block(
                    dbBlock.index,
                    dbBlock.timestamp,
                    dbBlock.transaction,
                    dbBlock.previousHash
                );
                block.hash = dbBlock.hash;
                block.nonce = dbBlock.nonce;
                return block;
            });
            console.log(`Blockchain initialized with ${this.chain.length} blocks from database.`);
        } else {
            console.log('No existing blockchain found. Creating Genesis block...');
            const genesisBlock = this.createGenesisBlock();
            await this.saveBlockToDb(genesisBlock);
            this.chain = [genesisBlock];
        }
        this.initialized = true;
        })();

        try {
            await this.initPromise;
        } finally {
            this.initPromise = null;
        }
    }

    public async ensureInitialized(): Promise<void> {
        await this.init();
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

    public async addTransaction(transaction: Transaction): Promise<void> {
        await this.ensureInitialized();

        const newBlock = new Block(
            this.chain.length,
            Date.now(),
            transaction,
            this.getLatestBlock().hash
        );

        newBlock.mineBlock(this.difficulty);
        console.log('Block successfully mined!');
        
        await this.saveBlockToDb(newBlock);
        this.chain.push(newBlock);
    }

    private async saveBlockToDb(block: Block): Promise<void> {
        await BlockModel.create({
            index: block.index,
            timestamp: block.timestamp,
            transaction: block.transaction,
            previousHash: block.previousHash,
            hash: block.hash,
            nonce: block.nonce
        });
    }

    public isChainValid(): boolean {
        for (let i = 1; i < this.chain.length; i++) {
            const currentBlock = this.chain[i];
            const previousBlock = this.chain[i - 1];

            if (currentBlock.hash !== currentBlock.calculateHash()) {
                return false;
            }

            if (currentBlock.previousHash !== previousBlock.hash) {
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
