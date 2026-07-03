const mongoose = require('mongoose');
const MONGO_URI = "mongodb+srv://ayushsinha391_db_user:YxWpgCgnnRntmC70@cluster0.i8ohngb.mongodb.net/?appName=Cluster0";

mongoose.connect(MONGO_URI).then(async () => {
    const organizerUser = await mongoose.connection.collection('users').findOne({ uid: 'festflow-organizer' });
    if (!organizerUser) {
        console.log("Organizer not found");
        process.exit(1);
    }
    
    console.log("Organizer User ID:", organizerUser._id);
    
    const result = await mongoose.connection.collection('events').updateMany(
        {}, 
        { $set: { organizer: organizerUser._id } }
    );
    
    console.log("Modified count:", result.modifiedCount);
    process.exit(0);
});
