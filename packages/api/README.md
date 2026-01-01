# Analytics API

Backend API server for the analytics platform.

## Tech Stack

- **Runtime**: Bun
- **Framework**: tRPC
- **Database**: MongoDB with Mongoose
- **DI**: TSyringe
- **Validation**: Zod

## Setup

1. **Install Dependencies**:
   ```bash
   bun install
   ```

2. **Configure Environment** (`.env`):
   ```env
   MONGODB_URI=mongodb+srv://...
   ADMIN_SECRET=your-secret
   DASHBOARD_URL=http://localhost:5173
   PORT=3000
   ```

3. **Start Development Server**:
   ```bash
   bun run dev
   ```

## API Endpoints

### Projects Router (Admin Only)

All project endpoints require `Authorization: Bearer <ADMIN_SECRET>` header.

#### `projects.list`
Query - List all projects (without API keys)

**Response**:
```typescript
Array<{
  projectId: string;
  name: string;
  settings: ProjectSettings;
  createdAt: Date;
  updatedAt: Date;
}>
```

#### `projects.create`
Mutation - Create a new project

**Input**:
```typescript
{
  projectId: string;      // Alphanumeric + hyphens, 1-50 chars
  name: string;           // 1-100 chars
  settings?: {
    dataRetentionDays?: number;  // 1-365, default 90
    allowedOrigins?: string[];   // Default []
  };
}
```

**Response**:
```typescript
{
  projectId: string;
  name: string;
  apiKey: string;         // Only returned on creation!
  settings: ProjectSettings;
  createdAt: Date;
}
```

#### `projects.update`
Mutation - Update project name or settings

**Input**:
```typescript
{
  projectId: string;
  name?: string;
  settings?: Partial<ProjectSettings>;
}
```

#### `projects.delete`
Mutation - Delete project and all its events

**Input**:
```typescript
{
  projectId: string;
}
```

#### `projects.regenerateApiKey`
Mutation - Generate new API key (invalidates old one)

**Input**:
```typescript
{
  projectId: string;
}
```

**Response**:
```typescript
{
  projectId: string;
  apiKey: string;
}
```

#### `projects.stats`
Query - Get analytics statistics for a project

**Input**:
```typescript
{
  projectId: string;
  startDate?: Date;
  endDate?: Date;
}
```

**Response**:
```typescript
{
  totalEvents: number;
  uniqueUsers: number;
  eventBreakdown: Array<{
    name: string;
    count: number;
  }>;
}
```

### Events Router

#### `events.track`
Mutation - Track events (requires `x-api-key` header)

**Headers**:
```
x-api-key: <project-api-key>
```

**Input**:
```typescript
{
  events: Array<{
    name: string;
    timestamp: Date;
    userId?: string;
    sessionId?: string;
    properties?: Record<string, any>;
  }>;  // Max 100 events per batch
}
```

**Response**:
```typescript
{
  success: boolean;
  count: number;
}
```

#### `events.query`
Query - Query events with filters (admin only)

**Input**:
```typescript
{
  projectId: string;
  startDate?: Date;
  endDate?: Date;
  eventName?: string;
  limit?: number;    // 1-100, default 50
  offset?: number;   // Default 0
}
```

**Response**:
```typescript
{
  events: EventDocument[];
  total: number;
  hasMore: boolean;
}
```

## Architecture

### Service Layer

The API uses a clean service layer architecture:

- **ProjectService**: Project CRUD operations
- **EventService**: Event tracking and querying
- **AnalyticsService**: Aggregation and analytics queries

Services are registered with TSyringe for dependency injection.

### Models

- **Project**: Project configuration and API keys
- **Event**: Event data with timeseries optimization

### Middleware

- **adminMiddleware**: Validates admin secret from Authorization header
- **apiKeyMiddleware**: Validates project API key and attaches project to context

## Development

### Code Conventions

See `claude.md` in the root for coding standards:
- Class organization: instance vars → constructor → public methods (alphabetical) → private methods (alphabetical)
- No `I` prefix for interfaces
- Use `Document` suffix for Mongoose models

### Running

```bash
# Development with auto-reload
bun run dev

# Production build
bun run build
bun run start
```

## Testing

Manual integration testing:

1. Start the API server
2. Use the dashboard or curl to test endpoints
3. Verify MongoDB data

Example with curl:

```bash
# List projects
curl -H "Authorization: Bearer your-admin-secret" \
  http://localhost:3000/projects.list

# Track events
curl -H "x-api-key: your-project-api-key" \
  -H "Content-Type: application/json" \
  -d '{"events":[{"name":"test","timestamp":"2024-01-01T00:00:00Z"}]}' \
  http://localhost:3000/events.track
```

## Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| MONGODB_URI | MongoDB connection string | Yes | - |
| ADMIN_SECRET | Admin authentication secret | Yes | - |
| DASHBOARD_URL | Dashboard URL for CORS | Yes | - |
| PORT | Server port | No | 3000 |

## Database Schema

### Projects Collection

```javascript
{
  projectId: String,      // Unique, indexed
  name: String,
  apiKey: String,         // Unique, indexed
  settings: {
    dataRetentionDays: Number,
    allowedOrigins: [String]
  },
  createdAt: Date,
  updatedAt: Date
}
```

### Events Collection

```javascript
{
  projectId: String,      // Indexed
  name: String,
  timestamp: Date,        // Client-side time
  receivedAt: Date,       // Server time, indexed
  userId: String,         // Optional, indexed
  sessionId: String,      // Optional
  properties: Object      // Optional custom data
}
```

Compound indexes:
- `{ projectId: 1, receivedAt: -1 }`
- `{ projectId: 1, name: 1, receivedAt: -1 }`
- `{ projectId: 1, userId: 1, receivedAt: -1 }`
