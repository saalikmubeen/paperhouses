import { gql } from "@apollo/client";

export const SEND_MESSAGE = gql`
    subscription SendMessage($to: ID!) {
        sendMessage(to: $to) {
            id
            content
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