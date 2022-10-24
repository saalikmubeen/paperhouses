import { gql } from "@apollo/client";

export const LISTINGS = gql`
    query Listings(
        $location: String
        $filter: ListingsFilter!
        $limit: Int!
        $page: Int!
    ) {
        listings(
            location: $location
            filter: $filter
            limit: $limit
            page: $page
        ) {
            region
            total
            result {
                id
                title
                image
                address
                price
                numOfGuests
            }
        }
    }
`;
