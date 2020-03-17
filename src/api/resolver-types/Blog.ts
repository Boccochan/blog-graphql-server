import "reflect-metadata";
import { MaxLength, MinLength } from "class-validator";
import { ObjectType, Field, InputType, ID, Int } from "type-graphql";

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
  userName: string;

  @Field(() => String, { nullable: true })
  after?: string;

  @Field(() => String, { nullable: true })
  before?: string;

  @Field(() => Int, { nullable: true })
  first?: number;

  @Field(() => Int, { nullable: true })
  last?: number;

  @Field(() => [String], { nullable: true })
  filter?: string[];
}

@ObjectType()
export class Node {
  @Field(() => ID)
  blogId: number;

  @Field()
  photoUri: string;

  @Field()
  title: string;

  @Field()
  context: string;

  @Field()
  userName: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
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

  @Field(() => PageInfo)
  pageInfo: PageInfo;
}
