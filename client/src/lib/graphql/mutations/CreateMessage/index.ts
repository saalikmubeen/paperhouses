import { gql } from "@apollo/client";

export const CREATE_MESSAGE = gql`
    mutation CreateMessage($input: CreateMessageInput!) {
        createMessage(input: $input) {
            id
        }
    }
`;
