type HttpMethodType = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

type ApiClientOptions = {
  method?: HttpMethodType;
  body?: unknown;
  headers?: HeadersInit;
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
  const { method = 'GET', body, headers } = options;

  const response = await fetch(`/api${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
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

  return response.json() as Promise<TResponse>;
};
