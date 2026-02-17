# Contento - Multi-Platform Publishing Ecosystem

A complete multi-platform social media publishing system built with NestJS and Next.js.

## Platforms

- **Manch** (ports 3000/3002) - Social media platform with indigo/purple theme
- **Adda** (ports 3100/3102) - Social media platform with teal/cyan theme
- **Samooh** (ports 3200/3202) - Social media platform with orange/amber theme
- **Prasaran** (ports 3001/3003) - Publishing hub that connects to all platforms

## Quick Start

```bash
# Start all services
./start-all.sh

# Stop all services
./stop-all.sh
```

## Access Points

- Manch: http://localhost:3002
- Adda: http://localhost:3102
- Samooh: http://localhost:3202
- Prasaran: http://localhost:3003

## Documentation

See [PLATFORMS.md](PLATFORMS.md) for complete documentation including:
- Architecture overview
- Setup instructions
- OAuth flow
- Publishing workflow
- API reference
- Troubleshooting

## Architecture

See [docs/architecture.md](docs/architecture.md) for detailed architecture information.

## Tech Stack

- **Backend**: NestJS, SQLite, Passport.js, OAuth 2.0
- **Frontend**: Next.js, TypeScript, Tailwind CSS
- **Auth**: Email/password + Google OAuth

## Features

- User authentication (email/password + Google OAuth)
- OAuth 2.0 provider capabilities
- Multi-platform content publishing
- Publishing history with platform-specific status
- Real-time feed updates
- Cross-platform connections
