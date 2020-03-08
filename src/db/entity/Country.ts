import { Entity, PrimaryGeneratedColumn, Column, BaseEntity } from "typeorm";
import { ObjectType, Field, ID } from "type-graphql";

@ObjectType()
@Entity()
export class Country extends BaseEntity {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id: number;

  @Field()
  @Column("varchar", { length: 70, unique: true })
  countryName: string;

  @Field()
  @Column("varchar", { length: 2 })
  countryCode: string;
}
