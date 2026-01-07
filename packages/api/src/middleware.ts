import { initTRPC, TRPCError } from "@trpc/server";
import { CreateHTTPContextOptions } from "@trpc/server/adapters/standalone";
import {
    container,
    ProjectService,
    EventService,
    AnalyticsService,
} from "./services/index.js";
import { Project } from "./models/Project.js";

export interface Context {
    isAdmin: boolean;
    apiKey?: string;
    project?: Project;
    services: {
        projectService: ProjectService;
        eventService: EventService;
        analyticsService: AnalyticsService;
    };
}

export async function createContext(
    opts: CreateHTTPContextOptions
): Promise<Context> {
    const authHeader = opts.req.headers.authorization;
    const apiKey = opts.req.headers["x-api-key"] as string | undefined;

    const isAdmin =
        authHeader?.startsWith("Bearer ") &&
        authHeader.slice(7) === process.env.ADMIN_SECRET;

    return {
        isAdmin: isAdmin ? isAdmin : false,
        apiKey,
        services: {
            projectService: container.resolve(ProjectService),
            eventService: container.resolve(EventService),
            analyticsService: container.resolve(AnalyticsService),
        },
    };
}

const t = initTRPC.context<Context>().create();

export const router = t.router;
export const publicProcedure = t.procedure;

export const adminMiddleware = t.middleware(async ({ ctx, next }) => {
    if (!ctx.isAdmin) {
        throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Admin authentication required",
        });
    }
    return next();
});

export const apiKeyMiddleware = t.middleware(async ({ ctx, next }) => {
    if (!ctx.apiKey) {
        throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "API key required",
        });
    }

    const project = await ctx.services.projectService.getProjectByApiKey(
        ctx.apiKey
    );

    if (!project) {
        throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Invalid API key",
        });
    }

    return next({
        ctx: {
            ...ctx,
            project,
        },
    });
});

export const adminProcedure = publicProcedure.use(adminMiddleware);
export const apiKeyProcedure = publicProcedure.use(apiKeyMiddleware);
