import { MaxLength, MinLength } from "class-validator";
import { Field, InputType } from "type-graphql";

@InputType()
export class PostInput {
  @Field()
  @MinLength(1)
  @MaxLength(1000)
  title: string;

  @Field()
  @MinLength(1)
  @MaxLength(20000)
  content: string;

  @Field(type => [String])
  // @MinLength(1)
  // @MaxLength(15)
  keyword: string[];
}
