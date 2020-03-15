import { Blog } from "./resolver/Blog";
import { buildSchema } from "type-graphql";

import { Login } from "./resolver/Login";
import { Logout } from "./resolver/Logout";
import { Me } from "./resolver/Me";
import { Register } from "./resolver/Register";

export const createSchema = () =>
  buildSchema({
    resolvers: [Me, Register, Logout, Login, Blog],
    authChecker: ({ context: { req } }) => {
      return !!req.session.userId;
    }
  });
