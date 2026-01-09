import { createTRPCOptionsProxy } from "@trpc/tanstack-react-query";
import { QueryClient } from "@tanstack/react-query";
import { createTRPCClient, httpBatchLink } from "@trpc/client";
import type { AppRouter } from "@analytics/api";

export const queryClient = new QueryClient();

let adminSecret: string | null = null;

const getApiUrl = () => {
    if (import.meta.env.VITE_API_URL) {
        return import.meta.env.VITE_API_URL;
    }

    return "http://localhost:3000";
};

const trpcClient = createTRPCClient<AppRouter>({
    links: [
        httpBatchLink({
            url: getApiUrl(),
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
