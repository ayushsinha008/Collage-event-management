const mongoose = require('mongoose');
const MONGO_URI = "mongodb+srv://ayushsinha391_db_user:YxWpgCgnnRntmC70@cluster0.i8ohngb.mongodb.net/?appName=Cluster0";

mongoose.connect(MONGO_URI).then(async () => {
    const defaultBanner = 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=80';
    
    await mongoose.connection.collection('events').updateMany(
        { $or: [{ bannerImage: "" }, { bannerImage: { $exists: false } }] },
        { $set: { bannerImage: defaultBanner } }
    );

    console.log("Restored banner images.");
    process.exit(0);
});
