/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL subscription operation: ListingBooked
// ====================================================

export interface ListingBooked_listingBooked {
  __typename: "Listing";
  id: string;
  title: string;
  description: string;
}

export interface ListingBooked {
  listingBooked: ListingBooked_listingBooked;
}

export interface ListingBookedVariables {
  hostId: string;
  isHost: boolean;
}
