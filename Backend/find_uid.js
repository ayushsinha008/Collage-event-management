const mongoose = require('mongoose');
const MONGO_URI = "mongodb+srv://ayushsinha391_db_user:YxWpgCgnnRntmC70@cluster0.i8ohngb.mongodb.net/?appName=Cluster0";

mongoose.connect(MONGO_URI).then(async () => {
    const user = await mongoose.connection.collection('users').findOne({ email: 'ayushsinha391@gmail.com' });
    console.log("UID:", user.uid);
    process.exit(0);
});
