import "reflect-metadata";
import { Min, MaxLength, MinLength } from "class-validator";
import { ObjectType, Field, InputType, Int } from "type-graphql";

@InputType()
export class PostBlogInput {
  @Field()
  @MinLength(1)
  @MaxLength(1000)
  title: string;

  @Field()
  @MinLength(1)
  @MaxLength(20000)
  content: string;

  @Field(() => [String])
  // @MinLength(1)
  // @MaxLength(15)
  keyword: string[];
}

@InputType()
export class SearchInput {
  @Field(() => String, { nullable: true })
  userName?: string;

  @Field(() => String, { nullable: true })
  after?: string;

  @Field(() => String, { nullable: true })
  before?: string;

  @Field(() => Int, { nullable: true })
  @Min(1, { message: "first must be bigger than 0" })
  first?: number;

  @Field(() => Int, { nullable: true })
  last?: number;

  @Field(() => [String], { nullable: true })
  filter?: string[];
}

@ObjectType()
export class Node {
  @Field()
  title: string;

  @Field({ nullable: true })
  content?: string;

  @Field({ nullable: true })
  photoUri?: string;

  @Field({ nullable: true })
  userName?: string;

  @Field({ nullable: true })
  createdAt?: Date;

  @Field({ nullable: true })
  updatedAt?: Date;
}

@ObjectType()
export class Edge {
  @Field()
  cursor: string;

  @Field(() => Node, { nullable: true })
  node?: Node;
}

@ObjectType()
export class PageInfo {
  @Field()
  startCursor: string;

  @Field()
  endCursor: string;

  @Field(() => Boolean)
  hasPreviousPage: boolean;

  @Field(() => Boolean)
  hasNextPage: boolean;
}

@ObjectType()
export class SearchItemsResult {
  @Field(() => Int)
  count: number;

  @Field(() => [Edge], { nullable: true })
  edges?: Edge[];

  @Field(() => PageInfo, { nullable: true })
  pageInfo?: PageInfo;
}
