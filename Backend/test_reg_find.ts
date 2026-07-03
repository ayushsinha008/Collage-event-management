import mongoose from 'mongoose';
import { Registration } from './src/models/Registration.model';
import { RegistrationStatus } from './src/types';
import { User } from './src/models/User.model';

const MONGO_URI = "mongodb+srv://ayushsinha391_db_user:YxWpgCgnnRntmC70@cluster0.i8ohngb.mongodb.net/?appName=Cluster0";

async function run() {
    await mongoose.connect(MONGO_URI);
    const user = await User.findOne({ email: 'ayushsinha391@gmail.com' });
    if (!user) throw new Error("No user");
    
    const userId = user._id.toString();
    const allRegs = await Registration.find({ user: userId });
    console.log("Status in DB:", allRegs[0].status);
    console.log("Enum value:", RegistrationStatus.CONFIRMED);
    console.log("Matches?", allRegs[0].status === RegistrationStatus.CONFIRMED);
    
    process.exit(0);
}

run().catch(console.error);
