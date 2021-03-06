import { UserInputError } from "apollo-server-express";
import { User } from "./../db/entity/User";
import { Post } from "./../db/entity/Post";
import { SearchInput } from "./resolver-types/Blog";
import { AbstractHandler } from "../utils/AbstractCOR";
import { atob } from "../utils/Base64";

type QueryParams = {
  take: number | undefined;

  order: { sort: string; order: "DESC" | "ASC" | undefined };

  where: { column: string; params: any | undefined };

  keyword: {
    expression: string | undefined;
    item: { keywordName: string[] } | undefined;
  };
};

type MyQuery = {
  params: QueryParams;

  queryHandler(params: QueryParams): Promise<Post[]>;
};

const queryBuilder = async (params: QueryParams): Promise<Post[]> => {
  const posts = await Post.createQueryBuilder("post")
    .innerJoin(
      "post.keyword",
      "keyword",
      params.keyword.expression,
      params.keyword.item
    )
    .where(params.where.column, params.where.params)
    .addOrderBy(params.order.sort, params.order.order)
    .take(params.take)
    .getMany();

  return posts;
};

class DefaultSearchQuery extends AbstractHandler<SearchInput, MyQuery> {
  async _handle(request: SearchInput, state: MyQuery): Promise<MyQuery> {
    if (request.first === undefined && request.last === undefined) {
      state.params.take = 30;
      state.params.order.sort = "post.id";
      state.params.order.order = "DESC";
    }

    return state;
  }
}

class FirstSearchQuery extends AbstractHandler<SearchInput, MyQuery> {
  async _handle(request: SearchInput, state: MyQuery): Promise<MyQuery> {
    if (request.first) {
      state.params.take = request.first;
      state.params.order.sort = "post.id";
      state.params.order.order = "DESC";
    }

    return state;
  }
}

class LastSearchQuery extends AbstractHandler<SearchInput, MyQuery> {
  async _handle(request: SearchInput, state: MyQuery): Promise<MyQuery> {
    if (request.last) {
      state.params.take = request.last;
      state.params.order.sort = "post.id";
      state.params.order.order = "ASC";

      state.queryHandler = async (params: QueryParams) => {
        const posts = await queryBuilder(params);

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

      const column = state.params.where.column;
      const userArg = "post.user.id = :userId";

      state.params.where.column = column ? column + " and " + userArg : userArg;

      const params = state.params.where.params;
      const userParams = { userId: user.id };

      state.params.where.params = params
        ? Object.assign(params, userParams)
        : userParams;
    }

    return state;
  }
}

class AfterSearchQuery extends AbstractHandler<SearchInput, MyQuery> {
  async _handle(request: SearchInput, state: MyQuery): Promise<MyQuery> {
    if (request.after) {
      const after = Number(atob(request.after));

      const column = state.params.where.column;
      const postArg = "post.id < :postId";

      state.params.where.column = column ? column + " and " + postArg : postArg;

      const params = state.params.where.params;
      const postParams = { postId: after };

      state.params.where.params = params
        ? Object.assign(params, postParams)
        : postParams;
    }

    return state;
  }
}

class BeforeSearchQuery extends AbstractHandler<SearchInput, MyQuery> {
  async _handle(request: SearchInput, state: MyQuery): Promise<MyQuery> {
    if (request.before) {
      const before = Number(atob(request.before));

      const column = state.params.where.column;
      const postArg = "post.id > :postId";

      state.params.where.column = column ? column + " and " + postArg : postArg;

      const params = state.params.where.params;
      const postParams = { postId: before };

      state.params.where.params = params
        ? Object.assign(params, postParams)
        : postParams;
    }

    return state;
  }
}

class FilterSearchQuery extends AbstractHandler<SearchInput, MyQuery> {
  async _handle(request: SearchInput, state: MyQuery): Promise<MyQuery> {
    if (request.filter) {
      state.params.keyword = {
        expression: "keyword.name IN (:...keywordName)",
        item: { keywordName: request.filter }
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
  const queryDeafultHandler = async (params: QueryParams) => {
    const posts = await queryBuilder(params);

    return posts;
  };

  const posts = await defaultSearchQuery
    .handle(request, {
      params: {
        take: undefined,
        order: { sort: "", order: undefined },
        where: { column: "", params: undefined },
        keyword: { expression: undefined, item: undefined }
      },
      queryHandler: queryDeafultHandler
    } as MyQuery)
    .then(async result => await result.queryHandler(result.params));

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
