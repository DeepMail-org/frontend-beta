# E2E Test Suite

Playwright end-to-end tests for user-critical frontend flows.

## Current Coverage

- `map.spec.ts`
  - marker click opens enriched sidebar
  - clustered-map datasets render safely (>100 nodes)
  - retry flow recovers from API error state

## Run

```bash
bun run test:e2e
```

## Notes

- Tests stub `/api/v1/results/:email_id` using Playwright route handlers.
- Config is in `playwright.config.ts` with desktop and mobile projects.
