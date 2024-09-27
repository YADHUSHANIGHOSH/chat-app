import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const chatResolvers = {
  Query: {
    // Get all chats
    getAllChats: async () => {
      try {
        return await prisma.chat.findMany({
          include: {
            users: true,
            messages: true,
          },
        });
      } catch (error) {
        throw new Error(`Failed to fetch chats: ${error.message}`);
      }
    },

    // Get a chat by ID
    getChatById: async (_, { id }) => {
      try {
        return await prisma.chat.findUnique({
          where: { id },
          include: {
            users: true,
            messages: true,
          },
        });
      } catch (error) {
        throw new Error(`Failed to fetch chat with ID ${id}: ${error.message}`);
      }
    },

    // Get all chats for a specific user
    getUserChats: async (_, { userId }) => {
      try {
        return await prisma.chat.findMany({
          where: {
            users: {
              some: {
                id: userId,
              },
            },
          },
          include: {
            users: true,
            messages: true,
          },
        });
      } catch (error) {
        throw new Error(`Failed to fetch chats for user with ID ${userId}: ${error.message}`);
      }
    },
  },

  Mutation: {
    // Create a new chat
    createChat: async (_, { userIds }) => {
      try {
        // Create a new chat with the specified users
        return await prisma.chat.create({
          data: {
            users: {
              connect: userIds.map((id) => ({ id })),
            },
          },
          include: {
            users: true,
            messages: true,
          },
        });
      } catch (error) {
        throw new Error(`Failed to create chat: ${error.message}`);
      }
    },

    // Update an existing chat
    updateChat: async (_, { id, userIds }) => {
      try {
        // Update the chat's users
        return await prisma.chat.update({
          where: { id },
          data: {
            users: {
              set: userIds.map((id) => ({ id })), // Replace users with the new list
            },
          },
          include: {
            users: true,
            messages: true,
          },
        });
      } catch (error) {
        throw new Error(`Failed to update chat with ID ${id}: ${error.message}`);
      }
    },

    // Delete a chat
    deleteChat: async (_, { id }) => {
      try {
        // Delete the chat by ID
        return await prisma.chat.delete({
          where: { id },
        });
      } catch (error) {
        throw new Error(`Failed to delete chat with ID ${id}: ${error.message}`);
      }
    },
  },

  // Resolve fields within Chat type
  Chat: {
    users: async (parent) => {
      // Fetch the users involved in a chat
      return await prisma.user.findMany({
        where: {
          chats: {
            some: {
              id: parent.id,
            },
          },
        },
      });
    },
    messages: async (parent) => {
      // Fetch messages associated with a chat
      return await prisma.message.findMany({
        where: {
          chatId: parent.id,
        },
      });
    },
  },

  // Resolve fields within Message type
  Message: {
    chat: async (parent) => {
      // Fetch the chat that a message belongs to
      return await prisma.chat.findUnique({
        where: { id: parent.chatId },
      });
    },
    sender: async (parent) => {
      // Fetch the user who sent the message
      return await prisma.user.findUnique({
        where: { id: parent.senderId },
      });
    },
  },
};


