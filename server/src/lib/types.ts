import { Collection, ObjectId } from "mongodb";

export interface Viewer {
    _id?: string;
    token?: string;
    avatar?: string;
    walletId?: string;
    didRequest: boolean;
}

export enum ListingType {
    Apartment = "APARTMENT",
    House = "HOUSE",
}

export interface BookingsIndexMonth {
    [key: string]: boolean;
}

export interface BookingsIndexYear {
    [key: string]: BookingsIndexMonth;
}

export interface BookingsIndex {
    [key: string]: BookingsIndexYear;
}


// NOTE: JavaScript function for getting month returns 0 for Jan and 11 for Dec
const bookingsIndex: BookingsIndex = {
  "2019": {

    // 2019-01-01 is booked
    "00": {
      "01": true,
      "02": true
    },

    // 2019-04-31 is booked
    "04": {
      "31": true
    },

    // 2019-05-01 is booked
    "05": {
      "01": true
    },

    // 2019-06-20 is booked
    "06": {
      "20": true
    }
  }
}



export interface Booking {
    _id: ObjectId;
    listing: ObjectId;
    tenant: string;  // user_id that booked the listing
    checkIn: string;
    checkOut: string;
}

export interface Listing {
    _id: ObjectId;
    title: string;
    description: string;
    image: string;
    host: string; // host user_id
    type: ListingType;
    address: string;
    country: string;
    admin: string;
    city: string;
    bookings: ObjectId[]; // bookings made for a certain listing from many different users
    bookingsIndex: BookingsIndex;
    price: number;
    numOfGuests: number;
    authorized?: boolean;
    reviews: Review[];
    numReviews: number;
    rating: number;
}

export interface User {
    _id: string;
    token: string;
    name: string;
    avatar: string;
    contact: string;
    walletId?: string;
    income: number;
    bookings: ObjectId[]; // refers to the document in the bookings collection
    listings: ObjectId[]; // refers to the document in the listings collection
    authorized?: boolean; // not a database field
    chats: ObjectId[];
}


export interface Message {
    _id: ObjectId;
    content: string;
    author: string;
    createdAt: string;
}

export interface Chat {
    _id: ObjectId;
    participants: ObjectId[];
    messages: ObjectId[]; // array of message ids
}

export interface Review {
    _id: ObjectId;
    rating: number;
    comment?: string;
    createdAt: string;
    author: string;
}

export interface Database {
    bookings: Collection<Booking>;
    listings: Collection<Listing>;
    users: Collection<User>;
    messages: Collection<Message>;
    chat: Collection<Chat>;
}
