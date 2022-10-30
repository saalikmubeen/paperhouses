require("dotenv").config();

import http from "http";
import express, { Application } from "express";
import { ApolloServer } from "apollo-server-express";
import cookieParser from "cookie-parser";
import { connectDatabase } from "./database";
import { typeDefs, resolvers } from "./graphql";
import { pubSub } from "./lib/pubSub";

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
                // console.log((webSocket as any).upgradeReq.headers.cookie);
                return {
                    req: context.request,
                    csrfToken: (connectionParams as any).xCsrfToken || ""
                };
            },
        },
        context: ({ req, res, connection }) => {

            if(connection) {
                // the object returned from onConnect will be connection.context
                // console.log(connection.context.csrfToken);
            }

            return { db, req, res, pubSub: pubSub, connection };
        },
    });

    apolloServer.applyMiddleware({ app, path: "/api" });

    const httpServer = http.createServer(app);
    apolloServer.installSubscriptionHandlers(httpServer);
    httpServer.listen(PORT, () => console.log(`[app] : http://localhost:${PORT}`));
};

mount(express());
