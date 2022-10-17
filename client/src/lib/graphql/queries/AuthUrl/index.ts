import { gql } from "@apollo/client";

export const AUTH_URL = gql`
  query AuthUrl {
    authUrl
  }
`;
