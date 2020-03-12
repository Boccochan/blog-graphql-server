import { Keyword } from "./../../db/entity/Keyword";
import { PostInput } from "./../input/Blog";
import { Arg, Ctx, Mutation, Resolver } from "type-graphql";

import { Post } from "../../db/entity/Post";
import { MyContext } from "../../types/MyContext";

@Resolver()
export class PostBlog {
  @Mutation(() => Post)
  async postBlog(
    @Arg("blog") { title, content, keyword }: PostInput,
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
}
