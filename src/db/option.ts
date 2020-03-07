import { ConnectionOptions } from "typeorm";
// import { isString } from "util";

// function mysqlOptions(): ConnectionOptions {
//   isString(process.env.DB_USER_NAME);
//   isString(process.env.DB_PASSWORD);
//   isString(process.env.DB_NAME);

//   const mysql: ConnectionOptions = {
//     type: "mysql",
//     host: "localhost",
//     port: 3306,
//     username: process.env.DB_USER_NAME,
//     password: process.env.DB_PASSWORD,
//     database: process.env.DB_NAME,
//     entities: ["src/db/entity/*.*"],
//     synchronize: true,
//     logging: false
//   };

//   return mysql;
// }

export function createOptions(
  dbName: string,
  userName: string,
  password: string,
  host: string = "localhost",
  port: number = 3306
): ConnectionOptions {
  const mysql: ConnectionOptions = {
    type: "mysql",
    host: host,
    port: port,
    username: dbName,
    password: userName,
    database: password,
    entities: ["src/db/entity/*.*"],
    synchronize: true,
    logging: true
  };

  return mysql;
}
