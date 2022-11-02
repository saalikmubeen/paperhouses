require("dotenv").config();

import http from "http";
import express, { Application } from "express";
import { ApolloServer } from "apollo-server-express";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import compression from "compression";
import { connectDatabase } from "./database";
import { typeDefs, resolvers } from "./graphql";
import { pubSub } from "./lib/pubSub";
import { Console } from "console";

const PORT = process.env.PORT || 9000;
const FRONTEND_URL = process.env.PUBLIC_URL; 

const mount = async (app: Application) => {
    const db = await connectDatabase();

    const indexExists = await db.listings.indexExists("country_1_city_1_admin_1")

    if(!indexExists) {
        const result = await db.listings.createIndex({ country: 1, city: 1, admin: 1  });
        console.log(`Index created: ${result}`);
    }

    app.use(bodyParser.json({ limit: "2mb" }));
    app.use(cookieParser(process.env.SECRET));
    app.use(compression());

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
            const token = req.get("X-CSRF-TOKEN");
            console.log("X-CSRF-TOKEN", token);

            if(connection) {
                // the object returned from onConnect will be connection.context
                // console.log(connection.context.csrfToken);
            }

            return { db, req, res, pubSub: pubSub, connection };
        },
        
    });

    apolloServer.applyMiddleware({ app, path: "/api", cors : { origin: FRONTEND_URL, credentials: true } });

    const httpServer = http.createServer(app);
    apolloServer.installSubscriptionHandlers(httpServer);
    httpServer.listen(PORT, () => console.log(`[app] : http://localhost:${PORT}`));
};

mount(express());
