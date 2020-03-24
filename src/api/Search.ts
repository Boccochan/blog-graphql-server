import { UserInputError } from "apollo-server-express";
import { User } from "./../db/entity/User";
import { FindManyOptions, LessThan, MoreThan } from "typeorm";
import { Post } from "./../db/entity/Post";
import { SearchInput } from "./resolver-types/Blog";
import { AbstractHandler } from "../utils/AbstractCOR";
import { atob } from "../utils/Base64";

class DefaultSearchQuery extends AbstractHandler<
  SearchInput,
  FindManyOptions<Post>
> {
  async _handle(
    request: SearchInput,
    state: FindManyOptions<Post>
  ): Promise<FindManyOptions<Post>> {
    if (request.first === undefined && request.last === undefined) {
      state = Object.assign(state, { take: 30, order: { id: "DESC" } });
    }

    return state;
  }
}

class FirstSearchQuery extends AbstractHandler<
  SearchInput,
  FindManyOptions<Post>
> {
  async _handle(
    request: SearchInput,
    state: FindManyOptions<Post>
  ): Promise<FindManyOptions<Post>> {
    if (request.first) {
      state = Object.assign(state, {
        take: request.first,
        order: { id: "DESC" }
      });
    }

    return state;
  }
}

class LastSearchQuery extends AbstractHandler<
  SearchInput,
  FindManyOptions<Post>
> {
  async _handle(
    request: SearchInput,
    state: FindManyOptions<Post>
  ): Promise<FindManyOptions<Post>> {
    if (request.last) {
      state = Object.assign(state, {
        take: request.last,
        order: { id: "ASC" }
      });
    }

    return state;
  }
}

class UserNameSearchQuery extends AbstractHandler<
  SearchInput,
  FindManyOptions<Post>
> {
  async _handle(
    request: SearchInput,
    state: FindManyOptions<Post>
  ): Promise<FindManyOptions<Post>> {
    const userName = request.userName;
    if (userName) {
      const user = await User.findOne({ userName });

      if (user === undefined) {
        throw new UserInputError("Not found the user");
      }

      state["relations"] = ["user"];

      const where = { user: { id: user.id } };
      state["where"] =
        "where" in state ? Object.assign(state["where"], where) : where;
    }

    return state;
  }
}

class AfterSearchQuery extends AbstractHandler<
  SearchInput,
  FindManyOptions<Post>
> {
  async _handle(
    request: SearchInput,
    state: FindManyOptions<Post>
  ): Promise<FindManyOptions<Post>> {
    if (request.after) {
      const after = Number(atob(request.after));
      const where = { id: LessThan(after) };
      state["where"] =
        "where" in state ? Object.assign(state["where"], where) : where;
    }

    return state;
  }
}

class BeforeSearchQuery extends AbstractHandler<
  SearchInput,
  FindManyOptions<Post>
> {
  async _handle(
    request: SearchInput,
    state: FindManyOptions<Post>
  ): Promise<FindManyOptions<Post>> {
    if (request.before) {
      const before = Number(atob(request.before));

      const where = { id: MoreThan(before) };
      state["where"] =
        "where" in state ? Object.assign(state["where"], where) : where;
    }

    return state;
  }
}

const defaultSearchQuery = new DefaultSearchQuery();
const firstSearchQuery = new FirstSearchQuery();
const lastSearchQuery = new LastSearchQuery();
const userNameSearchQuery = new UserNameSearchQuery();
const afterSearchQuery = new AfterSearchQuery();
const beforeSearchQuery = new BeforeSearchQuery();

defaultSearchQuery
  .setNext(firstSearchQuery)
  .setNext(lastSearchQuery)
  .setNext(userNameSearchQuery)
  .setNext(afterSearchQuery)
  .setNext(beforeSearchQuery);

export const searchBlog = async (request: SearchInput): Promise<Post[]> => {
  const posts = await defaultSearchQuery
    .handle(request, {})
    .then(async query => await Post.find(query));

  if (request.last) {
    return posts.reverse();
  }

  return posts;
};
