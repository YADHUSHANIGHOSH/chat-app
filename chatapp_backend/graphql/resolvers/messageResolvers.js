import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const messageResolvers = {
  Query: {
    // Get all messages
    getAllMessages: async () => {
      try {
        return await prisma.message.findMany({
          include: {
            chat: true,
            sender: true,
          },
        });
      } catch (error) {
        throw new Error(`Failed to fetch messages: ${error.message}`);
      }
    },

    // Get a message by ID
    getMessageById: async (_, { id }) => {
      try {
        return await prisma.message.findUnique({
          where: { id },
          include: {
            chat: true,
            sender: true,
          },
        });
      } catch (error) {
        throw new Error(`Failed to fetch message with ID ${id}: ${error.message}`);
      }
    },

    // Get all messages in a specific chat
    getMessagesByChat: async (_, { chatId }) => {
      try {
        return await prisma.message.findMany({
          where: { chatId },
          include: {
            chat: true,
            sender: true,
          },
        });
      } catch (error) {
        throw new Error(`Failed to fetch messages for chat with ID ${chatId}: ${error.message}`);
      }
    },
  },

  Mutation: {
    // Create a new message
    createMessage: async (_, { chatId, senderId, text }) => {
      try {
        return await prisma.message.create({
          data: {
            chat: { connect: { id: chatId } },
            sender: { connect: { id: senderId } },
            text,
          },
          include: {
            chat: true,
            sender: true,
          },
        });
      } catch (error) {
        throw new Error(`Failed to create message: ${error.message}`);
      }
    },

    // Update an existing message
    updateMessage: async (_, { id, text }) => {
      try {
        return await prisma.message.update({
          where: { id },
          data: { text },
          include: {
            chat: true,
            sender: true,
          },
        });
      } catch (error) {
        throw new Error(`Failed to update message with ID ${id}: ${error.message}`);
      }
    },

    // Delete a message
    deleteMessage: async (_, { id }) => {
      try {
        return await prisma.message.delete({
          where: { id },
        });
      } catch (error) {
        throw new Error(`Failed to delete message with ID ${id}: ${error.message}`);
      }
    },
  },
 
  
  // Field Resolvers
  Message: {
    chat: async (parent) => {
      return await prisma.chat.findUnique({
        where: { id: parent.chatId },
      });
    },
    sender: async (parent) => {
      return await prisma.user.findUnique({
        where: { id: parent.senderId },
      });
    },
  },
  
};


