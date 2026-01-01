import { router } from './middleware.js';
import { projectsRouter } from './routers/projects.js';
import { eventsRouter } from './routers/events.js';

export const appRouter = router({
  projects: projectsRouter,
  events: eventsRouter,
});

export type AppRouter = typeof appRouter;
