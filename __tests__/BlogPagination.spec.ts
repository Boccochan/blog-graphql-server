import faker from "faker";
import { Connection } from "typeorm";
import { gCall } from "./../test-utils/gCall";
import { testConn } from "./../test-utils/testConnection";

// import { User } from '../../../entity/User';

let conn: Connection;
beforeAll(async () => {
  conn = await testConn();
});

afterAll(async () => {
  await conn.close();
});

const registerMutation = `
mutation Register($data: RegisterInput!) {
    register(
        data: $data
    ) {
        userName 
        email
    }
}
`;

describe("Register", () => {
  it("create user", async () => {
    const user = {
      userName: faker.name.firstName(),
      email: faker.internet.email(),
      password: faker.internet.password()
    };

    const response = await gCall({
      source: registerMutation,
      variableValues: {
        data: user
      }
    });

    expect(response).toMatchObject({
      data: {
        register: {
          userName: user.userName,
          email: user.email
        }
      }
    });

    // const dbUser = await User.findOne({ where: { email: user.email } });
    // expect(dbUser).toBeDefined();
    // expect(dbUser!.confirmed).toBeFalsy();
  });
});
