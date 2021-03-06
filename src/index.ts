import "reflect-metadata";
import Express from "express";
import { ApolloServer } from "apollo-server-express";
import { createConnection } from "typeorm";
import { createDBOptions } from "./db/Option";
import { createSessionOptions } from "./session/Option";
import { createSchema } from "./api/Schema";
import cors from "cors";

const main = async () => {
  const dbOptions = createDBOptions(
    process.env.DB_NAME!,
    process.env.DB_USER_NAME!,
    process.env.DB_PASSWORD!
  );

  await createConnection(dbOptions);

  const schema = await createSchema();

  const apolloServer = new ApolloServer({
    schema,
    context: ({ req, res }: any) => ({ req, res })
  });

  const app = Express();
  app.use(cors({ origin: true, credentials: true }));
  app.use(createSessionOptions());

  apolloServer.applyMiddleware({ app, cors: false });

  app.listen(4000, () => {
    console.log("server started on http://localhost:4000/graphql");
  });
};

main();
