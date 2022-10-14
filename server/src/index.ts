require("dotenv").config();

import express, { Application } from "express";
import { ApolloServer } from "apollo-server-express";
import cookieParser from "cookie-parser";
import { connectDatabase } from "./database";
import { typeDefs, resolvers } from "./graphql";

const PORT = process.env.PORT || 5000;

const mount = async (app: Application) => {
  const db = await connectDatabase();

  app.use(cookieParser(process.env.SECRET));

  const server = new ApolloServer({
      typeDefs,
      resolvers,
      context: ({ req, res }) => ({ db, req, res }),
  });

  server.applyMiddleware({ app, path: "/api" });
  app.listen(PORT);

  console.log(`[app] : http://localhost:${PORT}`);
};

mount(express());

// Note: You will need to introduce a .env file at the root of the project
// that has the PORT, DB_USER, DB_USER_PASSWORD, and DB_CLUSTER environment variables defined.
// Otherwise, the server will not be able to start and/or connect to the database
