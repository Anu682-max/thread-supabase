import postgres from 'postgres'

const connectionString = 'postgresql://postgres:MEEM9k58dmDhKNgS@db.mpsxftupclabujyoomwg.supabase.co:5432/postgres'

const sql = postgres(connectionString, { ssl: 'require' })

async function runMigration() {
  console.log('Adding advanced social features...\n')

  try {
    // 1. Reposts table
    console.log('1. Creating reposts table...')
    await sql`
      CREATE TABLE IF NOT EXISTS reposts (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
        user_id UUID NOT NULL,
        quote TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(post_id, user_id)
      )
    `
    console.log('   ✓ reposts table created')

    // 2. Mentions table
    console.log('2. Creating mentions table...')
    await sql`
      CREATE TABLE IF NOT EXISTS mentions (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
        mentioned_user_id UUID NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `
    console.log('   ✓ mentions table created')

    // 3. Blocked users table
    console.log('3. Creating blocked_users table...')
    await sql`
      CREATE TABLE IF NOT EXISTS blocked_users (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        blocker_id UUID NOT NULL,
        blocked_id UUID NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(blocker_id, blocked_id)
      )
    `
    console.log('   ✓ blocked_users table created')

    // 4. Reports table
    console.log('4. Creating reports table...')
    await sql`
      CREATE TABLE IF NOT EXISTS reports (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        reporter_id UUID NOT NULL,
        post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
        user_id UUID,
        reason TEXT NOT NULL,
        status TEXT DEFAULT 'pending',
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `
    console.log('   ✓ reports table created')

    // 5. Add media_urls array to posts (for multiple images/videos)
    console.log('5. Adding media_urls to posts...')
    await sql`ALTER TABLE posts ADD COLUMN IF NOT EXISTS media_urls JSONB DEFAULT '[]'`
    await sql`ALTER TABLE posts ADD COLUMN IF NOT EXISTS media_type TEXT DEFAULT 'image'`
    console.log('   ✓ media_urls added')

    // 6. Add cover_url to profiles
    console.log('6. Adding cover_url to profiles...')
    await sql`ALTER TABLE profiles ADD COLUMN IF NOT EXISTS cover_url TEXT`
    await sql`ALTER TABLE profiles ADD COLUMN IF NOT EXISTS website TEXT`
    await sql`ALTER TABLE profiles ADD COLUMN IF NOT EXISTS location TEXT`
    console.log('   ✓ profile fields added')

    // 7. Link previews table
    console.log('7. Creating link_previews table...')
    await sql`
      CREATE TABLE IF NOT EXISTS link_previews (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        post_id UUID REFERENCES posts(id) ON DELETE CASCADE UNIQUE,
        url TEXT NOT NULL,
        title TEXT,
        description TEXT,
        image_url TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `
    console.log('   ✓ link_previews table created')

    // 8. Conversations table for DMs
    console.log('8. Creating conversations table...')
    await sql`
      CREATE TABLE IF NOT EXISTS conversations (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        user1_id UUID NOT NULL,
        user2_id UUID NOT NULL,
        last_message_at TIMESTAMPTZ DEFAULT NOW(),
        created_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(user1_id, user2_id)
      )
    `
    console.log('   ✓ conversations table created')

    // 9. Update messages table
    console.log('9. Updating messages table...')
    await sql`ALTER TABLE messages ADD COLUMN IF NOT EXISTS conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE`
    await sql`ALTER TABLE messages ADD COLUMN IF NOT EXISTS media_url TEXT`
    console.log('   ✓ messages updated')

    // 10. Saved collections (organize bookmarks)
    console.log('10. Creating collections table...')
    await sql`
      CREATE TABLE IF NOT EXISTS collections (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        user_id UUID NOT NULL,
        name TEXT NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `
    await sql`ALTER TABLE bookmarks ADD COLUMN IF NOT EXISTS collection_id UUID REFERENCES collections(id) ON DELETE SET NULL`
    console.log('   ✓ collections table created')

    // Enable RLS for new tables
    console.log('\n11. Enabling RLS policies...')
    const tables = ['reposts', 'mentions', 'blocked_users', 'reports', 'link_previews', 'conversations', 'collections']
    for (const table of tables) {
      await sql.unsafe(`ALTER TABLE ${table} ENABLE ROW LEVEL SECURITY`)
      await sql.unsafe(`DROP POLICY IF EXISTS "allow_all_${table}" ON ${table}`)
      await sql.unsafe(`
        CREATE POLICY "allow_all_${table}" ON ${table}
        FOR ALL TO public USING (true) WITH CHECK (true)
      `)
    }
    console.log('   ✓ RLS enabled')

    console.log('\nMigration completed!')

  } catch (err) {
    console.error('Migration failed:', err.message)
  } finally {
    await sql.end()
  }
}

runMigration()
