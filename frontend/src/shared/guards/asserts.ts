import { AppCodeValue } from '../app-code';
import { AppError } from '../error/appError';

type AssertNonNullable = <T>(value: T, appCode: AppCodeValue) => asserts value is NonNullable<T>;

export const assertNonNullable: AssertNonNullable = (value, appCode: AppCodeValue) => {
  if (value == null) {
    throw new AppError(appCode);
  }
};
