const mongoose = require('mongoose');
const MONGO_URI = "mongodb+srv://ayushsinha391_db_user:YxWpgCgnnRntmC70@cluster0.i8ohngb.mongodb.net/?appName=Cluster0";

mongoose.connect(MONGO_URI).then(async () => {
    const events = await mongoose.connection.collection('events').find({}).toArray();
    console.log(JSON.stringify(events.map(e => ({ title: e.title, bannerImage: e.bannerImage })), null, 2));
    process.exit(0);
});
