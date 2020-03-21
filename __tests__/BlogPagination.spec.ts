import { SearchInput, Edge } from "./../src/api/resolver-types/Blog";
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
  const searchQuery = `
  query Search($searchInput: SearchInput){
    search(searchInput: $searchInput) {
      count
    }
  }
  `;

  it("Return count 1 if argument is not given and there is one blog", async () => {
    const users = await registerUser(1);
    await writeBlog(users[0].id, 1);

    const response = await gCall({
      source: searchQuery,
      variableValues: {
        searchInput: null
      }
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
    const users = await registerUser(1);
    await writeBlog(users[0].id, 31);

    const response = await gCall({
      source: searchQuery,
      variableValues: {
        searchInput: null
      }
    });

    expect({
      data: {
        search: {
          count: 30
        }
      }
    }).toMatchObject(response);
  });

  it("Return count 10 if first is 10 and there is 30 blog", async () => {
    const arg = { first: 10 } as SearchInput;

    const users = await registerUser(1);
    await writeBlog(users[0].id, 30);

    const response = await gCall({
      source: searchQuery,
      variableValues: {
        searchInput: arg
      }
    });

    expect({
      data: {
        search: {
          count: 10
        }
      }
    }).toMatchObject(response);
  });

  it("Return error message if first is 0", async () => {
    const arg = { first: 0 } as SearchInput;

    const users = await registerUser(1);
    await writeBlog(users[0].id, 30);

    const response = await gCall({
      source: searchQuery,
      variableValues: {
        searchInput: arg
      }
    });

    expect(response.errors![0]).toMatchObject({
      message: "Argument Validation Error",
      locations: [{ line: 3, column: 5 }],
      path: ["search"]
    });
  });
});

describe("Search first argument and edges titles", () => {
  const searchQuery = `
  query Search($searchInput: SearchInput){
    search(searchInput: $searchInput) {
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

  it("Return 1 blog when first is 1 and there is 1 blog", async () => {
    const arg = { first: 1 } as SearchInput;

    const users = await registerUser(1);
    await writeBlog(users[0].id, 1);

    const response = await gCall({
      source: searchQuery,
      variableValues: {
        searchInput: arg
      }
    });

    const title = response.data!.search!.edges![0].node!.title;

    expect("title0").toBe(title);
  });

  it("Return 1 latest blog when first is 1 and there is 2 blog", async () => {
    const arg = { first: 1 } as SearchInput;

    const users = await registerUser(1);
    await writeBlog(users[0].id, 2);

    const response = await gCall({
      source: searchQuery,
      variableValues: {
        searchInput: arg
      }
    });

    const title = response.data!.search!.edges![0].node!.title;

    expect("title1").toBe(title);
  });

  it("Return 2 latest blog when first is 2 and there is 4 blog", async () => {
    const arg = { first: 2 } as SearchInput;

    const users = await registerUser(1);
    await writeBlog(users[0].id, 4);

    const response = await gCall({
      source: searchQuery,
      variableValues: {
        searchInput: arg
      }
    });

    const edges = response.data!.search!.edges! as Edge[];
    const titles = edges.map(edge => edge.node!.title);

    expect(["title3", "title2"]).toEqual(expect.arrayContaining(titles));
  });

  it("Return error when first and last are provided", async () => {
    const arg = { first: 1, last: 1 } as SearchInput;

    const users = await registerUser(1);
    await writeBlog(users[0].id, 1);

    const response = await gCall({
      source: searchQuery,
      variableValues: {
        searchInput: arg
      }
    });

    expect(1).toBe(response.errors!.length);
  });
});
