import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './src/models/User';

dotenv.config();

const makeAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/chain_voting');
        console.log('Connected to Database.');

        // Get the email from arguments
        const email = process.argv[2];

        if (!email) {
            console.error('Please provide the regular user email as an argument.');
            console.error('Usage: ts-node make-admin.ts <user_email>');
            process.exit(1);
        }

        const user = await User.findOne({ email });

        if (!user) {
            console.error(`User with email ${email} not found.`);
            process.exit(1);
        }

        user.isAdmin = true;
        await user.save();

        console.log(`\nSuccess! The user "${user.username}" (${user.email}) is now an Admin.`);
        console.log('Please log out and log back in on the frontend to refresh your abilities.');

        process.exit(0);
    } catch (error) {
        console.error('Error making user admin:', error);
        process.exit(1);
    }
};

makeAdmin();
