CREATE TABLE IF NOT EXISTS nexai_feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid,
  message_id text,
  user_id uuid,
  is_helpful boolean,
  created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE nexai_conversations ADD COLUMN IF NOT EXISTS name text;
