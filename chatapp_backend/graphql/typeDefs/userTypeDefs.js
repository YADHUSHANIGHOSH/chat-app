
import { gql } from "apollo-server-express";

export const userTypeDefs = gql`
  type User {
    id: Int!
    name: String!
    email: String!
    password: String!
    profilepic: String!
  }

  type AuthPayload {
    token: String!
    user: User
  }

  type Query {
    users: [User!]!
    user(id: Int!): User
  }

  type Mutation {
    signUp(
      name: String!
      email: String!
      password: String!
      profilepic: String!
    ): AuthPayload

    updateUser(
      id: Int!
      name: String!
      email: String!
      password: String!
      profilepic: String!
    ): User!

    deleteUser(id: Int!): User!

    signIn(email: String!, password: String!): AuthPayload
  }
`;


  