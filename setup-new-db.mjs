import postgres from 'postgres'

// New Supabase project connection
const sql = postgres({
  host: 'db.ohruefdawnlhfjjcioqt.supabase.co',
  port: 5432,
  database: 'postgres',
  username: 'postgres',
  password: 'WDFBcKYU8KbHgee3',
  ssl: 'require'
})

async function runSetup() {
  console.log('=== Thread Platform Database Setup ===\n')

  try {
    // Test connection
    console.log('Testing connection...')
    const result = await sql`SELECT NOW() as time`
    console.log('Connected at:', result[0].time)
    console.log('')

    // 1. Enable UUID extension
    console.log('1. Enabling UUID extension...')
    await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`
    console.log('   Done')

    // 2. Create profiles table
    console.log('2. Creating profiles table...')
    await sql`
      CREATE TABLE IF NOT EXISTS profiles (
        id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
        username TEXT UNIQUE,
        full_name TEXT,
        avatar_url TEXT,
        bio TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      )
    `
    console.log('   Done')

    // 3. Create posts table
    console.log('3. Creating posts table...')
    await sql`
      CREATE TABLE IF NOT EXISTS posts (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
        content TEXT NOT NULL,
        image_url TEXT,
        community_id UUID,
        parent_id UUID REFERENCES posts(id) ON DELETE CASCADE,
        is_pinned BOOLEAN DEFAULT FALSE,
        edited_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      )
    `
    console.log('   Done')

    // 4. Create likes table
    console.log('4. Creating likes table...')
    await sql`
      CREATE TABLE IF NOT EXISTS likes (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
        post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(user_id, post_id)
      )
    `
    console.log('   Done')

    // 5. Create follows table
    console.log('5. Creating follows table...')
    await sql`
      CREATE TABLE IF NOT EXISTS follows (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        follower_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
        following_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(follower_id, following_id),
        CHECK (follower_id != following_id)
      )
    `
    console.log('   Done')

    // 6. Create communities table
    console.log('6. Creating communities table...')
    await sql`
      CREATE TABLE IF NOT EXISTS communities (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL,
        slug TEXT UNIQUE NOT NULL,
        description TEXT,
        image_url TEXT,
        creator_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `
    console.log('   Done')

    // Add foreign key to posts for community_id
    try {
      await sql`ALTER TABLE posts ADD CONSTRAINT posts_community_fk FOREIGN KEY (community_id) REFERENCES communities(id) ON DELETE SET NULL`
    } catch (e) {}

    // 7. Create community_members table
    console.log('7. Creating community_members table...')
    await sql`
      CREATE TABLE IF NOT EXISTS community_members (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        community_id UUID NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
        user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
        role TEXT DEFAULT 'member',
        joined_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(community_id, user_id)
      )
    `
    console.log('   Done')

    // 8. Create activity table
    console.log('8. Creating activity table...')
    await sql`
      CREATE TABLE IF NOT EXISTS activity (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        type TEXT NOT NULL,
        user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
        target_user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
        post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
        community_id UUID REFERENCES communities(id) ON DELETE CASCADE,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `
    console.log('   Done')

    // 9. Create bookmarks table
    console.log('9. Creating bookmarks table...')
    await sql`
      CREATE TABLE IF NOT EXISTS bookmarks (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
        post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(user_id, post_id)
      )
    `
    console.log('   Done')

    // 10. Create stories table
    console.log('10. Creating stories table...')
    await sql`
      CREATE TABLE IF NOT EXISTS stories (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
        content TEXT,
        media_url TEXT,
        media_type TEXT DEFAULT 'image',
        created_at TIMESTAMPTZ DEFAULT NOW(),
        expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '24 hours')
      )
    `
    console.log('   Done')

    // 11. Create story_views table
    console.log('11. Creating story_views table...')
    await sql`
      CREATE TABLE IF NOT EXISTS story_views (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        story_id UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
        viewer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
        viewed_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(story_id, viewer_id)
      )
    `
    console.log('   Done')

    // 12. Create messages table
    console.log('12. Creating messages table...')
    await sql`
      CREATE TABLE IF NOT EXISTS messages (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
        receiver_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
        content TEXT,
        image_url TEXT,
        is_read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `
    console.log('   Done')

    // 13. Create shares table
    console.log('13. Creating shares table...')
    await sql`
      CREATE TABLE IF NOT EXISTS shares (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
        post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
        quote TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(user_id, post_id)
      )
    `
    console.log('   Done')

    // 14. Create indexes
    console.log('14. Creating indexes...')
    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_posts_user_id ON posts(user_id)',
      'CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at DESC)',
      'CREATE INDEX IF NOT EXISTS idx_posts_community ON posts(community_id)',
      'CREATE INDEX IF NOT EXISTS idx_posts_parent ON posts(parent_id)',
      'CREATE INDEX IF NOT EXISTS idx_likes_post_id ON likes(post_id)',
      'CREATE INDEX IF NOT EXISTS idx_likes_user_id ON likes(user_id)',
      'CREATE INDEX IF NOT EXISTS idx_follows_follower ON follows(follower_id)',
      'CREATE INDEX IF NOT EXISTS idx_follows_following ON follows(following_id)',
      'CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id)',
      'CREATE INDEX IF NOT EXISTS idx_messages_receiver ON messages(receiver_id)',
      'CREATE INDEX IF NOT EXISTS idx_stories_user ON stories(user_id)',
      'CREATE INDEX IF NOT EXISTS idx_activity_user ON activity(user_id)',
      'CREATE INDEX IF NOT EXISTS idx_bookmarks_user ON bookmarks(user_id)'
    ]
    for (const idx of indexes) {
      await sql.unsafe(idx)
    }
    console.log('   Done')

    // 15. Create trigger function for new user
    console.log('15. Creating user signup trigger...')
    await sql.unsafe(`
      CREATE OR REPLACE FUNCTION handle_new_user()
      RETURNS TRIGGER AS $$
      BEGIN
        INSERT INTO profiles (id, username, full_name, avatar_url)
        VALUES (
          NEW.id,
          COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
          COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''),
          COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture', '')
        );
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql SECURITY DEFINER
    `)
    console.log('   Done')

    // 16. Create trigger
    console.log('16. Creating auth trigger...')
    await sql.unsafe(`DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users`)
    await sql.unsafe(`
      CREATE TRIGGER on_auth_user_created
        AFTER INSERT ON auth.users
        FOR EACH ROW EXECUTE FUNCTION handle_new_user()
    `)
    console.log('   Done')

    // 17. Enable RLS
    console.log('17. Enabling Row Level Security...')
    const tables = ['profiles', 'posts', 'likes', 'follows', 'communities', 'community_members', 'activity', 'bookmarks', 'stories', 'story_views', 'messages', 'shares']
    for (const table of tables) {
      await sql.unsafe(`ALTER TABLE ${table} ENABLE ROW LEVEL SECURITY`)
    }
    console.log('   Done')

    // 18. Create RLS policies
    console.log('18. Creating RLS policies...')

    // Helper to create policy safely
    async function createPolicy(name, table, operation, using, check = null) {
      try {
        await sql.unsafe(`DROP POLICY IF EXISTS "${name}" ON ${table}`)
        if (check) {
          await sql.unsafe(`CREATE POLICY "${name}" ON ${table} FOR ${operation} WITH CHECK (${check})`)
        } else {
          await sql.unsafe(`CREATE POLICY "${name}" ON ${table} FOR ${operation} USING (${using})`)
        }
      } catch (e) {
        console.log(`    Policy ${name}: ${e.message.split('\n')[0]}`)
      }
    }

    // Profiles policies
    await createPolicy('Public profiles', 'profiles', 'SELECT', 'true')
    await createPolicy('Users update own profile', 'profiles', 'UPDATE', 'auth.uid() = id')

    // Posts policies
    await createPolicy('Public posts', 'posts', 'SELECT', 'true')
    await createPolicy('Users create posts', 'posts', 'INSERT', null, 'auth.uid() = user_id')
    await createPolicy('Users update own posts', 'posts', 'UPDATE', 'auth.uid() = user_id')
    await createPolicy('Users delete own posts', 'posts', 'DELETE', 'auth.uid() = user_id')

    // Likes policies
    await createPolicy('Public likes', 'likes', 'SELECT', 'true')
    await createPolicy('Users create likes', 'likes', 'INSERT', null, 'auth.uid() = user_id')
    await createPolicy('Users delete own likes', 'likes', 'DELETE', 'auth.uid() = user_id')

    // Follows policies
    await createPolicy('Public follows', 'follows', 'SELECT', 'true')
    await createPolicy('Users create follows', 'follows', 'INSERT', null, 'auth.uid() = follower_id')
    await createPolicy('Users delete own follows', 'follows', 'DELETE', 'auth.uid() = follower_id')

    // Other tables - allow all for authenticated
    const otherTables = ['communities', 'community_members', 'activity', 'bookmarks', 'stories', 'story_views', 'messages', 'shares']
    for (const table of otherTables) {
      await createPolicy(`${table}_select`, table, 'SELECT', 'true')
      await createPolicy(`${table}_insert`, table, 'INSERT', null, 'auth.uid() IS NOT NULL')
      await createPolicy(`${table}_update`, table, 'UPDATE', 'auth.uid() IS NOT NULL')
      await createPolicy(`${table}_delete`, table, 'DELETE', 'auth.uid() IS NOT NULL')
    }
    console.log('   Done')

    // 19. Grant permissions
    console.log('19. Granting permissions...')
    await sql`GRANT USAGE ON SCHEMA public TO anon, authenticated`
    await sql`GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated`
    await sql`GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated`
    console.log('   Done')

    // 20. Enable realtime
    console.log('20. Enabling realtime...')
    const realtimeTables = ['posts', 'likes', 'follows', 'messages', 'activity', 'stories']
    for (const table of realtimeTables) {
      try {
        await sql.unsafe(`ALTER PUBLICATION supabase_realtime ADD TABLE ${table}`)
        console.log(`    ${table}: enabled`)
      } catch (e) {
        if (e.message.includes('already member')) {
          console.log(`    ${table}: already enabled`)
        }
      }
    }

    // 21. Create sample communities
    console.log('21. Creating sample communities...')
    await sql`
      INSERT INTO communities (name, slug, description, image_url) VALUES
        ('Mongol Coder', 'mongol-coder', 'Mongolian programmers community', 'https://api.dicebear.com/7.x/identicon/svg?seed=mongol-coder'),
        ('Tech Mongol', 'tech-mongol', 'Technology news and discussions', 'https://api.dicebear.com/7.x/identicon/svg?seed=tech-mongol'),
        ('Startup UB', 'startup-ub', 'Ulaanbaatar startup ecosystem', 'https://api.dicebear.com/7.x/identicon/svg?seed=startup-ub')
      ON CONFLICT (slug) DO NOTHING
    `
    console.log('   Done')

    // Verify
    console.log('\n=== Verification ===')
    const tableList = await sql`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `
    console.log('Tables created:')
    tableList.forEach(t => console.log('  -', t.table_name))

    console.log('\n=== Setup Complete! ===')
    console.log('Database URL: https://ohruefdawnlhfjjcioqt.supabase.co')

  } catch (err) {
    console.error('\nSetup failed:', err.message)
  } finally {
    await sql.end()
  }
}

runSetup()
