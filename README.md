# DeepMail Frontend

## Purpose

Next.js 16 frontend for the DeepMail email threat intelligence platform. Provides
a web interface for uploading email files, viewing analysis results, and managing
authentication tokens.

## Architecture

```
┌─────────────────────────┐
│   Next.js 16 App Router  │
│   (Server + Client)      │
└────────────┬────────────┘
             │
    ┌────────┴────────┐
    │  Components    │
    ├────────────────┤
    │ layout/        │ - TopBar, navigation
    │ ui/            │ - Reusable UI components
    │ analysis/      │ - Analysis display components
    │ dashboard/     │ - Dashboard widgets
    │ upload/        │ - File upload components
    └────────┬────────┘
             │
    ┌────────┴────────┐
    │  lib/           │
    │  api.ts         │ - API client, error handling
    │  types.ts       │ - TypeScript definitions
    │  format.ts      │ - Formatting utilities
    └─────────────────┘
```

## Pages

| Path | Description |
|------|-------------|
| `/` | Dashboard with threat overview |
| `/upload` | Email file upload interface |
| `/analysis` | List of analyzed emails |
| `/analysis/[emailId]` | Detailed analysis of a specific email |
| `/analysis/[emailId]/map` | Geolocation map visualization |
| `/analysis/[emailId]/terminal` | Terminal-style IOC display |
| `/reports` | Threat reports |
| `/sandbox` | Sandbox execution results |
| `/settings` | Token management and settings |

## Authentication

The frontend supports JWT token-based authentication:

- **Token Entry**: Users enter JWT token in Settings page (`/settings`)
- **Token Storage**: Tokens stored in localStorage via `setToken()` / `getToken()`
- **Token Status**: TopBar shows connection status (connected/disconnected)
- **Error Handling**: 401 responses trigger redirect to settings

### API Client (`lib/api.ts`)

- `ApiError` class: Custom error with status code, message, and details
- `getToken()`: Retrieve token from localStorage
- `setToken(token)`: Store token in localStorage  
- `clearToken()`: Remove token from localStorage
- All API calls include token in `Authorization: Bearer <token>` header

## Color System (Dracula Theme)

The UI uses a Dracula-inspired color palette for threat levels:

| Level | Color | Hex | Usage |
|-------|-------|-----|-------|
| Critical | Red | `#ff5555` | High-severity threats, errors |
| Suspicious | Orange | `#ffb86c` | Medium-severity, warnings |
| Safe | Green | `#50fa7b` | Low/clean results |
| Neutral | Gray | `#6272a4` | Unknown, informational |

## Tech Stack

- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript
- **Styling**: CSS Modules + global CSS (Dracula theme)
- **Package Manager**: Bun

## Development

```bash
# Install dependencies
bun install

# Run development server
bun run dev

# Run lint
bun run lint

# Build for production
bun run build
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_API_URL` | Backend API URL (default: http://localhost:8000) |
