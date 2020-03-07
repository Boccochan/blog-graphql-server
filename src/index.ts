import { createOptions } from "./db/option";

const main = async () => {
  const options = createOptions(
    process.env.DB_NAME!,
    process.env.DB_USER_NAME!,
    process.env.DB_PASSWORD!
  );
  console.log("Hello World", options);
};

main();
