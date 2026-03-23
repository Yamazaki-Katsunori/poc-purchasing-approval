'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode, useState } from 'react';
import { Provider as JotaiProvider } from 'jotai';
import { createStore } from 'jotai';

type ProvidersProps = {
  children: ReactNode;
};

export function Providers({ children }: ProvidersProps) {
  const [queryClient] = useState(() => new QueryClient());

  const store = createStore();

  return (
    <JotaiProvider store={store}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
    </JotaiProvider>
  );
}
