const { MongoClient } = require('mongodb');
require('dotenv').config();

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

async function run() {
  try {
    await client.connect();
    console.log("Connected to MongoDB for fast fixing kidsseries...");
    
    const db = client.db('cinema_hub');
    const series = db.collection('kidsseries');
    
    // Clear image
    const res1 = await series.updateMany(
      { image: { $regex: /^data:/ } },
      { $set: { image: 'no-photo.jpg' } }
    );
    console.log(`Updated ${res1.modifiedCount} series with base64 'image'.`);

    // Clear audioLink
    const res2 = await series.updateMany(
      { audioLink: { $regex: /^data:/ } },
      { $set: { audioLink: '' } }
    );
    console.log(`Updated ${res2.modifiedCount} series with base64 'audioLink'.`);

    // Find any very large documents
    const cursor = series.find({});
    for await (const doc of cursor) {
      let updated = false;
      for (const key in doc) {
        if (typeof doc[key] === 'string' && doc[key].length > 100000) {
          console.log(`Found large string in field ${key} for doc ${doc._id}. Clearing it.`);
          doc[key] = '';
          updated = true;
        }
      }
      if (updated) {
        await series.updateOne({ _id: doc._id }, { $set: doc });
      }
    }
    console.log("Finished checking for large fields.");

  } catch (err) {
    console.log("Error:", err.stack);
  } finally {
    await client.close();
  }
}

run().catch(console.dir);
