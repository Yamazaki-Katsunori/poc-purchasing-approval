import { getCookie } from '../cookie';

type HttpMethodType = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

type ApiClientOptions = {
  method?: HttpMethodType;
  body?: unknown;
  headers?: HeadersInit;
  credentials?: RequestCredentials;
  cache?: RequestCache;
  signal?: AbortSignal;
};

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

export const apiClient = async <TResponse>(path: string, options: ApiClientOptions = {}): Promise<TResponse> => {
  const { method = 'GET', body, headers, credentials, cache, signal } = options;

  const newHeaders = new Headers(headers);

  if (body !== undefined) {
    newHeaders.set('Content-Type', 'application/json');
  }

  if (!['GET', 'HEAD', 'OPTIONS'].includes(method)) {
    const csrfToken = getCookie('csrf_token');
    if (csrfToken) {
      newHeaders.set('X-CSRF-Token', csrfToken);
    }
  }

  const response = await fetch(`/api${path}`, {
    method,
    headers: newHeaders,
    body: body !== undefined ? JSON.stringify(body) : undefined,
    credentials: credentials ?? 'include',
    cache,
    signal,
  });

  if (!response.ok) {
    let message = 'API request failed';

    try {
      const errorBody = (await response.json()) as { detail?: string };
      if (errorBody.detail) {
        message = errorBody.detail;
      }
    } catch {
      // response body が json でない場合は既定メッセージのまま
    }
    throw new ApiError(message, response.status);
  }

  // NOTE: レスポンスボディなし (204 No Content) のAPI対策(暫定)
  if (response.status === 204) {
    return undefined as TResponse;
  }

  return response.json() as Promise<TResponse>;
};
