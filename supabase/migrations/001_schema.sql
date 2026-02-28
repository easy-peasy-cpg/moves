-- Moves App Schema
-- Run this in the Supabase SQL editor

-- User profiles (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  avatar_url TEXT,
  bio TEXT,
  city TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Seasons (a challenge period with a crew)
CREATE TABLE IF NOT EXISTS seasons (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  created_by UUID REFERENCES profiles(id) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  draft_status TEXT NOT NULL DEFAULT 'pre_draft' CHECK (draft_status IN ('pre_draft', 'drafting', 'completed')),
  draft_started_at TIMESTAMPTZ,
  current_drafter_id UUID REFERENCES profiles(id),
  current_round INTEGER DEFAULT 1,
  current_pick INTEGER DEFAULT 1,
  invite_code TEXT UNIQUE NOT NULL,
  seconds_per_pick INTEGER DEFAULT 60,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Season members (the crew)
CREATE TABLE IF NOT EXISTS season_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  season_id UUID REFERENCES seasons(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) NOT NULL,
  join_order INTEGER NOT NULL,
  moves_completed INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(season_id, user_id)
);

-- The Move Pool (all available moves for a season's draft)
CREATE TABLE IF NOT EXISTS move_pool (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  season_id UUID REFERENCES seasons(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL CHECK (category IN (
    'physical', 'personal', 'professional',
    'social', 'creative', 'adventure', 'wildcard'
  )),
  submitted_by UUID REFERENCES profiles(id),
  is_collab BOOLEAN DEFAULT false,
  is_app_suggested BOOLEAN DEFAULT false,
  is_drafted BOOLEAN DEFAULT false,
  drafted_by UUID REFERENCES profiles(id),
  draft_round INTEGER,
  draft_pick INTEGER,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Drafted moves (each person's 20 moves for the season)
CREATE TABLE IF NOT EXISTS drafted_moves (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  season_id UUID REFERENCES seasons(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) NOT NULL,
  move_pool_id UUID REFERENCES move_pool(id) NOT NULL,
  is_completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  completion_photo_url TEXT,
  completion_story TEXT,
  collab_partner_id UUID REFERENCES profiles(id),
  draft_round INTEGER NOT NULL,
  draft_pick INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Feed posts (auto-created when a Move is completed)
CREATE TABLE IF NOT EXISTS feed_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  season_id UUID REFERENCES seasons(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) NOT NULL,
  drafted_move_id UUID REFERENCES drafted_moves(id) NOT NULL,
  celebration_prompt TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Comments on feed posts
CREATE TABLE IF NOT EXISTS comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  feed_post_id UUID REFERENCES feed_posts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Nudges
CREATE TABLE IF NOT EXISTS nudges (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  season_id UUID REFERENCES seasons(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID REFERENCES profiles(id) NOT NULL,
  receiver_id UUID REFERENCES profiles(id) NOT NULL,
  drafted_move_id UUID REFERENCES drafted_moves(id) NOT NULL,
  message TEXT DEFAULT 'Your move.',
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Notifications (in-app only)
CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) NOT NULL,
  type TEXT NOT NULL CHECK (type IN (
    'season_invite', 'draft_starting', 'draft_your_turn',
    'move_completed', 'comment', 'nudge', 'collab_tagged',
    'season_ended', 'first_mover'
  )),
  actor_id UUID REFERENCES profiles(id),
  season_id UUID REFERENCES seasons(id) ON DELETE CASCADE,
  reference_id UUID,
  message TEXT,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_season_members_user ON season_members(user_id);
CREATE INDEX IF NOT EXISTS idx_season_members_season ON season_members(season_id);
CREATE INDEX IF NOT EXISTS idx_move_pool_season ON move_pool(season_id);
CREATE INDEX IF NOT EXISTS idx_drafted_moves_season_user ON drafted_moves(season_id, user_id);
CREATE INDEX IF NOT EXISTS idx_feed_posts_season ON feed_posts(season_id);
CREATE INDEX IF NOT EXISTS idx_comments_post ON comments(feed_post_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_seasons_invite_code ON seasons(invite_code);

-- ============================================================
-- Row Level Security (RLS)
-- ============================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE seasons ENABLE ROW LEVEL SECURITY;
ALTER TABLE season_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE move_pool ENABLE ROW LEVEL SECURITY;
ALTER TABLE drafted_moves ENABLE ROW LEVEL SECURITY;
ALTER TABLE feed_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE nudges ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Profiles: anyone can view, only owner can update
CREATE POLICY "Profiles are viewable by everyone" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Seasons: members can view, creator can update, authenticated can view by invite code
CREATE POLICY "Season members can view seasons" ON seasons
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM season_members
      WHERE season_members.season_id = seasons.id
      AND season_members.user_id = auth.uid()
    )
    OR auth.uid() = created_by
  );

CREATE POLICY "Anyone can view seasons by invite code" ON seasons
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create seasons" ON seasons
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Season creator can update" ON seasons
  FOR UPDATE USING (auth.uid() = created_by);

-- For draft updates, members need to update seasons too
CREATE POLICY "Season members can update draft state" ON seasons
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM season_members
      WHERE season_members.season_id = seasons.id
      AND season_members.user_id = auth.uid()
    )
  );

-- Season members: members can view, anyone authenticated can join
CREATE POLICY "Season members can view members" ON season_members
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM season_members sm
      WHERE sm.season_id = season_members.season_id
      AND sm.user_id = auth.uid()
    )
    OR user_id = auth.uid()
  );

CREATE POLICY "Authenticated users can join seasons" ON season_members
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Members can update their own membership" ON season_members
  FOR UPDATE USING (auth.uid() = user_id);

-- Allow any season member to update other members (for moves_completed counter)
CREATE POLICY "Season members can update member stats" ON season_members
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM season_members sm
      WHERE sm.season_id = season_members.season_id
      AND sm.user_id = auth.uid()
    )
  );

-- Move pool: season members can view and insert
CREATE POLICY "Season members can view pool" ON move_pool
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM season_members
      WHERE season_members.season_id = move_pool.season_id
      AND season_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Season members can add to pool" ON move_pool
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM season_members
      WHERE season_members.season_id = move_pool.season_id
      AND season_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Season members can update pool items" ON move_pool
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM season_members
      WHERE season_members.season_id = move_pool.season_id
      AND season_members.user_id = auth.uid()
    )
  );

-- Drafted moves: season members can view, owner can update
CREATE POLICY "Season members can view drafted moves" ON drafted_moves
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM season_members
      WHERE season_members.season_id = drafted_moves.season_id
      AND season_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Season members can insert drafted moves" ON drafted_moves
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM season_members
      WHERE season_members.season_id = drafted_moves.season_id
      AND season_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own drafted moves" ON drafted_moves
  FOR UPDATE USING (auth.uid() = user_id);

-- Feed posts: season members can view, auto-created on completion
CREATE POLICY "Season members can view feed" ON feed_posts
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM season_members
      WHERE season_members.season_id = feed_posts.season_id
      AND season_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create feed posts" ON feed_posts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Comments: season members can view and insert
CREATE POLICY "Season members can view comments" ON comments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM feed_posts fp
      JOIN season_members sm ON sm.season_id = fp.season_id
      WHERE fp.id = comments.feed_post_id
      AND sm.user_id = auth.uid()
    )
  );

CREATE POLICY "Season members can add comments" ON comments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Nudges: sender can insert, receiver can view and update
CREATE POLICY "Users can view their nudges" ON nudges
  FOR SELECT USING (
    auth.uid() = receiver_id OR auth.uid() = sender_id
  );

CREATE POLICY "Users can send nudges" ON nudges
  FOR INSERT WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Receivers can update nudges" ON nudges
  FOR UPDATE USING (auth.uid() = receiver_id);

-- Notifications: only owner can view and update
CREATE POLICY "Users can view their notifications" ON notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create notifications" ON notifications
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update their notifications" ON notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- ============================================================
-- Supabase Storage: move-photos bucket
-- ============================================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('move-photos', 'move-photos', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Anyone can view move photos" ON storage.objects
  FOR SELECT USING (bucket_id = 'move-photos');

CREATE POLICY "Authenticated users can upload move photos" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'move-photos'
    AND auth.role() = 'authenticated'
  );

-- ============================================================
-- Realtime: Enable for key tables
-- ============================================================

ALTER PUBLICATION supabase_realtime ADD TABLE move_pool;
ALTER PUBLICATION supabase_realtime ADD TABLE drafted_moves;
ALTER PUBLICATION supabase_realtime ADD TABLE seasons;
ALTER PUBLICATION supabase_realtime ADD TABLE feed_posts;
ALTER PUBLICATION supabase_realtime ADD TABLE comments;
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE season_members;
