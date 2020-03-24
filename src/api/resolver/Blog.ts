import { searchBlog } from "./../Search";
import { UserInputError } from "apollo-server-express";
import { btoa } from "../../utils/Base64";
import { SearchInput, SearchItemsResult } from "./../resolver-types/Blog";
import { Keyword } from "../../db/entity/Keyword";
import { Edge, PostBlogInput } from "../resolver-types/Blog";
import { Query, Arg, Ctx, Mutation, Resolver } from "type-graphql";
import { Post } from "../../db/entity/Post";
import { MyContext } from "../../types/MyContext";

const defaultInput = {
  userName: undefined,
  after: undefined,
  before: undefined,
  first: 30,
  last: undefined,
  filter: undefined
} as SearchInput;

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

  private errorMessage = (param0: string, param1: string): string =>
    `Passing both ${param0} and ${param1} to paginate the search connection is not supported`;

  @Query(() => SearchItemsResult)
  async search(
    @Arg("searchInput", { nullable: true })
    arg: SearchInput
  ): Promise<SearchItemsResult | undefined> {
    const input = arg === undefined ? defaultInput : arg;

    if (input.first && input.last) {
      throw new UserInputError(this.errorMessage("first", "last"));
    }

    if (input.after && input.before) {
      throw new UserInputError(this.errorMessage("after", "before"));
    }

    const result = searchBlog(input).then(posts => createSearchResult(posts));

    return result;
  }
}
