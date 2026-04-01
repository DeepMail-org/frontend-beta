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
    │ map/           │ - 2D world map + marker sidebar + hop timeline
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

## Map Experience (Backend-Driven)

- 2D world map (React-Leaflet) replaces legacy 3D globe
- Map points come from backend `geo_points` only (no client-side IP geolocation calls)
- Received-hop playback uses backend `hop_timeline`
- Click marker opens sidebar with IP, location, ASN/org, abuse score, proxy/TOR flags
- Marker clustering activates for high-density datasets
- Smooth interactions: wheel zoom, touch pinch zoom, focus fly-to on selection

### Map Folder / Function Guide

| File | Main function/component | Responsibility |
|---|---|---|
| `src/components/map/WorldMap.tsx` | `WorldMap` | SSR-safe dynamic wrapper for map canvas |
| `src/components/map/WorldMapCanvas.tsx` | `WorldMapCanvas` | Leaflet canvas, marker render, hop path polylines, zoom controls |
| `src/components/map/IpMarker.tsx` | `IpMarker` | Risk-colored marker node with tooltip |
| `src/components/map/IpSidebar.tsx` | `IpSidebar` | Selected-node detail pane + report navigation |
| `src/components/map/HopTimeline.tsx` | `HopTimeline` | Received-chain slider/playback UI |
| `src/app/analysis/[emailId]/map/page.tsx` | `MapPage` | Fetches report and composes map + sidebar + timeline |

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

# Run E2E tests
bun run test:e2e

# Run backend contract schema tests
bun run test:contract
```

## Contract Safety

- `src/lib/contracts/results.ts` contains runtime payload validation for `/results/:email_id`
- Map page parses report payload through contract schema before rendering
- Contract tests live in `tests/contract/results.contract.test.ts`

## Environment Variables

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_API_URL` | Backend API URL (default: http://localhost:8000) |
