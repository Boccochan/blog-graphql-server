import { Keyword } from "./../src/db/entity/Keyword";
import { Connection } from "typeorm";
import { gCall } from "./../test-utils/gCall";
import { testConn } from "./../test-utils/testConnection";
import { Post } from "../src/db/entity/Post";
import { User } from "../src/db/entity/User";

const writeBlog = async (userId: number, count: number) => {
  const result = Promise.all(
    [...Array(count).keys()].map(async i => {
      const post = await Post.create({
        title: `title${i}`,
        content: `content${i}`,
        keyword: [Keyword.create({ name: `${i}` })],
        user: {
          id: userId
        }
      }).save();
      return post;
    })
  );
  return result;
};

const registerUser = async (count: number): Promise<User[]> => {
  const result = await Promise.all(
    [...Array(count).keys()].map(async i => {
      const user = await User.create({
        userName: `testuser${i}`,
        email: `testuser${i}@example.com`,
        password: "123456"
      }).save();
      return user;
    })
  );
  return result;
};

let conn: Connection;
beforeEach(async () => {
  conn = await testConn();

  await Post.remove(await Post.find());
  await User.remove(await User.find());
});

afterEach(async () => {
  await conn.close();
});

describe("Search first argument and count result", () => {
  it("Return count 1 if argument is not given and there is one blog", async () => {
    const searchQuery = `
query {
  search {
    count  
  }
}
`;
    const users = await registerUser(1);
    await writeBlog(users[0].id, 1);

    const response = await gCall({
      source: searchQuery
    });

    console.log(response);

    expect(response).toMatchObject({
      data: {
        search: {
          count: 1
        }
      }
    });
  });

  it("Return count 30 if argument is not given and there is 31 blog", async () => {
    const searchQuery = `
  query {
    search {
      count
    }
  }
  `;
    const users = await registerUser(1);
    await writeBlog(users[0].id, 31);

    const response = await gCall({
      source: searchQuery
    });

    expect(response).toMatchObject({
      data: {
        search: {
          count: 30
        }
      }
    });
  });

  it("Return count 10 if first is 10 and there is 30 blog", async () => {
    const searchQuery = `
  query {
    search(searchInput: {first: 10}) {
      count
    }
  }
  `;
    const users = await registerUser(1);
    await writeBlog(users[0].id, 30);

    const response = await gCall({
      source: searchQuery
    });

    expect(response).toMatchObject({
      data: {
        search: {
          count: 10
        }
      }
    });
  });

  it("Return error message if first is 0", async () => {
    const searchQuery = `
  query {
    search(searchInput: {first: 0}) {
      count
    }
  }
  `;
    const users = await registerUser(1);
    await writeBlog(users[0].id, 30);

    const response = await gCall({
      source: searchQuery
    });

    expect(response.errors![0]).toMatchObject({
      message: "Argument Validation Error",
      locations: [{ line: 3, column: 5 }],
      path: ["search"]
    });
  });
});

describe("Search first argument and edges", () => {
  it("Return 1 blog when first is 1 and there is 1 blog", async () => {
    const searchQuery = `
  query {
    search(searchInput: {first: 1}) {
      count
      edges {
        cursor
        node {
          title
        }
      }
    }
  }
  `;

    const users = await registerUser(1);
    await writeBlog(users[0].id, 1);

    const response = await gCall({
      source: searchQuery
    });

    // console.log(response);
    console.log(response.data!.search!.edges!);
  });
});
