

import { gql } from 'apollo-server-express';
export const chatTypeDefs = gql`
  type User {
    id: Int!
    name: String!
    email: String!
    profilepic: String
    createdAt: String!
    updatedAt: String!
    chats: [Chat!]
    messages: [Message!]
  }
  type Chat {
    id: Int!
    users: [User!]!
    messages: [Message!]
    createdAt: String!
  }
  type Message {
    id: Int!
    chat: Chat!
    chatId: Int!
    sender: User!
    senderId: Int!
    text: String!
    timestamp: String!
  }
  extend type Query {
    getAllChats: [Chat!]!
    getChatById(id: Int!): Chat
    getUserChats(userId: Int!): [Chat!]!
  }
  extend type Mutation {
    createChat(userIds: [Int!]!): Chat!
    updateChat(id: Int!, userIds: [Int!]): Chat!
    deleteChat(id: Int!): Chat!
  }
`;









  