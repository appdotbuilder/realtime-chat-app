
import { db } from '../db';
import { usersTable } from '../db/schema';
import { type GetUserByUsernameInput, type User } from '../schema';
import { eq } from 'drizzle-orm';

export const getUserByUsername = async (input: GetUserByUsernameInput): Promise<User | null> => {
  try {
    const result = await db.select()
      .from(usersTable)
      .where(eq(usersTable.username, input.username))
      .execute();

    // Return the first user found, or null if none found
    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error('Get user by username failed:', error);
    throw error;
  }
};
