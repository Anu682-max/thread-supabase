import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://ohruefdawnlhfjjcioqt.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9ocnVlZmRhd25saGZqamNpb3F0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg1MjY0NDEsImV4cCI6MjA4NDEwMjQ0MX0.jmmt1-VyQLLWmjjI6RGgKucRQlBAFqPMdSB7UY1O-l4'
)

async function checkDatabase() {
  console.log('=== Supabase Database Check ===\n')

  // Check profiles table
  const { data: profiles, error: profilesErr } = await supabase
    .from('profiles')
    .select('*')
    .limit(5)

  if (profilesErr) {
    console.log('❌ profiles table:', profilesErr.message)
  } else {
    console.log('✅ profiles table exists -', profiles.length, 'rows')
  }

  // Check posts table
  const { data: posts, error: postsErr } = await supabase
    .from('posts')
    .select('*')
    .limit(5)

  if (postsErr) {
    console.log('❌ posts table:', postsErr.message)
  } else {
    console.log('✅ posts table exists -', posts.length, 'rows')
  }

  // Check likes table
  const { data: likes, error: likesErr } = await supabase
    .from('likes')
    .select('*')
    .limit(5)

  if (likesErr) {
    console.log('❌ likes table:', likesErr.message)
  } else {
    console.log('✅ likes table exists -', likes.length, 'rows')
  }

  // Check follows table
  const { data: follows, error: followsErr } = await supabase
    .from('follows')
    .select('*')
    .limit(5)

  if (followsErr) {
    console.log('❌ follows table:', followsErr.message)
  } else {
    console.log('✅ follows table exists -', follows.length, 'rows')
  }

  console.log('\n=== Check Complete ===')
}

checkDatabase()
