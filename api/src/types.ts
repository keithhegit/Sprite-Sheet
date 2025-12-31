export interface Env {
  DB: D1Database;
  R2: R2Bucket;
  JWT_SECRET: string;
  FRONTEND_URL?: string;
  R2_PREFIX?: string;
}

export interface User {
  id: string;
  email: string;
  avatar_url: string | null;
  password_hash?: string;
  created_at: number;
  updated_at: number;
}

export interface GenerationHistory {
  id: string;
  user_id: string;
  original_image_key: string;
  created_at: number;
}

export interface SpriteResult {
  id: string;
  history_id: string;
  action_id: string;
  action_label: string;
  sprite_image_key: string;
  prompt_used?: string;
  created_at: number;
}

export interface JWTPayload {
  userId: string;
  exp: number;
}
