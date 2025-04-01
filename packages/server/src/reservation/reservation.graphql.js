import { auth } from "../auth/auth.middleware.js";
import { reservationSchema } from "./reservation.schema.js";
import { reservationResolvers } from "./reservation.resolver.js";
import { ApolloServer } from "@apollo/server";
// eslint-disable-next-line import/extensions
import { expressMiddleware } from "@apollo/server/express4";
import { log } from "../infrastructure/logger.js";

const server = new ApolloServer({
  typeDefs: reservationSchema,
  resolvers: reservationResolvers,
  formatError: (err) => {
    log.error(`[GraphQL] ${err.message}`);
    return err;
  },
});
await server.start();

export const reservationRouters = [
  auth(),
  expressMiddleware(server, {
    context: async ({ req }) => {
      return { user: req.user };
    },
  }),
];
