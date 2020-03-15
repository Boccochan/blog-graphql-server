import { SearchInput, SearchItemsResult } from "./../resolver-types/Blog";
import { Keyword } from "../../db/entity/Keyword";
import { PostBlogInput } from "../resolver-types/Blog";
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

  @Query(() => SearchItemsResult)
  async search(
    @Arg("searchInput", { nullable: true })
    { userName, after, before, first, last, filter, duration }: SearchInput,
    @Ctx() ctx: MyContext
  ): Promise<SearchItemsResult | undefined> {
    console.log(userName);
    console.log(after);
    console.log(before);
    console.log(first);
    console.log(last);
    console.log(filter);
    console.log(duration);

    return undefined;
  }

  // @Mutation(() => Post)
  // async search(
  //   @Arg("blog", { nullable: true })
  //   {
  //     cursor,
  //     after,
  //     before,
  //     userFilter,
  //     keywordFilter,
  //     titleFilter,
  //     dateFilter
  //   }: GetBlogInput,
  //   @Ctx() ctx: MyContext
  // ): Promise<void> {
  //   if (ctx.req.session === undefined || !ctx.req.session!.userId) {
  //     return undefined;
  //   }

  //   console.log(cursor);
  //   console.log(after);
  //   console.log(before);
  //   console.log(userFilter);
  //   console.log(keywordFilter);
  //   console.log(titleFilter);
  //   console.log(dateFilter);
  //   // console.log(post);
  // }
}

// @Resolver()
// export class GetBlogIndex {
//   @Mutation(() => Post)
//   async getBlogIndex(
//     @Arg("blog", { nullable: true })
//     {
//       blogId,
//       cursor,
//       after,
//       before,
//       userFilter,
//       keywordFilter,
//       titleFilter,
//       dateFilter
//     }: GetBlogInput,
//     @Ctx() ctx: MyContext
//   ): Promise<void> {
//     if (ctx.req.session === undefined || !ctx.req.session!.userId) {
//       return undefined;
//     }

//     console.log(blogId);
//     console.log(cursor);
//     console.log(after);
//     console.log(before);
//     console.log(userFilter);
//     console.log(keywordFilter);
//     console.log(titleFilter);
//     console.log(dateFilter);
//     // console.log(post);
//   }
// }
