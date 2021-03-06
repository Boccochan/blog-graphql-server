import { UserResult } from "./../resolver-types/User";
import { RegisterInput } from "../resolver-types/User";
import bcrypt from "bcryptjs";
import { Arg, Ctx, Mutation, Resolver } from "type-graphql";

import { User } from "../../db/entity/User";
import { MyContext } from "../../types/MyContext";

@Resolver()
export class Register {
  @Mutation(() => UserResult)
  async register(
    @Arg("data") { email, userName, password }: RegisterInput,
    @Ctx() ctx: MyContext
  ): Promise<UserResult> {
    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
      userName,
      email,
      password: hashedPassword
    }).save();

    //Currently, confirmation of the user is not implemented
    //TODO: implement confirmation.
    ctx.req.session!.userId = user.id;

    // sendEmail(email, await createConfirmationUrl(user.id));

    return user;
  }
}
