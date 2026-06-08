const { MongoClient } = require('mongodb');
require('dotenv').config();

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

async function run() {
  try {
    await client.connect();
    console.log("Connected to MongoDB for fast fixing events...");
    
    const db = client.db('cinema_hub');
    const events = db.collection('events');
    
    // 1. Reset base64 strings in the 'image' field
    const res1 = await events.updateMany(
      { image: { $regex: /^data:image\// } },
      { $set: { image: 'no-photo.jpg' } }
    );
    console.log(`Updated ${res1.modifiedCount} events with base64 'image'.`);

    // 2. Remove base64 strings from the 'gallery' array
    const res2 = await events.updateMany(
      { },
      { $pull: { gallery: { $regex: /^data:image\// } } }
    );
    console.log(`Updated ${res2.modifiedCount} events containing base64 images in 'gallery'.`);

  } catch (err) {
    console.log("Error:", err.stack);
  } finally {
    await client.close();
  }
}

run().catch(console.dir);
