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

  constructor(
    title: string,
    photoUri?: string,
    content?: string,
    userName?: string,
    createdAt?: Date,
    updatedAt?: Date
  ) {
    this.photoUri = photoUri;
    this.title = title;
    this.content = content;
    this.userName = userName;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }
}

@ObjectType()
export class Edge {
  @Field()
  cursor: string;

  @Field(() => Node, { nullable: true })
  node?: Node;

  constructor(cursor: string, node?: Node) {
    this.cursor = cursor;
    this.node = node;
  }
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

  constructor(count: number = 30, edge?: Edge[], pageInfo?: PageInfo) {
    this.count = count;
    this.edges = edge;
    this.pageInfo = pageInfo;
  }
}
