import { injectable } from 'tsyringe';
import { Event } from '../models/Event.js';

export interface ProjectStats {
  totalEvents: number;
  uniqueUsers: number;
  eventBreakdown: { name: string; count: number }[];
}

export interface DailyActiveUser {
  date: string;
  count: number;
}

export interface FunnelStep {
  eventName: string;
  count: number;
  dropoffRate: number;
}

export interface RetentionCohort {
  day: number;
  userCount: number;
  retentionRate: number;
}

@injectable()
export class AnalyticsService {
  // Public methods
  async getDailyActiveUsers(
    projectId: string,
    startDate: Date,
    endDate: Date
  ): Promise<DailyActiveUser[]> {
    const results = await Event.aggregate([
      {
        $match: {
          projectId,
          receivedAt: { $gte: startDate, $lte: endDate },
          userId: { $exists: true },
        },
      },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: '%Y-%m-%d', date: '$receivedAt' } },
            userId: '$userId',
          },
        },
      },
      {
        $group: {
          _id: '$_id.date',
          count: { $sum: 1 },
        },
      },
      {
        $sort: { _id: 1 },
      },
      {
        $project: {
          _id: 0,
          date: '$_id',
          count: 1,
        },
      },
    ]);

    return results;
  }

  async getEventFunnel(
    projectId: string,
    eventNames: string[],
    startDate?: Date,
    endDate?: Date
  ): Promise<FunnelStep[]> {
    const matchStage: any = { projectId };
    if (startDate || endDate) {
      matchStage.receivedAt = {};
      if (startDate) matchStage.receivedAt.$gte = startDate;
      if (endDate) matchStage.receivedAt.$lte = endDate;
    }

    const funnelSteps: FunnelStep[] = [];
    let previousCount = 0;

    for (const eventName of eventNames) {
      const count = await Event.countDocuments({
        ...matchStage,
        name: eventName,
      });

      const dropoffRate =
        previousCount > 0 ? ((previousCount - count) / previousCount) * 100 : 0;

      funnelSteps.push({
        eventName,
        count,
        dropoffRate,
      });

      previousCount = count;
    }

    return funnelSteps;
  }

  async getProjectStats(
    projectId: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<ProjectStats> {
    const matchStage: any = { projectId };
    if (startDate || endDate) {
      matchStage.receivedAt = {};
      if (startDate) matchStage.receivedAt.$gte = startDate;
      if (endDate) matchStage.receivedAt.$lte = endDate;
    }

    const [statsResult] = await Event.aggregate([
      { $match: matchStage },
      {
        $facet: {
          totalEvents: [{ $count: 'count' }],
          uniqueUsers: [
            {
              $match: { userId: { $exists: true } },
            },
            {
              $group: { _id: '$userId' },
            },
            {
              $count: 'count',
            },
          ],
          eventBreakdown: [
            {
              $group: {
                _id: '$name',
                count: { $sum: 1 },
              },
            },
            {
              $sort: { count: -1 },
            },
            {
              $project: {
                _id: 0,
                name: '$_id',
                count: 1,
              },
            },
          ],
        },
      },
    ]);

    return {
      totalEvents: statsResult.totalEvents[0]?.count || 0,
      uniqueUsers: statsResult.uniqueUsers[0]?.count || 0,
      eventBreakdown: statsResult.eventBreakdown || [],
    };
  }

  async getUserRetention(
    projectId: string,
    cohortDate: Date
  ): Promise<RetentionCohort[]> {
    const cohortStartDate = new Date(cohortDate);
    cohortStartDate.setHours(0, 0, 0, 0);
    const cohortEndDate = new Date(cohortStartDate);
    cohortEndDate.setDate(cohortEndDate.getDate() + 1);

    // Get users who had an event on the cohort date
    const cohortUsers = await Event.distinct('userId', {
      projectId,
      receivedAt: { $gte: cohortStartDate, $lt: cohortEndDate },
      userId: { $exists: true },
    });

    const cohortSize = cohortUsers.length;
    if (cohortSize === 0) {
      return [];
    }

    const retentionData: RetentionCohort[] = [];

    // Check retention for each of the next 30 days
    for (let day = 0; day < 30; day++) {
      const dayStartDate = new Date(cohortStartDate);
      dayStartDate.setDate(dayStartDate.getDate() + day);
      const dayEndDate = new Date(dayStartDate);
      dayEndDate.setDate(dayEndDate.getDate() + 1);

      const activeUsers = await Event.distinct('userId', {
        projectId,
        userId: { $in: cohortUsers },
        receivedAt: { $gte: dayStartDate, $lt: dayEndDate },
      });

      retentionData.push({
        day,
        userCount: activeUsers.length,
        retentionRate: (activeUsers.length / cohortSize) * 100,
      });
    }

    return retentionData;
  }
}
