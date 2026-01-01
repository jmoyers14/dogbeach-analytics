# Analytics Client

Lightweight TypeScript analytics client for Chrome extensions.

## Installation

```bash
bun add @analytics/client
```

## Usage

### Basic Setup

```typescript
import { Analytics } from '@analytics/client';

const analytics = new Analytics({
  apiUrl: 'http://localhost:3000',
  apiKey: 'your-api-key-here',
});

// Track an event
analytics.track('page_view', {
  url: window.location.href,
  title: document.title,
});

// Track a button click
analytics.track('button_click', {
  buttonId: 'signup',
  page: 'homepage',
});
```

### Configuration Options

```typescript
interface AnalyticsConfig {
  apiUrl: string;         // Required: Your analytics API endpoint
  apiKey: string;         // Required: Your project API key
  batchSize?: number;     // Optional: Events per batch (default: 10)
  flushInterval?: number; // Optional: Auto-flush interval in ms (default: 30000)
  maxQueueSize?: number;  // Optional: Max events in queue (default: 100)
}
```

### Advanced Usage

```typescript
// Manual flush
await analytics.flush();

// Cleanup when done
analytics.destroy();
```

## Features

- **Automatic batching**: Events are batched and sent in groups for efficiency
- **Auto-flush**: Automatic periodic flushing based on configured interval
- **User tracking**: Automatically generates and persists user IDs
- **Session tracking**: Tracks sessions using Chrome's session storage
- **Offline queue**: Failed requests are re-queued for retry
- **TypeScript support**: Full type definitions included

## Chrome Extension Integration

The client is designed specifically for Chrome extensions and uses:
- `chrome.storage.local` for persistent user ID storage
- `chrome.storage.session` for session ID tracking

Make sure your extension has the required permissions in `manifest.json`:

```json
{
  "permissions": [
    "storage"
  ]
}
```

## Example: Background Script

```typescript
import { Analytics } from '@analytics/client';

const analytics = new Analytics({
  apiUrl: 'https://api.youranalytics.com',
  apiKey: process.env.ANALYTICS_API_KEY!,
});

chrome.action.onClicked.addListener(() => {
  analytics.track('extension_icon_clicked');
});

// Cleanup on extension unload
chrome.runtime.onSuspend.addListener(() => {
  analytics.destroy();
});
```

## API Reference

### `track(name: string, properties?: Record<string, any>): Promise<void>`

Track an event with optional properties.

**Parameters:**
- `name`: Event name (e.g., "button_click", "page_view")
- `properties`: Optional object with custom event properties

**Example:**
```typescript
await analytics.track('purchase', {
  amount: 99.99,
  currency: 'USD',
  productId: 'prod_123',
});
```

### `flush(): Promise<void>`

Manually flush all queued events to the server.

**Example:**
```typescript
await analytics.flush();
```

### `destroy(): void`

Stop the auto-flush timer and flush remaining events. Call this when shutting down.

**Example:**
```typescript
analytics.destroy();
```

## License

MIT
