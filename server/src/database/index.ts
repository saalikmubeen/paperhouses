import { MongoClient } from "mongodb";
import { Booking, Chat, Database, Listing, Message, User } from "../lib/types";

const username = encodeURIComponent(process.env.MONGO_USER!);
const password = encodeURIComponent(process.env.MONGO_PASSWORD!);

let uri = `mongodb+srv://${username}:${password}@paper-houses.3df2fiq.mongodb.net/?retryWrites=true&w=majority`;

const url =
    process.env.NODE_ENV === "production"
        ? uri
        : "mongodb://localhost/paper-houses";

export const connectDatabase = async (): Promise<Database> => {
    const client = await MongoClient.connect(url, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });
    const db = client.db("main");

    return {
        bookings: db.collection<Booking>("bookings"),
        users: db.collection<User>("users"),
        messages: db.collection<Message>("messages"),
        chat: db.collection<Chat>("chat"),
        listings: db.collection<Listing>("listings"),
    };
};
