const mongoose = require('mongoose');
const MONGO_URI = "mongodb+srv://ayushsinha391_db_user:YxWpgCgnnRntmC70@cluster0.i8ohngb.mongodb.net/?appName=Cluster0";

mongoose.connect(MONGO_URI).then(async () => {
    const user = await mongoose.connection.collection('users').findOne({ email: 'ayushsinha391@gmail.com' });
    const registrations = await mongoose.connection.collection('registrations').find({ user: user._id }).toArray();
    const tickets = await mongoose.connection.collection('tickets').find({ registration: { $in: registrations.map(r => r._id) } }).toArray();
    console.log("Registrations:");
    console.dir(registrations, { depth: null });
    console.log("Tickets:");
    console.dir(tickets, { depth: null });
    process.exit(0);
});
