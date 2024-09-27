import express from "express";
import { ApolloServer } from "apollo-server-express";
import { typeDefs } from "./graphql/typeDefs/index.js";
import { resolvers } from "./graphql/resolvers/index.js";
import dotenv from "dotenv";
import http from "http";
import { Server as SocketIOServer } from "socket.io";

dotenv.config();

const app = express();

// Initialize ApolloServer
const apolloServer = new ApolloServer({ typeDefs, resolvers });

apolloServer.start().then(() => {
  apolloServer.applyMiddleware({ app });

  const httpServer = http.createServer(app);

  // Initialize Socket.IO
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: "*", // Allow cross-origin requests, adjust as needed
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log("New client connected with Socket.IO");

    // WebRTC signaling
    socket.on("offer", (data) => {
      console.log("Received offer:", data);
      socket.to(data.target).emit("offer", data);
    });

    socket.on("answer", (data) => {
      console.log("Received answer:", data);
      socket.to(data.target).emit("answer", data);
    });

    socket.on("ice-candidate", (data) => {
      console.log("Received ICE candidate:", data);
      socket.to(data.target).emit("ice-candidate", data);
    });

    // Emit a welcome message to the connected client
    socket.emit("message", { message: "Welcome to the Socket.IO server" });

    // Listen for incoming messages

    //  socket.on("chatMessage", (msg) => {
    //  console.log(`Received: ${msg}`);

    // socket.on('joinChat', ({ chatId }) => {
    //   socket.join(`chat_${chatId}`);
    // });

    socket.on("chatMessage", (msg) => {
      io.to(`chat_${msg.chatId}`).emit("newMessage", msg);
      // });

      // Send back a response to the client
      socket.emit("message", `Server received: ${msg}`);

      // Broadcast the message to all connected clients (for real-time updates)
      socket.broadcast.emit("newMessage", msg);
    });

    // Handle client disconnection
    socket.on("disconnect", () => {
      console.log("Client disconnected from Socket.IO");
    });
  });

  httpServer.listen(4000, () => {
    console.log(
      `Apollo Server ready at http://localhost:4000${apolloServer.graphqlPath}`
    );
    console.log("Socket.IO server running on ws://localhost:4000");
  });
});
