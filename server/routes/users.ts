import express from "express";
import db from "../db/conn";
import { ObjectId } from "mongodb";

const router = express.Router();

interface User {
  _id?: ObjectId;
  username: String;
}

interface Exercise {
  duration: Number;
  date: Date;
  description: String;
  user_id: ObjectId;
}

router.post("/", async (req, res) => {
  let collection = await db.then((db) => db.collection<User>("user"));

  const newUser = {
    username: req.body.username,
  };

  let result = await collection
    .insertOne(newUser)
    .then((insertedUser) =>
      collection.findOne<User>({ _id: insertedUser.insertedId }),
    )
    .catch((e) => {
      if (e.code === 11000) {
        return collection.findOne<User>(e.keyValue);
      }

      console.log(e);
    });

  res.json(result);
});

router.get("/", async (_req, res) => {
  let collection = await db.then((db) => db.collection<User>("user"));

  const usersCursor = collection.find<User>({});
  const usersArray = await usersCursor.toArray();

  res.send(usersArray);
});

router.post("/:_id/exercises", async (req, res) => {
  const exerciseCollection = await db.then((db) =>
    db.collection<Exercise>("exercise"),
  );
  const userCollection = await db.then((db) => db.collection<User>("user"));

  let { description, duration, date } = req.body;

  date = date ? new Date(date) : new Date();

  const { _id: userId } = req.params;

  await exerciseCollection.insertOne({
    description,
    date,
    duration: Number(duration),
    user_id: new ObjectId(userId),
  });

  const userFound = await userCollection.findOne({ _id: new ObjectId(userId) });

  const mergedDocument = {
    ...userFound,
    duration: Number(duration),
    description,
    date: date.toDateString(),
  };

  res.send(mergedDocument);
});

router.get("/:_id/logs", async (req, res) => {
  const exerciseCollection = await db.then((db) =>
    db.collection<Exercise>("exercise"),
  );
  const userCollection = await db.then((db) => db.collection<User>("user"));

  const { from, to, limit } = req.query;

  const { _id: userId } = req.params;

  const userFound = await userCollection.findOne({ _id: new ObjectId(userId) });

  if (from || to || limit) {
    const exercisesFound = exerciseCollection.find(
      {
        user_id: new ObjectId(userId),
        ...(from &&
          to && {
            date: {
              ...(from && { $gte: new Date(String(from)) }),
              ...(to && { $lt: new Date(String(to)) }),
            },
          }),
      },
      {
        limit: Number(limit),
      },
    );

    const exerciseArray = await exercisesFound.toArray();

    const mergedDocument = {
      ...userFound,
      count: exerciseArray.length,
      log: exerciseArray.map((ex) => ({
        duration: ex.duration,
        date: ex.date.toDateString(),
        description: ex.description,
      })),
    };

    res.send(mergedDocument);
  } else {
    const exercisesFound = exerciseCollection.find({
      user_id: new ObjectId(userId),
    });
    const exerciseArray = await exercisesFound.toArray();

    const mergedDocument = {
      ...userFound,
      count: exerciseArray.length,
      log: exerciseArray.map((ex) => ({
        duration: ex.duration,
        date: ex.date.toDateString(),
        description: ex.description,
      })),
    };

    res.send(mergedDocument);
  }
});

export default router;
