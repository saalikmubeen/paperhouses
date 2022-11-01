import { gql } from "@apollo/client";

export const LISTING = gql`
    query Listing($id: ID!, $bookingsPage: Int!, $limit: Int!) {
        listing(id: $id) {
            id
            title
            description
            image
            host {
                id
                name
                avatar
                hasWallet
            }
            type
            address
            city
            bookings(limit: $limit, page: $bookingsPage) {
                total
                result {
                    id
                    tenant {
                        id
                        name
                        avatar
                    }
                    checkIn
                    checkOut
                }
            }
            bookingsIndex
            price
            numOfGuests
            reviews {
                id
                rating
                comment
                createdAt
                author {
                    id
                    name
                    avatar
                    contact
                }
            }
            numReviews
            rating
        }
    }
`;
