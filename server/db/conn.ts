import { MongoClient } from "mongodb";
import dotenv from "dotenv";
dotenv.config();

const connectionString = process.env.MONGO_URI || "";

const client = new MongoClient(connectionString);

function run() {
  try {
    return client.connect();
  } finally {
    client.close();
  }
}

let db = run().then((client) => client.db("freecodecamp"));

export default db;
