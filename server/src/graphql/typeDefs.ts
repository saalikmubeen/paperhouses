import { gql } from "apollo-server-express";

export const typeDefs = gql`
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
    }

    type Mutation {
        logIn(input: LogInInput): Viewer!
        logOut: Viewer!
    }
`;
