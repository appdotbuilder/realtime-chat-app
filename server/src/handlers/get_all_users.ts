
import { db } from '../db';
import { usersTable } from '../db/schema';
import { type User } from '../schema';

export async function getAllUsers(): Promise<User[]> {
  try {
    const result = await db.select()
      .from(usersTable)
      .execute();

    return result;
  } catch (error) {
    console.error('Failed to get all users:', error);
    throw error;
  }
}
