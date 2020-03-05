import { Entity, PrimaryGeneratedColumn, Column, BaseEntity } from "typeorm";
import { ObjectType, Field, ID } from "type-graphql";

@ObjectType()
@Entity()
export class Post extends BaseEntity {
    @Field(() => ID)
    @PrimaryGeneratedColumn()
    id: number;

    @Field()
    @Column('varchar')
    title: string;

    @Field()
    @Column('text')
    content: string;

    @Column()
    good: number;

    @Column()
    bad: number;
}

