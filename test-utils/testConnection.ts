import { createConnection } from "typeorm";

export const testConn = (drop: boolean = false) => {
  return createConnection({
    name: "default",
    type: "mysql",
    host: "localhost",
    port: 3306,
    username: process.env.DB_USER_NAME!,
    password: process.env.DB_PASSWORD!,
    database: process.env.DB_NAME!,
    synchronize: drop,
    dropSchema: drop,
    entities: [__dirname + "/../src/db/entity/*.*"]
  });
};
