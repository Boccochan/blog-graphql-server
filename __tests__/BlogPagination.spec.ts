import { SearchInput, Edge } from "./../src/api/resolver-types/Blog";
import { Keyword } from "./../src/db/entity/Keyword";
import { Connection } from "typeorm";
import { gCall } from "./../test-utils/gCall";
import { testConn } from "./../test-utils/testConnection";
import { Post } from "../src/db/entity/Post";
import { User } from "../src/db/entity/User";

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

const writeBlog = async (userId: number, count: number, offset: number = 0) => {
  const posts = [];
  for (const i of [...Array(count).keys()]) {
    const post = await Post.create({
      title: `title${offset + i}`,
      content: `content${offset + i}`,
      keyword: [Keyword.create({ name: `${offset + i}` })],
      user: {
        id: userId
      }
    }).save();
    posts.push(post);
  }
  return posts;
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
  const searchSimpleQuery = `
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
      source: searchSimpleQuery,
      variableValues: {
        searchInput: null
      }
    });

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
      source: searchSimpleQuery,
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

    expect(response).toMatchObject({
      data: {
        search: {
          count: 30
        }
      }
    });
  });

  it("Return count 10 if first is 10 and there is 30 blog", async () => {
    const arg = { first: 10 } as SearchInput;

    const users = await registerUser(1);
    await writeBlog(users[0].id, 30);

    const response = await gCall({
      source: searchSimpleQuery,
      variableValues: {
        searchInput: arg
      }
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
    const arg = { first: 0 } as SearchInput;

    const users = await registerUser(1);
    await writeBlog(users[0].id, 30);

    const response = await gCall({
      source: searchSimpleQuery,
      variableValues: {
        searchInput: arg
      }
    });

    expect(response.errors!.length).toBe(1);
  });
});

describe("Search first argument and edges titles", () => {
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

    expect(title).toBe("title0");
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

    expect(title).toBe("title1");
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

    expect(titles).toEqual(["title3", "title2"]);
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

    expect(response.errors!.length).toBe(1);
  });
});

describe("Search last argument and edges titles", () => {
  it("Return 1 latest blog when first is 1 and there is 2 blog", async () => {
    const arg = { last: 1 } as SearchInput;

    const users = await registerUser(1);
    await writeBlog(users[0].id, 2);

    const response = await gCall({
      source: searchQuery,
      variableValues: {
        searchInput: arg
      }
    });

    const title = response.data!.search!.edges![0].node!.title;

    expect(title).toBe("title0");
  });

  it("Return 2 latest blog when first is 2 and there is 4 blog", async () => {
    const arg = { last: 2 } as SearchInput;

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
    expect(titles).toEqual(["title1", "title0"]);
  });
});

describe("Search after argument and edges titles", () => {
  it("Return rest blog when after points the latest", async () => {
    const users = await registerUser(1);
    await writeBlog(users[0].id, 2);

    const response = await gCall({
      source: searchQuery,
      variableValues: {
        searchInput: { first: 1 } as SearchInput
      }
    });

    const cursor = response.data!.search!.edges![0].cursor;

    const result = await gCall({
      source: searchQuery,
      variableValues: {
        searchInput: { after: cursor, first: 1 } as SearchInput
      }
    });

    const title = result.data!.search!.edges![0].node!.title;
    expect("title0").toBe(title);
  });

  it("Return the last 1 blog when after points the latest", async () => {
    const users = await registerUser(1);
    await writeBlog(users[0].id, 3);

    const response = await gCall({
      source: searchQuery,
      variableValues: {
        searchInput: { first: 1 } as SearchInput
      }
    });

    const cursor = response.data!.search!.edges![0].cursor;

    const result = await gCall({
      source: searchQuery,
      variableValues: {
        searchInput: { after: cursor, last: 1 } as SearchInput
      }
    });

    const title = result.data!.search!.edges![0].node!.title;
    expect("title0").toBe(title);
  });
});

describe("Search before argument and edges titles", () => {
  it("Return the 2 oldest blog when before points the oldest", async () => {
    const users = await registerUser(1);
    await writeBlog(users[0].id, 4);

    const response = await gCall({
      source: searchQuery,
      variableValues: {
        searchInput: { first: 4 } as SearchInput
      }
    });

    const cursor = response.data!.search!.edges![3].cursor;

    const result = await gCall({
      source: searchQuery,
      variableValues: {
        searchInput: { before: cursor, last: 2 } as SearchInput
      }
    });

    const edges = result.data!.search!.edges! as Edge[];
    const titles = edges.map(edge => edge.node!.title);

    expect(["title2", "title1"]).toEqual(titles);
  });

  it("Return error when after and before are provided.", async () => {
    const users = await registerUser(1);
    await writeBlog(users[0].id, 4);

    const response = await gCall({
      source: searchQuery,
      variableValues: {
        searchInput: { after: "test", before: "test" } as SearchInput
      }
    });

    expect(response.errors!.length).toBe(1);
  });
});

describe("Search userName argument", () => {
  it("Return testuser1 blog when userName is given", async () => {
    const users = await registerUser(2);
    await writeBlog(users[0].id, 1);
    await writeBlog(users[1].id, 4);

    const response = await gCall({
      source: searchQuery,
      variableValues: {
        searchInput: { userName: "testuser1" } as SearchInput
      }
    });

    console.log(response);
    expect(response.data!.search!.edges!.length).toBe(4);
  });

  it("Return error when userName is not found", async () => {
    const users = await registerUser(2);
    await writeBlog(users[0].id, 1);
    await writeBlog(users[1].id, 4);

    const response = await gCall({
      source: searchQuery,
      variableValues: {
        searchInput: { userName: "testuser3" } as SearchInput
      }
    });

    expect(response.errors!.length).toBe(1);
  });

  it("Return testuser0 blog when userName and first is given", async () => {
    const users = await registerUser(2);
    await writeBlog(users[0].id, 1);
    await writeBlog(users[1].id, 4);

    const response = await gCall({
      source: searchQuery,
      variableValues: {
        searchInput: { userName: "testuser0", first: 1 } as SearchInput
      }
    });

    expect(response.data!.search!.edges![0].node!.title).toBe("title0");
  });

  it("Return testuser1 blog when userName, after and first is given", async () => {
    const users = await registerUser(2);
    await writeBlog(users[0].id, 1);
    await writeBlog(users[1].id, 4);

    const response = await gCall({
      source: searchQuery,
      variableValues: {
        searchInput: { userName: "testuser1", first: 2 } as SearchInput
      }
    });

    const cursor = response.data!.search!.edges![1].cursor;

    const result = await gCall({
      source: searchQuery,
      variableValues: {
        searchInput: {
          after: cursor,
          userName: "testuser1",
          first: 2
        } as SearchInput
      }
    });

    const edges = result.data!.search!.edges! as Edge[];
    const titles = edges.map(edge => edge.node!.title);

    expect(titles).toEqual(["title1", "title0"]);
  });

  it("Return testuser1 blog when userName, before and last is given", async () => {
    const users = await registerUser(3);
    await writeBlog(users[0].id, 1);
    await writeBlog(users[1].id, 2);
    await writeBlog(users[0].id, 1, 1);

    const response = await gCall({
      source: searchQuery,
      variableValues: {
        searchInput: { userName: "testuser0", first: 2 } as SearchInput
      }
    });

    const cursor = response.data!.search!.edges![1].cursor;
    const result = await gCall({
      source: searchQuery,
      variableValues: {
        searchInput: {
          before: cursor,
          userName: "testuser0",
          last: 1
        } as SearchInput
      }
    });

    expect(result.data!.search!.edges![0].node!.title).toEqual("title1");
  });

  // it("Return error when after and before are provided.", async () => {
  //   const users = await registerUser(1);
  //   await writeBlog(users[0].id, 4);

  //   const response = await gCall({
  //     source: searchQuery,
  //     variableValues: {
  //       searchInput: { after: "test", before: "test" } as SearchInput
  //     }
  //   });

  //   expect(response.errors!.length).toBe(1);
  // });
});
