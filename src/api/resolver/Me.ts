import { UserResult } from "./../resolver-types/User";
import { Ctx, Query, Resolver } from "type-graphql";

import { User } from "../../db/entity/User";
import { MyContext } from "../../types/MyContext";

@Resolver()
export class Me {
  // @Query(() => User, { nullable: true, complexity: 5 })
  @Query(() => UserResult, { nullable: true })
  async me(@Ctx() ctx: MyContext): Promise<UserResult | undefined> {
    if (ctx.req.session === undefined || !ctx.req.session!.userId) {
      return undefined;
    }

    return User.findOne(ctx.req.session.userId);
  }
}
