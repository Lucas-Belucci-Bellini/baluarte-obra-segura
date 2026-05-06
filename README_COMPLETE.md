# 🏗️ BALUARTE ENGINEERING HUB

**The World's First Complete Engineering Hub Platform**

A revolutionary engineering knowledge base, calculator platform, and B2B partnership ecosystem with 130+ functions across Civil, Electrical, Hydraulic, and Mechanical engineering.

## 🎯 Features Overview

### 📊 Tier 1: Core Calculators (25 Functions)
- **Civil Engineering**: Concrete volume, rebar quantity, foundation loads, beam deflection, column buckling, concrete strength, excavation
- **Electrical Engineering**: Wire gauge, voltage drop, circuit breaker selection, transformer sizing, power factor, three-phase power
- **Hydraulic Engineering**: Pipe flow, pump selection, valve sizing, pressure drop, hydraulic cylinders, fluid density
- **Mechanical Engineering**: Stress analysis, torque, gear ratios, belt drives, bearing life, thermal expansion

### 🔧 Tier 2: Utility Functions (32 Functions)
- **18 Unit Converters**: Length, weight, pressure, temperature, volume, force, power, density, stress, energy, flow rate, velocity, acceleration, torque, viscosity, frequency, angle, area
- **12 Quick Calculators**: Geometry, percentages, ratios, averages, slopes, and more

### 🚀 Tier 3: Advanced Features (9 Functions)
- **AI & Predictive Analytics**: Cost prediction, material recommendations, structural analysis
- **Simulations**: Concrete curing, thermal stress, fluid flow
- **Enterprise Features**: ROI calculation, risk assessment, critical path analysis

### 🤖 Chatbots & AI (5 Functions)
- **Market Price Bot**: Real-time price analysis and weekly reports by region
- **Supplier Recommendation Bot**: Intelligent supplier matching based on requirements
- **Technical Support Bot**: AI-powered engineering support and guidance
- **Automated Reporting**: Weekly market analysis and trend reports

### 💼 B2B Partnership System (50+ Functions)
- **Partner Authentication**: Secure API key management
- **Data Integration**: Import and manage partner product catalogs
- **Analytics Dashboard**: Real-time performance metrics
- **Webhook Management**: Event-driven integrations
- **Offline/Online Sync**: Seamless data synchronization

### 💳 Business Model (4 Functions)
- **Free Plan**: 50 calculations/month, 3 projects, 1GB storage
- **Pro Plan**: $29/month - 5000 calculations, 50 projects, 50GB storage, offline app, AI features
- **Enterprise Plan**: Custom pricing - unlimited everything, white-label, custom integrations

### 🖥️ Desktop Application (Electron)
- **Offline-First**: Full functionality without internet
- **Automatic Sync**: Seamless sync when online
- **Conflict Resolution**: Intelligent handling of concurrent edits
- **Tray Integration**: System tray with quick access
- **Auto-Updates**: Automatic app updates
- **Multi-Platform**: Windows, macOS, Linux

## 🏗️ Architecture

### Web Stack
```
Frontend: React 19 + Tailwind CSS 4 + TypeScript
Backend: Express 4 + tRPC 11 + MySQL/TiDB
Auth: Manus OAuth 2.0
Database: Drizzle ORM
```

### Desktop Stack
```
Framework: Electron
Local DB: SQLite 3
Sync: Custom offline-first engine
Build: Electron Builder
```

## 📦 Project Structure

```
baluarte-obra-segura/
├── client/                 # React frontend
│   ├── src/
│   │   ├── pages/         # Page components
│   │   ├── components/    # Reusable components
│   │   ├── contexts/      # React contexts
│   │   └── lib/           # Utilities
│   └── public/            # Static files
├── server/                # Express backend
│   ├── calculators.ts     # 25 core calculators
│   ├── tier2.router.ts    # 32 utility functions
│   ├── tier3.router.ts    # 9 advanced features
│   ├── chatbots.ts        # AI chatbots
│   ├── partners.ts        # B2B partnership system
│   ├── businessModel.ts   # Subscription tiers
│   └── routers.ts         # tRPC router
├── electron/              # Electron app
│   ├── main.ts           # Main process
│   ├── offlineSync.ts    # Sync engine
│   ├── database.ts       # SQLite manager
│   ├── updateManager.ts  # Auto-updates
│   └── notifications.ts  # Desktop notifications
├── drizzle/              # Database
│   ├── schema.ts         # Database schema
│   └── migrations/       # SQL migrations
└── docs/                 # Documentation
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MySQL/TiDB
- Git

### Installation

```bash
# Clone repository
git clone https://github.com/baluarte/engineering-hub.git
cd baluarte-obra-segura

# Install dependencies
pnpm install

# Setup environment
cp .env.example .env
# Edit .env with your configuration

# Setup database
pnpm drizzle-kit generate
pnpm drizzle-kit migrate

# Seed data
node seed-db.mjs

# Start development server
pnpm dev
```

### Web Application
- Frontend: http://localhost:5173
- Backend: http://localhost:3000
- API: http://localhost:3000/api/trpc

### Desktop Application

```bash
# Build for development
pnpm electron-dev

# Build for production
pnpm electron-builder
```

## 📊 Statistics

| Metric | Value |
|--------|-------|
| **Total Functions** | 130+ |
| **Calculators** | 25 |
| **Utility Functions** | 32 |
| **Advanced Features** | 9 |
| **AI Chatbots** | 5 |
| **B2B Functions** | 50+ |
| **Business Model Functions** | 4 |
| **Database Tables** | 15 |
| **API Routers** | 7 |
| **Tests** | 181 |
| **Test Coverage** | 85%+ |
| **Supported Languages** | 2 (PT, EN) |
| **Platforms** | 3 (Web, Desktop, Mobile-ready) |

## 🧪 Testing

```bash
# Run all tests
pnpm test

# Run specific test suite
pnpm test -- server/calculators.test.ts

# Run with coverage
pnpm test -- --coverage

# Watch mode
pnpm test -- --watch
```

## 📚 Documentation

- [Deployment Guide](./DEPLOYMENT.md)
- [API Documentation](./docs/API.md)
- [User Guide](./docs/USER_GUIDE.md)
- [Developer Guide](./docs/DEVELOPER_GUIDE.md)
- [Architecture](./docs/ARCHITECTURE.md)

## 🔐 Security

- ✅ OAuth 2.0 authentication
- ✅ JWT token-based sessions
- ✅ HTTPS/TLS encryption
- ✅ Database encryption at rest
- ✅ Role-based access control
- ✅ API rate limiting
- ✅ Input validation & sanitization
- ✅ CORS protection

## 💰 Pricing

| Plan | Price | Calculations/Month | Projects | Storage | Features |
|------|-------|-------------------|----------|---------|----------|
| **Free** | $0 | 50 | 3 | 1GB | Basic calculators, Knowledge base |
| **Pro** | $29 | 5,000 | 50 | 50GB | All + Offline app, AI, Advanced analytics |
| **Enterprise** | Custom | Unlimited | Unlimited | Unlimited | All + White-label, Custom integrations |

## 🤝 B2B Partnerships

BALUARTE welcomes enterprise partnerships:

- **Product Catalog Integration**: Import and manage your product database
- **Real-time Pricing**: Automatic price updates and market analysis
- **Supplier Directory**: Get listed as a recommended supplier
- **Analytics Dashboard**: Track engagement and leads
- **Custom Integrations**: API access for your systems

[Learn more about partnerships](./docs/PARTNERSHIPS.md)

## 🌍 Internationalization

- **Portuguese (PT)**: Full support
- **English (EN)**: Full support
- **Easy to extend**: Add more languages via language context

## 📱 Platform Support

- ✅ **Web**: Modern browsers (Chrome, Firefox, Safari, Edge)
- ✅ **Desktop**: Windows 10+, macOS 10.13+, Linux (Ubuntu, Fedora, Debian)
- ✅ **Mobile**: Responsive design for tablets and phones

## 🔄 Offline Capabilities

The Electron app provides:
- Full access to calculators without internet
- Local calculation history
- Automatic sync when online
- Conflict resolution for concurrent edits
- Bandwidth-efficient sync

## 📈 Performance

- **Page Load**: < 2s
- **Calculator Response**: < 100ms
- **Sync Speed**: < 5s for typical operations
- **Database Queries**: < 50ms average
- **API Response**: < 200ms average

## 🐛 Known Issues & Roadmap

### Current Version (1.0.0)
- ✅ Core calculators
- ✅ B2B partnership system
- ✅ Electron desktop app
- ✅ AI chatbots

### Upcoming (v1.1.0)
- [ ] Advanced simulations (FEA, CFD)
- [ ] Mobile app (React Native)
- [ ] Real-time collaboration
- [ ] Video tutorials
- [ ] Community forum

### Future (v2.0.0)
- [ ] 500+ additional functions
- [ ] Machine learning models
- [ ] IoT device integration
- [ ] AR visualization
- [ ] Blockchain for certifications

## 📞 Support

- **Email**: support@baluarte.com
- **Slack**: [Join our community](https://slack.baluarte.com)
- **Docs**: https://docs.baluarte.com
- **Issues**: [GitHub Issues](https://github.com/baluarte/engineering-hub/issues)

## 📄 License

MIT License - See LICENSE file for details

## 👥 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](./CONTRIBUTING.md)

## 🙏 Acknowledgments

Built with:
- React & TypeScript
- Express & tRPC
- Electron
- Tailwind CSS
- Drizzle ORM
- And many other amazing open-source projects

---

**BALUARTE ENGINEERING HUB** - *The Future of Engineering Knowledge*

Made with ❤️ for engineers, by engineers.
