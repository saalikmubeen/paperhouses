import merge from "lodash.merge";
import { bookingResolvers } from "./Booking";
import { chatResolvers } from "./Chat";
import { listingResolvers } from "./Listing";
import { messageResolvers } from "./Message";
import { userResolvers } from "./User";
import { viewerResolvers } from "./Viewer";
import { reviewResolvers } from "./Review";

export const resolvers = merge(
    bookingResolvers,
    listingResolvers,
    userResolvers,
    viewerResolvers,
    messageResolvers,
    chatResolvers,
    reviewResolvers
);
