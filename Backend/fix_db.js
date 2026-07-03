const mongoose = require('mongoose');
const MONGO_URI = "mongodb+srv://ayushsinha391_db_user:YxWpgCgnnRntmC70@cluster0.i8ohngb.mongodb.net/?appName=Cluster0";

mongoose.connect(MONGO_URI).then(async () => {
    const users = await mongoose.connection.collection('users').find({
        $or: [
            { photoURL: { $regex: 'unsplash.com' } },
            { photoURL: { $regex: 'pravatar.cc' } }
        ]
    }).toArray();
    console.log(`Found ${users.length} users with fake avatars`);
    
    await mongoose.connection.collection('users').updateMany(
        { 
            $or: [
                { photoURL: { $regex: 'unsplash.com' } },
                { photoURL: { $regex: 'pravatar.cc' } }
            ]
        },
        { $set: { photoURL: '' } }
    );

    const events = await mongoose.connection.collection('events').find({
        $or: [
            { bannerImage: { $regex: 'unsplash.com' } },
            { bannerImage: { $regex: 'picsum.photos' } }
        ]
    }).toArray();
    console.log(`Found ${events.length} events with fake banners`);
    
    await mongoose.connection.collection('events').updateMany(
        { 
            $or: [
                { bannerImage: { $regex: 'unsplash.com' } },
                { bannerImage: { $regex: 'picsum.photos' } }
            ]
        },
        { $set: { bannerImage: '' } }
    );


    console.log("Cleared fake avatars and banners.");
    process.exit(0);
});
