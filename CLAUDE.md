# UNWANTED BOYS — Official Website + Admin Panel
## Claude Code Project Context v3.0

---

## 🏆 Project Overview

Official website for **Unwanted Boys** — most popular media football club in Uzbekistan (400K+ YouTube subscribers). Full-stack Next.js app with public site (7 pages) + admin panel (15 sections).

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14+ (App Router, Server Components, Server Actions) |
| Database | Supabase (PostgreSQL + Auth + Storage + Realtime) |
| Hosting | Vercel + Supabase Cloud |
| Styling | Tailwind CSS (custom dark theme) |
| i18n | next-intl v3+, locales: uz (default), ru, en |
| Charts | Recharts |
| MD Editor | @uiw/react-md-editor |
| Dev Tool | Claude Code CLI |

---

## 🔑 Supabase Credentials

```env
NEXT_PUBLIC_SUPABASE_URL=https://mmgpefnoipenertwaces.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1tZ3BlZm5vaXBlbmVydHdhY2VzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk3MTU0ODMsImV4cCI6MjA5NTI5MTQ4M30.hHHji16L2tAJjGaprLr9jZjWzeLXiQGHDMhvWo2daWk
SUPABASE_SERVICE_ROLE_KEY=<Supabase Dashboard → Settings → API → service_role>
NEXT_PUBLIC_SITE_URL=https://unwantedboys.uz
```

Storage base: `https://mmgpefnoipenertwaces.supabase.co/storage/v1/object/public/`

Storage buckets (all public): `players` `news` `opponents` `partners` `banners` `avatars` `pages`

---

## 📁 Project Structure

```
src/
├── app/
│   ├── [locale]/
│   │   ├── layout.tsx              # Public layout (Header + Footer)
│   │   ├── page.tsx                # Home
│   │   ├── matches/
│   │   │   └── page.tsx            # Matches list + detail panel
│   │   ├── team/
│   │   │   ├── page.tsx            # Squad page
│   │   │   └── [id]/page.tsx       # Player profile
│   │   ├── stats/page.tsx          # Team + player analytics
│   │   ├── news/
│   │   │   ├── page.tsx            # News list
│   │   │   └── [slug]/page.tsx     # News detail
│   │   ├── media/page.tsx          # YouTube gallery
│   │   └── club/page.tsx           # Club history page
│   └── admin/
│       ├── layout.tsx              # Admin sidebar layout
│       ├── login/page.tsx
│       ├── page.tsx                # Dashboard
│       ├── analytics/page.tsx      # Site analytics
│       ├── users/page.tsx
│       ├── settings/page.tsx
│       ├── matches/page.tsx
│       ├── players/page.tsx
│       ├── stats/page.tsx          # Player stats detail
│       ├── news/page.tsx
│       ├── media/page.tsx
│       ├── pages/page.tsx
│       ├── partners/page.tsx
│       ├── banners/page.tsx
│       ├── roles/page.tsx
│       ├── logs/page.tsx
│       └── backups/page.tsx
├── components/
│   ├── public/
│   │   ├── MatchCard.tsx
│   │   ├── MatchDetailPanel.tsx    # 5-tab match detail
│   │   ├── LineupField.tsx         # SVG tactical field
│   │   ├── PlayerCard.tsx
│   │   ├── NewsCard.tsx
│   │   ├── VideoCard.tsx
│   │   ├── StatsTable.tsx
│   │   └── LeagueTable.tsx
│   ├── admin/
│   │   ├── ImageUpload.tsx
│   │   ├── MarkdownEditor.tsx
│   │   ├── DataTable.tsx
│   │   └── StatWidget.tsx
│   └── ui/
│       ├── LanguageSwitcher.tsx
│       ├── CountdownTimer.tsx      # Client component
│       ├── VideoModal.tsx
│       ├── Badge.tsx
│       ├── Skeleton.tsx
│       └── StatBar.tsx
├── lib/
│   ├── supabase/
│   │   ├── client.ts               # createBrowserClient
│   │   ├── server.ts               # createServerClient + cookies
│   │   └── admin.ts                # service_role client
│   └── i18n/
├── types/index.ts
└── hooks/

messages/
├── uz.json
├── ru.json
└── en.json
```

---

## 🗄 Database Schema (14 tables)

### players
```sql
id uuid PK, name_uz/ru/en text NOT NULL, position_uz/ru/en text NOT NULL,
number integer, photo_url text, bio_uz/ru/en text,
birthdate date, height_cm integer, weight_kg integer,
nationality text DEFAULT 'Uzbekistan', dominant_foot text,
joined_date date, contract_until date,
status text DEFAULT 'active',  -- active|reserve|injured|inactive
is_active boolean DEFAULT true, created_at timestamptz
```

### matches
```sql
id uuid PK, opponent_uz/ru/en text NOT NULL, opponent_logo_url text,
match_date timestamptz NOT NULL, venue_uz/ru/en text,
stadium text, attendance integer, referee text,
competition_uz/ru/en text, season text DEFAULT '2026', round text,
score_home integer, score_away integer,
status text DEFAULT 'upcoming',  -- upcoming|finished|live|draft
highlight_url text, created_at timestamptz
```

### match_events  (match timeline)
```sql
id uuid PK, match_id uuid FK, minute integer NOT NULL,
extra_time integer DEFAULT 0,
event_type text NOT NULL,  -- goal|yellow_card|red_card|substitution
team text NOT NULL,  -- home|away
player_id uuid FK (nullable), player_name text,
description text, created_at timestamptz
```

### player_stats
```sql
id uuid PK, player_id uuid FK, match_id uuid FK,
goals/assists/yellow_cards/red_cards/minutes_played integer DEFAULT 0,
shots_total/shots_on_target/passes_total integer DEFAULT 0,
passes_accuracy numeric(5,2), rating numeric(3,1),
is_starter boolean DEFAULT true,
UNIQUE(player_id, match_id)
```

### match_stats  (team match stats)
```sql
id uuid PK, match_id uuid UNIQUE FK,
possession_home/away integer,
shots_home/away integer, shots_on_target_home/away integer,
corners_home/away integer, fouls_home/away integer,
yellow_home/away integer, red_home/away integer
```

### news
```sql
id uuid PK, title_uz/ru/en text NOT NULL, body_uz/ru/en text NOT NULL,
excerpt_uz/ru/en text, cover_url text, slug text UNIQUE NOT NULL,
category text,  -- match|club|interview|media|announcement|tournament
published_at timestamptz,
status text DEFAULT 'draft',  -- draft|published|scheduled|archived
tags text[], views integer DEFAULT 0,
author_id uuid FK admin_users, created_at timestamptz
```

### media
```sql
id uuid PK, title_uz/ru/en text NOT NULL, youtube_id text NOT NULL,
thumbnail_url text,
category text,  -- match|vlog|behind_scenes|shorts|training|interview|highlight
views_count integer DEFAULT 0, duration_seconds integer,
published_at timestamptz, is_published boolean DEFAULT true,
is_featured boolean DEFAULT false
```

### league_standings
```sql
id uuid PK, season text NOT NULL, competition text NOT NULL,
team_name text NOT NULL, team_logo_url text,
is_unwanted_boys boolean DEFAULT false,
position integer NOT NULL,
played/won/drawn/lost/goals_for/goals_against integer DEFAULT 0,
goal_diff integer GENERATED AS (goals_for - goals_against) STORED,
points integer DEFAULT 0, form text[]
```

### partners
```sql
id uuid PK, name text NOT NULL, logo_url text, website text,
category text,  -- equipment|food|finance|media|insurance|telecom|other
description_uz/ru/en text, contact_person/email/phone text,
contract_start/end date,
status text DEFAULT 'active',  -- active|inactive|pending|expired
priority integer DEFAULT 0, views_count integer DEFAULT 0,
created_at timestamptz
```

### banners
```sql
id uuid PK, name text NOT NULL, image_url text, link_url text,
placement text NOT NULL,  -- hero_slider|below_hero|news_sidebar|match_sidebar|player_page_bottom|media_top
type text DEFAULT 'image',  -- image|video
status text DEFAULT 'active',  -- active|inactive|scheduled
start_date/end_date date, priority integer DEFAULT 0,
device text DEFAULT 'all',  -- all|desktop|mobile
views/clicks integer DEFAULT 0, created_at timestamptz
```

### pages
```sql
id uuid PK, slug text UNIQUE NOT NULL,  -- club|about|faq|rules|privacy
title_uz/ru/en text NOT NULL, content_uz/ru/en text,
cover_url text, is_published boolean DEFAULT true,
updated_at timestamptz
```

### admin_users
```sql
id uuid PK REFERENCES auth.users(id),
email text NOT NULL UNIQUE, full_name text NOT NULL, avatar_url text,
role text NOT NULL DEFAULT 'editor',  -- super_admin|admin|manager|editor|moderator|viewer
is_active boolean DEFAULT true, last_login timestamptz,
created_at timestamptz
```

### activity_logs
```sql
id uuid PK, admin_user_id uuid FK,
action text NOT NULL,   -- create|update|delete|publish|login|logout
module text NOT NULL,   -- matches|players|news|media|banners|users...
description text NOT NULL, entity_id uuid,
ip_address text, user_agent text,
status text DEFAULT 'success',  -- success|error|warning
created_at timestamptz
```

### site_settings
```sql
key text PK, value_uz/ru/en text, type text
-- Keys: site_name, site_description_uz/ru/en, club_motto_uz/ru/en,
--       founded_year, social_youtube, social_instagram,
--       social_telegram, social_tiktok, contact_email,
--       contact_phone, address, logo_url, favicon_url, copyright_text
```

---

## 🎨 Design System

### Public Site Colors
```js
primary:    '#1A1A2E'  // bg, header, dark sections
secondary:  '#16213E'  // cards, sidebar
surface:    '#0F3460'  // card surfaces
accent:     '#E94560'  // CTA, win, accents — UNWANTED BOYS red
accent2:    '#F5A623'  // gold, top stats
win:        '#48BB78'
draw:       '#A0AEC0'
loss:       '#E94560'
```

### Admin Panel Colors
```js
adminBg:      '#111827'  // main background
adminSidebar: '#1F2937'  // sidebar
adminAccent:  '#E94560'  // active nav, buttons
```

### Typography
- Public headings: **Bebas Neue** (Google Fonts)
- Body + Admin: **Inter**
- Scores/numbers: **Roboto Mono**

### Key UI Patterns (from design mockups)
- Header: `UNWANTED` white + `BOYS` red, nav links white, lang switcher `UZ | RU | EN`, YouTube button red outlined
- Match card: team logos side by side, score center bold, Win=green/Draw=gray/Loss=red badge below
- Player card: photo with number badge top-right, name + position + age + flag below
- News card: cover image, colored category badge, date, title bold
- Admin sidebar: dark bg, red active state, grouped sections with labels
- Admin tables: dark rows alternating, right panel slides in on row click
- Stat widgets: icon + big number + small label + % change with arrow

---

## 🌐 i18n Rules

- Routing: `/uz/...`, `/ru/...`, `/en/...` (always prefix)
- Default: `uz`
- DB content: select field by locale — `name_uz`, `title_ru`, `body_en`
- UI strings: always `useTranslations()` — never hardcode
- Admin panel: separate language switcher (RU default for admin)

### Key translations
| Key | UZ | RU | EN |
|-----|----|----|-----|
| nav.home | Bosh sahifa | Главная | Home |
| nav.matches | O'yinlar | Матчи | Matches |
| nav.team | Jamoa | Команда | Team |
| nav.stats | Statistika | Статистика | Stats |
| nav.news | Yangiliklar | Новости | News |
| nav.media | Media | Медиа | Media |
| nav.club | Klub | Клуб | Club |
| match.win | G'alaba | Победа | Win |
| match.draw | Durang | Ничья | Draw |
| match.loss | Mag'lubiyat | Поражение | Loss |
| match.upcoming | Kutilmoqda | Предстоящий | Upcoming |
| match.live | Jonli efir | Онлайн | Live |
| player.goalkeeper | Darvozabon | Вратарь | Goalkeeper |
| player.defender | Himoyachi | Защитник | Defender |
| player.midfielder | Yarim himoyachi | Полузащитник | Midfielder |
| player.forward | Hujumchi | Нападающий | Forward |
| player.active | Faol | Активен | Active |
| player.reserve | Zahirada | В запасе | Reserve |
| player.injured | Jarohatlangan | Травмирован | Injured |

---

## 🔒 Auth & Security

- `/admin/*` protected by Next.js middleware (Supabase session check)
- Redirect to `/admin/login` if no session
- RLS: public SELECT on all tables; writes require `auth.role() = 'authenticated'`
- `admin.ts` uses SERVICE_ROLE_KEY — server-side only, never in client components
- Role hierarchy: super_admin > admin > manager > editor > moderator > viewer

---

## ⚙️ Supabase Client Rules

| Context | Import | Client |
|---------|--------|--------|
| Server Component / Route Handler | `@/lib/supabase/server` | `await createClient()` |
| Client Component | `@/lib/supabase/client` | `createClient()` |
| Server Action (admin writes) | `@/lib/supabase/admin` | `adminSupabase` |

---

## 📋 Coding Standards

- Server Components: `async/await`, Supabase server client, no `useEffect` for data
- Client Components: only for interactivity (modals, filters, timers, charts)
- TypeScript strict — always type Supabase responses
- Images: `next/image` with Supabase Storage domain in `next.config.js`
- YouTube thumbnail: `https://img.youtube.com/vi/{id}/maxresdefault.jpg`
- YouTube embed: `https://www.youtube.com/embed/{id}?autoplay=1`
- All admin writes: Server Actions (not API routes)
- Always handle `{ data, error }` from Supabase
- Activity logging: after every admin write, insert into activity_logs

### next.config.js
```js
images: {
  remotePatterns: [
    { protocol: 'https', hostname: 'mmgpefnoipenertwaces.supabase.co', pathname: '/storage/v1/object/public/**' },
    { protocol: 'https', hostname: 'img.youtube.com' },
  ]
}
```

---

## 📱 Public Site Pages — UI Description

### Home (/)
- **Hero**: fullscreen dark bg + team photo, "WE ARE" white + "UNWANTED BOYS" red (Bebas Neue), subtitle, 2 CTA buttons, social icons row
- **Next Match widget** (top-right): competition label, UB logo vs opponent logo, venue + date, countdown (DD HH MM SS)
- **Recent Results**: horizontal scroll, 4-5 match cards with logos + score + Win/Draw/Loss badge
- **League Table**: 5-row mini table, UB row highlighted red
- **Squad**: 4 player cards in a row
- **Media**: large featured video left + 3 video list right
- **News**: 3 news cards (category badge + date + title)

### Matches (/matches)
- **Left panel**: tab Upcoming/Previous, match list (date + logos + score + badge)
- **Center**: match detail panel slides in on click, 5 tabs:
  - Обзор: timeline events (minute + icon + player + score), YouTube button
  - Статистика: dual bars (possession, shots, corners, fouls, cards)
  - Составы: SVG field with player positions
  - Хронология: chronological event list
  - H2H: head-to-head history
- **Right panel**: starting lineups (UB/opponent tabs), Best Player widget, Match Media

### Team (/team)
- Hero banner with squad photo
- Club stats row: players count, coaches, base city, trophies
- Tabs: Squad / Coaching staff / Medical staff
- Player filters: ALL / GK / DEF / MID / FWD + sort by number
- Player card: photo + number badge + name + position + age + flag
- Right sidebar: head coach card with quote, About Club text, Season stats

### Stats (/stats)
- Hero with team photo + UB logo
- Top filters: Season / Tournament / All Matches
- Left menu: General / Players / Team Metrics / Attack / Defense / Discipline / Goalkeepers / Streaks / Compare
- General section: 7 stat widgets row
- Results chart: Recharts LineChart (scored red, conceded gray)
- Form: last 9 matches W/D/L badges + donut chart (67% wins)
- Player stats table: sortable, all columns
- Right sidebar: Season Leaders (top scorers/assists), Team metrics with progress bars

### News (/news)
- Hero banner with fans photo
- Filter tabs: ALL / Announcements / Matches / Interview / Club / Media + search + sort
- Left: featured slider (big card, "NEWS OF THE DAY" badge, category, date, title, excerpt, pagination dots)
- Right: recent news list (thumbnail + category + date + title + arrow)
- Right sidebar: Categories with counts, Popular news top-4

### Media (/media)
- Hero banner with UB branding
- Filter tabs: ALL / Matches / Vlogs / Behind Scenes / Shorts / Streams + search + sort
- "New Videos" section: 3 large cards (thumbnail + title + date + views)
- "All Videos" grid: 4 columns
- Right sidebar: Featured Video with big player + YouTube link, Playlists (5 items), Shorts (5 vertical thumbnails)

### Club (/club)
- Hero: team photo with smoke/flares, "КЛУБ" + "UNWANTED BOYS" title, tagline
- Top-right: UB logo + EST. 2022 + TASHKENT UZ + social icons
- Stats row: 400K+ YouTube / 9 Trophies / 2 Years / 20+ Players / Tashkent / 3 Languages
- About section: text left + photo right
- Values: 3 cards (Passion / Character / Community) with icons
- Timeline: 2022 → 2023 → 2024 → 2025 with dot markers and descriptions

---

## 🖥 Admin Panel — UI Description

### Layout
- Sidebar 210px: logo top-left, nav groups (ПАНЕЛЬ УПРАВЛЕНИЯ / КОНТЕНТ / СИСТЕМА), user card bottom with logout
- Header: language switcher, notification bell with badge, user avatar + name
- Main content: full width with breadcrumbs

### Dashboard (/admin)
- 6 top widgets: Visitors / Page Views / Video Views / News / Matches / Players (with % week change)
- Recharts LineChart: Visitors + Views over time, date filter
- Last matches: 4 rows with logos + score + status badge
- Last news: 4 rows with thumbnail + title + date + status
- Content summary: 6 mini widgets
- Recent activity: action log rows (who did what when)

### Matches (/admin/matches)
- Tabs: All / Upcoming / Previous / Drafts
- Filters: tournament + season + status + date range + search
- Table: date, tournament, match (logo+score+logo), status badge, actions
- Right slide panel: match details with tabs (Overview/Lineups/Stats/Events), goal timeline

### Players (/admin/players)
- 5 widgets: Total / Starting Squad / Reserve / Injured / Contracts Expiring
- Table: photo+name+nationality, position+squad type, number, status badge, birthdate+age, contract, actions
- Extended form: all fields including birthdate, height, weight, foot, nationality, contract dates

### Stats (/admin/stats) — Player Detail
- Header: photo + number (large) + name + position
- 6 widgets: Matches(starter) / Goals(+change) / Assists(+change) / Shots / Yellow Cards / Minutes
- Recharts LineChart: Goals + Assists per match
- Donut: Shot accuracy (on target / missed / blocked)
- Field heatmap: 3x3 goal distribution grid
- Match history table with all stats columns
- Right: Season summary all aggregated stats

### News (/admin/news)
- 5 widgets: Total / Published / Drafts / Scheduled / Archived
- Table: thumbnail, title, category badge, status badge, date, views, author, actions
- Right slide panel: cover preview + all details + tags chips
- Form: title uz/ru/en, MD editor uz/ru/en in tabs, cover upload, slug, category, status, scheduled date, tags

### Media (/admin/media)
- 5 widgets + storage usage bar (28.4/100 GB)
- Buttons: YouTube Settings / Import from YouTube / Add Media
- Grid: file thumbnails with type badge (JPG/MP4/PNG), name, size, date
- Right panel: file details (type, size, resolution, category, alt text)

### Partners (/admin/partners)
- Table: logo + name + website, category, status, dates, views, actions
- Right panel: all details + contact info + contract PDF download

### Banners (/admin/banners)
- 5 widgets: Total / Active / Monthly Views / Monthly Clicks / CTR
- Table: preview, name, placement, type, status, views, clicks, CTR, period, actions
- Right panel: details + quick actions (Deactivate / Duplicate)

### Users (/admin/users)
- 4 widgets: Total / Active / Admins / Blocked
- Table: avatar+name+ID, email, role (colored badge), status, last active, registered, actions

### Roles (/admin/roles)
- Left: roles table (name, System badge, users count, description, status, actions)
- Right: permissions panel for selected role, toggle switches grouped by section

### Logs (/admin/logs)
- 4 widgets: Total / Success / Warnings / Errors
- Table: datetime, user+email, action badge, module, description, IP, status
- Right panel: event details with JSON viewer + browser/OS/device info

### Backups (/admin/backups)
- 4 widgets: Total / Size / Auto / Last Backup
- Table: name, type badge (Auto/Manual), created, size, status, creator, download+restore actions
- Right panel: details (storage, SHA256, retention, contents)

### Analytics (/admin/analytics)
- 5 widgets with sparkline mini-charts
- Recharts LineChart: visitors + views by day/week/month
- Donut: traffic sources (Direct/YouTube/Search/Social/Referral/Other)
- Popular pages table with progress bars
- Geography: world map + countries table

### Settings (/admin/settings)
- Left menu: 12 tabs
- Main settings tab: site name, description, language, timezone, logo upload, favicon, contacts, social links, copyright

---

## 🚀 Implementation Order (23 stages)

1. Project init: Next.js 14, Tailwind, next-intl, Supabase clients
2. SQL migrations: all 14 tables, RLS, Storage buckets
3. Layout: public Header/Footer, admin sidebar, auth middleware
4. /team + /team/[id]
5. /matches with detail panel (5 tabs)
6. /stats with Recharts
7. /news + /news/[slug]
8. /media with playlists + Shorts + Featured
9. / (Home) — all sections + countdown + league table
10. /club — history, timeline, values
11. Admin: Login + Dashboard with Recharts
12. Admin: Matches CRUD + events + match_stats
13. Admin: Players CRUD (extended fields) + photo upload
14. Admin: Player stats detail page + batch input
15. Admin: News CRUD + MD editor + 5 statuses
16. Admin: Media CRUD + Storage
17. Admin: Pages + Partners CRUD
18. Admin: Banners + CTR tracking
19. Admin: Users + Roles (toggle system)
20. Admin: Logs + Backups + Analytics + Settings
21. SEO: generateMetadata, sitemap, robots, OG tags
22. Polish: Skeletons, Framer Motion, mobile QA
23. Deploy: Vercel env vars, domain, Supabase prod
