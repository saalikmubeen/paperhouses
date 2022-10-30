/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

//==============================================================
// START Enums and Input Objects
//==============================================================

export enum ListingType {
  APARTMENT = "APARTMENT",
  HOUSE = "HOUSE",
}

export enum ListingsFilter {
  PRICE_HIGH_TO_LOW = "PRICE_HIGH_TO_LOW",
  PRICE_LOW_TO_HIGH = "PRICE_LOW_TO_HIGH",
}

export interface ConnectStripeInput {
  code: string;
}

export interface CreateBookingInput {
  id: string;
  source: string;
  checkIn: string;
  checkOut: string;
}

export interface CreateMessageInput {
  content: string;
  to: string;
}

export interface HostListingInput {
  title: string;
  description: string;
  image: string;
  type: ListingType;
  address: string;
  price: number;
  numOfGuests: number;
}

export interface LogInInput {
  code: string;
}

export interface UpdateListingInput {
  title: string;
  description: string;
  image?: string | null;
  type: ListingType;
  price: number;
  numOfGuests: number;
}

//==============================================================
// END Enums and Input Objects
//==============================================================
