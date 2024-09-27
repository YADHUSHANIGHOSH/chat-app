import { ApolloServer } from 'apollo-server-express';
import { typeDefs } from './typeDefs/index.js';
import { resolvers } from './resolvers/index.js';

const server = new ApolloServer({ typeDefs, resolvers });