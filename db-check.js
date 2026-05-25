const mongoose = require('mongoose');
const Event = require('./src/models/Event');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    const events = await Event.find();
    console.log(JSON.stringify(events, null, 2));
    process.exit(0);
  });
