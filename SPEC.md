# Timezone‑Aware Meeting Planner — Product & Technical Specification

## Overview
Plan 1:1 meetings across time zones for a single Google Workspace organization, suggesting and ranking the best times, then directly booking Google Calendar events with Google Meet links.

- Tenant: Single org (`spoonity.com`)
- Users: All users in `spoonity.com`
- Meeting type: 1:1 (organizer + 1 participant)
- Tech stack: Next.js (App Router, RSC), Tailwind + shadcn/ui, NextAuth.js, Vercel Postgres (Prisma), SendGrid

## In scope
- Google OAuth sign-in (domain restricted), per-user OAuth for Calendar
- On‑demand Google Admin Directory search (bootstrap with super‑admin)
- Timezone normalization and DST handling
- Ranked suggestions with tunable scoring
- Direct booking with Google Meet link
- Weekly recurrence (recompute best slot per week), create all occurrences upfront
- Emails for participant authorization invites (SendGrid)

## Out of scope
- External guests (internal users only)
- Slack integration
- In‑app meeting management (use Google Calendar to modify/cancel)
- Complex recurrence (only weekly pattern)

---

## Auth & Identity
- Sign‑in: Google OAuth via NextAuth.js (App Router), restricted to `spoonity.com`
- Consent: Upfront with offline access (refresh tokens stored via Prisma)
- Scopes (requested upfront):
  - Identity: `openid`, `email`, `profile`
  - Calendar: `https://www.googleapis.com/auth/calendar.events`, `https://www.googleapis.com/auth/calendar.readonly`, `https://www.googleapis.com/auth/calendar.settings.readonly` (settings read may not be used)
  - Directory (bootstrap only): `https://www.googleapis.com/auth/admin.directory.user.readonly`
- Tokens: Per‑user Google tokens stored securely in Vercel Postgres (Prisma adapter)

## Participants & Directory
- Source: Google Workspace Directory (internal only)
- Search: On‑demand Admin Directory API (no cache)
- Bootstrap: One‑time super‑admin flow to authorize Directory scope and store refresh token; if revoked, fall back to manual entry until re‑bootstrapped

## Timezones & DST
- Timezone source:
  - Authorized users: Google Calendar settings
  - Not yet authorized: infer from Directory; else org default `America/Toronto`
- DST: Treat times normally (no avoidance of ambiguous/invalid local times)

## Working Hours
- Effective model: Use organizer’s per‑meeting fallback hours only for everyone without reliable hours: 08:00–17:00, Monday–Friday, participant‑local timezone
- Note: Google "Working hours" may be unavailable via API; we rely on organizer fallback

## Availability & Privacy
- Access: Require participant authorization for FreeBusy; allow provisional suggestions beforehand
- Calendars considered: Primary calendar only
- Visibility: Show only “busy” (no event details)

## Suggestion Window & Constraints
- Default search window: Next 7 days; weekends excluded
- Minimum notice: 2 hours from now
- Slot duration: Default 30 minutes (organizer override per meeting)
- Slot step: Default 30 minutes (organizer override per meeting)
- Public holidays: Skip per participant locale; for non‑authorized participants, use organizer’s holiday calendar as fallback
- Auto‑expansion on no results: Extend by +7 days steps up to 28 days total; weekends remain excluded

## Ranking Model (Tunable, static config)
- Philosophy: All‑free, in‑hours slots bubble to the top. Unknown availability allowed but penalized. Mild bias toward earlier dates.
- Defaults:
```json
{
  "scoring": {
    "hardFilters": {
      "excludeWeekends": true,
      "minNoticeHours": 2,
      "skipPublicHolidays": true
    },
    "weights": {
      "busyOverlapPenaltyPerMinute": -5,
      "unknownAvailabilityPenaltyPerParticipant": -20,
      "outsideWorkingHoursPenaltyPerMinute": -0.5,
      "distanceFromHoursMidpointPenaltyPerHour": -5,
      "earlierIsBetterPenaltyPerDay": -2
    },
    "aggregation": {
      "maxScore": 100,
      "minScoreToSuggest": 20
    },
    "slot": {
      "defaultDurationMinutes": 30,
      "defaultStepMinutes": 30,
      "defaultTopSuggestions": 5
    }
  }
}
```

## Booking
- Flow: Direct booking from suggestions
- Conflicts: Booking allowed with confirmation warning (busy/unknown)
- Calendar for event: Organizer’s primary calendar
- Event timezone: Organizer’s primary timezone
- Conferencing: Auto‑attach Google Meet
- Event settings: Visibility=default; guests cannot modify or invite others; guest list visible
- Invitations: Use Google Calendar invites only (`sendUpdates=all`)
- Description: Append “Scheduled via Spoonity Meeting Planner”

## Recurrence
- Pattern: Weekly
- End condition: Until a date
- Computation: Recompute best slot independently for each week
- Creation: Create all weekly occurrences upfront as separate events through the end date
- Holidays: Skip any occurrence falling on a public holiday

## Emails
- Provider: SendGrid (domain verified)
- From: “Spoonity Meeting Planner” <mohammed+meetings@spoonity.com>
- Usage: Participant authorization invites (with auth link); no booking confirmations (Google handles)

## UI/UX (Next.js App Router, RSC)
- Stack: Tailwind CSS + shadcn/ui with dark mode
- Key pages:
  - Sign‑in
  - Plan Meeting: search Directory, set parameters (duration, step, window, fallback hours), view ranked suggestions, book
  - Participant Authorization landing (after email link)
  - Admin Setup page (super‑admin bootstrap for Directory)
- Presentation: Ranked list of top suggestions with per‑participant local times and conflict indicators; provisional/unknown availability badges; confirmation modals on conflicts

## Data Model (Vercel Postgres + Prisma)
- NextAuth tables: `User`, `Account`, `Session`, `VerificationToken`
- `AdminDirectoryAuth`: super‑admin linkage and token metadata for Directory access
- `MeetingPlan`: organizer, participants (emails), parameters (duration, step, window, fallback hours), scoring snapshot, createdAt
- `ParticipantAuth`: email, status (authorized/pending), lastInviteAt
- Static scoring config: stored in repo (read at runtime)

## APIs (App Router)
- `POST /api/plan/suggest`: compute ranked slots (FreeBusy + rules, window expansion)
- `POST /api/meetings/book`: create event with Meet conferenceData
- `GET /api/directory/search`: on‑demand Directory lookup (uses admin token)
- `POST /api/participants/invite`: send auth invite via SendGrid
- NextAuth routes for Google OAuth

## Security & Compliance
- Domain‑restricted sign‑in; least‑privilege scopes
- Directory scope used only via super‑admin bootstrap
- Encrypt secrets at rest; short‑lived access tokens; refresh tokens stored in DB
- CSRF protection on mutations; request‑level rate limiting (especially Directory search)
- Basic audit of app events (auth invites, bookings)

## Configuration
- Org default timezone: `America/Toronto`
- Environment variables:
```bash
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
NEXTAUTH_SECRET=
NEXTAUTH_URL=
GOOGLE_ALLOWED_DOMAIN=spoonity.com
SENDGRID_API_KEY=
SEND_FROM_NAME="Spoonity Meeting Planner"
SEND_FROM_EMAIL="mohammed+meetings@spoonity.com"
ORG_DEFAULT_TZ="America/Toronto"
```

## Operational Notes
- No background jobs/cron required (on‑demand Directory + user‑driven flows)
- Handle Google API quota errors gracefully; debounce Directory search; cache responses within a single session where possible

## Risks & Mitigations
- Directory rate limits (on‑demand): debounce, minimal fields, UI guidance when throttled
- Provisional accuracy for un‑authorized participants: clearly mark provisional suggestions and warn on booking

## Success Metrics
- Time‑to‑first‑suggestion < 2 seconds for 1:1 internal users
- Booking success rate without manual retry > 95%
- Participant authorization completion rate > 80%

