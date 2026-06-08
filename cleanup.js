const { MongoClient } = require('mongodb');

const uri = "mongodb://sabbahossain123_db_user:2L5sPZjarv6UAViJ@ac-draz2ne-shard-00-00.j8cin9x.mongodb.net:27017,ac-draz2ne-shard-00-01.j8cin9x.mongodb.net:27017,ac-draz2ne-shard-00-02.j8cin9x.mongodb.net:27017/cinema_hub?ssl=true&authSource=admin&replicaSet=atlas-1390za-shard-0";
const client = new MongoClient(uri);

async function run() {
  try {
    await client.connect();
    console.log("Connected correctly to server");
    
    const db = client.db('cinema_hub');
    const col = db.collection('kidsseries');
    
    // Find just the length of documents
    const count = await col.countDocuments();
    console.log("Total docs:", count);
    
    // Delete all
    const result = await col.deleteMany({});
    console.log("Deleted count:", result.deletedCount);
    
  } catch (err) {
    console.log(err.stack);
  } finally {
    await client.close();
  }
}

run().catch(console.dir);
