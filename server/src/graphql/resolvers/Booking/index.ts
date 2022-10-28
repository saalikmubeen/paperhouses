import { IResolvers } from "apollo-server-express";
import { Request } from "express";
import { ObjectId } from "mongodb";
import { Stripe } from "../../../lib/api";
import { pubSub } from "../../../lib/pubSub";
import { Database, Listing, Booking, BookingsIndex } from "../../../lib/types";
import { authorize } from "../../../lib/utils";
import { CreateBookingArgs } from "./types";

const millisecondsPerDay = 86400000;

/*
const bookingsIndex: BookingsIndex = {
    "2019": {
        // 2019-01-01 is booked
        "00": {
            "01": true,
            "02": true,
        },

        // 2019-04-31 is booked
        "04": {
            "31": true,
        },

        // 2019-05-01 is booked
        "05": {
            "01": true,
        },

        // 2019-06-20 is booked
        "06": {
            "20": true,
        },
    },
};
*/

const resolveBookingsIndex = (
    bookingsIndex: BookingsIndex,
    checkInDate: string,
    checkOutDate: string
): BookingsIndex => {
    let dateCursor = new Date(checkInDate);
    let checkOut = new Date(checkOutDate);
    const newBookingsIndex: BookingsIndex = { ...bookingsIndex };

    while (dateCursor <= checkOut) {
        const y = dateCursor.getUTCFullYear();
        const m = dateCursor.getUTCMonth();
        const d = dateCursor.getUTCDate();

        if (!newBookingsIndex[y]) {
            newBookingsIndex[y] = {};
        }

        if (!newBookingsIndex[y][m]) {
            newBookingsIndex[y][m] = {};
        }

        if (!newBookingsIndex[y][m][d]) {
            newBookingsIndex[y][m][d] = true;
        } else {
            throw new Error(
                "selected dates can't overlap dates that have already been booked"
            );
        }

        dateCursor = new Date(dateCursor.getTime() + millisecondsPerDay);
    }

    return newBookingsIndex;
};

export const bookingResolvers: IResolvers = {
    Mutation: {
        createBooking: async (
            _root: undefined,
            { input }: CreateBookingArgs,
            { db, req }: { db: Database; req: Request }
        ): Promise<Booking> => {
            try {
                const { id, source, checkIn, checkOut } = input;

                let viewer = await authorize(db, req);
                if (!viewer) {
                    throw new Error("viewer cannot be found");
                }

                const listing = await db.listings.findOne({
                    _id: new ObjectId(id),
                });

                // check if the listing user is trying to book exists
                if (!listing) {
                    throw new Error("listing can't be found");
                }

                if (listing.host === viewer._id) {
                    throw new Error("viewer can't their book own listing");
                }

                const today = new Date();
                const checkInDate = new Date(checkIn);
                const checkOutDate = new Date(checkOut);

                if (
                    checkInDate.getTime() >
                    today.getTime() + 90 * millisecondsPerDay
                ) {
                    throw new Error(
                        "check in date can't be more than 90 days from today"
                    );
                }

                if (
                    checkOutDate.getTime() >
                    today.getTime() + 90 * millisecondsPerDay
                ) {
                    throw new Error(
                        "check out date can't be more than 90 days from today"
                    );
                }

                if (checkOutDate < checkInDate) {
                    throw new Error(
                        "check out date can't be before check in date"
                    );
                }

                const bookingsIndex = resolveBookingsIndex(
                    listing.bookingsIndex,
                    checkIn,
                    checkOut
                );

                const totalPrice =
                    listing.price *
                    ((checkOutDate.getTime() - checkInDate.getTime()) /
                        millisecondsPerDay +
                        1);

                // get the host or owner of the listing
                const host = await db.users.findOne({
                    _id: listing.host,
                });

                if (!host || !host.walletId) {
                    throw new Error(
                        "the host either can't be found or is not connected with Stripe"
                    );
                }

                // await Stripe.charge(totalPrice, source, host.walletId);

                const insertRes = await db.bookings.insertOne({
                    _id: new ObjectId(),
                    listing: listing._id,
                    tenant: viewer._id,
                    checkIn,
                    checkOut,
                });

                const insertedBooking: Booking = insertRes.ops[0];

                // update the total earned income of the host
                await db.users.updateOne(
                    {
                        _id: host._id,
                    },
                    {
                        $inc: { income: totalPrice },
                    }
                );

                // add the newly created booking to the bookings field of the currentUser
                // booking the listing.
                await db.users.updateOne(
                    {
                        _id: viewer._id,
                    },
                    {
                        $push: { bookings: insertedBooking._id },
                    }
                );

                // add the newly created booking to the bookings field of the listing
                // that's being booked ans update the bookingsIndex
                await db.listings.updateOne(
                    {
                        _id: listing._id,
                    },
                    {
                        $set: { bookingsIndex },
                        $push: { bookings: insertedBooking._id },
                    }
                );

                pubSub.publish(`LISTING_BOOKED ${listing.host}`, {
                    listingBooked: listing,
                });

                return insertedBooking;
            } catch (error) {
                throw new Error(`Failed to create a booking: ${error}`);
            }
        },
    },

    Booking: {
        id: (booking: Booking): string => {
            return booking._id.toString();
        },
        listing: (
            booking: Booking, // parent
            _args: {},
            { db }: { db: Database }
        ): Promise<Listing | null> => {
            return db.listings.findOne({ _id: booking.listing });
        },
        tenant: (booking: Booking, _args: {}, { db }: { db: Database }) => {
            return db.users.findOne({ _id: booking.tenant });
        },
    },
};
