import {
  UpdateDateColumn,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BaseEntity,
  OneToMany,
  OneToOne,
  JoinColumn
} from "typeorm";
import { ObjectType, Field, ID } from "type-graphql";
import { Post } from "./Post";
import { Photo } from "./Photo";
import { Length, IsEmail, IsFQDN } from "class-validator";

@ObjectType()
@Entity()
export class User extends BaseEntity {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id: number;

  @Field()
  @Column("varchar", { length: 30, unique: true, nullable: false })
  @Length(1, 30)
  userName: string;

  @Field()
  @Column("varchar", { length: 256, unique: true, nullable: false })
  @IsEmail()
  email: string;

  @Column("varchar", { length: 30 })
  @Length(6, 30)
  password: string;

  @Column("text")
  @IsFQDN()
  site: string;

  @Column("bool", { default: false })
  confirmed: boolean;

  @OneToMany(
    type => Post,
    post => post.user
  )
  post: Post;

  @OneToOne(type => Photo)
  @JoinColumn()
  photo: Photo;

  @CreateDateColumn()
  readonly createdAt?: Date;

  @UpdateDateColumn()
  readonly updateAt?: Date;
}
