import { createConnection } from "typeorm";
import { createOptions } from "./db/option";

const main = async () => {
  const dbOptions = createOptions(
    process.env.DB_NAME!,
    process.env.DB_USER_NAME!,
    process.env.DB_PASSWORD!
  );

  await createConnection(dbOptions);
};

main();
