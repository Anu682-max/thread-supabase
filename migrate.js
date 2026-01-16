import postgres from 'postgres'

// Supabase PostgreSQL connection (Direct)
const connectionString = 'postgresql://postgres:_%2FBjNx%3F%23sZL63ps@db.ohruefdawnlhfjjcioqt.supabase.co:5432/postgres'

const sql = postgres(connectionString, {
  ssl: 'require'
})

async function runMigration() {
  console.log('Starting migration...\n')

  try {
    // 1. PROFILES TABLE
    console.log('Creating profiles table...')
    await sql`
      CREATE TABLE IF NOT EXISTS profiles (
        id TEXT PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        display_name TEXT,
        avatar_url TEXT,
        bio TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      )
    `
    console.log('profiles table created')

    // 2. COMMUNITIES TABLE
    console.log('Creating communities table...')
    await sql`
      CREATE TABLE IF NOT EXISTS communities (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL,
        slug TEXT UNIQUE NOT NULL,
        description TEXT,
        image_url TEXT,
        creator_id TEXT REFERENCES profiles(id) ON DELETE SET NULL,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `
    console.log('communities table created')

    // 3. COMMUNITY MEMBERS TABLE
    console.log('Creating community_members table...')
    await sql`
      CREATE TABLE IF NOT EXISTS community_members (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        community_id UUID NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
        user_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
        role TEXT DEFAULT 'member',
        joined_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(community_id, user_id)
      )
    `
    console.log('community_members table created')

    // 4. Add columns to posts table if they don't exist
    console.log('Updating posts table...')
    try {
      await sql`ALTER TABLE posts ADD COLUMN IF NOT EXISTS community_id UUID REFERENCES communities(id) ON DELETE SET NULL`
      console.log('  community_id column added')
    } catch (e) {
      console.log('  community_id:', e.message.includes('already exists') ? 'already exists' : e.message)
    }
    try {
      await sql`ALTER TABLE posts ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES posts(id) ON DELETE CASCADE`
      console.log('  parent_id column added')
    } catch (e) {
      console.log('  parent_id:', e.message.includes('already exists') ? 'already exists' : e.message)
    }

    // 5. LIKES TABLE
    console.log('Creating likes table...')
    await sql`
      CREATE TABLE IF NOT EXISTS likes (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
        post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(user_id, post_id)
      )
    `
    console.log('likes table created')

    // 6. FOLLOWS TABLE
    console.log('Creating follows table...')
    await sql`
      CREATE TABLE IF NOT EXISTS follows (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        follower_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
        following_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        CHECK (follower_id != following_id),
        UNIQUE(follower_id, following_id)
      )
    `
    console.log('follows table created')

    // 7. ACTIVITY TABLE
    console.log('Creating activity table...')
    await sql`
      CREATE TABLE IF NOT EXISTS activity (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        type TEXT NOT NULL,
        user_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
        target_user_id TEXT REFERENCES profiles(id) ON DELETE CASCADE,
        post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
        community_id UUID REFERENCES communities(id) ON DELETE CASCADE,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `
    console.log('activity table created')

    // 8. INDEXES
    console.log('Creating indexes...')
    await sql`CREATE INDEX IF NOT EXISTS idx_posts_user_id ON posts(user_id)`
    await sql`CREATE INDEX IF NOT EXISTS idx_posts_community_id ON posts(community_id)`
    await sql`CREATE INDEX IF NOT EXISTS idx_posts_parent_id ON posts(parent_id)`
    await sql`CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at DESC)`
    await sql`CREATE INDEX IF NOT EXISTS idx_likes_post_id ON likes(post_id)`
    await sql`CREATE INDEX IF NOT EXISTS idx_likes_user_id ON likes(user_id)`
    await sql`CREATE INDEX IF NOT EXISTS idx_follows_follower ON follows(follower_id)`
    await sql`CREATE INDEX IF NOT EXISTS idx_follows_following ON follows(following_id)`
    await sql`CREATE INDEX IF NOT EXISTS idx_community_members_community ON community_members(community_id)`
    await sql`CREATE INDEX IF NOT EXISTS idx_community_members_user ON community_members(user_id)`
    await sql`CREATE INDEX IF NOT EXISTS idx_activity_user ON activity(user_id)`
    await sql`CREATE INDEX IF NOT EXISTS idx_activity_target_user ON activity(target_user_id)`
    console.log('indexes created')

    // 9. DISABLE RLS
    console.log('Disabling RLS...')
    await sql`ALTER TABLE profiles DISABLE ROW LEVEL SECURITY`
    await sql`ALTER TABLE posts DISABLE ROW LEVEL SECURITY`
    await sql`ALTER TABLE likes DISABLE ROW LEVEL SECURITY`
    await sql`ALTER TABLE follows DISABLE ROW LEVEL SECURITY`
    await sql`ALTER TABLE communities DISABLE ROW LEVEL SECURITY`
    await sql`ALTER TABLE community_members DISABLE ROW LEVEL SECURITY`
    await sql`ALTER TABLE activity DISABLE ROW LEVEL SECURITY`
    console.log('RLS disabled')

    // 10. ENABLE REALTIME
    console.log('Enabling realtime...')
    const tables = ['posts', 'likes', 'follows', 'communities', 'community_members', 'activity']
    for (const table of tables) {
      try {
        await sql.unsafe(`ALTER PUBLICATION supabase_realtime ADD TABLE ${table}`)
        console.log(`  ${table} realtime enabled`)
      } catch (e) {
        if (e.message.includes('already')) console.log(`  ${table} realtime already enabled`)
        else console.log(`  ${table} realtime: ${e.message.split('\n')[0]}`)
      }
    }

    // 11. CREATE SAMPLE COMMUNITIES
    console.log('\nCreating sample communities...')
    await sql`
      INSERT INTO communities (name, slug, description, image_url) VALUES
        ('Mongol Coder', 'mongol-coder', 'Mongolian programmers community', 'https://api.dicebear.com/7.x/identicon/svg?seed=mongol-coder'),
        ('Tech Mongol', 'tech-mongol', 'Technology news and discussions', 'https://api.dicebear.com/7.x/identicon/svg?seed=tech-mongol'),
        ('Startup UB', 'startup-ub', 'Ulaanbaatar startup ecosystem', 'https://api.dicebear.com/7.x/identicon/svg?seed=startup-ub'),
        ('Design Mongolia', 'design-mongolia', 'Design and UI/UX discussions', 'https://api.dicebear.com/7.x/identicon/svg?seed=design-mongolia')
      ON CONFLICT (slug) DO NOTHING
    `
    console.log('Sample communities created')

    console.log('\nMigration completed successfully!\n')

    // Verify tables
    console.log('Tables in database:')
    const tableList = await sql`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `
    tableList.forEach(t => console.log(`  ${t.table_name}`))

  } catch (err) {
    console.error('Migration failed:', err.message)
  } finally {
    await sql.end()
  }
}

runMigration()
