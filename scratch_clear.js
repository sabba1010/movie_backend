require('dotenv').config();
require('mongoose').connect(process.env.MONGODB_URI).then(async () => {
  const Event = require('./src/models/Event');
  const result = await Event.updateMany({}, { $set: { gallery: [] } });
  console.log("Updated", result.modifiedCount, "events.");
  process.exit(0);
}).catch(console.error);
