import { z } from 'zod';
import { router, adminProcedure, apiKeyProcedure } from '../middleware.js';

const eventSchema = z.object({
  name: z.string().min(1),
  timestamp: z.coerce.date(),
  userId: z.string().optional(),
  sessionId: z.string().optional(),
  properties: z.record(z.any()).optional(),
});

export const eventsRouter = router({
  query: adminProcedure
    .input(
      z.object({
        projectId: z.string(),
        startDate: z.coerce.date().optional(),
        endDate: z.coerce.date().optional(),
        eventName: z.string().optional(),
        limit: z.number().min(1).max(100).optional(),
        offset: z.number().min(0).optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      return await ctx.services.eventService.queryEvents(input);
    }),

  track: apiKeyProcedure
    .input(
      z.object({
        events: z.array(eventSchema).min(1).max(100),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.project) {
        throw new Error('Project not found in context');
      }

      const count = await ctx.services.eventService.trackEvents({
        projectId: ctx.project.projectId,
        events: input.events,
      });

      return {
        success: true,
        count,
      };
    }),
});
