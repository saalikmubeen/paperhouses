import { gql } from "@apollo/client";

export const CONNECT_STRIPE = gql`
    mutation ConnectStripe($input: ConnectStripeInput!) {
        connectStripe(input: $input) {
            hasWallet
        }
    }
`;
