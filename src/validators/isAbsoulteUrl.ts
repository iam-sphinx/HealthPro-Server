import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ async: false })
export class IsAbsoluteUrl implements ValidatorConstraintInterface {
  validate(value: any, args: ValidationArguments) {
    const regex = /^(http|https):\/\/[^\s$.?#].[^\s]*$/i;
    return typeof value === 'string' && regex.test(value);
  }

  defaultMessage(args: ValidationArguments) {
    return 'URL must be an absolute URL starting with http:// or https://';
  }
}
