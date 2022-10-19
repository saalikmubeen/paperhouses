import { gql } from "apollo-server-express";

export const typeDefs = gql`

    type Booking {
        id: ID!
        listing: Listing!
        tenant: User!
        checkIn: String!
        checkOut: String!
    }

    type Bookings {
        total: Int!
        result: [Booking!]!
    }

    enum ListingType {
        APARTMENT
        HOUSE
    }

    type Listing {
        id: ID!
        title: String!
        description: String!
        image: String!
        host: User!
        type: ListingType!
        address: String!
        city: String!
        bookings(limit: Int!, page: Int!): Bookings
        bookingsIndex: String!
        price: Int!
        numOfGuests: Int!
    }

    type Listings {
        total: Int!  # total number of objects that can be queried
        result: [Listing!]!
    }

    type User {
        id: ID!
        name: String!
        avatar: String!
        contact: String!
        hasWallet: Boolean!
        income: Int
        bookings(limit: Int!, page: Int!): Bookings
        listings(limit: Int!, page: Int!): Listings!
    }

    # currently logged in user
    type Viewer {
        id: ID
        token: String
        avatar: String
        hasWallet: Boolean
        didRequest: Boolean! # boolean to identify if we already attempted to obtain Viewers's info
    }

    input LogInInput {
        code: String!
    }

    type Query {
        authUrl: String!
        user(id: ID!): User!
    }

    type Mutation {
        logIn(input: LogInInput): Viewer!
        logOut: Viewer!
    }
`;
