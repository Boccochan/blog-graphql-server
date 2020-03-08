import { buildSchema } from "type-graphql";

import { Logout } from "./resolver/Logout";
import { Me } from "./resolver/Me";
import { Register } from "./resolver/Register";

export const createSchema = () =>
  buildSchema({
    resolvers: [Me, Register, Logout],
    authChecker: ({ context: { req } }) => {
      return !!req.session.userId;
    }
  });
