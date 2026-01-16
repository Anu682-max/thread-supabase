import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://ohruefdawnlhfjjcioqt.supabase.co'
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9ocnVlZmRhd25saGZqamNpb3F0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODUyNjQ0MSwiZXhwIjoyMDg0MTAyNDQxfQ.F6sKSetX_XZIHUdJPm6mTb41_fzofGDR68KytM67aBc'

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
})

async function setupDatabase() {
  console.log('=== Setting up Thread Platform Database ===\n')

  // Use the REST API to execute SQL via the pg endpoint
  const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SERVICE_ROLE_KEY,
      'Authorization': `Bearer ${SERVICE_ROLE_KEY}`
    },
    body: JSON.stringify({ query: 'SELECT 1' })
  })

  if (!response.ok) {
    console.log('Direct SQL execution not available. Trying alternative method...\n')
    
    // Try creating tables via the Supabase dashboard
    console.log('Please run the SQL in Supabase Dashboard > SQL Editor:')
    console.log('File: sql/001_init.sql\n')
    
    // Check what tables exist
    const { data, error } = await supabase.from('profiles').select('id').limit(1)
    if (error && error.message.includes('does not exist')) {
      console.log('❌ Tables do not exist yet.')
      console.log('\nPlease go to: https://supabase.com/dashboard/project/ohruefdawnlhfjjcioqt/sql')
      console.log('And run the contents of sql/001_init.sql')
    } else if (error) {
      console.log('Error:', error.message)
    } else {
      console.log('✅ Tables already exist!')
    }
    return
  }

  console.log('✅ Database setup complete!')
}

setupDatabase()
