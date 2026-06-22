-- admin_users 테이블 생성
CREATE TABLE IF NOT EXISTS admin_users (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id VARCHAR(50) UNIQUE NOT NULL,
  password_hash VARCHAR(60) NOT NULL,
  cret_dt TIMESTAMPTZ DEFAULT now(),
  cret_id VARCHAR(50),
  cret_ip VARCHAR(45),
  updt_dt TIMESTAMPTZ,
  updt_id VARCHAR(50),
  updt_ip VARCHAR(45)
);

-- 초기 관리자 계정 삽입
INSERT INTO admin_users (user_id, password_hash)
VALUES ('admin', '$2b$12$p7QEgYMC20BlyhtQrtjbguCUv3HlqzP2Iu.4t95cmQTM1HEJ1Wct.')
ON CONFLICT (user_id) DO NOTHING;

-- RLS 활성화
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- 로그인용 SELECT 허용 (password_hash는 bcrypt 단방향 암호화라 노출되어도 안전)
CREATE POLICY "allow_login_select" ON admin_users
  FOR SELECT TO anon
  USING (true);
