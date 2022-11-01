import { IResolvers } from "apollo-server-express";
import { Request } from "express";
import { PubSub } from "graphql-subscriptions";
import { ObjectId } from "mongodb";
import { Cloudinary, Google } from "../../../lib/api";
import { GeoCoder } from "../../../lib/api/Geocoder";
import { Database, Listing, ListingType, User } from "../../../lib/types";
import { authorize } from "../../../lib/utils";
import {
    ListingArgs,
    ListingBookingsArgs,
    ListingBookingsData,
    ListingsArgs,
    ListingsData,
    ListingsFilter,
    ListingsQuery,
    HostListingInput,
    HostListingArgs,
    UpdateListingArgs,
    UpdateListingInput
} from "./types";


const verifyHostListingInput = ({
    title,
    description,
    type,
    price,
}: Omit<HostListingInput, "address">) => {
    if (title.length > 100) {
        throw new Error("listing title must be under 100 characters");
    }
    if (description.length > 5000) {
        throw new Error("listing description must be under 5000 characters");
    }
    if (type !== ListingType.Apartment && type !== ListingType.House) {
        throw new Error("listing type must be either an apartment or house");
    }
    if (price < 0) {
        throw new Error("price must be greater than 0");
    }
};

export const listingResolvers: IResolvers = {
    Query: {
        listing: async (
            _root: undefined,
            { id }: ListingArgs,
            { db, req }: { db: Database; req: Request }
        ): Promise<Listing> => {
            try {
                const listing = await db.listings.findOne({
                    _id: new ObjectId(id),
                });
                if (!listing) {
                    throw new Error("listing can't be found");
                }

                const viewer = await authorize(db, req);

                // If currently logged in user is viewing their own listing
                if (viewer && viewer._id === listing.host) {
                    listing.authorized = true;
                }

                return listing;
            } catch (error) {
                throw new Error(`Failed to query listing: ${error}`);
            }
        },
        listings: async (
            _root: undefined,
            { location, filter, limit, page }: ListingsArgs,
            { db }: { db: Database }
        ): Promise<ListingsData> => {
            try {
                const query: ListingsQuery = {};
                const data: ListingsData = {
                    region: null,
                    total: 0,
                    result: [],
                };

                if (location) {
                    const res = await GeoCoder.geocode(location);

                    const { country, city, state, neighbourhood, zipcode } =
                        res[0] as any;

                    let admin: string | null = null;

                    // if (neighbourhood && state) {
                    //     admin = `${neighbourhood} ${state} ${zipcode}`;
                    // }

                    if (city) query.city = city;
                    if (admin) query.admin = admin;
                    if (country) {
                        query.country = country;
                    } else {
                        throw new Error("no country found");
                    }

                    const cityText = city ? `${city}, ` : "";
                    const adminText = admin ? `${admin}, ` : "";
                    data.region = `${cityText}${adminText}${country}`;
                }

                let cursor = await db.listings.find(query);

                if (filter && filter === ListingsFilter.PRICE_LOW_TO_HIGH) {
                    cursor = cursor.sort({ price: 1 });
                }

                if (filter && filter === ListingsFilter.PRICE_HIGH_TO_LOW) {
                    cursor = cursor.sort({ price: -1 });
                }

                if (filter && filter === ListingsFilter.HIGHEST_RATED) {
                    cursor = cursor.sort({ rating: -1 });
                }

                cursor = cursor.skip(page > 0 ? (page - 1) * limit : 0);
                cursor = cursor.limit(limit);

                data.total = await cursor.count();
                data.result = await cursor.toArray();

                return data;
            } catch (error) {
                throw new Error(`Failed to query listings: ${error}`);
            }
        },
    },
    Mutation: {
        hostListing: async (
            _root: undefined,
            { input }: HostListingArgs,
            { db, req }: { db: Database; req: Request }
        ): Promise<Listing> => {
            verifyHostListingInput(input);

            let viewer = await authorize(db, req);
            if (!viewer) {
                throw new Error("viewer cannot be found");
            }

            const res = await GeoCoder.geocode(input.address);

            console.log(res);

            const { country, city, neighbourhood, state, zipcode } =
                res[0] as any;

            if (!country || !state || !city) {
                throw new Error("invalid address input");
            }

            const admin = `${neighbourhood} ${state} ${zipcode}`;

            const imageUrl = await Cloudinary.upload(input.image);

            const insertResult = await db.listings.insertOne({
                _id: new ObjectId(),
                ...input,
                image: imageUrl,
                bookings: [],
                bookingsIndex: {},
                country,
                admin,
                city,
                host: viewer._id,
                reviews: [],
                numReviews: 0,
                rating: 0
            });

            const insertedListing: Listing = insertResult.ops[0];

            await db.users.updateOne(
                { _id: viewer._id },
                { $push: { listings: insertedListing._id } }
            );

            return insertedListing;
        },

        updateListing: async (
            _root: undefined,
            { input, id }: UpdateListingArgs,
            { db, req }: { db: Database; req: Request }
        ): Promise<{ id: string }> => {
            verifyHostListingInput({ ...input, image: "" });

            let viewer = await authorize(db, req);
            if (!viewer) {
                throw new Error("viewer cannot be found");
            }

            const listing = await db.listings.findOne({
                _id: new ObjectId(id),
            });
            if (!listing) {
                throw new Error("listing can't be found");
            }

            // If currently logged in user is viewing their own listing
            if (listing.host !== viewer._id) {
                throw new Error("Unauthorized!");
            } else {
                listing.authorized = true;
            }

            let imageUrl: string | null = null;

            if (input.image) {
                imageUrl = await Cloudinary.upload(input.image);
            }

            const updates = { ...input };

            if (imageUrl) {
                updates.image = imageUrl;
            }

            await db.listings.updateOne(
                {
                    _id: new ObjectId(id),
                },
                {
                    $set: updates,
                }
            );

            return {
                id: listing._id.toString(),
            };
        },
    },

    Subscription: {
        listingBooked: {
            subscribe(
                _parent,
                {hostId, isHost}: { hostId: String, isHost: Boolean },
                { db, req, pubSub }: { db: Database; req: Request, pubSub: PubSub },
                _info
            ) { 

                if(isHost) {
                    return pubSub.asyncIterator(`LISTING_BOOKED ${hostId}`);
                }
            },
        },
    },

    Listing: {
        id: (listing: Listing): string => {
            return listing._id.toString();
        },
        host: async (
            listing: Listing,
            _args: {},
            { db }: { db: Database }
        ): Promise<User> => {
            const host = await db.users.findOne({ _id: listing.host });
            if (!host) {
                throw new Error("host can't be found");
            }
            return host;
        },
        bookingsIndex: (listing: Listing): string => {
            return JSON.stringify(listing.bookingsIndex);
        },
        bookings: async (
            listing: Listing,
            { limit, page }: ListingBookingsArgs,
            { db }: { db: Database }
        ): Promise<ListingBookingsData | null> => {
            try {
                if (!listing.authorized) {
                    return null;
                }

                const data: ListingBookingsData = {
                    total: 0,
                    result: [],
                };

                let cursor = await db.bookings.find({
                    _id: { $in: listing.bookings },
                });

                cursor = cursor.skip(page > 0 ? (page - 1) * limit : 0);
                cursor = cursor.limit(limit);

                data.total = await cursor.count();
                data.result = await cursor.toArray();

                return data;
            } catch (error) {
                throw new Error(`Failed to query listing bookings: ${error}`);
            }
        },
    },
};
