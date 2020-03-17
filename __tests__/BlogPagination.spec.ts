import { Keyword } from "./../src/db/entity/Keyword";
import faker from "faker";
import { Connection } from "typeorm";
import { gCall } from "./../test-utils/gCall";
import { testConn } from "./../test-utils/testConnection";

import { Post } from "../src/db/entity/Post";
import { User } from "../src/db/entity/User";

let conn: Connection;
beforeAll(async () => {
  conn = await testConn();

  await User.remove(await User.find());
  await Post.remove(await Post.find());

  for (let i = 0; i < 3; i++) {
    const user = await User.create({
      userName: `testuser${i}`,
      email: `testuser${i}@example.com`,
      password: "123456"
    }).save();

    for (let n = 0; n < 10; n++) {
      await Post.create({
        title: `title${n}`,
        content: `content${n}`,
        keyword: [Keyword.create({ name: `${n}` })],
        user: {
          id: user.id
        }
      }).save();
    }
  }
});

afterAll(async () => {
  await conn.close();
});

// const registerMutation = `
// mutation Register($data: RegisterInput!) {
//     register(
//         data: $data
//     ) {
//         userName
//         email
//     }
// }
// `; describe("register", () => { it("create user", async () => { const user = {
//       username: faker.name.firstname(),
//       email: faker.internet.email(),
//       password: faker.internet.password()
//     };

//     const response = await gcall({
//       source: registermutation,
//       variablevalues: {
//         data: user
//       }
//     });

//     expect(response).tomatchobject({
//       data: {
//         register: {
//           username: user.username,
//           email: user.email
//         }
//       } }); // const dbuser = await user.findone({ where: { email: user.email } }); // expect(dbuser).tobedefined(); // expect(dbuser!.confirmed).tobefalsy(); }); }); describe("search", () => { it("search blog without argument", async () => { const user = { username: faker.name.firstname(), email: faker.internet.email(), password: faker.internet.password() }; const response = await gcall({ source: registermutation, variablevalues: { data: user
//                              }
//     });

//     expect(response).tomatchobject({
//       data: {
//         register: {
//           username: user.username,
//           email: user.email
//         }
//       }
//     });

//     // const dbuser = await user.findone({ where: { email: user.email } });
//     // expect(dbuser).tobedefined();
//     // expect(dbuser!.confirmed).tobefalsy();
//   });
// });

describe("Search", () => {
  it("Return the latest 30 titles if argument is not given", async () => {
    const user = {
      userName: faker.name.firstName(),
      email: faker.internet.email(),
      password: faker.internet.password()
    };

    const searchQuery = `
query {
  search {
    
  }

}
`;

    const response = await gCall({
      source: searchQuery,
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
