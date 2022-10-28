import { gql } from "@apollo/client";

export const LISTING_BOOKED = gql`
    subscription ListingBooked($hostId: ID!, $isHost: Boolean!) {
        listingBooked(hostId: $hostId, isHost: $isHost) {
            id
            title
            description
        }
    }
`;