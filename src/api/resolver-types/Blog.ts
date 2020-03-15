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

  @Field(type => [String])
  // @MinLength(1)
  // @MaxLength(15)
  keyword: string[];
}

@InputType()
export class SearchInput {
  @Field(type => String, { nullable: true })
  userName: string;

  @Field(type => String, { nullable: true })
  after?: string;

  @Field(type => String, { nullable: true })
  before?: string;

  @Field(type => Int, { nullable: true })
  first?: number;

  @Field(type => Int, { nullable: true })
  last?: number;

  @Field(type => [String], { nullable: true })
  filter?: string[];

  @Field(type => Int, { nullable: true })
  duration?: number;
}

@ObjectType()
export class Node {
  @Field(type => ID)
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

  @Field(type => Node)
  node: Node;
}

@ObjectType()
export class PageInfo {
  @Field()
  startCursor: string;

  @Field()
  endCursor: string;

  @Field(type => Boolean)
  hasPreviousPage: boolean;

  @Field(type => Boolean)
  hasNextPage: boolean;
}

@ObjectType()
export class SearchItemsResult {
  @Field(type => Int)
  count: number;

  @Field(type => [Edge])
  edges: Edge[];

  @Field(type => PageInfo)
  pageInfo: PageInfo;
}
