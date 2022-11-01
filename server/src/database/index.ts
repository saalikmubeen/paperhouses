import { MongoClient } from "mongodb";
import { Booking, Chat, Database, Listing, Message, User } from "../lib/types";

const url =
    process.env.NODE_ENV === "production"
        ? process.env.MONGO_URI
        : "mongodb://localhost/paper-houses";

export const connectDatabase = async (): Promise<Database> => {
    const client = await MongoClient.connect(url!, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });
    const db = client.db("main");

    return {
        bookings: db.collection<Booking>("bookings"),
        listings: db.collection<Listing>("listings"),
        users: db.collection<User>("users"),
        messages: db.collection<Message>("messages"),
        chat: db.collection<Chat>("chat"),
    };
};
