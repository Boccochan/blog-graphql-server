import {
  IsEmail,
  MaxLength,
  MinLength,
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface
} from "class-validator";
import { ID, Field, InputType, ObjectType } from "type-graphql";

import { User } from "../../db/entity/User";

@ValidatorConstraint({ async: true })
class IsEmailAlreadyExistConstraint implements ValidatorConstraintInterface {
  validate(email: string) {
    return User.findOne({ where: { email } }).then(user => {
      if (user) return false;
      return true;
    });
  }
}

@ValidatorConstraint({ async: true })
class IsUserNameAlreadyExistConstraint implements ValidatorConstraintInterface {
  validate(userName: string) {
    return User.findOne({ where: { userName } }).then(user => {
      if (user) return false;
      return true;
    });
  }
}

function createValidation(
  target: new () => ValidatorConstraintInterface,
  validationOptions?: ValidationOptions
) {
  return function(object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: target
    });
  };
}

const IsEmailAlreadyExist = (validationOptions?: ValidationOptions) =>
  createValidation(IsEmailAlreadyExistConstraint, validationOptions);

const IsUserNameAlreadyExist = (validationOptions?: ValidationOptions) =>
  createValidation(IsUserNameAlreadyExistConstraint, validationOptions);

@InputType()
class PasswordInput implements Partial<User> {
  @Field()
  @MinLength(6)
  @MaxLength(30)
  password: string;
}

@InputType()
export class LoginInput extends PasswordInput {
  @Field()
  @IsEmail()
  email: string;
}

@InputType()
export class RegisterInput extends PasswordInput {
  @Field()
  @IsEmail()
  @IsEmailAlreadyExist({ message: "email already in use" })
  email: string;

  @Field()
  @MinLength(1)
  @MaxLength(30)
  @IsUserNameAlreadyExist({ message: "userName already in use" })
  userName: string;
}

@ObjectType()
export class UserResult implements Partial<User> {
  @Field(() => ID)
  id: number;

  @Field()
  userName: string;

  @Field()
  email: string;

  @Field()
  site: string;

  @Field()
  readonly createdAt?: Date;

  @Field()
  readonly updateAt?: Date;
}
