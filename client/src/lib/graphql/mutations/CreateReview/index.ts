
import { gql } from "@apollo/client";

export const CREATE_REVIEW = gql`
    mutation CreateReview($input: CreateReviewInput!) {
        createReview(input: $input) {
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
    }
`;