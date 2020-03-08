import { Register } from "./resolver/Register";
import { buildSchema } from "type-graphql";
import { Me } from "./resolver/Me";

export const createSchema = () =>
  buildSchema({
    resolvers: [Me, Register],
    authChecker: ({ context: { req } }) => {
      return !!req.session.userId;
    }
  });
