
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { usersTable, messagesTable } from '../db/schema';
import { type GetMessageHistoryInput } from '../schema';
import { getMessageHistory } from '../handlers/get_message_history';

describe('getMessageHistory', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return messages between two users in both directions', async () => {
    // Create test users
    const users = await db.insert(usersTable)
      .values([
        { username: 'user1' },
        { username: 'user2' }
      ])
      .returning()
      .execute();

    const user1 = users[0];
    const user2 = users[1];

    // Create messages in both directions
    await db.insert(messagesTable)
      .values([
        { sender_id: user1.id, receiver_id: user2.id, content: 'Hello from user1' },
        { sender_id: user2.id, receiver_id: user1.id, content: 'Reply from user2' },
        { sender_id: user1.id, receiver_id: user2.id, content: 'Another message from user1' }
      ])
      .execute();

    const input: GetMessageHistoryInput = {
      user1_id: user1.id,
      user2_id: user2.id,
      limit: 50,
      offset: 0
    };

    const result = await getMessageHistory(input);

    expect(result).toHaveLength(3);
    
    // Check that all messages are between the two users
    result.forEach(message => {
      const isFromUser1ToUser2 = message.sender_id === user1.id && message.receiver_id === user2.id;
      const isFromUser2ToUser1 = message.sender_id === user2.id && message.receiver_id === user1.id;
      expect(isFromUser1ToUser2 || isFromUser2ToUser1).toBe(true);
    });

    // Verify messages are ordered by creation date (most recent first)
    for (let i = 0; i < result.length - 1; i++) {
      expect(result[i].created_at >= result[i + 1].created_at).toBe(true);
    }
  });

  it('should support pagination with limit and offset', async () => {
    // Create test users
    const users = await db.insert(usersTable)
      .values([
        { username: 'user1' },
        { username: 'user2' }
      ])
      .returning()
      .execute();

    const user1 = users[0];
    const user2 = users[1];

    // Create multiple messages
    const messages = [];
    for (let i = 0; i < 5; i++) {
      messages.push({ 
        sender_id: user1.id, 
        receiver_id: user2.id, 
        content: `Message ${i}` 
      });
    }

    await db.insert(messagesTable)
      .values(messages)
      .execute();

    // Test pagination
    const input: GetMessageHistoryInput = {
      user1_id: user1.id,
      user2_id: user2.id,
      limit: 2,
      offset: 1
    };

    const result = await getMessageHistory(input);

    expect(result).toHaveLength(2);
  });

  it('should return empty array when no messages exist between users', async () => {
    // Create test users
    const users = await db.insert(usersTable)
      .values([
        { username: 'user1' },
        { username: 'user2' }
      ])
      .returning()
      .execute();

    const user1 = users[0];
    const user2 = users[1];

    const input: GetMessageHistoryInput = {
      user1_id: user1.id,
      user2_id: user2.id,
      limit: 50,
      offset: 0
    };

    const result = await getMessageHistory(input);

    expect(result).toHaveLength(0);
  });

  it('should not return messages with other users', async () => {
    // Create test users
    const users = await db.insert(usersTable)
      .values([
        { username: 'user1' },
        { username: 'user2' },
        { username: 'user3' }
      ])
      .returning()
      .execute();

    const user1 = users[0];
    const user2 = users[1];
    const user3 = users[2];

    // Create messages between different users
    await db.insert(messagesTable)
      .values([
        { sender_id: user1.id, receiver_id: user2.id, content: 'Message between 1 and 2' },
        { sender_id: user1.id, receiver_id: user3.id, content: 'Message between 1 and 3' },
        { sender_id: user3.id, receiver_id: user2.id, content: 'Message between 3 and 2' }
      ])
      .execute();

    const input: GetMessageHistoryInput = {
      user1_id: user1.id,
      user2_id: user2.id,
      limit: 50,
      offset: 0
    };

    const result = await getMessageHistory(input);

    // Should only return the message between user1 and user2
    expect(result).toHaveLength(1);
    expect(result[0].content).toBe('Message between 1 and 2');
  });

  it('should use default values for limit and offset', async () => {
    // Create test users
    const users = await db.insert(usersTable)
      .values([
        { username: 'user1' },
        { username: 'user2' }
      ])
      .returning()
      .execute();

    const user1 = users[0];
    const user2 = users[1];

    await db.insert(messagesTable)
      .values([
        { sender_id: user1.id, receiver_id: user2.id, content: 'Test message' }
      ])
      .execute();

    // Test with minimal input (defaults should be applied by Zod)
    const input: GetMessageHistoryInput = {
      user1_id: user1.id,
      user2_id: user2.id,
      limit: 50, // Default value
      offset: 0  // Default value
    };

    const result = await getMessageHistory(input);

    expect(result).toHaveLength(1);
    expect(result[0].content).toBe('Test message');
    expect(result[0].created_at).toBeInstanceOf(Date);
  });
});
