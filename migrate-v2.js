import postgres from 'postgres'

const connectionString = 'postgresql://postgres:MEEM9k58dmDhKNgS@db.mpsxftupclabujyoomwg.supabase.co:5432/postgres'

const sql = postgres(connectionString, { ssl: 'require' })

async function runMigration() {
  console.log('Adding new columns for Reddit-like features...\n')

  try {
    // Add image_url column to posts
    console.log('Adding image_url to posts...')
    await sql`ALTER TABLE posts ADD COLUMN IF NOT EXISTS image_url TEXT`
    console.log('  image_url added')

    // Add tags column to posts (as text array)
    console.log('Adding tags to posts...')
    await sql`ALTER TABLE posts ADD COLUMN IF NOT EXISTS tags TEXT[]`
    console.log('  tags added')

    // Create storage bucket for images (need to do this in Supabase dashboard)
    console.log('\n*** IMPORTANT: Create storage bucket in Supabase Dashboard ***')
    console.log('1. Go to Storage in Supabase Dashboard')
    console.log('2. Create new bucket called "post-images"')
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
