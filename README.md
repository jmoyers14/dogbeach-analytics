# Analytics Platform

A multi-project analytics platform with a Bun + tRPC + Mongoose backend, React + Tailwind dashboard, and lightweight TypeScript client for Chrome extensions.

## Architecture

```
analytics-platform/
├── packages/
│   ├── api/          # Backend API (Bun + tRPC + Mongoose)
│   ├── dashboard/    # Admin dashboard (React + Vite + Tailwind)
│   └── client/       # Analytics client (TypeScript for Chrome extensions)
```

## Features

- **Multi-project support**: Manage multiple analytics projects from one dashboard
- **Event tracking**: Track custom events with properties
- **User analytics**: Unique users, DAU, retention analysis
- **Real-time stats**: Event counts, user metrics, event breakdowns
- **Secure API**: API key authentication for tracking, admin secret for management
- **Batched events**: Efficient event batching for reduced network overhead

## Getting Started

### Prerequisites

- Bun installed
- MongoDB Atlas account (free tier works great)
- Node.js/npm (optional, for publishing packages)

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd analytics-platform
bun install
```

### 2. Configure MongoDB

1. Create a free MongoDB Atlas cluster at https://www.mongodb.com/cloud/atlas
2. Get your connection string
3. Update `packages/api/.env`:

```env
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/analytics?retryWrites=true&w=majority
ADMIN_SECRET=your-secure-admin-secret-change-this
DASHBOARD_URL=http://localhost:5173
PORT=3000
```

### 3. Start Development

Open three terminals:

```bash
# Terminal 1: API Server
bun run dev:api

# Terminal 2: Dashboard
bun run dev:dashboard

# Terminal 3: (Optional) Build client
bun run build:client
```

### 4. Access Dashboard

1. Open http://localhost:5173
2. Login with your `ADMIN_SECRET` from `.env`
3. Create your first project
4. Copy the generated API key

### 5. Use the Client

```typescript
import { Analytics } from '@analytics/client';

const analytics = new Analytics({
  apiUrl: 'http://localhost:3000',
  apiKey: 'your-project-api-key',
});

analytics.track('page_view', {
  url: window.location.href,
});
```

## Project Structure

### API (`packages/api`)

Backend API server with:
- **Models**: Mongoose schemas for Projects and Events
- **Services**: Business logic layer with dependency injection
- **Routers**: tRPC endpoints for projects and events
- **Middleware**: Authentication and context management

Key endpoints:
- `projects.list` - List all projects (admin)
- `projects.create` - Create new project (admin)
- `projects.stats` - Get project statistics (admin)
- `events.track` - Track events (API key)
- `events.query` - Query events (admin)

### Dashboard (`packages/dashboard`)

React-based admin dashboard with:
- Project management (create, update, delete)
- API key management (view, regenerate)
- Real-time analytics stats
- Event breakdown visualization

### Client (`packages/client`)

Lightweight analytics client for Chrome extensions:
- Automatic event batching
- User and session tracking
- Offline queue with retry logic
- TypeScript support

## Development

### Running Tests

Integration testing is manual. See the testing guide:

```bash
# Start API
bun run dev:api

# Start Dashboard
bun run dev:dashboard

# Follow manual testing steps in packages/api/README.md
```

### Building for Production

```bash
# Build all packages
bun run build

# Or build individually
bun run build:api
bun run build:dashboard
bun run build:client
```

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for production deployment instructions.

## Environment Variables

### API (`packages/api/.env`)

| Variable | Description | Required |
|----------|-------------|----------|
| `MONGODB_URI` | MongoDB connection string | Yes |
| `ADMIN_SECRET` | Secret for dashboard authentication | Yes |
| `DASHBOARD_URL` | Dashboard URL for CORS | Yes |
| `PORT` | Server port | No (default: 3000) |

### Dashboard

The dashboard connects to the API using the URL in `src/trpc.ts`. Update this for production.

## Technology Stack

- **Runtime**: Bun
- **API Framework**: tRPC
- **Database**: MongoDB with Mongoose
- **DI Container**: TSyringe
- **Frontend**: React + Vite
- **Styling**: Tailwind CSS
- **Type Safety**: TypeScript throughout

## License

MIT

## Contributing

Pull requests are welcome! Please ensure:
- Code follows the conventions in `claude.md`
- TypeScript compiles without errors
- Manual testing passes
