import { IResolvers } from "apollo-server-express";
import { Request } from "express";
import { ObjectId } from "mongodb";

import {
    Chat,
    Database,
    Message,
    User,
} from "../../../lib/types";
import { authorize } from "../../../lib/utils";
import { ChatArgs } from "./types";

export const chatResolvers: IResolvers = {
    Query: {
        chat: async (
            _root: undefined,
            { recipient }: ChatArgs,
            { db, req }: { db: Database; req: Request }
        ): Promise<Chat> => {
            try {
                const viewer = await authorize(db, req);

                if (!viewer) {
                    throw new Error("viewer cannot be found | unauthorized");
                }

                let chat = await db.chat.findOne({
                    participants: {
                        $all: [viewer._id, recipient],
                    },
                });

                if (!chat) {
                    console.log("creating new chat....!");
                    const inserted = await db.chat.insertOne({
                        _id: new ObjectId(),
                        messages: [],
                        participants: [viewer._id, recipient],
                    });

                    chat = inserted.ops[0];

                    await db.users.updateMany(
                        {
                            _id: { $in: [viewer._id, recipient] },
                        },
                        {
                            $push: { chats: chat._id },
                        }
                    );
                } else {
                    console.log("chat exists....!");
                }
                return chat;
            } catch (error) {
                throw new Error(`Failed to query the chat: ${error}`);
            }
        },
    },


    Chat: {
        id: (chat: Chat): string => {
            return chat._id.toString();
        },

        messages: async (
            chat: Chat,
            _args: {},
            { db }: { db: Database }
        ): Promise<Message[]> => {
            let cursor = await db.messages.find({
                _id: { $in: chat.messages },
            });

            return cursor.toArray();
        },

        participants: async (
            chat: Chat,
            _args: {},
            { db }: { db: Database }
        ): Promise<User[]> => {
            let cursor = await db.users.find({
                _id: { $in: chat.participants },
            });

            return cursor.toArray();
        },
    },
};
