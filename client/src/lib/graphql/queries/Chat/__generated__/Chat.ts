/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: Chat
// ====================================================

export interface Chat_chat_messages_author {
  __typename: "User";
  id: string;
  name: string;
  avatar: string;
  contact: string;
}

export interface Chat_chat_messages {
  __typename: "Message";
  id: string;
  content: string;
  createdAt: string;
  author: Chat_chat_messages_author;
}

export interface Chat_chat_participants {
  __typename: "User";
  id: string;
  name: string;
  avatar: string;
}

export interface Chat_chat {
  __typename: "Chat";
  id: string;
  messages: Chat_chat_messages[];
  participants: Chat_chat_participants[];
}

export interface Chat {
  chat: Chat_chat;
}

export interface ChatVariables {
  recipient: string;
}
