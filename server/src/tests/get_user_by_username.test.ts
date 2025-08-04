
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { usersTable } from '../db/schema';
import { type GetUserByUsernameInput } from '../schema';
import { getUserByUsername } from '../handlers/get_user_by_username';

describe('getUserByUsername', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return user when username exists', async () => {
    // Create test user
    const testUser = await db.insert(usersTable)
      .values({
        username: 'testuser123'
      })
      .returning()
      .execute();

    const input: GetUserByUsernameInput = {
      username: 'testuser123'
    };

    const result = await getUserByUsername(input);

    expect(result).not.toBeNull();
    expect(result!.username).toEqual('testuser123');
    expect(result!.id).toEqual(testUser[0].id);
    expect(result!.created_at).toBeInstanceOf(Date);
  });

  it('should return null when username does not exist', async () => {
    const input: GetUserByUsernameInput = {
      username: 'nonexistentuser'
    };

    const result = await getUserByUsername(input);

    expect(result).toBeNull();
  });

  it('should handle case-sensitive username search', async () => {
    // Create test user with lowercase username
    await db.insert(usersTable)
      .values({
        username: 'testuser'
      })
      .returning()
      .execute();

    const input: GetUserByUsernameInput = {
      username: 'TestUser' // Different case
    };

    const result = await getUserByUsername(input);

    // Should return null since usernames are case-sensitive
    expect(result).toBeNull();
  });

  it('should return correct user when multiple users exist', async () => {
    // Create multiple test users
    await db.insert(usersTable)
      .values([
        { username: 'user1' },
        { username: 'user2' },
        { username: 'targetuser' }
      ])
      .execute();

    const input: GetUserByUsernameInput = {
      username: 'targetuser'
    };

    const result = await getUserByUsername(input);

    expect(result).not.toBeNull();
    expect(result!.username).toEqual('targetuser');
  });
});
