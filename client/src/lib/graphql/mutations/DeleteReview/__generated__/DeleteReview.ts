/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { DeleteReviewInput } from "./../../../globalTypes";

// ====================================================
// GraphQL mutation operation: DeleteReview
// ====================================================

export interface DeleteReview_deleteReview {
  __typename: "Review";
  id: string;
}

export interface DeleteReview {
  deleteReview: DeleteReview_deleteReview;
}

export interface DeleteReviewVariables {
  input: DeleteReviewInput;
}
