
import { userResolvers } from "./userResolvers.js";
import { chatResolvers} from "./chatResolvers.js";
import { messageResolvers} from "./messageResolvers.js";



export const resolvers = {
    Query: {
        ...userResolvers.Query,
        ...chatResolvers.Query,
        ...messageResolvers.Query
    
    },
    Mutation:{
        ...userResolvers.Mutation,
        ...chatResolvers.Mutation,
        ...messageResolvers.Mutation
      


    }
}