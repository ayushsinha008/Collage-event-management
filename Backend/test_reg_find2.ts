import mongoose from 'mongoose';
import { Registration } from './src/models/Registration.model';

const MONGO_URI = "mongodb+srv://ayushsinha391_db_user:YxWpgCgnnRntmC70@cluster0.i8ohngb.mongodb.net/?appName=Cluster0";

async function run() {
    await mongoose.connect(MONGO_URI);
    const user = await mongoose.connection.collection('users').findOne({ email: 'ayushsinha391@gmail.com' });
    
    const userId = user._id;
    
    // Create a dummy one
    await Registration.create({
       user: userId,
       event: new mongoose.Types.ObjectId(),
       status: 'Confirmed'
    });
    
    const found = await Registration.find({ user: userId, status: 'Confirmed' });
    console.log("Found:", found.length);
    
    // Clean up
    await Registration.deleteOne({ user: userId, status: 'Confirmed', _id: found[0]?._id });
    process.exit(0);
}

run().catch(console.error);
