import { ConnectionOptions } from "typeorm";

export const createDBOptions = (
  database: string,
  username: string,
  password: string,
  host: string = "localhost",
  port: number = 3306
): ConnectionOptions => {
  const mysql: ConnectionOptions = {
    type: "mysql",
    host,
    port,
    username,
    password,
    database,
    entities: ["src/db/entity/*.*"],
    synchronize: true,
    logging: true
  };

  return mysql;
};
