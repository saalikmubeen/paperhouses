import { gql } from "@apollo/client";

export const CHAT = gql`
    query Chat($recipient: String!) {
        chat(recipient: $recipient) {
            id
            messages {
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
            participants {
                id
                name
                avatar
            }
        }
    }
`;