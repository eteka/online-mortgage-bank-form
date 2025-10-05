# Online Mortgage Bank Form

A secure web application for the Federal Mortgage Bank of Nigeria that allows staff members to update and register for NHF contribution alerts. The project includes a hardened Node.js/Express API, a modern React front end, and a MySQL schema for persisting submissions.

## Features

- **Security-first backend** using Express, Helmet, CSRF protection, strict rate limiting, sanitisation, and schema validation with Zod.
- **Responsive React interface** that mirrors the provided mortgage form while guiding the user with contextual helper text and validation feedback.
- **MySQL persistence** with a pre-built schema and prepared statements to protect sensitive information at rest.
- **Comprehensive validation** on both client and server to prevent malformed or malicious payloads.

## Project structure

```
.
├── client/   # React single page application (Vite)
├── server/   # Express API server
├── db/       # Database schema
└── README.md
```

## Prerequisites

- Node.js 18+
- npm 9+
- MySQL 8+

## Environment configuration

Copy the `.env.example` file to `.env` in the project root and provide real credentials:

```bash
cp .env.example .env
```

| Variable | Description |
| --- | --- |
| `PORT` | Port for the Express API (defaults to `4000`). |
| `NODE_ENV` | `development`, `production`, or `test` to control secure cookie settings. |
| `CLIENT_ORIGIN` | URL allowed to communicate with the API (e.g. `http://localhost:5173`). |
| `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` | MySQL connection details. |
| `DB_CONNECTION_LIMIT` | Optional pool limit (default `10`). |
| `DB_SSL` | Set to `true` when connecting with TLS (certificate validation is disabled for managed services). |

> **Security note:** Store the `.env` file outside of version control and rotate database credentials regularly. Use TLS (`DB_SSL=true`) whenever the database runs outside the local network.

## Database setup

Create the application database and table by running the schema file:

```bash
mysql -u <user> -p -h <host> -P <port> <db_name> < db/schema.sql
```

The schema creates a `registrations` table with auditing timestamps and indices optimised for frequent lookups by NHF number.

## Installing dependencies

Install dependencies for both the client and server:

```bash
cd server && npm install
cd ../client && npm install
```

## Running the development stack

In separate terminals:

```bash
# Terminal 1 - API
cd server
npm run dev

# Terminal 2 - Frontend
cd client
npm run dev
```

The frontend is available at `http://localhost:5173` and proxies `/api` requests to the Express server on port `4000` by default.

## Production build

Build the client for production:

```bash
cd client
npm run build
```

Use a reverse proxy such as Nginx to terminate TLS and forward `/api` to the Node.js process. Ensure environment variables are set before starting the server with `npm start` inside the `server` directory.

## Testing and linting

- `npm run lint` in `server/` runs ESLint against the backend code.
- `npm run lint` in `client/` runs ESLint for the React application.

## Security hardening highlights

- CSRF tokens with httpOnly, same-site cookies and double submit validation.
- Strict HTTP security headers via Helmet.
- Rate limiting and parameter pollution protection.
- Server-side and client-side validation with Zod to eliminate injection vectors.
- XSS sanitisation before data persistence.
- Prepared statements (parameterised queries) for all database interactions.

## Accessibility

The React form uses semantic labels, helper text, focus styles, and ARIA alerts for validation messages to ensure an inclusive experience for all users.
