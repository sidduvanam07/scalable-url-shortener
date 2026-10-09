
# Scalable URL Shortener with Rate Limiting & Analytics

A REST API built with Node.js, Express, MongoDB, and Redis. It generates short URLs, redirects users, caches URL lookups, applies IP-based sliding-window rate limiting, and records click analytics.

## Features

- Generate unique short codes for URLs
- Store URL metadata in MongoDB
- Redirect short URLs using HTTP 302
- Cache URL lookups in Redis with a TTL
- Apply Redis-based sliding-window rate limiting
- Track click counts, timestamps, referrers, and user agents
- Retrieve analytics through a REST API
- Health-check endpoint for MongoDB and Redis
- Reconcile stored click counts from click-event records

## Tech Stack

- Node.js
- Express
- MongoDB
- Redis-compatible server (Redis or Memurai)
- REST APIs

## Prerequisites

- Node.js and npm
- MongoDB
- Redis or a compatible server such as Memurai

## Setup

1. Clone the repository.
2. Install dependencies:

   ```bash
   npm install
   ```

3. Create `.env` from `.env.example` and update values if necessary.
4. Ensure MongoDB and Redis are running.
5. Start the development server:

   ```bash
   npm run dev
   ```

The API runs at `http://localhost:3000` by default.

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/` | API status |
| GET | `/health` | MongoDB and Redis health |
| POST | `/api/urls` | Create a short URL |
| GET | `/:code` | Redirect to the original URL |
| GET | `/api/urls/:code/analytics` | Retrieve URL analytics |

## Create a Short URL

PowerShell example:

```powershell
Invoke-RestMethod -Method Post `
  -Uri "http://localhost:3000/api/urls" `
  -ContentType "application/json" `
  -Body '{"url":"https://example.com/articles/nodejs"}'
```

## Retrieve Analytics

```powershell
curl.exe http://localhost:3000/api/urls/YOUR_CODE/analytics
```

Analytics include the event-based click count, recent click events, and referrer statistics.

## Health Check

```powershell
curl.exe -i http://localhost:3000/health
```

The endpoint returns HTTP 200 when MongoDB and Redis are healthy, or HTTP 503 if a dependency is unavailable.

## Rate Limiting

The API uses a Redis-backed sliding window with a limit of 100 requests per IP address in 60 seconds. Exceeding the limit returns HTTP 429.

The current middleware fails open if Redis is unavailable, so rate limiting is not enforced during a Redis outage.

## Reconcile Click Counts

```bash
node src/scripts/reconcile-clicks.js YOUR_CODE
```

This maintenance script recalculates a URL's stored click counter from its click-event records.

## Environment Variables

See `.env.example` for the required configuration.

Never commit `.env` or production credentials.

## Future Improvements

- Automated unit and integration tests
- API key-based rate limits
- URL expiration and deactivation endpoints
- More robust analytics consistency and failure recovery
- Production deployment and monitoring
