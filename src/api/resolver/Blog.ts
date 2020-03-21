import { UserInputError } from "apollo-server-express";
import { btoa } from "./../../utils/base64";
import { SearchInput, SearchItemsResult } from "./../resolver-types/Blog";
import { Keyword } from "../../db/entity/Keyword";
import { Edge, PostBlogInput } from "../resolver-types/Blog";
import { Query, Arg, Ctx, Mutation, Resolver } from "type-graphql";
import { Post } from "../../db/entity/Post";
import { MyContext } from "../../types/MyContext";

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

    // TODO: Don't allow to post a blog which has the same title.
    console.log(title);
    console.log(content);
    console.log(keyword);

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
    // console.log(post);
    return post;
  }

  private defaultInput = {
    userName: undefined,
    after: undefined,
    before: undefined,
    first: 30,
    last: undefined,
    filter: undefined
  } as SearchInput;

  @Query(() => SearchItemsResult)
  async search(
    @Arg("searchInput", { nullable: true })
    arg: SearchInput,
    @Ctx() ctx: MyContext
  ): Promise<SearchItemsResult | undefined> {
    const { userName, after, before, first, last, filter } =
      arg === undefined ? this.defaultInput : arg;

    if (first && last) {
      throw new UserInputError(
        "Passing both `first` and `last` to paginate the `search` connection is not supported."
      );
    }

    console.log(ctx);
    console.log(userName);
    console.log(after);
    console.log(before);
    console.log(filter);

    const firstCnt = first === undefined ? 30 : first;

    const posts = await Post.find({
      take: firstCnt,
      order: { createdAt: "DESC" }
    });

    const edges = posts.map(
      (post): Edge => {
        const edge = {
          cursor: btoa(String(post.id)),
          node: { title: post.title }
        } as Edge;
        return edge;
      }
    );

    const count = posts.length;
    const result = { count, edges } as SearchItemsResult;

    return result;
  }
}
