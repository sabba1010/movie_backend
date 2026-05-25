const mongoose = require('mongoose');
const Event = require('./src/models/Event');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    const User = require('./src/models/User');
    const users = await User.find();
    console.log(JSON.stringify(users, null, 2));
    process.exit(0);
  });
