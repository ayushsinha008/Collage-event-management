const mongoose = require('mongoose');
const MONGO_URI = "mongodb+srv://ayushsinha391_db_user:YxWpgCgnnRntmC70@cluster0.i8ohngb.mongodb.net/?appName=Cluster0";

mongoose.connect(MONGO_URI).then(async () => {
    const event = await mongoose.connection.collection('events').findOne({ _id: new mongoose.Types.ObjectId("6a473efc64a13bd5ae2c14bc") });
    console.log(event);
    process.exit(0);
});
