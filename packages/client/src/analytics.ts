import { createTRPCProxyClient, httpBatchLink } from '@trpc/client';

export interface AnalyticsConfig {
  apiUrl: string;
  apiKey: string;
  batchSize?: number;
  flushInterval?: number;
  maxQueueSize?: number;
}

export interface EventData {
  name: string;
  properties?: Record<string, any>;
}

interface QueuedEvent {
  name: string;
  timestamp: Date;
  userId?: string;
  sessionId?: string;
  properties?: Record<string, any>;
}

const USER_ID_KEY = 'analytics_user_id';
const SESSION_ID_KEY = 'analytics_session_id';

export class Analytics {
  private client: any;
  private queue: QueuedEvent[] = [];
  private userId?: string;
  private sessionId?: string;
  private flushTimer?: number;
  private config: Required<AnalyticsConfig>;

  constructor(config: AnalyticsConfig) {
    this.config = {
      apiUrl: config.apiUrl,
      apiKey: config.apiKey,
      batchSize: config.batchSize ?? 10,
      flushInterval: config.flushInterval ?? 30000, // 30 seconds
      maxQueueSize: config.maxQueueSize ?? 100,
    };

    this.client = createTRPCProxyClient({
      links: [
        httpBatchLink({
          url: this.config.apiUrl,
          headers: {
            'x-api-key': this.config.apiKey,
          },
        }),
      ],
    });

    this.initializeIds();
    this.startFlushTimer();
  }

  async track(name: string, properties?: Record<string, any>): Promise<void> {
    const event: QueuedEvent = {
      name,
      timestamp: new Date(),
      userId: this.userId,
      sessionId: this.sessionId,
      properties,
    };

    this.queue.push(event);

    // Remove oldest events if queue is too large
    if (this.queue.length > this.config.maxQueueSize) {
      this.queue.shift();
    }

    // Auto-flush if batch size reached
    if (this.queue.length >= this.config.batchSize) {
      await this.flush();
    }
  }

  async flush(): Promise<void> {
    if (this.queue.length === 0) {
      return;
    }

    const eventsToSend = this.queue.splice(0, this.config.batchSize);

    try {
      await this.client.events.track.mutate({
        events: eventsToSend,
      });
    } catch (error) {
      console.error('Failed to send analytics events:', error);
      // Re-queue failed events at the front
      this.queue.unshift(...eventsToSend);
    }
  }

  destroy(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }
    this.flush().catch(console.error);
  }

  // Private methods
  private async initializeIds(): Promise<void> {
    // Get or generate user ID
    try {
      const result = await chrome.storage.local.get(USER_ID_KEY);
      if (result[USER_ID_KEY]) {
        this.userId = result[USER_ID_KEY];
      } else {
        this.userId = this.generateId();
        await chrome.storage.local.set({ [USER_ID_KEY]: this.userId });
      }
    } catch (error) {
      console.error('Failed to initialize user ID:', error);
      this.userId = this.generateId();
    }

    // Generate session ID (per browser session)
    this.sessionId = this.generateId();
    try {
      await chrome.storage.session.set({ [SESSION_ID_KEY]: this.sessionId });
    } catch (error) {
      console.error('Failed to set session ID:', error);
    }
  }

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
  }

  private startFlushTimer(): void {
    this.flushTimer = window.setInterval(() => {
      this.flush().catch(console.error);
    }, this.config.flushInterval);
  }
}
