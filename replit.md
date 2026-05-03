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
│   │   ├── prayers.tsx              # Prayer Book with 3D page-flip reader
│   │   ├── calendar.tsx             # Orthodox liturgical calendar (New/Old style)
│   │   ├── bible.tsx                # Bible reader (John 1) with verse highlighting & commentary
│   │   └── you.tsx                  # Profile: streak, 8 badges + progress rings, activity feed
│   ├── companion.tsx                # AI Spiritual Companion chat (Father Seraphim, SSE streaming)
│   ├── settings.tsx                 # Settings sheet: notifications toggle, calendar style, about
│   ├── bookmarks.tsx                # Saved bookmarks & Bible highlights
│   ├── onboarding/[step].tsx        # 3-step onboarding
│   ├── prayers/[slug].tsx           # Prayer detail modal
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
│   ├── pages.ts                     # Prayer book page data
│   ├── audio.ts                     # Audio SFX stubs (expo-audio ready)
│   └── calendar.ts                  # Orthodox calendar data + Julian/Gregorian shift
└── theme/
    ├── colors.ts                    # Brand color tokens
    ├── typography.ts                # Font scale
    └── spacing.ts                   # Spacing/radius/shadow tokens
```

## Key Features

- **Home Screen**: Today's Prayer hero card (Saint Nicholas icon + quote), 2×3 quick-action tiles with MaterialCommunityIcons, Prayer Categories list, badge progress preview
- **Page-flip Prayer Book**: Swipe-to-turn pages with 3D perspective curl animation
- **Orthodox Calendar**: Monthly grid, feast days, Old/New style toggle, tone of week, Sunday readings
- **Bible Reader**: John 1 with verse long-press → highlight/copy/share/bookmark actions
- **AI Spiritual Companion** (`app/companion.tsx`): Full-screen chat with "Father Seraphim" — an Orthodox spiritual guide powered by Claude via Anthropic API. SSE streaming responses, conversation history persisted to PostgreSQL, 6 suggestion prompts on welcome screen. Entry banner on "You" tab.
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
