import { gql } from "@apollo/client";

export const DELETE_REVIEW = gql`
    mutation DeleteReview($input: DeleteReviewInput!) {
        deleteReview(input: $input) {
            id
        }
    }
`;
