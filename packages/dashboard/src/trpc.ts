import { createTRPCReact } from '@trpc/react-query';
import { httpBatchLink } from '@trpc/client';
import type { AppRouter } from '@analytics/api';

export const trpc = createTRPCReact<AppRouter>();

export function createTRPCClient(adminSecret: string) {
  return trpc.createClient({
    links: [
      httpBatchLink({
        url: 'http://localhost:3000',
        headers() {
          return {
            Authorization: `Bearer ${adminSecret}`,
          };
        },
      }),
    ],
  });
}
