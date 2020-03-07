import { Entity, PrimaryGeneratedColumn, Column, BaseEntity } from "typeorm";
import { ObjectType, Field, ID } from "type-graphql";
import { Length } from "class-validator";

@ObjectType()
@Entity()
export class Country extends BaseEntity {
    @Field(() => ID)
    @PrimaryGeneratedColumn()
    id: number;

    @Field()
    @Column('varchar', { length: 70, unique: true })
    @Length(1, 70)
    countryName: string;

    @Field()
    @Column('varchar', { length: 2 })
    countryCode: string;
}

