import { gql } from "@apollo/client";

export const CREATE_BOOKING = gql`
    mutation CreateBooking($input: CreateBookingInput!) {
        createBooking(input: $input) {
            id
        }
    }
`;
