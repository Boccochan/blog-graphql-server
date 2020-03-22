import { UserInputError } from "apollo-server-express";
import { atob, btoa } from "./../../utils/base64";
import { SearchInput, SearchItemsResult } from "./../resolver-types/Blog";
import { Keyword } from "../../db/entity/Keyword";
import { Edge, PostBlogInput } from "../resolver-types/Blog";
import { Query, Arg, Ctx, Mutation, Resolver } from "type-graphql";
import { Post } from "../../db/entity/Post";
import { MyContext } from "../../types/MyContext";
import { FindManyOptions, MoreThan, LessThan } from "typeorm";

const defaultInput = {
  userName: undefined,
  after: undefined,
  before: undefined,
  first: 30,
  last: undefined,
  filter: undefined
} as SearchInput;

interface SearchBlog {
  getBlog(): Promise<Post[]>;
}

const createBaseSearchQuery = (
  count: number,
  order: string
): FindManyOptions<Post> => {
  const query = {
    take: count,
    order: { id: order }
  } as FindManyOptions<Post>;

  return query;
};

class SearchFirstBlog implements SearchBlog {
  constructor(private count: number) {}

  async getBlog(): Promise<Post[]> {
    const query = createBaseSearchQuery(this.count, "DESC");
    const posts = await Post.find(query);

    return posts;
  }
}

class SearchFirstWithAfterBlog implements SearchBlog {
  constructor(private count: number, private cursor: number) {}

  async getBlog(): Promise<Post[]> {
    const query = createBaseSearchQuery(this.count, "DESC");
    query["where"] = { id: LessThan(this.cursor) };

    const posts = await Post.find(query);

    return posts;
  }
}

class SearchLastBlog implements SearchBlog {
  constructor(private count: number) {}

  async getBlog(): Promise<Post[]> {
    const query = createBaseSearchQuery(this.count, "ASC");
    const posts = await Post.find(query);

    return posts.reverse();
  }
}

class SearchLastWithBeforeBlog implements SearchBlog {
  constructor(private count: number, private cursor: number) {}

  async getBlog(): Promise<Post[]> {
    const query = createBaseSearchQuery(this.count, "ASC");
    query["where"] = { id: MoreThan(this.cursor) };
    const posts = await Post.find(query);

    return posts.reverse();
  }
}

const postFactory = (input: SearchInput): SearchBlog => {
  if (input.first && input.after === undefined) {
    return new SearchFirstBlog(input.first);
  } else if (input.first && input.after) {
    return new SearchFirstWithAfterBlog(input.first, Number(atob(input.after)));
  } else if (input.last && input.before === undefined) {
    return new SearchLastBlog(input.last);
  } else if (input.last && input.before) {
    return new SearchLastWithBeforeBlog(input.last, Number(atob(input.before)));
  }

  return new SearchFirstBlog(30);
};

const createSearchResult = (posts: Post[]): SearchItemsResult => {
  const edges = posts.map(
    (post): Edge => {
      const edge = {
        cursor: btoa(String(post.id)),
        node: { title: post.title }
      } as Edge;
      return edge;
    }
  );

  const result = { count: posts.length, edges } as SearchItemsResult;

  return result;
};

@Resolver()
export class Blog {
  @Mutation(() => Post)
  async postBlog(
    @Arg("blog") { title, content, keyword }: PostBlogInput,
    @Ctx() ctx: MyContext
  ): Promise<Post | undefined> {
    if (ctx.req.session === undefined || !ctx.req.session!.userId) {
      return undefined;
    }

    const keys: Keyword[] = keyword.map(
      (key): Keyword => {
        return Keyword.create({ name: key });
      }
    );

    const post = await Post.create({
      title,
      content,
      keyword: keys,
      user: {
        id: ctx.req.session.userId
      }
    }).save();
    return post;
  }

  @Query(() => SearchItemsResult)
  async search(
    @Arg("searchInput", { nullable: true })
    arg: SearchInput
  ): Promise<SearchItemsResult | undefined> {
    const input = arg === undefined ? defaultInput : arg;

    if (input.first && input.last) {
      throw new UserInputError(
        "Passing both `first` and `last` to paginate the `search` connection is not supported."
      );
    }

    const posts = await postFactory(input).getBlog();
    const result = createSearchResult(posts);

    return result;
  }
}
