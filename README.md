# Thread Platform

Supabase ашигласан бүрэн Social Media платформ. Google/Facebook-ээр нэвтэрч, пост бичиж, like хийж, хэрэглэгчдийг дагах боломжтой.

## Features

- Google/Facebook OAuth нэвтрэлт
- Пост бичих (280 тэмдэгт)
- Like/Unlike (Realtime)
- Follow/Unfollow
- Profile засах
- Dark UI

---

# Тохиргооны заавар

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
│  Name:          thread-platform                                 │
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

⏳ Project үүсэхэд 1-2 минут хүлээнэ.

---

## Алхам 2: Database Migration

### 2.1 SQL Editor нээх

```
Dashboard → SQL Editor → [New query]
```

### 2.2 Migration ажиллуулах

`sql/001_init.sql` файлын бүх агуулгыг хуулж, SQL Editor дээр paste хийгээд **[Run]** дарна.

```sql
-- Энэ SQL-ийг ажиллуулна (файлаас хуулна)
CREATE TABLE IF NOT EXISTS profiles (...);
CREATE TABLE IF NOT EXISTS posts (...);
CREATE TABLE IF NOT EXISTS likes (...);
CREATE TABLE IF NOT EXISTS follows (...);
-- ... бусад
```

✅ "Success. No rows returned" гэж гарвал амжилттай.

### 2.3 Table шалгах

```
Dashboard → Table Editor
```

4 table байх ёстой:
- `profiles`
- `posts`
- `likes`
- `follows`

---

## Алхам 3: Google OAuth тохируулах

### 3.1 Google Cloud Console

```
https://console.cloud.google.com/
```

### 3.2 Project үүсгэх/сонгох

```
Дээд талын dropdown → [New Project] эсвэл байгаа project сонгох
```

### 3.3 OAuth consent screen

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
│  App name:           Thread Platform                            │
│  User support email: your@email.com                             │
│  Developer contact:  your@email.com                             │
│                                                                 │
│  [Save and Continue] (3 удаа дарж дуусгана)                    │
└─────────────────────────────────────────────────────────────────┘
```

### 3.4 Credentials үүсгэх

```
APIs & Services → Credentials → [+ Create Credentials] → OAuth client ID
```

```
┌─────────────────────────────────────────────────────────────────┐
│  Create OAuth client ID                                         │
│                                                                 │
│  Application type: Web application                              │
│                                                                 │
│  Name: Thread Platform                                          │
│                                                                 │
│  Authorized redirect URIs:                                      │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  https://YOUR_PROJECT_ID.supabase.co/auth/v1/callback   │   │
│  └─────────────────────────────────────────────────────────┘   │
│  ↑ Supabase Dashboard-аас Project URL авч /auth/v1/callback    │
│    залгана                                                      │
│                                                                 │
│  [Create]                                                       │
└─────────────────────────────────────────────────────────────────┘
```

**Client ID** болон **Client Secret** хуулж авна.

### 3.5 Supabase дээр Google идэвхжүүлэх

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

## Алхам 4: Facebook OAuth тохируулах

### 4.1 Facebook Developers

```
https://developers.facebook.com/
```

### 4.2 App үүсгэх

```
My Apps → [Create App]
```

```
┌─────────────────────────────────────────────────────────────────┐
│  What do you want your app to do?                               │
│                                                                 │
│  ● Authenticate and request data from users with Facebook Login│
│                                                                 │
│  [Next]                                                         │
└─────────────────────────────────────────────────────────────────┘
```

```
┌─────────────────────────────────────────────────────────────────┐
│  App details                                                    │
│                                                                 │
│  Add an app name: Thread Platform                               │
│  App contact email: your@email.com                              │
│                                                                 │
│  [Create app]                                                   │
└─────────────────────────────────────────────────────────────────┘
```

### 4.3 Facebook Login тохируулах

```
App Dashboard → Add Product → Facebook Login → [Set Up]
```

```
Facebook Login → Settings
```

```
┌─────────────────────────────────────────────────────────────────┐
│  Valid OAuth Redirect URIs:                                     │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  https://YOUR_PROJECT_ID.supabase.co/auth/v1/callback   │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  [Save Changes]                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 4.4 App ID, Secret авах

```
Settings → Basic
```

- **App ID** - хуулах
- **App Secret** - [Show] дараад хуулах

### 4.5 Supabase дээр Facebook идэвхжүүлэх

```
Supabase Dashboard → Authentication → Providers → Facebook
```

```
┌─────────────────────────────────────────────────────────────────┐
│  Facebook                                              [Enable] │
│                                                                 │
│  Client ID (App ID):                                            │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  123456789012345                                        │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  Client Secret (App Secret):                                    │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx                       │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  [Save]                                                         │
└─────────────────────────────────────────────────────────────────┘
```

---

## Алхам 5: API Keys авах

### 5.1 Supabase API Settings

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

## Алхам 6: .env файл үүсгэх

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

## Алхам 7: App ажиллуулах

```bash
# Dependencies суулгах
npm install

# Development server
npm run dev
```

Browser дээр `http://localhost:5173` нээгдэнэ.

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
├── sql/
│   └── 001_init.sql      # Database migration
└── src/
    ├── main.jsx          # React entry
    ├── App.jsx           # Main component
    ├── App.css           # App styles
    ├── index.css         # Global styles
    └── supabaseClient.js # Supabase connection
```

---

# Түгээмэл алдаанууд

## "Invalid API key"

**Шийдэл:** `.env` файл дахь API keys зөв эсэхийг шалгана.

## "relation 'profiles' does not exist"

**Шийдэл:** `sql/001_init.sql` migration ажиллуулаагүй байна. SQL Editor дээр ажиллуулна.

## Google/Facebook login redirect ажиллахгүй

**Шийдэл:**
1. Redirect URI зөв эсэхийг шалгах: `https://YOUR_PROJECT_ID.supabase.co/auth/v1/callback`
2. Google Cloud / Facebook Developer console дээр URI нэмсэн эсэхийг шалгах
3. Supabase Providers дээр Client ID, Secret зөв эсэхийг шалгах

## "new row violates row-level security"

**Шийдэл:** Migration дотор RLS disable хийсэн. Дахин ажиллуулна:
```sql
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE posts DISABLE ROW LEVEL SECURITY;
ALTER TABLE likes DISABLE ROW LEVEL SECURITY;
ALTER TABLE follows DISABLE ROW LEVEL SECURITY;
```

---

# Week 15 Хичээлийн бүтэц

Энэ бүтэн project-ийг 5 хичээлээр заана:

| # | Сэдэв | Агуулга |
|---|-------|---------|
| 1 | **Supabase Intro** | Project үүсгэх, Migration, API keys |
| 2 | **Database Design** | profiles, posts, likes, follows tables |
| 3 | **Authentication** | Google/Facebook OAuth тохируулах |
| 4 | **Social Features** | Like, Follow, Realtime subscriptions |
| 5 | **UI & Deploy** | Profile засах, Vercel deploy |

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

**Амжилт хүсье!**
