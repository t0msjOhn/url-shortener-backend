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
```sh
npm install

create in server/.env

Create the links table (example SQL)

