import { createTRPCOptionsProxy } from "@trpc/tanstack-react-query";
import { QueryClient } from "@tanstack/react-query";
import { createTRPCClient, httpBatchLink } from "@trpc/client";
import type { AppRouter } from "@analytics/api";

export const queryClient = new QueryClient();

// Store the admin secret
let adminSecret: string | null = null;

// Create client with lazy headers
const trpcClient = createTRPCClient<AppRouter>({
    links: [
        httpBatchLink({
            url: "http://localhost:3000",
            headers() {
                if (adminSecret) {
                    return {
                        Authorization: `Bearer ${adminSecret}`,
                    };
                }
                return {};
            },
        }),
    ],
});

export const trpc = createTRPCOptionsProxy<AppRouter>({
    client: trpcClient,
    queryClient,
});

export function updateTRPCClient(secret: string) {
    adminSecret = secret;
}
