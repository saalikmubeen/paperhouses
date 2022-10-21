import { gql } from "@apollo/client";

export const DISCONNECT_STRIPE = gql`
    mutation DisconnectStripe {
        disconnectStripe {
            hasWallet
        }
    }
`;
