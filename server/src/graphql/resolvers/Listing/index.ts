import { IResolvers } from "apollo-server-express";
import { Request } from "express";
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
} from "./types";

const verifyHostListingInput = ({
    title,
    description,
    type,
    price,
}: HostListingInput) => {
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

                // IFf currently logged in user is viewing their own listing
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

                    const {
                        country,
                        city,
                        streetName,
                        administrativeLevels,
                        zipcode,
                    } = res[0];

                    let admin: string | null = null;

                    if (administrativeLevels) {
                        admin = `${streetName} ${administrativeLevels.level1long} ${zipcode}`;
                    }

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

            const res = await GeoCoder.geocode(
                input.address
            );

            const { country, city, streetName, administrativeLevels, zipcode } = res[0];

            if (!country || !administrativeLevels || !city) {
                throw new Error("invalid address input");
            }

            const admin = `${streetName} ${administrativeLevels.level1long} ${zipcode}`

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
            });

            const insertedListing: Listing = insertResult.ops[0];

            await db.users.updateOne(
                { _id: viewer._id },
                { $push: { listings: insertedListing._id } }
            );

            return insertedListing;
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
