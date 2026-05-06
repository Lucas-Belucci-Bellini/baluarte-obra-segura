# BALUARTE ENGINEERING HUB - DEPLOYMENT GUIDE

## Project Overview

BALUARTE ENGINEERING HUB is a comprehensive engineering knowledge base and calculator platform with:

- **130+ Functions** across 4 engineering specialties
- **Web Application** (React + tRPC + Express)
- **Desktop Application** (Electron with offline sync)
- **B2B Partnership System** for enterprise integration
- **AI-Powered Chatbots** for market analysis and recommendations
- **Subscription Model** (Free, Pro, Enterprise)
- **Multilingual Support** (Portuguese & English)

## Architecture

### Web Application Stack
- **Frontend**: React 19 + Tailwind CSS 4 + TypeScript
- **Backend**: Express 4 + tRPC 11 + MySQL/TiDB
- **Authentication**: Manus OAuth
- **Database**: Drizzle ORM with migrations

### Desktop Application Stack
- **Framework**: Electron
- **Local Storage**: SQLite 3
- **Sync Engine**: Custom offline-first sync
- **Build**: Electron Builder (Windows, Mac, Linux)

### API Routers
1. **Calculators Router** - 25 professional calculators
2. **Tier 2 Router** - 32 unit converters & quick calculators
3. **Tier 3 Router** - 9 advanced features
4. **Chatbots Router** - 5 AI-powered functions
5. **Partners Router** - 20+ B2B procedures
6. **Billing Router** - Subscription management

## Deployment Steps

### 1. Web Application Deployment

#### Prerequisites
- Node.js 18+
- MySQL/TiDB database
- Environment variables configured

#### Environment Variables
```env
DATABASE_URL=mysql://user:password@host/baluarte
JWT_SECRET=your-secret-key
VITE_APP_ID=your-oauth-app-id
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://oauth.manus.im
```

#### Build & Deploy
```bash
# Install dependencies
pnpm install

# Run migrations
pnpm drizzle-kit generate
pnpm drizzle-kit migrate

# Build application
pnpm build

# Start production server
pnpm start
```

### 2. Desktop Application Deployment

#### Prerequisites
- Electron Builder
- Code signing certificates (for macOS/Windows)
- Update server endpoint

#### Build for All Platforms
```bash
# Build for Windows
pnpm electron-builder --win

# Build for macOS
pnpm electron-builder --mac

# Build for Linux
pnpm electron-builder --linux
```

#### Code Signing (macOS)
```bash
export CSC_LINK=/path/to/certificate.p12
export CSC_KEY_PASSWORD=password
pnpm electron-builder --mac
```

### 3. Database Setup

#### Create Tables
```bash
# MySQL
mysql -u root -p baluarte < drizzle/schema.sql

# Or use Drizzle migrations
pnpm drizzle-kit migrate
```

#### Seed Initial Data
```bash
node seed-db.mjs
```

### 4. Testing

#### Run All Tests
```bash
pnpm test
```

#### Run Specific Test Suite
```bash
pnpm test -- server/calculators.test.ts
pnpm test -- server/businessModel.test.ts
pnpm test -- server/chatbots.test.ts
```

#### Coverage Report
```bash
pnpm test -- --coverage
```

## Performance Optimization

### Web Application
- **Code Splitting**: Implemented via Vite
- **Lazy Loading**: React Router lazy routes
- **Caching**: Browser cache + server-side caching
- **CDN**: Static assets via CDN
- **Compression**: Gzip compression enabled

### Desktop Application
- **SQLite Indexing**: Optimized queries with indexes
- **Sync Batching**: Batch sync operations
- **Memory Management**: Proper cleanup of resources
- **Lazy Loading**: Load data on demand

### Database
- **Query Optimization**: Indexed foreign keys
- **Connection Pooling**: MySQL connection pool
- **Caching**: Redis for frequently accessed data

## Monitoring & Logging

### Application Logs
- Server logs: `.manus-logs/devserver.log`
- Client logs: `.manus-logs/browserConsole.log`
- Network logs: `.manus-logs/networkRequests.log`

### Metrics
- User engagement
- Calculation performance
- Sync success rate
- Error rates

### Alerts
- High error rate (>5%)
- Sync failures
- Database connection issues
- Server downtime

## Security

### Authentication
- OAuth 2.0 via Manus
- JWT tokens with expiration
- Secure cookie handling

### Data Protection
- HTTPS/TLS encryption
- Database encryption at rest
- API key rotation for partners

### Access Control
- Role-based access (admin/user)
- Feature access based on subscription tier
- Partner data isolation

## Maintenance

### Regular Tasks
- Database backups (daily)
- Log rotation (weekly)
- Security updates (as needed)
- Performance monitoring (daily)

### Update Process
- Version bump in package.json
- Database migrations if needed
- Build and test
- Deploy to staging
- Deploy to production

## Rollback Procedure

If deployment fails:

```bash
# Rollback to previous version
git revert HEAD

# Revert database migrations
pnpm drizzle-kit migrate --revert

# Restart services
pnpm start
```

## Support & Documentation

- **API Documentation**: `/api/docs`
- **User Guide**: `docs/USER_GUIDE.md`
- **Developer Guide**: `docs/DEVELOPER_GUIDE.md`
- **Architecture**: `docs/ARCHITECTURE.md`

## Contact

For deployment issues or questions:
- Email: support@baluarte.com
- Slack: #engineering-hub-support
- Docs: https://docs.baluarte.com
