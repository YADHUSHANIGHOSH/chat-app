
import { PrismaClient } from '@prisma/client';
// import { ApolloError } from "apollo-server-express";
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const generateToken = (user) => {
  return jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

export const userResolvers = {
  Query: {
    users: async () => {
      return await prisma.user.findMany();
    },
    user: async (_, { id }) => {
      return await prisma.user.findUnique({
        where: { id: Number(id) },
      });
    },
  },
  Mutation: {
    signUp: async (_, { name, email, password, profilepic }) => {
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await prisma.user.create({
        data: { name, email, password: hashedPassword, profilepic },
      });
      const token = generateToken(user);
      return { token, user };
    },
    signIn: async (_, { email, password }) => {
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        throw new Error('User not found');
      }
      const valid = await bcrypt.compare(password, user.password);
      if (!valid) {
        throw new Error('Invalid password');
      }
      const token = generateToken(user);
      return { token, user };
    },
    updateUser: async (_, { id, name, email, password, profilepic }) => {
      try {
        // Check if the user exists
        const userExists = await prisma.user.findUnique({ where: { id: Number(id) } });
        if (!userExists) {
          throw new Error('User not found');
        }

        // Hash the new password if provided
        const hashedPassword = password ? await bcrypt.hash(password, 10) : userExists.password;

        // Update the user
        const updatedUser = await prisma.user.update({
          where: { id: Number(id) },
          data: { name, email, password: hashedPassword, profilepic },
        });

        return updatedUser;
      } catch (error) {
        console.error('Error updating user:', error);
        throw new Error(`Failed to update user: ${error.message}`);
      }
    },
    deleteUser: async (_, { id }) => {
      try {
        // Check if the user exists
        const user = await prisma.user.findUnique({ where: { id: Number(id) } });
        if (!user) {
          throw new Error('User not found');
        }

        // Delete the user
        const deletedUser = await prisma.user.delete({
          where: { id: Number(id) },
        });

        return deletedUser;
      } catch (error) {
        console.error('Failed to delete user:', error);
        throw new Error(`Failed to delete user with ID ${id}: ${error.message}`);
      }
    },
  },
};
