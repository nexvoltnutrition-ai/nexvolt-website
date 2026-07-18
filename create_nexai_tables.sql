CREATE TABLE IF NOT EXISTS nexai_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ai_enabled boolean DEFAULT true,
  welcome_message text DEFAULT 'Hi! I''m NEXAI. Your personal sports nutrition assistant.',
  system_prompt text,
  brand_tone text DEFAULT 'Professional, concise, friendly',
  temperature numeric DEFAULT 0.7,
  max_tokens integer DEFAULT 2048,
  gemini_model text DEFAULT 'gemini-3.1-pro-preview',
  suggested_questions jsonb DEFAULT '["Build Muscle", "Improve Recovery"]'::jsonb,
  blocked_words jsonb DEFAULT '[]'::jsonb,
  restricted_topics jsonb DEFAULT '[]'::jsonb,
  medical_disclaimer text DEFAULT 'Consult a healthcare professional for medical advice.',
  safety_toggles jsonb DEFAULT '{"medical": true, "competitors": true}'::jsonb,
  updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS nexai_prompt_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  prompt_text text,
  version integer,
  created_at timestamp with time zone DEFAULT now(),
  created_by uuid
);

CREATE TABLE IF NOT EXISTS nexai_conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  messages jsonb DEFAULT '[]'::jsonb,
  summary text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Insert default settings if none exist
INSERT INTO nexai_settings (system_prompt)
SELECT 'You are NEXAI, a professional sports nutrition coach and personal assistant for the NEXVOLT website.'
WHERE NOT EXISTS (SELECT 1 FROM nexai_settings);
