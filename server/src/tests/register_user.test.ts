
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { usersTable } from '../db/schema';
import { type RegisterUserInput } from '../schema';
import { registerUser } from '../handlers/register_user';
import { eq } from 'drizzle-orm';

const testInput: RegisterUserInput = {
  username: 'testuser123'
};

describe('registerUser', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should register a new user', async () => {
    const result = await registerUser(testInput);

    expect(result.username).toEqual('testuser123');
    expect(result.id).toBeDefined();
    expect(typeof result.id).toBe('number');
    expect(result.created_at).toBeInstanceOf(Date);
  });

  it('should save user to database', async () => {
    const result = await registerUser(testInput);

    const users = await db.select()
      .from(usersTable)
      .where(eq(usersTable.id, result.id))
      .execute();

    expect(users).toHaveLength(1);
    expect(users[0].username).toEqual('testuser123');
    expect(users[0].id).toEqual(result.id);
    expect(users[0].created_at).toBeInstanceOf(Date);
  });

  it('should throw error when username already exists', async () => {
    // Register first user
    await registerUser(testInput);

    // Try to register another user with same username
    await expect(registerUser(testInput)).rejects.toThrow(/username already exists/i);
  });

  it('should handle valid username formats', async () => {
    const validUsernames = ['user123', 'test-user', 'my_username', 'ABC'];

    for (const username of validUsernames) {
      const result = await registerUser({ username });
      expect(result.username).toEqual(username);
      expect(result.id).toBeDefined();
    }
  });

  it('should create users with unique IDs', async () => {
    const user1 = await registerUser({ username: 'user1' });
    const user2 = await registerUser({ username: 'user2' });

    expect(user1.id).not.toEqual(user2.id);
    expect(user1.username).toEqual('user1');
    expect(user2.username).toEqual('user2');
  });
});
