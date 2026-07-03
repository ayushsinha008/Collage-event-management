const mongoose = require('mongoose');
const MONGO_URI = "mongodb+srv://ayushsinha391_db_user:YxWpgCgnnRntmC70@cluster0.i8ohngb.mongodb.net/?appName=Cluster0";

mongoose.connect(MONGO_URI).then(async () => {
    const events = await mongoose.connection.collection('events').find({}).toArray();
    console.log("Total events:", events.length);
    if (events.length > 0) {
        console.log("First event organizer ID:", events[0].organizer);
    }
    
    const organizerUser = await mongoose.connection.collection('users').findOne({ uid: 'festflow-organizer' });
    console.log("Organizer User ID:", organizerUser ? organizerUser._id : "Not found");
    
    const allUsers = await mongoose.connection.collection('users').find({}).toArray();
    console.log("All users:");
    allUsers.forEach(u => console.log(u.name, u._id, u.role, u.uid));
    
    process.exit(0);
});
