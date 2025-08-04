
import { z } from 'zod';

// User schema
export const userSchema = z.object({
  id: z.number(),
  username: z.string(),
  created_at: z.coerce.date()
});

export type User = z.infer<typeof userSchema>;

// Input schema for user registration
export const registerUserInputSchema = z.object({
  username: z.string().min(3).max(50).regex(/^[a-zA-Z0-9_-]+$/, "Username can only contain letters, numbers, underscores, and hyphens")
});

export type RegisterUserInput = z.infer<typeof registerUserInputSchema>;

// Message schema
export const messageSchema = z.object({
  id: z.number(),
  sender_id: z.number(),
  receiver_id: z.number(),
  content: z.string(),
  created_at: z.coerce.date()
});

export type Message = z.infer<typeof messageSchema>;

// Input schema for sending messages
export const sendMessageInputSchema = z.object({
  sender_id: z.number(),
  receiver_id: z.number(),
  content: z.string().min(1).max(1000)
});

export type SendMessageInput = z.infer<typeof sendMessageInputSchema>;

// Input schema for getting message history
export const getMessageHistoryInputSchema = z.object({
  user1_id: z.number(),
  user2_id: z.number(),
  limit: z.number().int().positive().max(100).optional().default(50),
  offset: z.number().int().nonnegative().optional().default(0)
});

export type GetMessageHistoryInput = z.infer<typeof getMessageHistoryInputSchema>;

// Input schema for getting user by username
export const getUserByUsernameInputSchema = z.object({
  username: z.string()
});

export type GetUserByUsernameInput = z.infer<typeof getUserByUsernameInputSchema>;
