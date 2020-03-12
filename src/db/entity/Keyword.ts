import { Entity, PrimaryGeneratedColumn, Column, BaseEntity } from "typeorm";
import { InputType, ObjectType, Field, ID } from "type-graphql";

@InputType("KeywordInput")
@ObjectType("KeywordType")
@Entity()
export class Keyword extends BaseEntity {
  //   @Field(() => ID)
  @PrimaryGeneratedColumn()
  id: number;

  @Field()
  @Column("varchar", { unique: true })
  name: string;
}
