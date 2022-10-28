require("dotenv").config();

import http from "http";
import express, { Application } from "express";
import { ApolloServer } from "apollo-server-express";
import cookieParser from "cookie-parser";
import { connectDatabase } from "./database";
import { typeDefs, resolvers } from "./graphql";

const PORT = process.env.PORT || 5000;

const mount = async (app: Application) => {
    const db = await connectDatabase();

    const indexExists = await db.listings.indexExists("country_1_city_1_admin_1")

    if(!indexExists) {
        const result = await db.listings.createIndex({ country: 1, city: 1, admin: 1  });
        console.log(`Index created: ${result}`);
    }

    app.use(cookieParser(process.env.SECRET));

    const apolloServer = new ApolloServer({
        typeDefs,
        resolvers,
        subscriptions: {
            path: "/api",
            onConnect: (connectionParams, webSocket, context) => {
                console.log("Connected!");
            },
        },
        context: ({ req, res }) => ({ db, req, res }),
    });

    apolloServer.applyMiddleware({ app, path: "/api" });

    const httpServer = http.createServer(app);
    apolloServer.installSubscriptionHandlers(httpServer);
    httpServer.listen(PORT, () => console.log(`[app] : http://localhost:${PORT}`));
};

mount(express());

// Note: You will need to introduce a .env file at the root of the project
// that has the PORT, DB_USER, DB_USER_PASSWORD, and DB_CLUSTER environment variables defined.
// Otherwise, the server will not be able to start and/or connect to the database
