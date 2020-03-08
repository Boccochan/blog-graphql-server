import bcrypt from "bcryptjs";
import { IsEmail, MaxLength, MinLength } from "class-validator";
import { Arg, Ctx, Field, InputType, Mutation, Resolver } from "type-graphql";

import { User } from "../../db/entity/User";
import { MyContext } from "../../types/MyContext";

@InputType()
class RegisterInput implements Partial<User> {
  @Field()
  @MinLength(1)
  @MaxLength(30)
  userName: string;

  @Field()
  @IsEmail()
  email: string;

  @Field()
  @MinLength(6)
  @MaxLength(30)
  password: string;
}

@Resolver()
export class Register {
  @Mutation(() => User)
  async register(
    @Arg("data") { email, userName, password }: RegisterInput,
    @Ctx() ctx: MyContext
  ): Promise<User> {
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
