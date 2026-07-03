const mongoose = require('mongoose');
const { RegistrationService } = require('./src/services/registration.service');

const MONGO_URI = "mongodb+srv://ayushsinha391_db_user:YxWpgCgnnRntmC70@cluster0.i8ohngb.mongodb.net/?appName=Cluster0";

async function run() {
    await mongoose.connect(MONGO_URI);
    
    // Register the models before populating
    require('./src/models/User.model');
    require('./src/models/Event.model');
    require('./src/models/Registration.model');
    require('./src/models/Ticket.model');

    const user = await mongoose.connection.collection('users').findOne({ email: 'ayushsinha391@gmail.com' });
    const tickets = await RegistrationService.getUserTickets(user._id.toString(), {});
    console.log(JSON.stringify(tickets, null, 2));
    process.exit(0);
}

run().catch(console.error);
