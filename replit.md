# Red Prayer Book

An Orthodox Christian prayer mobile app built with Expo SDK 54, expo-router v6, React Native 0.81.5, TypeScript.

## Stack

- **Framework**: Expo SDK 54, expo-router v6, React Native 0.81.5, React 19.1.0
- **State**: Zustand (book state), AsyncStorage (bookmarks, highlights, streak, badges, notifications)
- **Animation**: react-native-reanimated v4 (page-flip curl), react-native-gesture-handler v2
- **Navigation**: expo-router file-based routing with 5-tab layout
- **Icons**: `@expo/vector-icons` → MaterialCommunityIcons (tabs, tiles, UI)
- **SVG**: `react-native-svg` → ProgressRing component for badge progress arcs
- **Notifications**: `expo-notifications` ~0.32.17 (dynamic import, native-only, lazy)

## Brand

| Token | Value |
|-------|-------|
| `byzantineCrimson` | `#8B0E1A` |
| `sacredGold` | `#D4AF37` |
| `ivoryVellum` | `#F5EBDD` |
| `deepOnyx` | `#0E0E10` |
| `vesperPurple` | `#4A2C4E` |

Brand tokens live in `artifacts/red-prayer-book/theme/colors.ts`.

## Architecture

```
artifacts/red-prayer-book/
├── app/
│   ├── _layout.tsx                  # Root layout — GestureHandler, SafeArea, QueryClient, notifications init
│   ├── (tabs)/
│   │   ├── _layout.tsx              # 5-tab nav (Home, Prayers, Calendar, Bible, You) — MCI vector icons
│   │   ├── index.tsx                # Home: Today's Prayer card, 2×3 quick tiles, prayer categories, badges
│   │   ├── prayers.tsx              # Prayer Book — section-based TOC with expandable accordions, search
│   │   ├── calendar.tsx             # Orthodox liturgical calendar (New/Old style)
│   │   ├── bible.tsx                # Bible reader — full 3-view navigator (Books→Chapters→Reading), all 73 Orthodox canon books, live KJV fetch + cache
│   │   └── you.tsx                  # Profile: streak, 8 badges + progress rings, activity feed
│   ├── fasting.tsx                  # Fasting Calendar screen — Pascha countdown, all periods, one-day fasts, today's status
│   ├── hours.tsx                    # Canonical Hours prayer screen — full Divine Office with hour selector, prev/next nav, share
│   ├── companion.tsx                # AI Spiritual Companion chat (Father Seraphim, SSE streaming)
│   ├── settings.tsx                 # Settings sheet: notifications toggle, calendar style, about
│   ├── bookmarks.tsx                # Saved bookmarks & Bible highlights
│   ├── onboarding/[step].tsx        # 3-step onboarding
│   ├── prayers/[slug].tsx           # Prayer detail — title card, rubric, paragraph/list/responsive renderers, in-section nav
│   ├── intention.tsx                # Compose a Prayer: intention input → streamed Orthodox prayer → save/share
│   └── saints/[id].tsx              # Saint detail modal
├── components/
│   ├── book/
│   │   ├── BookView.tsx             # Full page-flip reader (Gesture + Reanimated)
│   │   ├── CurlingPage.tsx          # Animated 3D perspective page curl
│   │   ├── StaticPage.tsx           # Static page content renderer
│   │   └── PageJumpSheet.tsx        # Modal sheet to jump to any page
│   ├── calendar/
│   │   ├── MonthGrid.tsx            # Monthly calendar grid
│   │   └── DaySheet.tsx             # Day detail sheet (feast, readings, tone)
│   ├── home/
│   │   ├── TodaysPrayerCard.tsx     # (legacy) Home hero card
│   │   └── QuickTile.tsx            # (legacy) Quick-action tile
│   └── ui/
│       ├── CrossDivider.tsx         # ✧ ✟ ✧ decorative divider
│       ├── FiligreeFrame.tsx        # Byzantine filigree border frame
│       ├── ProgressRing.tsx         # SVG circular progress arc (react-native-svg)
│       └── BadgeItem.tsx            # Badge with ProgressRing, locked/earned/progress states
├── lib/
│   ├── store.ts                     # Zustand book state (currentIndex, totalPages)
│   ├── db.ts                        # AsyncStorage persistence (bookmarks, highlights, streak)
│   ├── badges.ts                    # 8 badge definitions + AsyncStorage progress tracking
│   ├── notifications.ts             # Morning/evening notification scheduling (lazy expo-notifications)
│   ├── pages.ts                     # Legacy prayer book page data (BookView)
│   ├── prayers.ts                   # Full prayer data library — 12 sections, 70+ prayers, all real PDF content
│   ├── audio.ts                     # Audio SFX stubs (expo-audio ready)
│   ├── calendar.ts                  # Orthodox calendar data + Julian/Gregorian shift
│   ├── bible-structure.ts           # All 73 Orthodox canon books in 9 sections (BIBLE_SECTIONS), helpers
│   └── bible-fetch.ts               # fetchChapter() → bible-api.com KJV, AsyncStorage cache (rpb:bible:*)
└── theme/
    ├── colors.ts                    # Brand color tokens
    ├── typography.ts                # Font scale
    └── spacing.ts                   # Spacing/radius/shadow tokens
```

## Key Features

- **Home Screen**: Today's Prayer hero card (Saint Nicholas icon + quote), 2×3 quick-action tiles with MaterialCommunityIcons, Prayer Categories list, badge progress preview
- **Page-flip Prayer Book**: Swipe-to-turn pages with 3D perspective curl animation
- **Orthodox Calendar**: Monthly grid, feast days, Old/New style toggle, tone of week, Sunday readings
- **Bible Reader**: Full 3-view navigator — Books (all 73 Orthodox canon books, OT/NT toggle, deuterocanonical gold dots) → Chapters (grid) → Reading (live KJV from bible-api.com, AsyncStorage cache, animated skeleton, verse long-press → highlight/copy/share/bookmark, prev/next chapter dock)
- **Fasting Calendar** (`lib/fasting.ts`, `app/fasting.tsx`): Full Orthodox fasting year computed dynamically from Julian Pascha (algorithm covers any year). Covers all major fasting periods (Publican & Pharisee fast-free, Cheese Week, Great Lent, Holy Week, Bright Week, Pentecost Week, Apostles' Fast, Dormition Fast, Nativity Fast, Christmas Season), three annual one-day fasts (Theophany Eve, Beheading of St. John, Elevation of the Cross), and weekly Wednesday/Friday fasts. `getTodayFastStatus()` returns the current fast label, strictness, rules, and progress. Home screen widget (below Canonical Hours) shows the current fast with a progress bar and taps through to the full screen. The full `/fasting` screen shows: today's hero card with rules + progress bar, Pascha date with countdown, annual one-day fasts list, and all yearly fasting periods as expandable accordion cards with strictness bars and date ranges. Calendar tab also shows a fasting banner below the month grid.
- **Canonical Hours** (`lib/canonicalHours.ts`, `app/hours.tsx`): Full Orthodox Divine Office — 7 canonical hours (Midnight Office, Matins, First, Third, Sixth, Ninth Hour, Vespers) each with name, Greek name, time range, accent color, scripture verse, full liturgical prayer text in elevated English. Live home screen widget auto-detects the current hour (updates every 60s), shows the hour name, subtitle, Greek name, live clock, and short prayer snippet. Taps through to `app/hours.tsx` — a full-screen prayer reader with a horizontal hour selector strip, hero card with scripture + intention, full prayer text, prev/next navigation, share button.
- **AI Spiritual Companion** (`app/companion.tsx`): Full-screen chat with "Father Seraphim" — an Orthodox spiritual guide powered by Claude via Anthropic API. SSE streaming responses, conversation history persisted to PostgreSQL, 6 suggestion prompts on welcome screen. Entry banner on "You" tab.
- **Compose a Prayer** (`app/intention.tsx`): User types a personal prayer intention → Claude composes a formal Orthodox prayer in liturgical English (SSE streamed). Prayer can be saved to AsyncStorage bookmarks and shared via native Share. 6 example intentions for inspiration. Saved prayers appear in Bookmarks screen under the "Prayers" tab (expandable cards with delete). Entry banner on "You" tab.
- **Profile (You)**: Streak counter, 8 badge progress rings, "Add Your Church" modal, activity feed with tab filters
- **Settings**: Notification toggles (Morning/Evening prayer reminders), calendar style, about — presented as modal sheet
- **Bookmarks**: Saved prayer pages + Bible verse highlights
- **Badge System** (`lib/badges.ts`): 8 badges (Share Verses, Whole Bible, Notes, Days Fasted, Daily Prayers, App Streak, Calendar, Vespers). Each has a max threshold, color, icon, and progress tracking via AsyncStorage. Badges are earned — not auto-shown. `BadgeItem` renders a ProgressRing (SVG arc), locked/earned/progress visual states.
- **Notifications** (`lib/notifications.ts`): Morning/Evening local notifications scheduled via `expo-notifications` using lazy dynamic import (Platform.OS !== 'web' guard). Settings persist to AsyncStorage.

## Tab Bar Icons (MaterialCommunityIcons)
| Tab | Icon (focused) | Icon (unfocused) |
|-----|---------------|-----------------|
| Home | `home` | `home-outline` |
| Prayers | `cross` | `cross` |
| Calendar | `calendar-month` | `calendar-month-outline` |
| Bible | `book-open-variant` | `book-open-outline` |
| You | `account-circle` | `account-circle-outline` |

## API Server (`artifacts/api-server`)

Express + Drizzle ORM + PostgreSQL. Routes:
- `GET /api/healthz` — health check
- `GET /api/anthropic/conversations` — list conversations
- `POST /api/anthropic/conversations` — create conversation
- `DELETE /api/anthropic/conversations/:id` — delete conversation
- `GET /api/anthropic/conversations/:id/messages` — list messages
- `POST /api/anthropic/conversations/:id/messages` — send user message + stream AI response (SSE)
- `POST /api/anthropic/compose-prayer` — takes `{ intention }`, streams back a composed Orthodox prayer

DB tables: `conversations`, `messages` (in `lib/db/src/schema/`).

Anthropic integration via `@workspace/integrations-anthropic-ai` (uses `AI_INTEGRATIONS_ANTHROPIC_BASE_URL` + `AI_INTEGRATIONS_ANTHROPIC_API_KEY` env vars set by Replit).

## Packages Added Beyond Scaffold

| Package | Purpose |
|---------|---------|
| `zustand` | Lightweight book state store |
| `expo-audio` | SFX stubs (page flip, riffle) |
| `@gorhom/bottom-sheet` | Installed (sheets use native Modal in Expo Go) |
| `react-native-svg` | ProgressRing SVG arcs for badge system |
| `expo-notifications` ~0.32.17 | Morning/evening prayer local notifications |
| `@anthropic-ai/sdk` ^0.78.0 | Claude AI via Replit AI Integrations proxy |
| `p-limit` ^7.3.0 | Concurrency limiting for batch processing |
| `p-retry` ^7.1.1 | Retry logic for batch processing |

## Design References
UI-UX reference images saved at `attached_assets/uiux/`:
- `home.png` — Home screen layout
- `settings.png` — You/profile screen
- `bible.png` — Bible reader
- `calander.png` — Calendar grid
- `guidelines.png` / `guidelines_2.png` — Brand system (colors, typography, iconography)
- `banner.png` — Marketing banner with app preview
