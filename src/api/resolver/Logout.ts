import { Ctx, Mutation, Resolver } from "type-graphql";

import { MyContext } from "../../types/MyContext";

@Resolver()
export class Logout {
  @Mutation(() => Boolean)
  async logout(@Ctx() ctx: MyContext): Promise<Boolean> {
    return new Promise((res, rej) => {
      if (ctx.req.session === undefined) {
        return rej(false);
      }
      ctx.req.session.destroy(err => {
        if (err) {
          console.log(err);
          return rej(false);
        }
        ctx.res.clearCookie("qid");
        return res(true);
      });
    });
  }
}
