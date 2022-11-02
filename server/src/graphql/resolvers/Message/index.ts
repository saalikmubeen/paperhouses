import { Request } from "express";
import { IResolvers } from "apollo-server-express";
import { Database, Message, User } from "../../../lib/types";
import { authorize } from "../../../lib/utils";
import { CreateMessageArgs, SendMessageArgs } from "./types";
import { ObjectId } from "mongodb";
import { PubSub } from "graphql-subscriptions";
import cookieParser from "cookie-parser";
import cookie from 'cookie'

export const messageResolvers: IResolvers = {
    Mutation: {
        createMessage: async (
            _root: undefined,
            { input }: CreateMessageArgs,
            { db, req, pubSub }: { db: Database; req: Request; pubSub: PubSub }
        ): Promise<Message> => {
            let viewer = await authorize(db, req);
            if (!viewer) {
                throw new Error("viewer cannot be found");
            }

            // add message to database
            const insertResult = await db.messages.insertOne({
                _id: new ObjectId(),
                content: input.content,
                author: viewer._id,
                createdAt: new Date().toISOString(),
            });

            const insertedMessage: Message = insertResult.ops[0];

            // find the chat and add the message to the list of messages in that chat
            let chat = await db.chat.findOne({
                participants: {
                    $all: [viewer._id, input.to],
                },
            });

            if (!chat) {
                throw new Error("Chat doesn't exist!");
            }

            await db.chat.updateOne(
                {
                    _id: chat._id,
                },
                {
                    $push: { messages: insertedMessage._id },
                }
            );

            pubSub.publish(`SEND_MESSAGE ${chat._id}`, {
                sendMessage: insertedMessage,
            });

            return insertedMessage;
        },
    },

    Subscription: {
        sendMessage: {
            async subscribe(
                _parent,
                { to }: SendMessageArgs,
                {
                    db,
                    req,
                    pubSub,
                    connection,
                }: {
                    db: Database;
                    req: Request;
                    pubSub: PubSub;
                    connection: any;
                },
                _info
            ) {
                const reqCookie = connection.context.req.headers.cookie;
                var cookies = cookie.parse(reqCookie);

                if (!cookies.viewer) {
                    throw new Error("viewer cannot be found | unauthorized");
                }

                const viewerId = cookieParser.signedCookie(
                    cookies.viewer,
                    process.env.SECRET!
                );

                if (!viewerId) {
                    throw new Error("viewer cannot be found | unauthorized");
                }

                // console.log("X-CSRF-TOKEN:", connection.context.csrfToken);

                const viewer = await db.users.findOne({
                    _id: viewerId,
                    // token,
                });

                if (!viewer) {
                    throw new Error("viewer cannot be found | unauthorized");
                }

                let chat = await db.chat.findOne({
                    participants: {
                        $all: [viewer._id, to],
                    },
                });

                if (chat) {
                    return pubSub.asyncIterator(`SEND_MESSAGE ${chat._id}`);
                }
            },
        },
    },

    Message: {
        id: (message: Message): string => {
            return message._id.toString();
        },

        author: async (
            message: Message,
            _args: {},
            { db }: { db: Database }
        ): Promise<User> => {
            const authorOfMessage = await db.users.findOne({
                _id: message.author,
            });
            if (!authorOfMessage) {
                throw new Error("user can't be found");
            }
            return authorOfMessage;
        },
    },
};
