/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { UpdateListingInput } from "./../../../globalTypes";

// ====================================================
// GraphQL mutation operation: UpdateListing
// ====================================================

export interface UpdateListing_updateListing {
  __typename: "UpdateListingResult";
  id: string;
}

export interface UpdateListing {
  updateListing: UpdateListing_updateListing;
}

export interface UpdateListingVariables {
  id: string;
  input: UpdateListingInput;
}
