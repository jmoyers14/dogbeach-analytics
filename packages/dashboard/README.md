# Analytics Dashboard

Admin dashboard for managing analytics projects and viewing statistics.

## Tech Stack

- **Framework**: React 18
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Data Fetching**: tRPC + React Query
- **Type Safety**: TypeScript

## Setup

1. **Install Dependencies**:
   ```bash
   bun install
   ```

2. **Configure API URL** in `src/trpc.ts`:
   ```typescript
   url: 'http://localhost:3000',  // Update for production
   ```

3. **Start Development Server**:
   ```bash
   bun run dev
   ```

4. **Access**: Open http://localhost:5173

## Features

### Authentication
- Simple admin secret authentication
- Secret stored in localStorage
- Logout clears credentials

### Project Management
- Create new projects with custom settings
- View project list with real-time stats
- Update project settings
- Regenerate API keys
- Delete projects (with confirmation)

### Analytics Display
- Total events count
- Unique users count
- Event types breakdown
- Real-time updates

### UI Components

#### ProjectsPage
Main page displaying all projects in a responsive grid.

#### ProjectCard
Individual project card showing:
- Project name and ID
- Statistics (events, users, types)
- API key (toggle visibility)
- Action buttons (regenerate, delete)

#### CreateProjectModal
Modal form for creating new projects:
- Project ID validation
- Project name
- Data retention settings
- Displays generated API key (one-time view)

## Development

### File Structure

```
src/
├── pages/
│   └── Projects.tsx     # Main projects page
├── components/          # Reusable components (future)
├── utils/
│   └── cn.ts           # Tailwind class merge utility
├── trpc.ts             # tRPC client setup
├── App.tsx             # Root component with auth
├── main.tsx            # React entry point
└── index.css           # Tailwind imports
```

### Styling

Uses Tailwind CSS with custom utilities:
- Responsive design (mobile, tablet, desktop)
- Consistent color scheme
- Focus states for accessibility
- Hover effects for interactivity

### State Management

- React Query for server state
- Local component state for UI
- localStorage for authentication

## Building

```bash
# Development
bun run dev

# Production build
bun run build

# Preview production build
bun run preview
```

Output: `dist/` directory ready for static hosting.

## Deployment

### Vercel
```bash
vercel
```

### Netlify
```bash
bun run build
# Upload dist/ folder
```

### Manual
1. Build: `bun run build`
2. Upload `dist/` to static host
3. Configure redirects for SPA routing

## Environment Configuration

Update API URL based on environment:

**Development** (`src/trpc.ts`):
```typescript
url: 'http://localhost:3000'
```

**Production** (`src/trpc.ts`):
```typescript
url: 'https://api.yourdomain.com'
```

Or use environment variables:
```typescript
url: import.meta.env.VITE_API_URL
```

Then create `.env.production`:
```env
VITE_API_URL=https://api.yourdomain.com
```

## Usage

1. **Login**: Enter your admin secret from the API `.env` file
2. **Create Project**: Click "Create Project" and fill in details
3. **Copy API Key**: Save the generated API key (shown only once!)
4. **View Stats**: Project cards automatically show analytics
5. **Manage**: Regenerate keys or delete projects as needed

## Security Notes

- Admin secret is stored in localStorage (client-side only)
- All API requests include the secret in headers
- API key is only shown once after creation
- Confirmation required for destructive actions

## Browser Support

Modern browsers with ES2020+ support:
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
