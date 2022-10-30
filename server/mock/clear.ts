require("dotenv").config();

import { connectDatabase } from "../src/database";

const clear = async () => {
    try {
        console.log("[clear] : running...");

        const db = await connectDatabase();

        const bookings = await db.bookings.find({}).toArray();
        const listings = await db.listings.find({}).toArray();
        const users = await db.users.find({}).toArray();
        const messages = await db.messages.find({}).toArray();
        const chat = await db.chat.find({}).toArray();

        if (bookings.length > 0) {
            await db.bookings.drop();
        }

        if (listings.length > 0) {
            await db.listings.drop();
        }

        if (users.length > 0) {
            await db.users.drop();
        }

        if (messages.length > 0) {
            await db.messages.drop();
        }

        if (chat.length > 0) {
            await db.chat.drop();
        }

        console.log("[clear] : success");
    } catch {
        throw new Error("failed to clear database");
    }
};

clear();
