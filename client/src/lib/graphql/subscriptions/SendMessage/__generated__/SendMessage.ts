/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL subscription operation: SendMessage
// ====================================================

export interface SendMessage_sendMessage_author {
  __typename: "User";
  id: string;
  name: string;
  avatar: string;
  contact: string;
}

export interface SendMessage_sendMessage {
  __typename: "Message";
  id: string;
  content: string;
  createdAt: string;
  author: SendMessage_sendMessage_author;
}

export interface SendMessage {
  sendMessage: SendMessage_sendMessage;
}

export interface SendMessageVariables {
  to: string;
}
