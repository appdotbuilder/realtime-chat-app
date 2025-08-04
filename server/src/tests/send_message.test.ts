
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { usersTable, messagesTable } from '../db/schema';
import { type SendMessageInput } from '../schema';
import { sendMessage } from '../handlers/send_message';
import { eq } from 'drizzle-orm';

describe('sendMessage', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  let senderId: number;
  let receiverId: number;

  const setupUsers = async () => {
    // Create sender user
    const senderResult = await db.insert(usersTable)
      .values({ username: 'sender_user' })
      .returning()
      .execute();
    senderId = senderResult[0].id;

    // Create receiver user
    const receiverResult = await db.insert(usersTable)
      .values({ username: 'receiver_user' })
      .returning()
      .execute();
    receiverId = receiverResult[0].id;
  };

  it('should send a message between existing users', async () => {
    await setupUsers();

    const testInput: SendMessageInput = {
      sender_id: senderId,
      receiver_id: receiverId,
      content: 'Hello, this is a test message!'
    };

    const result = await sendMessage(testInput);

    // Basic field validation
    expect(result.sender_id).toEqual(senderId);
    expect(result.receiver_id).toEqual(receiverId);
    expect(result.content).toEqual('Hello, this is a test message!');
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
  });

  it('should save message to database', async () => {
    await setupUsers();

    const testInput: SendMessageInput = {
      sender_id: senderId,
      receiver_id: receiverId,
      content: 'Database test message'
    };

    const result = await sendMessage(testInput);

    // Query database to verify message was saved
    const messages = await db.select()
      .from(messagesTable)
      .where(eq(messagesTable.id, result.id))
      .execute();

    expect(messages).toHaveLength(1);
    expect(messages[0].sender_id).toEqual(senderId);
    expect(messages[0].receiver_id).toEqual(receiverId);
    expect(messages[0].content).toEqual('Database test message');
    expect(messages[0].created_at).toBeInstanceOf(Date);
  });

  it('should reject message when sender does not exist', async () => {
    await setupUsers();

    const testInput: SendMessageInput = {
      sender_id: 99999, // Non-existent sender
      receiver_id: receiverId,
      content: 'This should fail'
    };

    await expect(sendMessage(testInput)).rejects.toThrow(/sender.*not found/i);
  });

  it('should reject message when receiver does not exist', async () => {
    await setupUsers();

    const testInput: SendMessageInput = {
      sender_id: senderId,
      receiver_id: 99999, // Non-existent receiver
      content: 'This should fail'
    };

    await expect(sendMessage(testInput)).rejects.toThrow(/receiver.*not found/i);
  });

  it('should handle long message content', async () => {
    await setupUsers();

    const longContent = 'A'.repeat(1000); // Maximum allowed length
    const testInput: SendMessageInput = {
      sender_id: senderId,
      receiver_id: receiverId,
      content: longContent
    };

    const result = await sendMessage(testInput);

    expect(result.content).toEqual(longContent);
    expect(result.content.length).toEqual(1000);
  });
});
