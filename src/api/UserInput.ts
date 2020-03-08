import {
  IsEmail,
  MaxLength,
  MinLength,
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface
} from "class-validator";
import { Field, InputType } from "type-graphql";

import { User } from "../db/entity/User";

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

export const IsEmailAlreadyExist = (validationOptions?: ValidationOptions) =>
  createValidation(IsEmailAlreadyExistConstraint, validationOptions);

export const IsUserNameAlreadyExist = (validationOptions?: ValidationOptions) =>
  createValidation(IsUserNameAlreadyExistConstraint, validationOptions);

@InputType()
export class PasswordInput implements Partial<User> {
  @Field()
  @IsEmail()
  email: string;

  @Field()
  @MinLength(6)
  @MaxLength(30)
  password: string;
}
