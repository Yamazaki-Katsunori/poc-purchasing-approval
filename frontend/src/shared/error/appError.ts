import type { AppCode, AppCodeValue } from '@/shared/app-code';

type AppErrorOptions = {
  message?: string;
  status?: number;
  cause?: unknown;
};

export class AppError extends Error {
  public readonly code: AppCode;
  public readonly status: number;
  public override readonly cause?: unknown;

  constructor(appCode: AppCodeValue, options?: AppErrorOptions) {
    super(options?.message ?? appCode.defaultMessage);

    this.name = 'AppError';
    this.code = appCode.code;
    this.status = options?.status ?? appCode.defaultStatus;
    this.cause = options?.cause;
  }
}
