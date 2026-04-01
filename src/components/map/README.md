# Map Components

This folder contains all map-focused UI components used by
`/analysis/[emailId]/map`.

## Component and Function Index

| File | Main export | What it does |
|---|---|---|
| `WorldMap.tsx` | `WorldMap` | Dynamic import boundary to prevent SSR issues with Leaflet |
| `WorldMapCanvas.tsx` | `WorldMapCanvas` | Renders dark world map, clustered markers, hop polylines, and zoom controls |
| `IpMarker.tsx` | `IpMarker` | Marker node with risk color, tooltip, and click selection handler |
| `IpSidebar.tsx` | `IpSidebar` | Displays selected IP details and report navigation CTA |
| `HopTimeline.tsx` | `HopTimeline` | Interactive slider/list for `Received` hop playback |

## Data Contract

All components consume backend fields from `EmailAnalysisReport`:

- `geo_points`: marker coordinates and enrichment fields
- `hop_timeline`: ordered mail relay path

No client-side IP geolocation lookups are performed in this folder.
