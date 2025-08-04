
import { db } from '../db';
import { messagesTable, usersTable } from '../db/schema';
import { type SendMessageInput, type Message } from '../schema';
import { eq } from 'drizzle-orm';

export const sendMessage = async (input: SendMessageInput): Promise<Message> => {
  try {
    // Validate that sender exists
    const sender = await db.select()
      .from(usersTable)
      .where(eq(usersTable.id, input.sender_id))
      .execute();

    if (sender.length === 0) {
      throw new Error(`Sender with ID ${input.sender_id} not found`);
    }

    // Validate that receiver exists
    const receiver = await db.select()
      .from(usersTable)
      .where(eq(usersTable.id, input.receiver_id))
      .execute();

    if (receiver.length === 0) {
      throw new Error(`Receiver with ID ${input.receiver_id} not found`);
    }

    // Insert message record
    const result = await db.insert(messagesTable)
      .values({
        sender_id: input.sender_id,
        receiver_id: input.receiver_id,
        content: input.content
      })
      .returning()
      .execute();

    return result[0];
  } catch (error) {
    console.error('Message sending failed:', error);
    throw error;
  }
};
