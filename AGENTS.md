# Project Guidance

## User Preferences

- La app debe estar en español
- Identidad de la emisora: Radio Crepuscular 99.5 FM, Barquisimeto, estado Lara, Venezuela, emisora comunitaria

## Accepted Requirements

- App para la estación de radio Radio Crepuscular 99.5 FM

## Verified Commands

- **typecheck**: `pnpm typecheck`
- **fix**: `pnpm fix`
- **build**: `pnpm build`

## Learnings

- Keep an audio element's creation callback dependency-free and sync volume/mute in a separate effect, so slider changes never recreate the element and interrupt playback.
- Guard decorative Tailwind animations with useReducedMotion from motion/react so prefers-reduced-motion is honored.
- The generated Weekday type is a value enum: use Weekday.monday and a value import, never string literals, in Record and array types.
- NewsItem.publishedAt is a nanosecond bigint; sort with bigint comparison and format through the shared helpers in src/frontend/src/types/index.ts.
- OQL auto-derive needs top-level imports of MapEntity, Entity and RecordValue plus one <Type>Value per primitive field (Nat, Text, Int, Principal).
- The initial migration src/backend/migrations/00000000_000000.mo must be extended in place for a new draft; never create a second migration.
- The live stream URL lives in LIVE_STREAM_URL in src/frontend/src/hooks/use-live-stream.ts and is still a placeholder that must be replaced with the station's real HTTPS stream endpoint.
- The weekly schedule has no seeded programs yet, so the Programación page shows its empty state until programs are added.
