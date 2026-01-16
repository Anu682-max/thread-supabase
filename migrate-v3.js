import postgres from 'postgres'

const connectionString = 'postgresql://postgres:MEEM9k58dmDhKNgS@db.mpsxftupclabujyoomwg.supabase.co:5432/postgres'

const sql = postgres(connectionString, { ssl: 'require' })

async function runMigration() {
  console.log('Adding modern social platform features...\n')

  try {
    // 1. Add is_verified to profiles
    console.log('1. Adding is_verified to profiles...')
    await sql`ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE`
    console.log('   ✓ is_verified added')

    // 2. Create bookmarks table
    console.log('2. Creating bookmarks table...')
    await sql`
      CREATE TABLE IF NOT EXISTS bookmarks (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        user_id UUID NOT NULL,
        post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(user_id, post_id)
      )
    `
    console.log('   ✓ bookmarks table created')

    // 3. Create stories table
    console.log('3. Creating stories table...')
    await sql`
      CREATE TABLE IF NOT EXISTS stories (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        user_id UUID NOT NULL,
        image_url TEXT NOT NULL,
        caption TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '24 hours')
      )
    `
    console.log('   ✓ stories table created')

    // 4. Create story_views table
    console.log('4. Creating story_views table...')
    await sql`
      CREATE TABLE IF NOT EXISTS story_views (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        story_id UUID REFERENCES stories(id) ON DELETE CASCADE,
        user_id UUID NOT NULL,
        viewed_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(story_id, user_id)
      )
    `
    console.log('   ✓ story_views table created')

    // 5. Create polls table
    console.log('5. Creating polls table...')
    await sql`
      CREATE TABLE IF NOT EXISTS polls (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        post_id UUID REFERENCES posts(id) ON DELETE CASCADE UNIQUE,
        question TEXT NOT NULL,
        options JSONB NOT NULL DEFAULT '[]',
        ends_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `
    console.log('   ✓ polls table created')

    // 6. Create poll_votes table
    console.log('6. Creating poll_votes table...')
    await sql`
      CREATE TABLE IF NOT EXISTS poll_votes (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        poll_id UUID REFERENCES polls(id) ON DELETE CASCADE,
        user_id UUID NOT NULL,
        option_index INTEGER NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(poll_id, user_id)
      )
    `
    console.log('   ✓ poll_votes table created')

    // 7. Create reactions table (emoji reactions beyond likes)
    console.log('7. Creating reactions table...')
    await sql`
      CREATE TABLE IF NOT EXISTS reactions (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
        user_id UUID NOT NULL,
        reaction_type TEXT NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(post_id, user_id)
      )
    `
    console.log('   ✓ reactions table created')

    // 8. Create post_views table
    console.log('8. Creating post_views table...')
    await sql`
      CREATE TABLE IF NOT EXISTS post_views (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
        user_id UUID NOT NULL,
        viewed_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(post_id, user_id)
      )
    `
    console.log('   ✓ post_views table created')

    // 9. Create messages table (DMs)
    console.log('9. Creating messages table...')
    await sql`
      CREATE TABLE IF NOT EXISTS messages (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        sender_id UUID NOT NULL,
        receiver_id UUID NOT NULL,
        content TEXT NOT NULL,
        is_read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `
    console.log('   ✓ messages table created')

    // 10. Add view_count to posts
    console.log('10. Adding view_count to posts...')
    await sql`ALTER TABLE posts ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0`
    console.log('   ✓ view_count added')

    // 11. Create shares table
    console.log('11. Creating shares table...')
    await sql`
      CREATE TABLE IF NOT EXISTS shares (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
        user_id UUID NOT NULL,
        share_type TEXT DEFAULT 'copy',
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `
    console.log('   ✓ shares table created')

    // Enable RLS for new tables
    console.log('\n12. Enabling RLS policies...')
    const tables = ['bookmarks', 'stories', 'story_views', 'polls', 'poll_votes', 'reactions', 'post_views', 'messages', 'shares']
    for (const table of tables) {
      await sql`ALTER TABLE ${sql(table)} ENABLE ROW LEVEL SECURITY`
      await sql.unsafe(`
        CREATE POLICY IF NOT EXISTS "${table}_all_policy" ON ${table}
        FOR ALL USING (true) WITH CHECK (true)
      `).catch(() => {})
    }
    console.log('   ✓ RLS enabled')

    console.log('\n*** IMPORTANT: Create storage bucket for stories ***')
    console.log('1. Go to Storage in Supabase Dashboard')
    console.log('2. Create new bucket called "stories"')
    console.log('3. Make it PUBLIC')
    console.log('4. Add policy: Allow all for SELECT, INSERT, UPDATE, DELETE\n')

    console.log('Migration completed!')

  } catch (err) {
    console.error('Migration failed:', err.message)
  } finally {
    await sql.end()
  }
}

runMigration()
