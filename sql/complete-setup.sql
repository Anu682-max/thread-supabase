-- ChatLay - Complete Database Setup
-- Copy and paste this entire file into Supabase SQL Editor
-- Project: https://ixinwunrwipficopwnfh.supabase.co

-- 1. Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create posts table
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
);

-- 4. Create likes table
CREATE TABLE IF NOT EXISTS likes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, post_id)
);

-- 5. Create follows table
CREATE TABLE IF NOT EXISTS follows (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  follower_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(follower_id, following_id),
  CHECK (follower_id != following_id)
);

-- 6. Create communities table
CREATE TABLE IF NOT EXISTS communities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  image_url TEXT,
  creator_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add foreign key to posts for community_id
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'posts_community_fk'
  ) THEN
    ALTER TABLE posts ADD CONSTRAINT posts_community_fk
      FOREIGN KEY (community_id) REFERENCES communities(id) ON DELETE SET NULL;
  END IF;
END $$;

-- 7. Create community_members table
CREATE TABLE IF NOT EXISTS community_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id UUID NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member',
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(community_id, user_id)
);

-- 8. Create activity table
CREATE TABLE IF NOT EXISTS activity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  target_user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  community_id UUID REFERENCES communities(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Create bookmarks table
CREATE TABLE IF NOT EXISTS bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, post_id)
);

-- 10. Create stories table
CREATE TABLE IF NOT EXISTS stories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT,
  media_url TEXT,
  media_type TEXT DEFAULT 'image',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '24 hours')
);

-- 11. Create story_views table
CREATE TABLE IF NOT EXISTS story_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
  viewer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  viewed_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(story_id, viewer_id)
);

-- 12. Create messages table
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT,
  image_url TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. Create shares table
CREATE TABLE IF NOT EXISTS shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  quote TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, post_id)
);

-- 14. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_posts_user_id ON posts(user_id);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_community ON posts(community_id);
CREATE INDEX IF NOT EXISTS idx_posts_parent ON posts(parent_id);
CREATE INDEX IF NOT EXISTS idx_likes_post_id ON likes(post_id);
CREATE INDEX IF NOT EXISTS idx_likes_user_id ON likes(user_id);
CREATE INDEX IF NOT EXISTS idx_follows_follower ON follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_following ON follows(following_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_receiver ON messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_stories_user ON stories(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_user ON activity(user_id);
CREATE INDEX IF NOT EXISTS idx_bookmarks_user ON bookmarks(user_id);

-- 15. Create trigger function for new user
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 16. Create trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- 17. Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE communities ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE story_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE shares ENABLE ROW LEVEL SECURITY;

-- 18. Create RLS policies

-- Profiles policies
DROP POLICY IF EXISTS "Public profiles" ON profiles;
CREATE POLICY "Public profiles" ON profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users update own profile" ON profiles;
CREATE POLICY "Users update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Posts policies
DROP POLICY IF EXISTS "Public posts" ON posts;
CREATE POLICY "Public posts" ON posts FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users create posts" ON posts;
CREATE POLICY "Users create posts" ON posts FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users update own posts" ON posts;
CREATE POLICY "Users update own posts" ON posts FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users delete own posts" ON posts;
CREATE POLICY "Users delete own posts" ON posts FOR DELETE USING (auth.uid() = user_id);

-- Likes policies
DROP POLICY IF EXISTS "Public likes" ON likes;
CREATE POLICY "Public likes" ON likes FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users create likes" ON likes;
CREATE POLICY "Users create likes" ON likes FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users delete own likes" ON likes;
CREATE POLICY "Users delete own likes" ON likes FOR DELETE USING (auth.uid() = user_id);

-- Follows policies
DROP POLICY IF EXISTS "Public follows" ON follows;
CREATE POLICY "Public follows" ON follows FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users create follows" ON follows;
CREATE POLICY "Users create follows" ON follows FOR INSERT WITH CHECK (auth.uid() = follower_id);

DROP POLICY IF EXISTS "Users delete own follows" ON follows;
CREATE POLICY "Users delete own follows" ON follows FOR DELETE USING (auth.uid() = follower_id);

-- Communities policies
DROP POLICY IF EXISTS "communities_select" ON communities;
CREATE POLICY "communities_select" ON communities FOR SELECT USING (true);

DROP POLICY IF EXISTS "communities_insert" ON communities;
CREATE POLICY "communities_insert" ON communities FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "communities_update" ON communities;
CREATE POLICY "communities_update" ON communities FOR UPDATE USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "communities_delete" ON communities;
CREATE POLICY "communities_delete" ON communities FOR DELETE USING (auth.uid() IS NOT NULL);

-- Community members policies
DROP POLICY IF EXISTS "community_members_select" ON community_members;
CREATE POLICY "community_members_select" ON community_members FOR SELECT USING (true);

DROP POLICY IF EXISTS "community_members_insert" ON community_members;
CREATE POLICY "community_members_insert" ON community_members FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "community_members_update" ON community_members;
CREATE POLICY "community_members_update" ON community_members FOR UPDATE USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "community_members_delete" ON community_members;
CREATE POLICY "community_members_delete" ON community_members FOR DELETE USING (auth.uid() IS NOT NULL);

-- Activity policies
DROP POLICY IF EXISTS "activity_select" ON activity;
CREATE POLICY "activity_select" ON activity FOR SELECT USING (true);

DROP POLICY IF EXISTS "activity_insert" ON activity;
CREATE POLICY "activity_insert" ON activity FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "activity_update" ON activity;
CREATE POLICY "activity_update" ON activity FOR UPDATE USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "activity_delete" ON activity;
CREATE POLICY "activity_delete" ON activity FOR DELETE USING (auth.uid() IS NOT NULL);

-- Bookmarks policies
DROP POLICY IF EXISTS "bookmarks_select" ON bookmarks;
CREATE POLICY "bookmarks_select" ON bookmarks FOR SELECT USING (true);

DROP POLICY IF EXISTS "bookmarks_insert" ON bookmarks;
CREATE POLICY "bookmarks_insert" ON bookmarks FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "bookmarks_update" ON bookmarks;
CREATE POLICY "bookmarks_update" ON bookmarks FOR UPDATE USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "bookmarks_delete" ON bookmarks;
CREATE POLICY "bookmarks_delete" ON bookmarks FOR DELETE USING (auth.uid() IS NOT NULL);

-- Stories policies
DROP POLICY IF EXISTS "stories_select" ON stories;
CREATE POLICY "stories_select" ON stories FOR SELECT USING (true);

DROP POLICY IF EXISTS "stories_insert" ON stories;
CREATE POLICY "stories_insert" ON stories FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "stories_update" ON stories;
CREATE POLICY "stories_update" ON stories FOR UPDATE USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "stories_delete" ON stories;
CREATE POLICY "stories_delete" ON stories FOR DELETE USING (auth.uid() IS NOT NULL);

-- Story views policies
DROP POLICY IF EXISTS "story_views_select" ON story_views;
CREATE POLICY "story_views_select" ON story_views FOR SELECT USING (true);

DROP POLICY IF EXISTS "story_views_insert" ON story_views;
CREATE POLICY "story_views_insert" ON story_views FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "story_views_update" ON story_views;
CREATE POLICY "story_views_update" ON story_views FOR UPDATE USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "story_views_delete" ON story_views;
CREATE POLICY "story_views_delete" ON story_views FOR DELETE USING (auth.uid() IS NOT NULL);

-- Messages policies
DROP POLICY IF EXISTS "messages_select" ON messages;
CREATE POLICY "messages_select" ON messages FOR SELECT USING (true);

DROP POLICY IF EXISTS "messages_insert" ON messages;
CREATE POLICY "messages_insert" ON messages FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "messages_update" ON messages;
CREATE POLICY "messages_update" ON messages FOR UPDATE USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "messages_delete" ON messages;
CREATE POLICY "messages_delete" ON messages FOR DELETE USING (auth.uid() IS NOT NULL);

-- Shares policies
DROP POLICY IF EXISTS "shares_select" ON shares;
CREATE POLICY "shares_select" ON shares FOR SELECT USING (true);

DROP POLICY IF EXISTS "shares_insert" ON shares;
CREATE POLICY "shares_insert" ON shares FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "shares_update" ON shares;
CREATE POLICY "shares_update" ON shares FOR UPDATE USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "shares_delete" ON shares;
CREATE POLICY "shares_delete" ON shares FOR DELETE USING (auth.uid() IS NOT NULL);

-- 19. Grant permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- 20. Enable realtime (Note: This may require additional permissions)
-- You may need to enable these manually in Supabase Dashboard > Database > Replication
-- ALTER PUBLICATION supabase_realtime ADD TABLE posts;
-- ALTER PUBLICATION supabase_realtime ADD TABLE likes;
-- ALTER PUBLICATION supabase_realtime ADD TABLE follows;
-- ALTER PUBLICATION supabase_realtime ADD TABLE messages;
-- ALTER PUBLICATION supabase_realtime ADD TABLE activity;
-- ALTER PUBLICATION supabase_realtime ADD TABLE stories;

-- 21. Create sample communities
INSERT INTO communities (name, slug, description, image_url) VALUES
  ('Mongol Coder', 'mongol-coder', 'Mongolian programmers community', 'https://api.dicebear.com/7.x/identicon/svg?seed=mongol-coder'),
  ('Tech Mongol', 'tech-mongol', 'Technology news and discussions', 'https://api.dicebear.com/7.x/identicon/svg?seed=tech-mongol'),
  ('Startup UB', 'startup-ub', 'Ulaanbaatar startup ecosystem', 'https://api.dicebear.com/7.x/identicon/svg?seed=startup-ub')
ON CONFLICT (slug) DO NOTHING;

-- Setup complete!
-- Next steps:
-- 1. Enable Realtime in Supabase Dashboard > Database > Replication
-- 2. Configure Google OAuth in Authentication > Providers
