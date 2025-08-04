
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { usersTable } from '../db/schema';
import { getAllUsers } from '../handlers/get_all_users';

describe('getAllUsers', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array when no users exist', async () => {
    const result = await getAllUsers();
    
    expect(result).toEqual([]);
  });

  it('should return all users when users exist', async () => {
    // Create test users
    await db.insert(usersTable)
      .values([
        { username: 'alice' },
        { username: 'bob' },
        { username: 'charlie' }
      ])
      .execute();

    const result = await getAllUsers();

    expect(result).toHaveLength(3);
    
    // Verify user data structure
    result.forEach(user => {
      expect(user.id).toBeDefined();
      expect(user.username).toBeDefined();
      expect(user.created_at).toBeInstanceOf(Date);
    });

    // Verify specific usernames are present
    const usernames = result.map(user => user.username);
    expect(usernames).toContain('alice');
    expect(usernames).toContain('bob');
    expect(usernames).toContain('charlie');
  });

  it('should return users with correct field types', async () => {
    // Create a single test user
    await db.insert(usersTable)
      .values({ username: 'testuser' })
      .execute();

    const result = await getAllUsers();

    expect(result).toHaveLength(1);
    const user = result[0];
    
    expect(typeof user.id).toBe('number');
    expect(typeof user.username).toBe('string');
    expect(user.created_at).toBeInstanceOf(Date);
    expect(user.username).toEqual('testuser');
  });
});
