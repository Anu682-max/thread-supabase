import postgres from 'postgres'

const connectionString = 'postgresql://postgres:MEEM9k58dmDhKNgS@db.mpsxftupclabujyoomwg.supabase.co:5432/postgres'

const sql = postgres(connectionString, { ssl: 'require' })

async function runMigration() {
  console.log('Adding advanced features v5...\n')

  try {
    // 1. Post editing
    console.log('1. Adding edit support to posts...')
    await sql`ALTER TABLE posts ADD COLUMN IF NOT EXISTS edited_at TIMESTAMPTZ`
    await sql`ALTER TABLE posts ADD COLUMN IF NOT EXISTS is_pinned BOOLEAN DEFAULT false`
    await sql`ALTER TABLE posts ADD COLUMN IF NOT EXISTS scheduled_at TIMESTAMPTZ`
    await sql`ALTER TABLE posts ADD COLUMN IF NOT EXISTS thread_id UUID`
    await sql`ALTER TABLE posts ADD COLUMN IF NOT EXISTS thread_position INTEGER`
    await sql`ALTER TABLE posts ADD COLUMN IF NOT EXISTS visibility TEXT DEFAULT 'public'`
    console.log('   ✓ posts updated')

    // 2. Drafts table
    console.log('2. Creating drafts table...')
    await sql`
      CREATE TABLE IF NOT EXISTS drafts (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        user_id UUID NOT NULL,
        content TEXT,
        media_urls JSONB DEFAULT '[]',
        tags TEXT[],
        poll_data JSONB,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      )
    `
    console.log('   ✓ drafts table created')

    // 3. Messages enhancements
    console.log('3. Enhancing messages table...')
    await sql`ALTER TABLE messages ADD COLUMN IF NOT EXISTS voice_url TEXT`
    await sql`ALTER TABLE messages ADD COLUMN IF NOT EXISTS read_at TIMESTAMPTZ`
    await sql`ALTER TABLE messages ADD COLUMN IF NOT EXISTS message_type TEXT DEFAULT 'text'`
    await sql`ALTER TABLE messages ADD COLUMN IF NOT EXISTS gif_url TEXT`
    await sql`ALTER TABLE messages ADD COLUMN IF NOT EXISTS reply_to_id UUID REFERENCES messages(id)`
    console.log('   ✓ messages enhanced')

    // 4. Online status / presence
    console.log('4. Adding presence support...')
    await sql`ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_seen TIMESTAMPTZ DEFAULT NOW()`
    await sql`ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_online BOOLEAN DEFAULT false`
    await sql`ALTER TABLE profiles ADD COLUMN IF NOT EXISTS accent_color TEXT DEFAULT '#1d9bf0'`
    await sql`ALTER TABLE profiles ADD COLUMN IF NOT EXISTS theme TEXT DEFAULT 'dark'`
    console.log('   ✓ presence support added')

    // 5. Close friends
    console.log('5. Creating close_friends table...')
    await sql`
      CREATE TABLE IF NOT EXISTS close_friends (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        user_id UUID NOT NULL,
        friend_id UUID NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(user_id, friend_id)
      )
    `
    console.log('   ✓ close_friends table created')

    // 6. Story highlights
    console.log('6. Creating highlights table...')
    await sql`
      CREATE TABLE IF NOT EXISTS highlights (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        user_id UUID NOT NULL,
        name TEXT NOT NULL,
        cover_url TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `
    await sql`
      CREATE TABLE IF NOT EXISTS highlight_stories (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        highlight_id UUID REFERENCES highlights(id) ON DELETE CASCADE,
        story_id UUID REFERENCES stories(id) ON DELETE CASCADE,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `
    console.log('   ✓ highlights tables created')

    // 7. Topics/Interests
    console.log('7. Creating topics tables...')
    await sql`
      CREATE TABLE IF NOT EXISTS topics (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        name TEXT NOT NULL UNIQUE,
        description TEXT,
        icon TEXT,
        post_count INTEGER DEFAULT 0,
        follower_count INTEGER DEFAULT 0,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `
    await sql`
      CREATE TABLE IF NOT EXISTS user_topics (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        user_id UUID NOT NULL,
        topic_id UUID REFERENCES topics(id) ON DELETE CASCADE,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(user_id, topic_id)
      )
    `
    await sql`ALTER TABLE posts ADD COLUMN IF NOT EXISTS topic_id UUID REFERENCES topics(id)`
    console.log('   ✓ topics tables created')

    // 8. Muted keywords
    console.log('8. Creating muted_keywords table...')
    await sql`
      CREATE TABLE IF NOT EXISTS muted_keywords (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        user_id UUID NOT NULL,
        keyword TEXT NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(user_id, keyword)
      )
    `
    console.log('   ✓ muted_keywords table created')

    // 9. Lists
    console.log('9. Creating lists tables...')
    await sql`
      CREATE TABLE IF NOT EXISTS lists (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        user_id UUID NOT NULL,
        name TEXT NOT NULL,
        description TEXT,
        is_private BOOLEAN DEFAULT false,
        cover_url TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `
    await sql`
      CREATE TABLE IF NOT EXISTS list_members (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        list_id UUID REFERENCES lists(id) ON DELETE CASCADE,
        member_id UUID NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(list_id, member_id)
      )
    `
    console.log('   ✓ lists tables created')

    // 10. Tips/Donations
    console.log('10. Creating tips table...')
    await sql`
      CREATE TABLE IF NOT EXISTS tips (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        sender_id UUID NOT NULL,
        receiver_id UUID NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        message TEXT,
        post_id UUID REFERENCES posts(id) ON DELETE SET NULL,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `
    console.log('   ✓ tips table created')

    // 11. Subscriptions
    console.log('11. Creating subscriptions table...')
    await sql`
      CREATE TABLE IF NOT EXISTS creator_subscriptions (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        subscriber_id UUID NOT NULL,
        creator_id UUID NOT NULL,
        tier TEXT DEFAULT 'basic',
        amount DECIMAL(10,2),
        started_at TIMESTAMPTZ DEFAULT NOW(),
        expires_at TIMESTAMPTZ,
        is_active BOOLEAN DEFAULT true,
        UNIQUE(subscriber_id, creator_id)
      )
    `
    await sql`ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subscription_price DECIMAL(10,2)`
    await sql`ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_creator BOOLEAN DEFAULT false`
    console.log('   ✓ subscriptions table created')

    // 12. Notification settings
    console.log('12. Creating notification_settings table...')
    await sql`
      CREATE TABLE IF NOT EXISTS notification_settings (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        user_id UUID NOT NULL UNIQUE,
        likes BOOLEAN DEFAULT true,
        comments BOOLEAN DEFAULT true,
        follows BOOLEAN DEFAULT true,
        mentions BOOLEAN DEFAULT true,
        dms BOOLEAN DEFAULT true,
        tips BOOLEAN DEFAULT true,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `
    console.log('   ✓ notification_settings table created')

    // 13. Add unread count to activity
    console.log('13. Adding unread support to activity...')
    await sql`ALTER TABLE activity ADD COLUMN IF NOT EXISTS is_read BOOLEAN DEFAULT false`
    console.log('   ✓ activity updated')

    // 14. Add default topics
    console.log('14. Adding default topics...')
    const topics = ['Technology', 'Sports', 'Music', 'Gaming', 'News', 'Art', 'Food', 'Travel', 'Fashion', 'Science', 'Movies', 'Books', 'Fitness', 'Business', 'Crypto']
    for (const topic of topics) {
      await sql`INSERT INTO topics (name) VALUES (${topic}) ON CONFLICT (name) DO NOTHING`
    }
    console.log('   ✓ default topics added')

    // 15. Enable RLS
    console.log('\n15. Enabling RLS policies...')
    const tables = ['drafts', 'close_friends', 'highlights', 'highlight_stories', 'topics', 'user_topics', 'muted_keywords', 'lists', 'list_members', 'tips', 'creator_subscriptions', 'notification_settings']
    for (const table of tables) {
      await sql.unsafe(`ALTER TABLE ${table} ENABLE ROW LEVEL SECURITY`)
      await sql.unsafe(`DROP POLICY IF EXISTS "allow_all_${table}" ON ${table}`)
      await sql.unsafe(`
        CREATE POLICY "allow_all_${table}" ON ${table}
        FOR ALL TO public USING (true) WITH CHECK (true)
      `)
    }
    console.log('   ✓ RLS enabled')

    console.log('\nMigration v5 completed!')

  } catch (err) {
    console.error('Migration failed:', err.message)
  } finally {
    await sql.end()
  }
}

runMigration()
