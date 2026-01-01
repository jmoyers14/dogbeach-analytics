# Deployment Guide

This guide covers deploying the analytics platform to production.

## Prerequisites

- MongoDB Atlas cluster (production-ready)
- Hosting platform for API (Railway, Fly.io, or VPS)
- Hosting for dashboard (Vercel, Netlify, or static hosting)

## API Deployment

### Option 1: Railway

1. **Create Railway Account**: https://railway.app
2. **Create New Project** from GitHub repo
3. **Add MongoDB Plugin** or use existing Atlas connection
4. **Set Environment Variables**:
   ```
   MONGODB_URI=<your-atlas-connection-string>
   ADMIN_SECRET=<secure-random-string>
   DASHBOARD_URL=<your-dashboard-url>
   PORT=3000
   ```
5. **Configure Start Command**: `bun run start`
6. **Deploy**: Railway will auto-deploy on push

### Option 2: Fly.io

1. **Install Fly CLI**: https://fly.io/docs/hands-on/install-flyctl/
2. **Login**: `fly auth login`
3. **Launch App**:
   ```bash
   cd packages/api
   fly launch
   ```
4. **Set Secrets**:
   ```bash
   fly secrets set MONGODB_URI=<connection-string>
   fly secrets set ADMIN_SECRET=<your-secret>
   fly secrets set DASHBOARD_URL=<dashboard-url>
   ```
5. **Deploy**: `fly deploy`

### Option 3: VPS (Ubuntu/Debian)

1. **Install Bun**:
   ```bash
   curl -fsSL https://bun.sh/install | bash
   ```

2. **Clone Repository**:
   ```bash
   git clone <your-repo>
   cd analytics-platform
   bun install
   ```

3. **Create `.env` file** in `packages/api/`:
   ```env
   MONGODB_URI=<your-atlas-uri>
   ADMIN_SECRET=<secure-secret>
   DASHBOARD_URL=<dashboard-url>
   PORT=3000
   ```

4. **Build and Start**:
   ```bash
   bun run build:api
   cd packages/api
   bun run start
   ```

5. **Setup Process Manager** (PM2):
   ```bash
   npm install -g pm2
   pm2 start "bun run start" --name analytics-api
   pm2 save
   pm2 startup
   ```

6. **Configure Nginx** (reverse proxy):
   ```nginx
   server {
       listen 80;
       server_name api.yourdomain.com;

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

7. **Setup SSL** with Let's Encrypt:
   ```bash
   sudo apt install certbot python3-certbot-nginx
   sudo certbot --nginx -d api.yourdomain.com
   ```

## Dashboard Deployment

### Option 1: Vercel

1. **Install Vercel CLI**: `npm i -g vercel`
2. **Navigate to Dashboard**:
   ```bash
   cd packages/dashboard
   ```
3. **Update API URL** in `src/trpc.ts`:
   ```typescript
   url: 'https://api.yourdomain.com',
   ```
4. **Deploy**:
   ```bash
   vercel
   ```

### Option 2: Netlify

1. **Build Dashboard**:
   ```bash
   bun run build:dashboard
   ```
2. **Deploy** via Netlify CLI or drag-and-drop `packages/dashboard/dist` to https://app.netlify.com

### Option 3: Static Hosting

1. **Build**:
   ```bash
   bun run build:dashboard
   ```
2. **Upload** `packages/dashboard/dist` to your static host (S3, Cloudflare Pages, etc.)

## MongoDB Setup

### Production Configuration

1. **Create Production Cluster** in MongoDB Atlas
2. **Enable Authentication**
3. **Whitelist IP Addresses** or use `0.0.0.0/0` (not recommended for production)
4. **Create Database User** with read/write permissions
5. **Get Connection String** and update `MONGODB_URI`

### Indexes

Ensure indexes are created (they should auto-create from models):

```javascript
// Events collection
db.events.createIndex({ projectId: 1, receivedAt: -1 })
db.events.createIndex({ projectId: 1, name: 1, receivedAt: -1 })
db.events.createIndex({ projectId: 1, userId: 1, receivedAt: -1 })

// Projects collection
db.projects.createIndex({ projectId: 1 }, { unique: true })
db.projects.createIndex({ apiKey: 1 }, { unique: true })
```

## Security Checklist

- [ ] Change `ADMIN_SECRET` to a secure random string
- [ ] Use MongoDB Atlas with authentication
- [ ] Enable HTTPS on API (use Let's Encrypt or platform SSL)
- [ ] Update `DASHBOARD_URL` to production URL
- [ ] Set proper CORS origins
- [ ] Use environment variables (never commit secrets)
- [ ] Enable rate limiting (optional but recommended)
- [ ] Monitor error logs
- [ ] Set up backups for MongoDB

## Environment Variables

### Production API

```env
MONGODB_URI=mongodb+srv://<user>:<pass>@<cluster>.mongodb.net/analytics?retryWrites=true&w=majority
ADMIN_SECRET=<64-character-random-string>
DASHBOARD_URL=https://dashboard.yourdomain.com
PORT=3000
```

Generate a secure admin secret:
```bash
openssl rand -hex 32
```

## Monitoring

### API Health Check

The API automatically logs:
- MongoDB connection status
- Server start on port
- Request errors

Add monitoring with:
- **Sentry** for error tracking
- **LogTail** for log aggregation
- **UptimeRobot** for uptime monitoring

### Database Monitoring

MongoDB Atlas provides:
- Performance metrics
- Query profiling
- Automated backups
- Alerts

## Scaling Considerations

### Horizontal Scaling

- Add load balancer in front of multiple API instances
- Use MongoDB replica sets
- Consider Redis for session storage if needed

### Performance

- Enable MongoDB connection pooling (handled by Mongoose)
- Add caching layer for frequently accessed stats
- Consider CDN for dashboard
- Implement rate limiting per project

## Backup Strategy

1. **MongoDB Backups**: Enable automated backups in Atlas
2. **Environment Variables**: Keep secure copy of all env vars
3. **Code**: Use Git tags for releases

## Rollback Plan

1. **API**: Revert to previous Railway/Fly deployment
2. **Dashboard**: Rollback in Vercel/Netlify dashboard
3. **Database**: Restore from Atlas backup if needed

## Post-Deployment

1. Test all functionality:
   - Create project
   - Track events
   - View stats
   - Regenerate API key
   - Delete project

2. Monitor logs for errors

3. Set up alerts for:
   - API downtime
   - High error rates
   - Database connection issues

## Support

For issues or questions, please create an issue in the GitHub repository.
