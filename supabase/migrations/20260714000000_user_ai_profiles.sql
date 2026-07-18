CREATE TABLE IF NOT EXISTS user_ai_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  name text,
  age text,
  gender text,
  height text,
  weight text,
  sport text,
  training_days text,
  goal text,
  budget text,
  diet text,
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE user_ai_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own AI profile" ON user_ai_profiles FOR ALL USING (auth.uid() = user_id);
