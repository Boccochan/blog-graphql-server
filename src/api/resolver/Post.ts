import { MaxLength, MinLength } from "class-validator";
import { Arg, Ctx, Field, InputType, Mutation, Resolver } from "type-graphql";

import { Post } from "../../db/entity/Post";
import { User } from "../../db/entity/User";
import { MyContext } from "../../types/MyContext";

@InputType()
class PostInput implements Partial<Post> {
  @Field()
  @MinLength(1)
  @MaxLength(1000)
  title: string;

  @Field()
  @MinLength(1)
  @MaxLength(20000)
  content: string;
}

@Resolver()
export class PostBlog {
  @Mutation(() => Post)
  async postBlog(
    @Arg("data") { title, content }: PostInput,
    @Ctx() ctx: MyContext
  ): Promise<Post | undefined> {
    if (ctx.req.session === undefined || !ctx.req.session!.userId) {
      return undefined;
    }

    // TODO: Don't allow to post a blog which has the same title.
    console.log(title);
    console.log(content);
    const user = await User.findOne({ id: ctx.req.session.userId });

    const post = await Post.create({
      title,
      content,
      user
    }).save();
    console.log(post);
    return post;
  }
}
