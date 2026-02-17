# Contento Platform Ecosystem

## Overview

Contento is a multi-platform publishing ecosystem that enables users to publish content across multiple social media platforms simultaneously.

## Platforms

| Platform | Backend | Frontend | Purpose | Colors |
|----------|---------|----------|---------|--------|
| Manch | 3000 | 3002 | Social media platform | Indigo/Purple |
| Adda | 3100 | 3102 | Social media platform | Teal/Cyan |
| Samooh | 3200 | 3202 | Social media platform | Orange/Amber |
| Prasaran | 3001 | 3003 | Publishing service | Purple/Pink |

## Architecture

### Social Platforms (Manch, Adda, Samooh)

Each social platform provides:
- **User Authentication**: Email/password registration and Google OAuth login
- **OAuth Provider**: Acts as OAuth 2.0 provider for Prasaran integration
- **Posts & Feed**: Users can create and view posts
- **Independent Database**: Each platform has its own SQLite database
- **REST API**: NestJS backend with standardized endpoints

### Prasaran (Publishing Platform)

Prasaran is the central publishing hub that:
- **Connects to Platforms**: Uses OAuth 2.0 to connect to social platforms
- **Multi-Platform Publishing**: Publishes content to all connected platforms simultaneously
- **Connection Management**: Manages platform connections and token lifecycle
- **Publishing History**: Tracks all published content and job status

## Port Allocation

| Service | Port | Type |
|---------|------|------|
| Manch Backend | 3000 | API |
| Prasaran Backend | 3001 | API |
| Manch Frontend | 3002 | Web |
| Prasaran Frontend | 3003 | Web |
| Adda Backend | 3100 | API |
| Adda Frontend | 3102 | Web |
| Samooh Backend | 3200 | API |
| Samooh Frontend | 3202 | Web |

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Google OAuth credentials (for Google login)

### Initial Setup

1. **Install dependencies for all platforms**:

```bash
# Manch
cd Manch/backend && npm install
cd ../frontend && npm install

# Adda
cd ../../Adda/backend && npm install
cd ../frontend && npm install

# Samooh
cd ../../Samooh/backend && npm install
cd ../frontend && npm install

# Prasaran
cd ../../Prasaran/backend && npm install
cd ../frontend && npm install
```

2. **Configure environment variables**:

```bash
# Copy example files
cp Adda/backend/.env.example Adda/backend/.env
cp Adda/frontend/.env.example Adda/frontend/.env
cp Samooh/backend/.env.example Samooh/backend/.env
cp Samooh/frontend/.env.example Samooh/frontend/.env
```

3. **Add Google OAuth credentials** to each platform's `.env` file (Manch, Adda, Samooh, Prasaran).

### Running the Platforms

#### Start All Services

```bash
./start-all.sh
```

This will start all 8 services (4 backends + 4 frontends) in the background.

#### Stop All Services

```bash
./stop-all.sh
```

This will stop all running services and clean up log files.

#### Start Individual Services

To start services individually:

```bash
# Manch
cd Manch/backend && npm run dev
cd Manch/frontend && npm run dev

# Adda
cd Adda/backend && npm run dev
cd Adda/frontend && npm run dev

# Samooh
cd Samooh/backend && npm run dev
cd Samooh/frontend && npm run dev

# Prasaran
cd Prasaran/backend && npm run dev
cd Prasaran/frontend && npm run dev
```

## Usage Flow

### 1. Create Accounts on Social Platforms

Visit each platform and create a user account:
- Manch: http://localhost:3002
- Adda: http://localhost:3102
- Samooh: http://localhost:3202

You can use email/password registration or Google OAuth.

### 2. Login to Prasaran

Visit http://localhost:3003 and create a Prasaran account (or login with Google).

### 3. Connect Platforms

From the Prasaran dashboard:
1. Click "Connect Manch" (or Adda/Samooh)
2. Authorize the connection
3. You'll be redirected back to Prasaran
4. Repeat for other platforms

### 4. Publish Content

1. Compose your content in the text area
2. Select which platforms to publish to (can select multiple)
3. Click "Publish"
4. Content will be distributed to all selected platforms

### 5. View Publishing History

Your publishing history shows:
- Published content
- Target platforms
- Status (pending/processing/completed/failed)
- Timestamps

## OAuth Flow

```
User → Prasaran Dashboard → "Connect Platform"
  ↓
Prasaran redirects to Platform OAuth authorization page
  ↓
User authorizes on Platform
  ↓
Platform redirects to Prasaran callback with code
  ↓
Prasaran exchanges code for access token
  ↓
Prasaran stores token and marks connection as active
```

## Publishing Flow

```
User composes content in Prasaran
  ↓
Prasaran creates publish job
  ↓
For each selected platform:
  - Retrieves access token
  - Makes API call to platform
  - Posts content on behalf of user
  - Records result
  ↓
Shows success/failure status
```

## Platform Generator

To create new platforms, use the generator script:

```bash
node scripts/create-platform.js <PlatformName> <backendPort> <frontendPort> <primaryColor> <secondaryColor>
```

Example:
```bash
node scripts/create-platform.js MyPlatform 3300 3302 blue indigo
```

This will:
- Copy the Manch template
- Replace all references to Manch with MyPlatform
- Update ports and colors
- Generate environment files

After creating a new platform, you'll need to:
1. Install dependencies
2. Create adapters in Prasaran
3. Update CORS configurations
4. Add platform to Prasaran database seeding

## Database Schema

### Social Platforms (Manch/Adda/Samooh)

Tables:
- `users` - User accounts
- `posts` - User posts
- `oauth_clients` - Registered OAuth clients (Prasaran)
- `oauth_authorization_codes` - Authorization codes for OAuth flow
- `oauth_access_tokens` - Issued access tokens
- `user_oauth_providers` - Google OAuth provider data

### Prasaran

Tables:
- `users` - Prasaran user accounts
- `platforms` - Available social platforms (Manch, Adda, Samooh)
- `user_platform_connections` - User's connected platforms and tokens
- `posts` - Content created in Prasaran
- `publish_jobs` - Publishing tasks
- `publish_tasks` - Individual platform publishing tasks
- `user_oauth_providers` - Google OAuth provider data

## API Endpoints

### Social Platforms (Manch/Adda/Samooh)

All platforms expose the same API structure:

**Authentication**:
- `POST /api/auth/register` - Register with email/password
- `POST /api/auth/login` - Login
- `GET /api/auth/google` - Initiate Google OAuth
- `GET /api/auth/google/callback` - Google OAuth callback
- `POST /api/auth/logout` - Logout
- `GET /api/auth/profile` - Get current user

**Posts**:
- `GET /api/posts` - Get all posts (feed)
- `POST /api/posts` - Create post (requires auth)
- `GET /api/posts/:id` - Get specific post

**OAuth Provider**:
- `GET /api/oauth/authorize` - Authorization endpoint
- `POST /api/oauth/token` - Token exchange
- `POST /api/oauth/revoke` - Revoke token

### Prasaran

**Authentication**:
- `POST /api/auth/register` - Register
- `POST /api/auth/login` - Login
- `GET /api/auth/google` - Google OAuth
- `GET /api/auth/google/callback` - Google callback

**Platforms**:
- `GET /api/platforms` - Get connected platforms
- `GET /api/platforms/:platform/connect` - Get OAuth URL
- `GET /api/oauth/callback` - OAuth callback
- `POST /api/platforms/:platform/disconnect` - Disconnect platform

**Publishing**:
- `POST /api/publish` - Publish content
- `GET /api/publish/history` - Get publishing history

## Troubleshooting

### Port Already in Use

If you get "port already in use" errors:
```bash
./stop-all.sh
```

Or manually kill processes:
```bash
lsof -ti:3000 | xargs kill -9  # Replace 3000 with your port
```

### Database Issues

Each platform has its own SQLite database. To reset:
```bash
rm Manch/backend/manch.db
rm Adda/backend/adda.db
rm Samooh/backend/samooh.db
rm Prasaran/backend/prasaran.db
```

Databases will be recreated on next startup.

### CORS Errors

All backends are configured to allow cross-origin requests from all platform URLs. If you get CORS errors, check that:
1. Backend is running
2. Frontend is using the correct API URL
3. CORS configuration in `main.ts` includes all origins

### OAuth Errors

Common OAuth issues:
- **Invalid redirect_uri**: Ensure redirect URI matches exactly in OAuth client configuration
- **Invalid state**: State parameter is single-use; refresh the page and try again
- **Token expired**: Disconnect and reconnect the platform

## Security Notes

**⚠️ This is a POC/Demo Application**

Security considerations for production:
- [ ] Encrypt access tokens at rest
- [ ] Use refresh tokens
- [ ] Implement token rotation
- [ ] Add rate limiting
- [ ] Use environment-specific secrets
- [ ] Enable HTTPS in production
- [ ] Implement proper session management
- [ ] Add CSRF protection
- [ ] Validate and sanitize all inputs
- [ ] Use prepared statements (already done)
- [ ] Add logging and monitoring
- [ ] Implement proper error handling

## Future Enhancements

Potential improvements:
- [ ] Scheduled publishing
- [ ] Draft posts
- [ ] Media attachments (images, videos)
- [ ] Post analytics
- [ ] Bulk operations
- [ ] Platform-specific formatting
- [ ] Content templates
- [ ] User groups/teams
- [ ] Role-based access control
- [ ] API webhooks
- [ ] Mobile apps
- [ ] Content moderation
- [ ] Search and filtering

## Development

### Adding a New Platform

1. Run the generator script
2. Install dependencies
3. Create adapter in `Prasaran/backend/src/platforms/`
4. Register adapter in `platforms.module.ts`
5. Add to `platforms.service.ts` adapter switch
6. Seed platform in Prasaran database
7. Update CORS in all backends
8. Add UI buttons in Prasaran frontend
9. Test OAuth flow and publishing

### Technology Stack

**Backend**:
- NestJS - Node.js framework
- better-sqlite3 - SQLite database
- bcrypt - Password hashing
- jsonwebtoken - JWT tokens
- Passport - Authentication
- axios - HTTP client

**Frontend**:
- Next.js - React framework
- TypeScript - Type safety
- Tailwind CSS - Styling

## Contributing

This is a demo project for learning OAuth 2.0 and multi-platform publishing concepts.

## License

MIT License - feel free to use and modify for learning purposes.
