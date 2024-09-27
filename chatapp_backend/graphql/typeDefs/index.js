import { gql } from "apollo-server-express";
import { userTypeDefs } from "./userTypeDefs.js";
import { chatTypeDefs } from "./chatTypeDefs.js";
import { messageTypeDefs } from "./messageTypeDefs.js";

export const typeDefs = gql`
  type Query {
    _empty: String
  }
  type Mutation {
    _empty: String
  }
  ${userTypeDefs}
  ${chatTypeDefs}
  ${messageTypeDefs}
`;
