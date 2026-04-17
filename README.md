# Portier Sync Panel

A frontend take-home project for Portier: a Web App Integration Sync Panel that demonstrates integration management, sync preview, conflict resolution, and version history tracking.

## What it does

- **Integrations List**: View all connected services with status badges (synced, syncing, conflict, error), search, and status filters.
- **Integration Detail**: Inspect an integration, trigger a sync, preview incoming changes, resolve field-level conflicts, and browse expandable sync history.
- **Sync History & Versioning**: Track every sync event with timestamps, version numbers, and outcomes. Click any row to inspect what changed.
- **Error Handling**: Handles 4xx, 500, and 502 errors from the sync API with user-friendly messages.

## Tech Stack

- Next.js 16 (App Router)
- React 19 + TypeScript
- Tailwind CSS
- Lucide React (icons)
- Static export + Docker

## Design decisions & assumptions

1. **No backend required**  
   All data except the live sync API is mocked and persisted to `localStorage` so state survives reloads. This keeps the demo self-contained and runnable anywhere.

2. **Static export**  
   The app is configured with `output: "export"` so it can be served as static files. This makes Docker packaging trivial (a single static file server) and avoids runtime Node.js complexity.

3. **Hydration-safe client components**  
   Because the app is statically exported and then hydrated in the browser, components that depend on `localStorage` or `Date` use a `mounted` guard with a brief skeleton fallback to avoid React hydration mismatches.

4. **Conflict simulation**  
   The external sync API may return an empty change list. To still demonstrate the conflict resolution UI, the app injects a small set of simulated conflicting changes **only** when the API returns zero changes.

5. **Architecture**  
   - `lib/api.ts` — pure API interaction (fetch + error mapping).  
   - `lib/sync.ts` — sync business logic (`classifyChanges`) and the `useSyncFlow` custom hook that implements the full sync state machine.  
   - `lib/data.ts` — mock data and `localStorage` persistence.  
   - `components/` — focused, reusable UI pieces.

6. **Icons**  
   Integration icons are mapped to Lucide React icons by name (`Cloud`, `Target`, `CreditCard`, `MessageSquare`) instead of generic 2-letter abbreviations.

7. **Entity model**  
   The provided User / Door / Key schemas are used implicitly: conflict examples use `user.email` and `user.phone` fields. A full entity grid was omitted to keep the scope focused on the sync-and-conflict workflow.

## How to run

### Option 1: Docker (recommended)

```bash
cd portier-sync-panel
docker build -t portier-sync-panel .
docker run -p 3000:3000 portier-sync-panel
```

Then open http://localhost:3000.

### Option 2: Local development

```bash
cd portier-sync-panel
npm install
npm run dev
```

Then open http://localhost:3000.

### Option 3: Static export

```bash
cd portier-sync-panel
npm install
npm run build
npx serve dist -l 3000
```

## Testing

```bash
npm run test:unit   # Vitest (pure logic tests)
npm run test:e2e    # Playwright (critical flows)
npm test            # Run everything
```

Test coverage includes:
- `getErrorMessage`, `classifyChanges`, `formatDate`, `timeAgo`
- End-to-end: home navigation, search/filter, sync preview, apply clean changes, conflict resolution, error states (4xx/500/502), back navigation, and history inspection.

## API usage

The **Sync Now** button calls:

```
GET https://portier-takehometest.onrender.com/api/v1/data/sync
```

The response is used to populate the sync preview and conflict resolution UI.
