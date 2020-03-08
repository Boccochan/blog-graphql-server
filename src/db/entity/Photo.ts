import {
  UpdateDateColumn,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BaseEntity
} from "typeorm";
import { ObjectType, Field, ID } from "type-graphql";

@ObjectType()
@Entity()
export class Photo extends BaseEntity {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id: number;

  @Column("text")
  url: string;

  @CreateDateColumn()
  readonly createdAt?: Date;

  @UpdateDateColumn()
  readonly updateAt?: Date;
}
