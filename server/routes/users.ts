import express from "express";
import db from "../db/conn";
import { ObjectId } from "mongodb";

const router = express.Router();

interface User {
  username: String;
  description: String | null;
  duration: Number | null;
  date: String;
}

router.post("/", async (req, res) => {
  let collection = await db.then((db) => db.collection<User>("users"));

  const newUser = {
    username: req.body.username,
    description: null,
    duration: null,
    date: new Date().toDateString(),
  };

  let result = await collection
    .insertOne(newUser)
    .then((insertedUser) =>
      collection.findOne<User>(
        { _id: insertedUser.insertedId },
        {
          projection: { _id: 1, username: 1 },
        },
      ),
    )
    .catch(() => res.json({ err: "Usarname aldread exist" }));
  res.json(result);
});

router.get("/", async (req, res) => {
  let collection = await db.then((db) => db.collection<User>("users"));

  const usersCursor = collection.find<User>({});

  res.send(await usersCursor.toArray());
});

router.post("/:_id/exercises", async (req, res) => {
  let collection = await db.then((db) => db.collection<User>("users"));

  const { description, duration, date } = req.body;

  const result = await collection.findOneAndUpdate(
    { _id: new ObjectId(req.params._id) },
    {
      $set: {
        description,
        duration,
        date: date || new Date().toDateString(),
      },
    },
  );

  res.send(result.value);
});

router.get('/:id/logs', async (req, res) => {
  let collection = await db.then((db) => db.collection<User>("users"));

});

export default router;
