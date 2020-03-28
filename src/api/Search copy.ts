import { UserInputError } from "apollo-server-express";
import { User } from "./../db/entity/User";
import { FindManyOptions, LessThan, MoreThan } from "typeorm";
import { Post } from "./../db/entity/Post";
import { SearchInput } from "./resolver-types/Blog";
import { AbstractHandler } from "../utils/AbstractCOR";
import { atob } from "../utils/Base64";

type MyQuery = {
  query: FindManyOptions<Post>;

  queryHandler(query: FindManyOptions<Post>): Promise<Post[]>;
};

class DefaultSearchQuery extends AbstractHandler<SearchInput, MyQuery> {
  async _handle(request: SearchInput, state: MyQuery): Promise<MyQuery> {
    if (request.first === undefined && request.last === undefined) {
      state.query = Object.assign(state.query, {
        take: 30,
        order: { id: "DESC" }
      });
    }

    return state;
  }
}

class FirstSearchQuery extends AbstractHandler<SearchInput, MyQuery> {
  async _handle(request: SearchInput, state: MyQuery): Promise<MyQuery> {
    if (request.first) {
      state.query = Object.assign(state.query, {
        take: request.first,
        order: { id: "DESC" }
      });
    }

    return state;
  }
}

class LastSearchQuery extends AbstractHandler<SearchInput, MyQuery> {
  async _handle(request: SearchInput, state: MyQuery): Promise<MyQuery> {
    if (request.last) {
      state.query = Object.assign(state.query, {
        take: request.last,
        order: { id: "ASC" }
      });

      state.queryHandler = async (query: FindManyOptions<Post>) => {
        const posts = await Post.find(query);
        return posts.reverse();
      };
    }

    return state;
  }
}

class UserNameSearchQuery extends AbstractHandler<SearchInput, MyQuery> {
  async _handle(request: SearchInput, state: MyQuery): Promise<MyQuery> {
    const userName = request.userName;
    if (userName) {
      const user = await User.findOne({ userName });

      if (user === undefined) {
        throw new UserInputError("Not found the user");
      }

      state.query["relations"] = ["user"];

      const where = { user: { id: user.id } };
      state.query["where"] =
        "where" in state.query
          ? Object.assign(state.query["where"], where)
          : where;
    }

    return state;
  }
}

class AfterSearchQuery extends AbstractHandler<SearchInput, MyQuery> {
  async _handle(request: SearchInput, state: MyQuery): Promise<MyQuery> {
    if (request.after) {
      const after = Number(atob(request.after));
      const where = { id: LessThan(after) };
      state.query["where"] =
        "where" in state.query
          ? Object.assign(state.query["where"], where)
          : where;
    }

    return state;
  }
}

class BeforeSearchQuery extends AbstractHandler<SearchInput, MyQuery> {
  async _handle(request: SearchInput, state: MyQuery): Promise<MyQuery> {
    if (request.before) {
      const before = Number(atob(request.before));

      const where = { id: MoreThan(before) };
      state.query["where"] =
        "where" in state.query
          ? Object.assign(state.query["where"], where)
          : where;
    }

    return state;
  }
}

class FilterSearchQuery extends AbstractHandler<SearchInput, MyQuery> {
  async _handle(request: SearchInput, state: MyQuery): Promise<MyQuery> {
    if (request.filter) {
      const where = { keyword: request.filter };

      state.query["where"] =
        "where" in state.query
          ? Object.assign(state.query["where"], where)
          : where;

      state.queryHandler = async (query: FindManyOptions<Post>) => {
        console.log("------------------------------------------------");
        const where = query["where"] as {
          keyword: string[];
          user: { id: string };
        };

        console.log(query["where"]);

        let argWhere = { where: "", params: {} };

        if (where.user) {
          argWhere = {
            where: "post.user.id = :userId",
            params: { userId: where.user.id }
          };
        }

        const posts = await Post.createQueryBuilder("post")
          .innerJoin(
            "post.keyword",
            "keyword",
            "keyword.name IN (:...keywordName)",
            {
              keywordName: where.keyword
            }
          )
          .where(argWhere.where, argWhere.params)
          .getMany();
        console.log(posts);
        return posts;
      };
    }

    return state;
  }
}

const defaultSearchQuery = new DefaultSearchQuery();
const firstSearchQuery = new FirstSearchQuery();
const userNameSearchQuery = new UserNameSearchQuery();
const afterSearchQuery = new AfterSearchQuery();
const beforeSearchQuery = new BeforeSearchQuery();
const lastSearchQuery = new LastSearchQuery();
const filterSearchQuery = new FilterSearchQuery();

defaultSearchQuery
  .setNext(firstSearchQuery)
  .setNext(userNameSearchQuery)
  .setNext(afterSearchQuery)
  .setNext(beforeSearchQuery)
  .setNext(lastSearchQuery)
  .setNext(filterSearchQuery);

export const searchBlog = async (request: SearchInput): Promise<Post[]> => {
  const queryDeafultHandler = async (query: FindManyOptions<Post>) => {
    const posts = await Post.find(query);

    return posts;
  };

  const posts = await defaultSearchQuery
    .handle(request, {
      query: {},
      queryHandler: queryDeafultHandler
    } as MyQuery)
    .then(async result => await result.queryHandler(result.query));

  return posts;
};

// import { createConnection } from "typeorm";
// import { createDBOptions } from "../db/Option";

// // import { In } from "typeorm";
// (async () => {
//   const dbOptions = createDBOptions(
//     process.env.DB_NAME!,
//     process.env.DB_USER_NAME!,
//     process.env.DB_PASSWORD!
//   );

//   await createConnection(dbOptions);

//   // const result = await Post.find({
//   //   relations: ["keyword"],
//   //   where: {
//   //     // id: 0,
//   //     keyword: [{ id: 0 }]
//   //     // keyword: In([{ name: "26: 1" } as Keyword])
//   //   }
//   // });
//   const result = await Post.createQueryBuilder("post")
//     .innerJoin("post.keyword", "keyword", "keyword.name IN (:...keywordName)", {
//       keywordName: ["26: 1", "26: 0"]
//     })
//     .getMany();
//   console.log(result);
// })();
