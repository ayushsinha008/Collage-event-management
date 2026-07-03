const mongoose = require('mongoose');
const MONGO_URI = "mongodb+srv://ayushsinha391_db_user:YxWpgCgnnRntmC70@cluster0.i8ohngb.mongodb.net/?appName=Cluster0";

mongoose.connect(MONGO_URI).then(async () => {
    const users = await mongoose.connection.collection('users').find({ photoURL: { $regex: 'cloudinary' } }).toArray();
    console.log(`Found ${users.length} users with cloudinary avatars`);
    process.exit(0);
});
