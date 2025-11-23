# URL Shortener (Node.js)

Simple URL Shortener API built with Express and PostgreSQL.

## Features
- Create short URLs (optional custom slug, password protection, expiry)
- Redirect short URLs to original URLs with click tracking
- Retrieve link stats (clicks, created at)
- Delete links
- Health check endpoint

## Quick start

Prerequisites:
- Node.js 16+
- PostgreSQL

1. Install dependencies

npm install

2. create in server/.env

3. Create the links table (example SQL)

    CREATE TABLE links (
    id SERIAL PRIMARY KEY,
    slug TEXT UNIQUE NOT NULL,
    url TEXT NOT NULL,
    clicks INTEGER DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMP,
    password_hash TEXT
    );

4. Start the server

    npm start


The server listens on the port from PORT env or 3000.

Endpoints
POST /api/shorten

Body: { "url": "<original_url>", "customSlug"?: "...", "password"?: "...", "expiresAt"?: "ISO date" }
Response: { "shortUrl": "http://.../slug" }

Implementation: linkController.createShortLink → linkService.createLink
GET /:slug

Redirects to the original URL and increments click count
Controller: linkController.redirectLink → linkService.trackClick, linkService.getLinkUrl
GET /api/stats/:slug

Returns { slug, url, clicks, created_at }
Controller: linkController.getLinkStats → linkService.getLinkStats
DELETE /api/links/:slug

Deletes the link
Controller: linkController.deleteLink → linkService.deleteLink
GET /healthz

Basic health and DB connectivity check (uses server/config/db.js)

Config & Files
Server entry: server/server.js
Routes: server/routes/linkRoutes.js
Controllers: server/controllers/linkController.js
Services / DB access: server/services/linkService.js
DB pool & test: server/config/db.js (exports pool and testDbConnection)
Env: server/.env
Scripts & deps: server/package.json
Notes
Uses nanoid for slug generation; bcrypt for optional password protection.
Ensure PostgreSQL credentials in server/.env are correct.
Errors are returned with HTTP status codes and a JSON error message where applicable.