
import { initTRPC } from '@trpc/server';
import { createHTTPServer } from '@trpc/server/adapters/standalone';
import 'dotenv/config';
import cors from 'cors';
import superjson from 'superjson';

import { 
  registerUserInputSchema, 
  getUserByUsernameInputSchema, 
  sendMessageInputSchema, 
  getMessageHistoryInputSchema 
} from './schema';
import { registerUser } from './handlers/register_user';
import { getUserByUsername } from './handlers/get_user_by_username';
import { sendMessage } from './handlers/send_message';
import { getMessageHistory } from './handlers/get_message_history';
import { getAllUsers } from './handlers/get_all_users';

const t = initTRPC.create({
  transformer: superjson,
});

const publicProcedure = t.procedure;
const router = t.router;

const appRouter = router({
  healthcheck: publicProcedure.query(() => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }),
  
  // User registration
  registerUser: publicProcedure
    .input(registerUserInputSchema)
    .mutation(({ input }) => registerUser(input)),
  
  // Get user by username
  getUserByUsername: publicProcedure
    .input(getUserByUsernameInputSchema)
    .query(({ input }) => getUserByUsername(input)),
  
  // Get all users (for finding users to message)
  getAllUsers: publicProcedure
    .query(() => getAllUsers()),
  
  // Send message
  sendMessage: publicProcedure
    .input(sendMessageInputSchema)
    .mutation(({ input }) => sendMessage(input)),
  
  // Get message history between two users
  getMessageHistory: publicProcedure
    .input(getMessageHistoryInputSchema)
    .query(({ input }) => getMessageHistory(input)),
});

export type AppRouter = typeof appRouter;

async function start() {
  const port = process.env['SERVER_PORT'] || 2022;
  const server = createHTTPServer({
    middleware: (req, res, next) => {
      cors()(req, res, next);
    },
    router: appRouter,
    createContext() {
      return {};
    },
  });
  server.listen(port);
  console.log(`TRPC server listening at port: ${port}`);
}

start();
