-- ==================================================================================
-- OgSprite 数据库表结构
-- 适用于 Cloudflare D1 (SQLite 兼容)
-- ==================================================================================

-- 用户表
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,                      -- UUID，用户唯一标识
  email TEXT UNIQUE NOT NULL,               -- 邮箱地址（必须是 @ogcloud.com）
  nickname TEXT,                            -- 昵称
  avatar_url TEXT,                          -- 头像 URL
  password_hash TEXT,                       -- 密码哈希 (bcrypt)
  created_at INTEGER NOT NULL,              -- 创建时间（Unix timestamp，毫秒）
  updated_at INTEGER NOT NULL               -- 更新时间（Unix timestamp，毫秒）
);

-- 生成历史表
CREATE TABLE IF NOT EXISTS generation_history (
  id TEXT PRIMARY KEY,                      -- UUID，历史记录唯一标识
  user_id TEXT NOT NULL,                    -- 用户 ID（外键）
  original_image_key TEXT NOT NULL,         -- R2 中原始图片的 key
  created_at INTEGER NOT NULL,              -- 创建时间（Unix timestamp，毫秒）
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 精灵图结果表（每个 action 一条记录）
CREATE TABLE IF NOT EXISTS sprite_results (
  id TEXT PRIMARY KEY,                      -- UUID，结果唯一标识
  history_id TEXT NOT NULL,                 -- 历史记录 ID（外键）
  action_id TEXT NOT NULL,                  -- 动作 ID: 'run', 'walk', 'attack', etc.
  action_label TEXT NOT NULL,               -- 动作标签: '奔跑', '行走', '攻击', etc.
  sprite_image_key TEXT NOT NULL,           -- R2 中精灵图的 key
  prompt_used TEXT,                         -- 使用的 prompt（可选）
  created_at INTEGER NOT NULL,              -- 创建时间（Unix timestamp，毫秒）
  FOREIGN KEY (history_id) REFERENCES generation_history(id) ON DELETE CASCADE
);

-- ==================================================================================
-- 索引优化
-- ==================================================================================

-- 按用户查询历史记录
CREATE INDEX IF NOT EXISTS idx_history_user ON generation_history(user_id);

-- 按时间倒序查询历史记录
CREATE INDEX IF NOT EXISTS idx_history_created ON generation_history(created_at DESC);

-- 按历史记录查询精灵图
CREATE INDEX IF NOT EXISTS idx_sprites_history ON sprite_results(history_id);

-- 按邮箱查询用户
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
