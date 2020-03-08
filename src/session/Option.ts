import connectRedis from "connect-redis";
import session from "express-session";
import { redis } from "./Redis";

export const createSessionOptions = () => {
  const RedisStore = connectRedis(session);
  const sessionOptions = {
    store: new RedisStore({
      client: redis as any
    }),
    name: "qid",
    secret: process.env.SESSION_SECRET!,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 1000 * 60 * 60 * 24 * 7 * 365
    }
  };

  return session(sessionOptions);
};
