# Testing Guide

Manual integration testing guide for the analytics platform.

## Prerequisites

1. MongoDB Atlas connection configured in `packages/api/.env`
2. API server running on `http://localhost:3000`
3. Dashboard running on `http://localhost:5173`

## Test Scenarios

### 1. Backend Health Check

**Goal**: Verify API server starts and connects to MongoDB

**Steps**:
```bash
cd packages/api
bun run dev
```

**Expected Output**:
```
Connecting to MongoDB...
Connected to MongoDB successfully
Analytics API server listening on port 3000
CORS enabled for: http://localhost:5173
```

**Pass Criteria**:
- ✅ No connection errors
- ✅ Server starts on port 3000
- ✅ MongoDB connection successful

---

### 2. Dashboard Authentication

**Goal**: Test login flow

**Steps**:
1. Open http://localhost:5173
2. Enter admin secret from `packages/api/.env`
3. Click "Login"

**Expected**:
- ✅ Redirects to projects page
- ✅ Shows navigation bar with "Logout" button
- ✅ Secret persists on page refresh

**Test Logout**:
1. Click "Logout"
2. Returns to login page
3. Secret is cleared

---

### 3. Project Creation

**Goal**: Create a new project and receive API key

**Steps**:
1. Click "Create Project"
2. Enter:
   - Project ID: `test-project`
   - Name: `Test Project`
   - Retention: `90`
3. Click "Create"

**Expected**:
- ✅ Success message appears
- ✅ API key is displayed (starts with `ak_`)
- ✅ Warning to copy key before closing
- ✅ Modal closes on "Close"
- ✅ New project appears in list

**Save the API key for next tests!**

---

### 4. Project Display

**Goal**: Verify project card shows correct information

**Expected**:
- ✅ Project name: "Test Project"
- ✅ Project ID: "test-project"
- ✅ Stats grid shows:
  - Total Events: 0
  - Unique Users: 0
  - Event Types: 0
- ✅ "Show API Key" button works

---

### 5. Event Tracking (API)

**Goal**: Track events via API

**Test with curl**:
```bash
curl -X POST http://localhost:3000/events.track \
  -H "Content-Type: application/json" \
  -H "x-api-key: YOUR_API_KEY_HERE" \
  -d '{
    "events": [
      {
        "name": "page_view",
        "timestamp": "2024-01-15T10:00:00Z",
        "userId": "user-123",
        "sessionId": "session-456",
        "properties": {
          "url": "/home",
          "title": "Homepage"
        }
      },
      {
        "name": "button_click",
        "timestamp": "2024-01-15T10:01:00Z",
        "userId": "user-123",
        "sessionId": "session-456",
        "properties": {
          "buttonId": "signup"
        }
      }
    ]
  }'
```

**Expected Response**:
```json
{
  "success": true,
  "count": 2
}
```

**Pass Criteria**:
- ✅ Response success: true
- ✅ Count matches number of events sent

---

### 6. Stats Update

**Goal**: Verify stats update after tracking events

**Steps**:
1. Refresh dashboard
2. Check project card stats

**Expected**:
- ✅ Total Events: 2
- ✅ Unique Users: 1
- ✅ Event Types: 2

---

### 7. Event Querying (Optional)

**Goal**: Query events via API (admin)

**Test with curl**:
```bash
curl -X POST http://localhost:3000/events.query \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_SECRET" \
  -d '{
    "projectId": "test-project",
    "limit": 10
  }'
```

**Expected**:
- ✅ Returns array of events
- ✅ Events have correct structure
- ✅ Total count matches

---

### 8. API Key Regeneration

**Goal**: Test regenerating API key

**Steps**:
1. Click "Regenerate Key" on project card
2. Confirm in alert dialog

**Expected**:
- ✅ New API key is generated
- ✅ Old API key no longer works
- ✅ New key works for tracking

**Verify old key fails**:
```bash
curl -X POST http://localhost:3000/events.track \
  -H "x-api-key: OLD_KEY" \
  -d '{"events":[{"name":"test","timestamp":"2024-01-15T10:00:00Z"}]}'
```

**Expected**: 401 Unauthorized

---

### 9. Project Deletion

**Goal**: Test deleting project and its events

**Steps**:
1. Click "Delete" on project card
2. Confirmation UI appears
3. Click "Confirm Delete"

**Expected**:
- ✅ Project is removed from list
- ✅ All events are deleted from database
- ✅ API key no longer works

---

### 10. Analytics Client (Chrome Extension)

**Goal**: Test the client package in a Chrome extension

**Create Test Extension**:

1. Create `test-extension/manifest.json`:
```json
{
  "manifest_version": 3,
  "name": "Analytics Test",
  "version": "1.0.0",
  "permissions": ["storage"],
  "background": {
    "service_worker": "background.js",
    "type": "module"
  }
}
```

2. Build client:
```bash
bun run build:client
```

3. Create `test-extension/background.js`:
```javascript
import { Analytics } from '../packages/client/dist/index.js';

const analytics = new Analytics({
  apiUrl: 'http://localhost:3000',
  apiKey: 'YOUR_API_KEY',
});

// Track test event
analytics.track('extension_loaded', {
  timestamp: new Date().toISOString(),
});

// Track after delay
setTimeout(() => {
  analytics.track('delayed_event', {
    value: 42,
  });
}, 2000);
```

4. Load extension in Chrome
5. Check dashboard for events

**Expected**:
- ✅ Events appear in dashboard
- ✅ UserID is consistent across events
- ✅ SessionID is set

---

## Error Scenarios

### Invalid API Key
```bash
curl -X POST http://localhost:3000/events.track \
  -H "x-api-key: invalid-key" \
  -d '{"events":[{"name":"test","timestamp":"2024-01-15T10:00:00Z"}]}'
```
**Expected**: 401 Unauthorized

### Invalid Admin Secret
- Try logging into dashboard with wrong secret
**Expected**: API returns UNAUTHORIZED errors

### Duplicate Project ID
- Try creating project with same ID
**Expected**: Error message "already exists"

### Missing Required Fields
```bash
curl -X POST http://localhost:3000/events.track \
  -H "x-api-key: YOUR_KEY" \
  -d '{"events":[{"timestamp":"2024-01-15T10:00:00Z"}]}'
```
**Expected**: Validation error (missing `name`)

---

## Database Verification

Check MongoDB Atlas directly:

1. **Projects Collection**:
   ```javascript
   db.projects.find({})
   ```
   - Verify projects exist
   - Check apiKey format (`ak_...`)

2. **Events Collection**:
   ```javascript
   db.events.find({ projectId: "test-project" })
   ```
   - Verify events are stored
   - Check timestamp vs receivedAt
   - Verify properties are preserved

3. **Indexes**:
   ```javascript
   db.events.getIndexes()
   db.projects.getIndexes()
   ```
   - Verify compound indexes exist

---

## Performance Testing

### Batch Event Tracking
Send 100 events at once:
```bash
# Create JSON file with 100 events
# POST to events.track endpoint
```

**Expected**:
- ✅ All events are stored
- ✅ Response time < 2 seconds
- ✅ Stats update correctly

---

## Success Criteria

All phases complete when:
- ✅ API server runs without errors
- ✅ Dashboard loads and authenticates
- ✅ Projects can be created, updated, deleted
- ✅ Events can be tracked via API
- ✅ Stats display correctly
- ✅ API keys can be regenerated
- ✅ Client package works in extensions
- ✅ No TypeScript compilation errors
- ✅ MongoDB indexes are created
- ✅ Error handling works correctly

---

## Troubleshooting

### API won't start
- Check MongoDB connection string
- Verify ADMIN_SECRET is set
- Check port 3000 is not in use

### Dashboard shows errors
- Verify API is running
- Check admin secret matches
- Open browser console for details

### Events not appearing
- Verify API key is correct
- Check network tab for failed requests
- Verify MongoDB connection

### Stats not updating
- Refresh the page
- Check browser console
- Verify events were successfully tracked
