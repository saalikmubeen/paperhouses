import crypto from "crypto";
import { Request, Response } from "express";
import { IResolvers } from "apollo-server-express";
import { Google } from "../../../lib/api";
import { Viewer, Database, User } from "../../../lib/types";
import { ConnectStripeArgs, LogInArgs } from "./types";
import { authorize } from "../../../lib/utils";
import { Stripe } from "../../../lib/api";

console.log(process.env.NODE_ENV);

const cookieOptions = {
    httpOnly: true,
    sameSite: "none",
    signed: true,
    secure: process.env.NODE_ENV === "production",
};

const logInViaGoogle = async (
    code: string,
    token: string,
    db: Database,
    res: Response
): Promise<User | undefined> => {
    const { user } = await Google.logIn(code);

    if (!user) {
        throw new Error("Google login error");
    }

    // Name/Photo/Email Lists
    const userNamesList = user.names && user.names.length ? user.names : null;
    const userPhotosList =
        user.photos && user.photos.length ? user.photos : null;
    const userEmailsList =
        user.emailAddresses && user.emailAddresses.length
            ? user.emailAddresses
            : null;

    // User Display Name
    const userName = userNamesList ? userNamesList[0].displayName : null;

    // User Id
    const userId =
        userNamesList &&
        userNamesList[0].metadata &&
        userNamesList[0].metadata.source
            ? userNamesList[0].metadata.source.id
            : null;

    // User Avatar
    const userAvatar =
        userPhotosList && userPhotosList[0].url ? userPhotosList[0].url : null;

    // User Email
    const userEmail =
        userEmailsList && userEmailsList[0].value
            ? userEmailsList[0].value
            : null;

    if (!userId || !userName || !userAvatar || !userEmail) {
        throw new Error("Google login error");
    }

    const updateRes = await db.users.findOneAndUpdate(
        { _id: userId },
        {
            $set: {
                name: userName,
                avatar: userAvatar,
                contact: userEmail,
                token,
            },
        },
        { returnOriginal: false }
    );

    let viewer = updateRes.value;

    // means user is logging in for the first time
    if (!viewer) {
        const insertResult = await db.users.insertOne({
            _id: userId,
            token,
            name: userName,
            avatar: userAvatar,
            contact: userEmail,
            income: 0,
            bookings: [],
            listings: [],
            chats: []
        });

        viewer = insertResult.ops[0];
    }

    res.cookie("viewer", userId, {
        ...cookieOptions,
        maxAge: 365 * 24 * 60 * 60 * 1000, // one year
    });

    return viewer;
};

const logInViaCookie = async (
    token: string,
    db: Database,
    req: Request,
    res: Response
): Promise<User | undefined> => {
    console.log(token)

    const updateRes = await db.users.findOneAndUpdate(
        { _id: req.signedCookies.viewer },
        { $set: { token } },
        { returnOriginal: false }
    );

    let viewer = updateRes.value;
    console.log(viewer)

    if (!viewer) {
        res.clearCookie("viewer", cookieOptions);
    }

    return viewer;
};

export const viewerResolvers: IResolvers = {
    Query: {
        authUrl: (): string => {
            try {
                return Google.authUrl;
            } catch (error) {
                throw new Error(`Failed to query Google Auth Url: ${error}`);
            }
        },
    },
    Mutation: {
        logIn: async (
            _root: undefined,
            { input }: LogInArgs,
            { db, req, res }: { db: Database; req: Request; res: Response }
        ): Promise<Viewer> => {
            try {
                const code = input ? input.code : null;
                const token = crypto.randomBytes(16).toString("hex");

                const user: User | undefined = code
                    ? await logInViaGoogle(code, token, db, res)
                    : await logInViaCookie(token, db, req, res);

                if (!user) {
                    return { didRequest: true };
                }

                return {
                    _id: user._id,
                    token: user.token,
                    avatar: user.avatar,
                    walletId: user.walletId,
                    didRequest: true,
                };
            } catch (error) {
                throw new Error(`Failed to log in: ${error}`);
            }
        },
        logOut: (
            _root: undefined,
            _args: {},
            { res }: { res: Response }
        ): Viewer => {
            try {
                res.clearCookie("viewer", cookieOptions);
                return { didRequest: true };
            } catch (error) {
                throw new Error(`Failed to log out: ${error}`);
            }
        },

        connectStripe: async (
            _root: undefined,
            { input }: ConnectStripeArgs,
            { db, req }: { db: Database; req: Request }
        ): Promise<Viewer> => {
            try {
                const { code } = input;

                let viewer = await authorize(db, req);
                if (!viewer) {
                    throw new Error("viewer cannot be found");
                }

                const wallet = await Stripe.connect(code);
                if (!wallet) {
                    throw new Error("stripe grant error");
                }

                const updateRes = await db.users.findOneAndUpdate(
                    { _id: viewer._id },
                    { $set: { walletId: wallet.stripe_user_id } },
                    { returnOriginal: false }
                );

                if (!updateRes.value) {
                    throw new Error("viewer could not be updated");
                }

                viewer = updateRes.value;

                return {
                    _id: viewer._id,
                    token: viewer.token,
                    avatar: viewer.avatar,
                    walletId: viewer.walletId,
                    didRequest: true,
                };
            } catch (error) {
                throw new Error(`Failed to connect with Stripe: ${error}`);
            }
        },

        disconnectStripe: async (
            _root: undefined,
            _args: {},
            { db, req }: { db: Database; req: Request }
        ): Promise<Viewer> => {
            try {
                let viewer = await authorize(db, req);
                if (!viewer || !viewer.walletId) {
                    throw new Error("viewer cannot be found");
                }

                // const wallet = await Stripe.disconnect(viewer.walletId);
                // if (!wallet) {
                //     throw new Error("stripe disconnect error");
                // }

                const updateRes = await db.users.findOneAndUpdate(
                    { _id: viewer._id },
                    { $set: { walletId: undefined } },
                    { returnOriginal: false }
                );

                if (!updateRes.value) {
                    throw new Error("viewer could not be updated");
                }

                viewer = updateRes.value;

                return {
                    _id: viewer._id,
                    token: viewer.token,
                    avatar: viewer.avatar,
                    walletId: viewer.walletId,
                    didRequest: true,
                };
            } catch (error) {
                throw new Error(`Failed to disconnect with Stripe: ${error}`);
            }
        },

    },
    Viewer: {
        id: (viewer: Viewer): string | undefined => {
            return viewer._id;
        },
        hasWallet: (viewer: Viewer): boolean | undefined => {
            return viewer.walletId ? true : undefined;
        },
    },
};
