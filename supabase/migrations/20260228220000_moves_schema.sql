-- Moves App Schema
-- All tables prefixed with moves_ to avoid conflicts with other apps sharing this Supabase project
-- Profiles table is shared across apps

-- User profiles (extends Supabase auth.users) - shared table, skip if exists
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
CREATE TABLE IF NOT EXISTS moves_seasons (
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
CREATE TABLE IF NOT EXISTS moves_season_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  season_id UUID REFERENCES moves_seasons(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) NOT NULL,
  join_order INTEGER NOT NULL,
  moves_completed INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(season_id, user_id)
);

-- The Move Pool (all available moves for a season's draft)
CREATE TABLE IF NOT EXISTS moves_pool (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  season_id UUID REFERENCES moves_seasons(id) ON DELETE CASCADE NOT NULL,
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
CREATE TABLE IF NOT EXISTS moves_drafted (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  season_id UUID REFERENCES moves_seasons(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) NOT NULL,
  move_pool_id UUID REFERENCES moves_pool(id) NOT NULL,
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
CREATE TABLE IF NOT EXISTS moves_feed_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  season_id UUID REFERENCES moves_seasons(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) NOT NULL,
  drafted_move_id UUID REFERENCES moves_drafted(id) NOT NULL,
  celebration_prompt TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Comments on feed posts
CREATE TABLE IF NOT EXISTS moves_comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  feed_post_id UUID REFERENCES moves_feed_posts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Nudges
CREATE TABLE IF NOT EXISTS moves_nudges (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  season_id UUID REFERENCES moves_seasons(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID REFERENCES profiles(id) NOT NULL,
  receiver_id UUID REFERENCES profiles(id) NOT NULL,
  drafted_move_id UUID REFERENCES moves_drafted(id) NOT NULL,
  message TEXT DEFAULT 'Your move.',
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Notifications (in-app only)
CREATE TABLE IF NOT EXISTS moves_notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) NOT NULL,
  type TEXT NOT NULL CHECK (type IN (
    'season_invite', 'draft_starting', 'draft_your_turn',
    'move_completed', 'comment', 'nudge', 'collab_tagged',
    'season_ended', 'first_mover'
  )),
  actor_id UUID REFERENCES profiles(id),
  season_id UUID REFERENCES moves_seasons(id) ON DELETE CASCADE,
  reference_id UUID,
  message TEXT,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_moves_season_members_user ON moves_season_members(user_id);
CREATE INDEX IF NOT EXISTS idx_moves_season_members_season ON moves_season_members(season_id);
CREATE INDEX IF NOT EXISTS idx_moves_pool_season ON moves_pool(season_id);
CREATE INDEX IF NOT EXISTS idx_moves_drafted_season_user ON moves_drafted(season_id, user_id);
CREATE INDEX IF NOT EXISTS idx_moves_feed_posts_season ON moves_feed_posts(season_id);
CREATE INDEX IF NOT EXISTS idx_moves_comments_post ON moves_comments(feed_post_id);
CREATE INDEX IF NOT EXISTS idx_moves_notifications_user ON moves_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_moves_notifications_unread ON moves_notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_moves_seasons_invite_code ON moves_seasons(invite_code);

-- ============================================================
-- Row Level Security (RLS)
-- ============================================================

ALTER TABLE moves_seasons ENABLE ROW LEVEL SECURITY;
ALTER TABLE moves_season_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE moves_pool ENABLE ROW LEVEL SECURITY;
ALTER TABLE moves_drafted ENABLE ROW LEVEL SECURITY;
ALTER TABLE moves_feed_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE moves_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE moves_nudges ENABLE ROW LEVEL SECURITY;
ALTER TABLE moves_notifications ENABLE ROW LEVEL SECURITY;

-- Seasons: anyone can view (for invite codes), creator/members can update
CREATE POLICY "Anyone can view seasons" ON moves_seasons
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create seasons" ON moves_seasons
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Season members can update" ON moves_seasons
  FOR UPDATE USING (
    auth.uid() = created_by
    OR EXISTS (
      SELECT 1 FROM moves_season_members
      WHERE moves_season_members.season_id = moves_seasons.id
      AND moves_season_members.user_id = auth.uid()
    )
  );

-- Season members
CREATE POLICY "Anyone can view season members" ON moves_season_members
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can join seasons" ON moves_season_members
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Season members can update membership" ON moves_season_members
  FOR UPDATE USING (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM moves_season_members sm
      WHERE sm.season_id = moves_season_members.season_id
      AND sm.user_id = auth.uid()
    )
  );

-- Move pool
CREATE POLICY "Season members can view pool" ON moves_pool
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM moves_season_members
      WHERE moves_season_members.season_id = moves_pool.season_id
      AND moves_season_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Season members can add to pool" ON moves_pool
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM moves_season_members
      WHERE moves_season_members.season_id = moves_pool.season_id
      AND moves_season_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Season members can update pool items" ON moves_pool
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM moves_season_members
      WHERE moves_season_members.season_id = moves_pool.season_id
      AND moves_season_members.user_id = auth.uid()
    )
  );

-- Drafted moves
CREATE POLICY "Season members can view drafted moves" ON moves_drafted
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM moves_season_members
      WHERE moves_season_members.season_id = moves_drafted.season_id
      AND moves_season_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Season members can insert drafted moves" ON moves_drafted
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM moves_season_members
      WHERE moves_season_members.season_id = moves_drafted.season_id
      AND moves_season_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own drafted moves" ON moves_drafted
  FOR UPDATE USING (auth.uid() = user_id);

-- Feed posts
CREATE POLICY "Season members can view feed" ON moves_feed_posts
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM moves_season_members
      WHERE moves_season_members.season_id = moves_feed_posts.season_id
      AND moves_season_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create feed posts" ON moves_feed_posts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Comments
CREATE POLICY "Feed members can view comments" ON moves_comments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM moves_feed_posts fp
      JOIN moves_season_members sm ON sm.season_id = fp.season_id
      WHERE fp.id = moves_comments.feed_post_id
      AND sm.user_id = auth.uid()
    )
  );

CREATE POLICY "Authenticated users can add comments" ON moves_comments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Nudges
CREATE POLICY "Users can view their nudges" ON moves_nudges
  FOR SELECT USING (
    auth.uid() = receiver_id OR auth.uid() = sender_id
  );

CREATE POLICY "Users can send nudges" ON moves_nudges
  FOR INSERT WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Receivers can update nudges" ON moves_nudges
  FOR UPDATE USING (auth.uid() = receiver_id);

-- Notifications
CREATE POLICY "Users can view their notifications" ON moves_notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Anyone can create notifications" ON moves_notifications
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update their notifications" ON moves_notifications
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

ALTER PUBLICATION supabase_realtime ADD TABLE moves_pool;
ALTER PUBLICATION supabase_realtime ADD TABLE moves_drafted;
ALTER PUBLICATION supabase_realtime ADD TABLE moves_seasons;
ALTER PUBLICATION supabase_realtime ADD TABLE moves_feed_posts;
ALTER PUBLICATION supabase_realtime ADD TABLE moves_comments;
ALTER PUBLICATION supabase_realtime ADD TABLE moves_notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE moves_season_members;
