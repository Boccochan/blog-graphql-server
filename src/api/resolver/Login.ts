import { UserResult } from "./../resolver-types/User";
import { LoginInput } from "../resolver-types/User";
import bcrypt from "bcryptjs";
import { Arg, Ctx, Mutation, Resolver } from "type-graphql";

import { User } from "../../db/entity/User";
import { MyContext } from "../../types/MyContext";

@Resolver()
export class Login {
  @Mutation(() => UserResult, { nullable: true })
  async login(
    @Arg("data") { email, password }: LoginInput,
    @Ctx() ctx: MyContext
  ): Promise<UserResult | null> {
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return null;
    }

    const valid = await bcrypt.compare(password, user.password);

    if (!valid) {
      return null;
    }

    //Currently, confirmation of the user is not implemented
    //TODO: implement confirmation.
    // if (!user.confirmed) {
    //   return null;
    // }

    ctx.req.session!.userId = user.id;

    return user;
  }
}
