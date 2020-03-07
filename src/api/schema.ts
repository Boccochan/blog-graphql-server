import { buildSchema } from "type-graphql";
import { Me } from './resolver/Me'

export const createSchema = () =>
  buildSchema({
    resolvers: [Me],
    authChecker: ({ context: { req } }) => {
      return !!req.session.userId;
    }
  });
