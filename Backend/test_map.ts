import mongoose from 'mongoose';
import { RegistrationService } from './src/services/registration.service';
import { User } from './src/models/User.model';

const MONGO_URI = "mongodb+srv://ayushsinha391_db_user:YxWpgCgnnRntmC70@cluster0.i8ohngb.mongodb.net/?appName=Cluster0";

async function run() {
    await mongoose.connect(MONGO_URI);
    const user = await User.findOne({ email: 'ayushsinha391@gmail.com' });
    if (!user) throw new Error("No user");
    
    const tickets = await RegistrationService.getUserTickets(user._id.toString(), {});
    // Simulate App.tsx logic
    const myTicketDetails = JSON.parse(JSON.stringify(tickets)); // simulate JSON transmission
    const myTickets = myTicketDetails
      .map((t: any) => t.registration?.event?._id || t.registration?.event?.id || t.registration?.event)
      .filter(Boolean) as string[];
      
    console.log("myTickets mapped:", myTickets);
    process.exit(0);
}

run().catch(console.error);
