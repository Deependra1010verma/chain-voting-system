import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Candidate from './src/models/Candidate';

dotenv.config();

const dummyCandidates = [
    {
        name: 'Aarav Sharma',
        party: 'Development Party',
        position: 'President',
        image: 'https://ui-avatars.com/api/?name=Aarav+Sharma&background=0D8ABC&color=fff&size=200'
    },
    {
        name: 'Priya Patel',
        party: 'Progressive Alliance',
        position: 'President',
        image: 'https://ui-avatars.com/api/?name=Priya+Patel&background=EB4D4B&color=fff&size=200'
    },
    {
        name: 'Rohan Gupta',
        party: 'Unity Front',
        position: 'President',
        image: 'https://ui-avatars.com/api/?name=Rohan+Gupta&background=2ECC71&color=fff&size=200'
    }
];

const seedDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb+srv://Blockchain-voting:Vdeep%401234@blockchain-voting.jlvuqxh.mongodb.net/');
        console.log('MongoDB Connected');
        await Candidate.deleteMany();
        await Candidate.insertMany(dummyCandidates);
        console.log('Candidates seeded successfully!');
        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

seedDB();
