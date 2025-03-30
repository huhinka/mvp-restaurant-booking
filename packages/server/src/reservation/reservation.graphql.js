import { auth } from "../auth/auth.middleware.js";
import { reservationSchema } from "./reservation.schema.js";
import { reservationResolvers } from "./reservation.resolver.js";
import { ApolloServer } from "@apollo/server";
// eslint-disable-next-line import/extensions
import { expressMiddleware } from "@apollo/server/express4";

const server = new ApolloServer({
  typeDefs: reservationSchema,
  resolvers: reservationResolvers,
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
