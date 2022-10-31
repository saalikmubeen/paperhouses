/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { CreateReviewInput } from "./../../../globalTypes";

// ====================================================
// GraphQL mutation operation: CreateReview
// ====================================================

export interface CreateReview_createReview_author {
  __typename: "User";
  id: string;
  name: string;
  avatar: string;
  contact: string;
}

export interface CreateReview_createReview {
  __typename: "Review";
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  author: CreateReview_createReview_author;
}

export interface CreateReview {
  createReview: CreateReview_createReview;
}

export interface CreateReviewVariables {
  input: CreateReviewInput;
}
