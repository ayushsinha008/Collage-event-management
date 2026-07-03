const mongoose = require('mongoose');
const MONGO_URI = "mongodb+srv://ayushsinha391_db_user:YxWpgCgnnRntmC70@cluster0.i8ohngb.mongodb.net/?appName=Cluster0";

mongoose.connect(MONGO_URI).then(async () => {
    const user = await mongoose.connection.collection('users').findOne({ email: 'ayushsinha391@gmail.com' });
    const registrations = await mongoose.connection.collection('registrations').find({ user: user._id, status: 'Confirmed' }).toArray();
    const regIds = registrations.map(r => r._id);
    const tickets = await mongoose.connection.collection('tickets').find({ registration: { $in: regIds }, status: 'Active' }).toArray();
    console.log("Tickets count:", tickets.length);
    console.log("Registrations count:", registrations.length);
    console.dir(tickets, { depth: null });
    process.exit(0);
});
