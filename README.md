# ChatLay - Нийгмийн Сүлжээ

Supabase ашигласан бүрэн Social Media платформ. Google-ээр нэвтэрч, пост бичиж, like хийж, хэрэглэгчдийг дагах боломжтой.

## Боломжууд

- Google OAuth нэвтрэлт
- Пост бичих (280 тэмдэгт)
- Like/Unlike (Realtime)
- Follow/Unfollow
- Profile засах
- Community үүсгэх
- Story оруулах
- Мессеж илгээх
- Dark UI

---

# Хурдан эхлэл (5 минут)

Хамгийн хурдан туршиж үзэх:

1. **Supabase дээр SQL ажиллуулах**
   - https://supabase.com руу орж шинэ project үүсгэнэ
   - SQL Editor дээр `sql/complete-setup.sql` файлыг ажиллуулна

2. **Google OAuth тохируулах**
   - https://console.cloud.google.com дээр OAuth Client үүсгэнэ
   - Supabase Authentication → Providers → Google дээр идэвхжүүлнэ

3. **Төслийг ажиллуулах**
   ```bash
   npm install
   cp .env.example .env
   # .env файлд Supabase URL ба ANON_KEY оруулна
   npm run dev
   ```

4. http://localhost:5173 дээр нээнэ - бэлэн! 🚀

---

# Суулгах заавар

## Шаардлага

- Node.js 18+
- npm эсвэл yarn
- Supabase account (үнэгүй)
- Google Cloud account (үнэгүй)

---

# Арга 1: Supabase CLI ашиглах (Санал болгох)

## Алхам 1: Supabase CLI суулгах

```bash
# npm ашиглан суулгах
npm install -g supabase

# Хувилбар шалгах
supabase --version
```

## Алхам 2: Supabase руу нэвтрэх

```bash
# Supabase Dashboard-аас Access Token авна
# https://supabase.com/dashboard/account/tokens

supabase login
```

Access Token оруулах:
```
Enter your access token: sbp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

## Алхам 3: Project link хийх

```bash
# Project folder руу орох
cd thread-platform

# Supabase init (анх удаа)
supabase init

# Project link хийх
supabase link --project-ref YOUR_PROJECT_REF
```

**Project Ref олох:** Supabase Dashboard → Project Settings → General → Reference ID

## Алхам 4: Database migration ажиллуулах

```bash
# Migration файлуудыг push хийх
supabase db push

# Эсвэл SQL файл шууд ажиллуулах
supabase db execute -f sql/001_init.sql
```

## Алхам 5: Шууд SQL ажиллуулах (Postgres ашиглан)

Хэрэв CLI ажиллахгүй бол `postgres` npm package ашиглаж болно:

```bash
# Postgres package суулгах
npm install postgres

# Setup script ажиллуулах
node setup-new-db.mjs
```

`setup-new-db.mjs` файл:
```javascript
import postgres from 'postgres'

const sql = postgres({
  host: 'db.YOUR_PROJECT_REF.supabase.co',
  port: 5432,
  database: 'postgres',
  username: 'postgres',
  password: 'YOUR_DATABASE_PASSWORD',
  ssl: 'require'
})

// Tables үүсгэх SQL-ууд...
```

**Database Password олох:** Supabase Dashboard → Project Settings → Database → Connection string

---

# Арга 2: Supabase Dashboard ашиглах

## Алхам 1: Supabase Project үүсгэх

### 1.1 Supabase.com руу орох

```
https://supabase.com → Sign In (GitHub-ээр)
```

### 1.2 New Project үүсгэх

```
Dashboard → [New Project]
```

### 1.3 Project тохиргоо

```
┌─────────────────────────────────────────────────────────────────┐
│  Create a new project                                           │
│                                                                 │
│  Organization:  Personal                                        │
│                                                                 │
│  Name:          chatlay-platform                                │
│                                                                 │
│  Database Password:  [Generate] ← Энэ password-г хадгална!     │
│                                                                 │
│  Region:        Singapore (Southeast Asia)                      │
│                                                                 │
│  Pricing Plan:  Free                                            │
│                                                                 │
│  [Create new project]                                           │
└─────────────────────────────────────────────────────────────────┘
```

## Алхам 2: Database Migration

### 2.1 SQL Editor нээх

```
Dashboard → SQL Editor → [New query]
```

### 2.2 Migration ажиллуулах

**Санал болгох:** `sql/complete-setup.sql` файлын бүх агуулгыг хуулж, SQL Editor дээр paste хийгээд **[Run]** дарна.

Энэ нь:
- 12 хүснэгт үүсгэнэ (profiles, posts, likes, follows, communities, messages, stories гэх мэт)
- Indexes болон triggers нэмнэ
- Row Level Security (RLS) policies тохируулна
- 3 жишээ community үүсгэнэ

---

# Google OAuth тохируулах

## Алхам 1: Google Cloud Console

```
https://console.cloud.google.com/
```

## Алхам 2: Project үүсгэх/сонгох

```
Дээд талын dropdown → [New Project] эсвэл байгаа project сонгох
```

## Алхам 3: OAuth consent screen

```
APIs & Services → OAuth consent screen
```

```
┌─────────────────────────────────────────────────────────────────┐
│  OAuth consent screen                                           │
│                                                                 │
│  User Type: ● External                                          │
│                                                                 │
│  [Create]                                                       │
└─────────────────────────────────────────────────────────────────┘
```

Дараа нь:
```
┌─────────────────────────────────────────────────────────────────┐
│  App information                                                │
│                                                                 │
│  App name:           ChatLay                                    │
│  User support email: your@email.com                             │
│  Developer contact:  your@email.com                             │
│                                                                 │
│  [Save and Continue] (3 удаа дарж дуусгана)                    │
└─────────────────────────────────────────────────────────────────┘
```

## Алхам 4: Production горимд шилжүүлэх

```
OAuth consent screen → Publishing status → [PUBLISH APP]
```

⚠️ **Чухал:** Testing горимд зөвхөн test users нэвтэрч чадна. Production болгосноор бүх Google хэрэглэгч нэвтэрч чадна.

## Алхам 5: Credentials үүсгэх

```
APIs & Services → Credentials → [+ Create Credentials] → OAuth client ID
```

```
┌─────────────────────────────────────────────────────────────────┐
│  Create OAuth client ID                                         │
│                                                                 │
│  Application type: Web application                              │
│                                                                 │
│  Name: ChatLay Web                                              │
│                                                                 │
│  Authorized redirect URIs:                                      │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback  │   │
│  │  http://localhost:5173                                  │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  [Create]                                                       │
└─────────────────────────────────────────────────────────────────┘
```

⚠️ **Чухал:** `http://localhost:5173` нэмэхээ бүү мартаарай! Үгүй бол local development-д ажиллахгүй.

**Client ID** болон **Client Secret** хуулж авна.

## Алхам 6: Email баталгаажуулалт идэвхгүй болгох

```
Supabase Dashboard → Authentication → Settings
```

**"Enable email confirmations"** toggle-ийг **OFF** болгоно уу.

Энэ нь шинэ хэрэглэгчид email баталгаажуулалтгүйгээр шууд нэвтрэх боломж олгоно.

## Алхам 7: Supabase дээр Google идэвхжүүлэх

```
Supabase Dashboard → Authentication → Providers → Google
```

```
┌─────────────────────────────────────────────────────────────────┐
│  Google                                                [Enable] │
│                                                                 │
│  Client ID:                                                     │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  xxxxxxxxxxxx.apps.googleusercontent.com                │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  Client Secret:                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  GOCSPX-xxxxxxxxxxxxxxx                                 │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  [Save]                                                         │
└─────────────────────────────────────────────────────────────────┘
```

---

# API Keys авах

## Supabase API Settings

```
Supabase Dashboard → Project Settings → API
```

```
┌─────────────────────────────────────────────────────────────────┐
│  API Settings                                                   │
│                                                                 │
│  Project URL:                                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  https://abcdefghijk.supabase.co                        │   │
│  └─────────────────────────────────────────────────────────┘   │
│  ↑ VITE_SUPABASE_URL                                           │
│                                                                 │
│  anon (public):                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...                │   │
│  └─────────────────────────────────────────────────────────┘   │
│  ↑ VITE_SUPABASE_ANON_KEY                                      │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

# .env файл үүсгэх

Project folder дотор `.env` файл үүсгэнэ:

```bash
# .env файл үүсгэх
cp .env.example .env
```

`.env` файлыг нээж өөрийн утгуудыг оруулна:

```env
VITE_SUPABASE_URL=https://abcdefghijk.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

# App ажиллуулах

```bash
# Dependencies суулгах
npm install

# Development server
npm run dev
```

Browser дээр `http://localhost:5173` нээгдэнэ.

---

# Database Tables

Энэ project дараах tables ашиглана:

| Table | Тайлбар |
|-------|---------|
| `profiles` | Хэрэглэгчийн профайл |
| `posts` | Постууд |
| `likes` | Like-ууд |
| `follows` | Дагалт |
| `communities` | Community-үүд |
| `community_members` | Community гишүүд |
| `activity` | Үйл ажиллагааны түүх |
| `bookmarks` | Хадгалсан постууд |
| `stories` | Story-үүд |
| `story_views` | Story үзсэн түүх |
| `messages` | Мессежүүд |
| `shares` | Хуваалцсан постууд |

---

# Бүтэц

```
thread-platform/
├── package.json          # Dependencies
├── vite.config.js        # Vite тохиргоо
├── index.html            # HTML template
├── .env.example          # Environment variables жишээ
├── .gitignore
├── README.md             # Энэ заавар
├── setup-new-db.mjs      # Database setup script
├── fix-policies.js       # RLS policies засах script
├── sql/
│   └── 001_init.sql      # Database migration
└── src/
    ├── main.jsx          # React entry
    ├── App.jsx           # Main component (бүх UI)
    ├── App.css           # App styles
    ├── index.css         # Global styles
    └── supabaseClient.js # Supabase connection
```

---

# Түгээмэл алдаанууд

## "Invalid API key"

**Шийдэл:** `.env` файл дахь API keys зөв эсэхийг шалгана.

## "relation 'profiles' does not exist"

**Шийдэл:** Database migration ажиллуулаагүй байна. `setup-new-db.mjs` эсвэл SQL Editor дээр ажиллуулна.

## Google login redirect ажиллахгүй

**Шийдэл:**
1. Redirect URI зөв эсэхийг шалгах: `https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback`
2. Google Cloud Console дээр `http://localhost:5173` нэмсэн эсэхийг шалгах
3. Supabase Providers дээр Client ID, Secret зөв эсэхийг шалгах
4. Google OAuth app Production горимд байгаа эсэхийг шалгах (OAuth consent screen → PUBLISH APP)
5. Тохиргоо идэвхжихэд 5 минут хүлээх

## "Testing" горимд зөвхөн test users нэвтэрч чадна

**Шийдэл:**
```
Google Cloud Console → APIs & Services → OAuth consent screen → [PUBLISH APP]
```

Publishing status: "In production" болгосноор хэн ч нэвтэрч чадна.

## "new row violates row-level security"

**Шийдэл:** RLS policies засах:
```bash
node fix-policies.js
```

Эсвэл SQL Editor дээр:
```sql
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE posts DISABLE ROW LEVEL SECURITY;
-- ... бусад tables
```

---

# Deploy (Vercel)

```bash
# Build
npm run build

# Vercel дээр:
# 1. GitHub руу push
# 2. vercel.com → Import → Add env vars
# 3. Supabase redirect URLs дээр Vercel domain нэмэх
```

---

**Амжилт хүсье! 🎉**
