import { z } from 'zod';
import { router, adminProcedure } from '../middleware.js';
import { TRPCError } from '@trpc/server';

const projectIdSchema = z
  .string()
  .min(1)
  .max(50)
  .regex(/^[a-zA-Z0-9-]+$/, 'Project ID must be alphanumeric with hyphens');

const projectNameSchema = z.string().min(1).max(100);

const settingsSchema = z
  .object({
    dataRetentionDays: z.number().min(1).max(365).optional(),
    allowedOrigins: z.array(z.string()).optional(),
  })
  .optional();

export const projectsRouter = router({
  create: adminProcedure
    .input(
      z.object({
        projectId: projectIdSchema,
        name: projectNameSchema,
        settings: settingsSchema,
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const project = await ctx.services.projectService.createProject(input);
        return {
          projectId: project.projectId,
          name: project.name,
          apiKey: project.apiKey,
          settings: project.settings,
          createdAt: project.createdAt,
        };
      } catch (error) {
        if (error instanceof Error && error.message.includes('already exists')) {
          throw new TRPCError({
            code: 'CONFLICT',
            message: error.message,
          });
        }
        throw error;
      }
    }),

  delete: adminProcedure
    .input(
      z.object({
        projectId: projectIdSchema,
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Delete all events for this project first
      await ctx.services.eventService.deleteProjectEvents(input.projectId);

      // Delete the project
      const deleted = await ctx.services.projectService.deleteProject(
        input.projectId
      );

      if (!deleted) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Project not found',
        });
      }

      return { success: true };
    }),

  list: adminProcedure.query(async ({ ctx }) => {
    return await ctx.services.projectService.listProjects();
  }),

  regenerateApiKey: adminProcedure
    .input(
      z.object({
        projectId: projectIdSchema,
      })
    )
    .mutation(async ({ ctx, input }) => {
      const project = await ctx.services.projectService.regenerateApiKey(
        input.projectId
      );

      if (!project) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Project not found',
        });
      }

      return {
        projectId: project.projectId,
        apiKey: project.apiKey,
      };
    }),

  stats: adminProcedure
    .input(
      z.object({
        projectId: projectIdSchema,
        startDate: z.coerce.date().optional(),
        endDate: z.coerce.date().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const project = await ctx.services.projectService.getProject(
        input.projectId
      );

      if (!project) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Project not found',
        });
      }

      return await ctx.services.analyticsService.getProjectStats(
        input.projectId,
        input.startDate,
        input.endDate
      );
    }),

  dailyActiveUsers: adminProcedure
    .input(
      z.object({
        projectId: projectIdSchema,
        startDate: z.coerce.date(),
        endDate: z.coerce.date(),
      })
    )
    .query(async ({ ctx, input }) => {
      const project = await ctx.services.projectService.getProject(
        input.projectId
      );

      if (!project) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Project not found',
        });
      }

      return await ctx.services.analyticsService.getDailyActiveUsers(
        input.projectId,
        input.startDate,
        input.endDate
      );
    }),

  update: adminProcedure
    .input(
      z.object({
        projectId: projectIdSchema,
        name: projectNameSchema.optional(),
        settings: settingsSchema,
      })
    )
    .mutation(async ({ ctx, input }) => {
      const project = await ctx.services.projectService.updateProject(input);

      if (!project) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Project not found',
        });
      }

      return {
        projectId: project.projectId,
        name: project.name,
        settings: project.settings,
        updatedAt: project.updatedAt,
      };
    }),
});
