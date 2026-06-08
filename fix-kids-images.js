const { MongoClient } = require('mongodb');
require('dotenv').config();

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

async function run() {
  try {
    await client.connect();
    const db = client.db('cinema_hub');
    const series = db.collection('kidsseries');
    
    const res = await series.updateMany(
      { image: 'no-photo.jpg' },
      { $set: { image: 'https://images.unsplash.com/photo-1502086223501-7ea2443054f1?w=400&h=200&fit=crop' } }
    );
    console.log(`Updated ${res.modifiedCount} series with placeholder image.`);

  } catch (err) {
    console.log("Error:", err.stack);
  } finally {
    await client.close();
  }
}

run().catch(console.dir);
