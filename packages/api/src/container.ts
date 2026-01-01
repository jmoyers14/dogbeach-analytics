import 'reflect-metadata';
import { container } from 'tsyringe';
import { ProjectService } from './services/ProjectService.js';
import { EventService } from './services/EventService.js';
import { AnalyticsService } from './services/AnalyticsService.js';

// Register all services
container.register('ProjectService', { useClass: ProjectService });
container.register('EventService', { useClass: EventService });
container.register('AnalyticsService', { useClass: AnalyticsService });

export { container };
