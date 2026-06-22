-- admin_users 테이블 생성
CREATE TABLE IF NOT EXISTS admin_users (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 초기 관리자 계정 삽입
INSERT INTO admin_users (username, password_hash)
VALUES ('admin', '$2b$12$p7QEgYMC20BlyhtQrtjbguCUv3HlqzP2Iu.4t95cmQTM1HEJ1Wct.')
ON CONFLICT (username) DO NOTHING;

-- RLS 활성화 (외부에서 직접 조회 차단)
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
