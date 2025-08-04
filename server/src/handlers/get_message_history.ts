
import { db } from '../db';
import { messagesTable } from '../db/schema';
import { type GetMessageHistoryInput, type Message } from '../schema';
import { or, and, eq, desc } from 'drizzle-orm';

export async function getMessageHistory(input: GetMessageHistoryInput): Promise<Message[]> {
  try {
    // Build query to get messages between two users in both directions
    const results = await db.select()
      .from(messagesTable)
      .where(
        or(
          and(
            eq(messagesTable.sender_id, input.user1_id),
            eq(messagesTable.receiver_id, input.user2_id)
          ),
          and(
            eq(messagesTable.sender_id, input.user2_id),
            eq(messagesTable.receiver_id, input.user1_id)
          )
        )
      )
      .orderBy(desc(messagesTable.created_at))
      .limit(input.limit)
      .offset(input.offset)
      .execute();

    return results;
  } catch (error) {
    console.error('Failed to get message history:', error);
    throw error;
  }
}
