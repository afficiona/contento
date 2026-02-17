# Prasaran -- Scalable Web App Architecture

## Overview

Prasaran is a web application that allows users to connect multiple
social media platforms and publish content to all of them at once.\
Initially, it will support a single platform called **Manch**, with
future scalability for additional platforms.

This document outlines a scalable, production-ready architecture for
Prasaran (excluding Manch implementation).

------------------------------------------------------------------------

# 1. Architecture Style

## Modular Monolith (Initial Phase)

Start with a single backend repository but enforce strict module
boundaries:

-   Auth Module
-   Users Module
-   Platforms Module
-   Publishing Module
-   UI Module

This allows: - Faster iteration early on - Easy extraction into
microservices later

## Event-Driven Publishing

Publishing must be asynchronous: - User request → Create job → Queue
tasks → Worker processes tasks - Prevents UI blocking - Enables
retries - Scales across multiple platforms

------------------------------------------------------------------------

# 2. High-Level Components

## 2.1 Frontend (Web App)

### Responsibilities

-   Login / Signup (Email + Password)
-   Dashboard (Connected platforms)
-   OAuth connection flow for Manch
-   Content composer UI
-   Publish status display

### Recommended Stack

-   **Next.js (React + TypeScript)**
-   **Tailwind CSS**
-   **shadcn/ui** (clean, professional design system)
-   react-hook-form + zod (form validation)
-   REST API (OpenAPI) or tRPC

------------------------------------------------------------------------

## 2.2 Backend API Service

### Responsibilities

-   Authentication endpoints
-   OAuth initiation + callback handling
-   Publish endpoint
-   Connection status endpoints
-   Publish history endpoints

### Recommended Frameworks

-   NestJS (Node.js)
-   FastAPI (Python)
-   Spring Boot (Java)

Include: - OpenAPI/Swagger documentation - Request validation - Rate
limiting

------------------------------------------------------------------------

# 3. Authentication Service

## Email/Password Authentication

-   Password hashing: **Argon2id** (preferred) or bcrypt
-   Session management:
    -   JWT + Refresh tokens (recommended)
    -   OR Server sessions using Redis

## Security Measures

-   CSRF protection (if using cookies)
-   Rate limiting on login endpoints
-   Secure HTTP headers (CSP, HSTS, etc.)

------------------------------------------------------------------------

# 4. Platform Connections Service

This is the core scalability component.

## Responsibilities

-   Start OAuth flow
-   Handle OAuth callback
-   Store encrypted tokens
-   Refresh tokens
-   Disconnect platform

## Adapter Pattern

Define a common interface:

PlatformAdapter: - getAuthUrl(userId) - handleCallback(code, state) -
publishContent(userId, content) - refreshTokenIfNeeded(userId) -
disconnect(userId)

Implement: - ManchAdapter (initial) - Future adapters for other
platforms

This prevents platform-specific logic from polluting core services.

------------------------------------------------------------------------

# 5. Publishing Service (Asynchronous)

## Responsibilities

-   Create publish job
-   Create per-platform publish tasks
-   Enqueue tasks
-   Retry failures
-   Track status

## Recommended Queue Systems

-   AWS SQS

Workers process tasks independently of API servers.

------------------------------------------------------------------------

# 6. Data Layer

## Primary Database

**PostgreSQL**

### Core Tables

Users - id - email - password_hash - created_at

Platforms - id - name

UserPlatformConnections - user_id - platform_id -
access_token_encrypted - refresh_token_encrypted - expires_at - scopes -
status

Posts - id - user_id - content - created_at

PublishJobs - id - post_id - status - created_at

PublishTasks - id - job_id - platform_id - status - attempt_count -
last_error - external_post_id

------------------------------------------------------------------------

## Token Encryption

Store OAuth tokens encrypted at rest using: - AWS KMS

Use envelope encryption and store only encrypted blobs in the database.

------------------------------------------------------------------------

# 7. Caching Layer(ignore this for now)

Use **Redis** for: - Session storage - Queue backend - Rate limiting
counters - Short-lived cache for platform connection status

------------------------------------------------------------------------

# 8. Network Security

## Edge Protection(ignore for now)

-   Cloudflare (DNS + CDN + WAF)

## Backend Protections(ignore for now)

-   TLS everywhere
-   OAuth state parameter + PKCE
-   Input validation
-   Rate limiting per user/IP

## Secrets Management

-   AWS Secrets Manager

------------------------------------------------------------------------

# 9. Observability(ignore for now)

## Logging

-   Structured JSON logs
-   Centralized log aggregation (ELK, Datadog, CloudWatch)

## Metrics

-   Request latency
-   Queue depth
-   Publish success rate

## Error Monitoring

-   Sentry

## Distributed Tracing

-   OpenTelemetry

------------------------------------------------------------------------

# 10. Deployment & Scalability

## Containerization

-   Docker for API + Worker

## Hosting Options

-   AWS ECS/Fargate

## Scaling Strategy(ignore for now)

-   API scales on HTTP traffic
-   Workers scale on queue depth
-   Database vertical scaling first
-   Add read replicas later if needed

------------------------------------------------------------------------

# 11. Main Application Flows

## Login Flow

1.  User submits login/signup
2.  API validates credentials
3.  Session/JWT issued
4.  Redirect to dashboard

## Connect Manch (OAuth)

1.  User clicks Connect
2.  API generates OAuth URL with state + PKCE
3.  User authenticates on Manch
4.  Callback handled
5.  Tokens encrypted and stored

## Publish Flow

1.  User submits content
2.  API creates post + publish job + tasks
3.  Tasks enqueued
4.  Worker publishes to each platform
5.  Status updated in database
6.  UI reflects publish status

------------------------------------------------------------------------

# 12. Recommended v1 Stack Summary

Frontend: - Next.js + TypeScript - Tailwind + shadcn/ui

Backend: - NestJS - PostgreSQL - Redis + BullMQ

Infra: - Cloudflare - Managed Postgres - Managed Redis - KMS + Secret
Manager - Sentry + OpenTelemetry

------------------------------------------------------------------------

# Conclusion

This architecture ensures:

-   Clean separation of concerns
-   Secure OAuth handling
-   Asynchronous scalable publishing
-   Easy addition of new social platforms
-   Production-grade observability and security

Prasaran can start as a modular monolith and evolve into distributed
services as platform count and traffic grow.
