import { MongoClient } from "mongodb";
import { Booking, Database, Listing, User } from "../lib/types";

// const url = `mongodb+srv://${process.env.DB_USER}:${
//   process.env.DB_USER_PASSWORD
// }@${process.env.DB_CLUSTER}.mongodb.net`;

const url = "mongodb://localhost/paper-houses";

export const connectDatabase = async (): Promise<Database> => {
  const client = await MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true });
  const db = client.db("main");

  return {
      bookings: db.collection<Booking>("bookings"),
      listings: db.collection<Listing>("listings"),
      users: db.collection<User>("users"),
  };
};
