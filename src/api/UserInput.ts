import { IsEmail, MaxLength, MinLength } from "class-validator";
import { Field, InputType } from "type-graphql";

import { User } from "../db/entity/User";

@InputType()
export class BasicUserInput implements Partial<User> {
  @Field()
  @IsEmail()
  email: string;

  @Field()
  @MinLength(6)
  @MaxLength(30)
  password: string;
}
