  import { gql } from 'apollo-server-express';

  export const messageTypeDefs = gql`
    type User {
      id: Int!
      name: String
      email: String!
      profilepic: String
      createdAt: String!
      updatedAt: String!
      chats: [Chat!]!
      messages: [Message!]!
    }

    type Chat {
      id: Int!
      users: [User!]!
      messages: [Message!]!
      createdAt: String!
    }

    type Message {
      id: Int!
      text: String!
      timestamp: String!
      chat: Chat! 
      sender: User!
    
      
      
    }

    extend type Query {
      getAllMessages: [Message!]!
      getMessageById(id: Int!): Message
      getMessagesByChat(chatId: Int!): [Message!]!
    }

    extend type Mutation {
      createMessage(chatId: Int!, senderId: Int!, text: String!): Message!
      updateMessage(id: Int!, text: String!): Message!
      deleteMessage(id: Int!): Message!
     
    }
  `;

