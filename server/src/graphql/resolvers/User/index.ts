import { Request } from "express";
import { IResolvers } from "apollo-server-express";
import { Chat, Database, User } from "../../../lib/types";
import { UserArgs, UserBookingsArgs, UserBookingsData, UserListingsArgs, UserListingsData } from "./types";
import { authorize } from "../../../lib/utils";

export const userResolvers: IResolvers = {
    Query: {
        user: async (
            _root: undefined,
            { id }: UserArgs,
            { db, req }: { db: Database; req: Request }
        ): Promise<User> => {
            try {
                const user = await db.users.findOne({ _id: id });
                console.log(user);

                if (!user) {
                    throw new Error("User not found!");
                }

                const viewer = await authorize(db, req);

                // if currently logged in user is same as the use being queried
                if (viewer && viewer._id === user._id) {
                    user.authorized = true;
                } else {
                    user.authorized = false;
                }

                return user;
            } catch (err) {
                throw new Error(`Failed to query user: ${err}`);
            }
        },
    },

    User: {
        id: (parent: User): string => {
            // parent = user
            return parent._id;
        },

        hasWallet: (user: User): boolean => {
            return Boolean(user.walletId);
        },

        income: (user: User): number | null => {
            return user.authorized ? user.income : null;
        },

        bookings: async (
            user: User,
            { limit, page }: UserBookingsArgs,
            { db }: { db: Database }
        ): Promise<UserBookingsData | null> => {
            try {
                if (!user.authorized) {
                    return null;
                }

                const data: UserBookingsData = {
                    total: 0,
                    result: [],
                };

                let cursor = await db.bookings.find({
                    _id: { $in: user.bookings },
                });

                const skip = page > 0 ? (page - 1) * limit : 0;
                cursor = cursor.skip(skip);
                cursor = cursor.limit(limit);

                data.total = await cursor.count();
                data.result = await cursor.toArray();

                return data;
            } catch (error) {
                throw new Error(`Failed to query user bookings: ${error}`);
            }
        },

        listings: async (
            user: User,
            { limit, page }: UserListingsArgs,
            { db }: { db: Database }
        ): Promise<UserListingsData | null> => {
            try {
                const data: UserListingsData = {
                    total: 0,
                    result: [],
                };

                let cursor = await db.listings.find({
                    _id: { $in: user.listings },
                });

                const skip = page > 0 ? (page - 1) * limit : 0;
                cursor = cursor.skip(skip);
                cursor = cursor.limit(limit);

                data.total = await cursor.count();
                data.result = await cursor.toArray();

                return data;
            } catch (error) {
                throw new Error(`Failed to query user listings: ${error}`);
            }
        },

        chats: async (
            user: User,
            args,
            { db }: { db: Database }
        ): Promise<Chat[] | null> => {
            try {
                if (!user.authorized) {
                    return null;
                }

                let cursor = await db.chat.find({
                    _id: { $in: user.chats },
                });

                return cursor.toArray();
            } catch (error) {
                throw new Error(`Failed to query user chats: ${error}`);
            }
        },
    },
};
