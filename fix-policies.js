import postgres from 'postgres'

const sql = postgres({
  host: 'db.ohruefdawnlhfjjcioqt.supabase.co',
  port: 5432,
  database: 'postgres',
  username: 'postgres',
  password: 'WDFBcKYU8KbHgee3',
  ssl: 'require'
})

async function fixPolicies() {
  console.log('Fixing RLS policies for all tables...\n')

  const tables = [
    'profiles',
    'posts',
    'likes',
    'follows',
    'communities',
    'community_members',
    'activity',
    'bookmarks',
    'stories',
    'story_views',
    'messages',
    'shares'
  ]

  for (const table of tables) {
    try {
      console.log(`Fixing ${table}...`)

      // Enable RLS
      await sql.unsafe(`ALTER TABLE ${table} ENABLE ROW LEVEL SECURITY`)

      // Drop existing policies
      await sql.unsafe(`DROP POLICY IF EXISTS "${table}_select_policy" ON ${table}`)
      await sql.unsafe(`DROP POLICY IF EXISTS "${table}_insert_policy" ON ${table}`)
      await sql.unsafe(`DROP POLICY IF EXISTS "${table}_update_policy" ON ${table}`)
      await sql.unsafe(`DROP POLICY IF EXISTS "${table}_delete_policy" ON ${table}`)
      await sql.unsafe(`DROP POLICY IF EXISTS "${table}_all_policy" ON ${table}`)
      await sql.unsafe(`DROP POLICY IF EXISTS "Allow all for ${table}" ON ${table}`)
      await sql.unsafe(`DROP POLICY IF EXISTS "Enable all for ${table}" ON ${table}`)

      // Create simple allow all policy
      await sql.unsafe(`
        CREATE POLICY "allow_all_${table}" ON ${table}
        FOR ALL
        TO public
        USING (true)
        WITH CHECK (true)
      `)

      console.log(`  ✓ ${table} fixed`)
    } catch (err) {
      console.log(`  ! ${table}: ${err.message}`)
    }
  }

  console.log('\nDone!')
  await sql.end()
}

fixPolicies()
