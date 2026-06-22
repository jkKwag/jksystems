-- admin_users 테이블 생성
CREATE TABLE IF NOT EXISTS admin_users (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id VARCHAR(50) UNIQUE NOT NULL,
  password_hash VARCHAR(60) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  creat_id VARCHAR(50),
  creat_ip VARCHAR(45),
  updt_at TIMESTAMPTZ,
  updt_id VARCHAR(50),
  updt_ip VARCHAR(45)
);

-- 초기 관리자 계정 삽입
INSERT INTO admin_users (user_id, password_hash)
VALUES ('admin', '$2b$12$p7QEgYMC20BlyhtQrtjbguCUv3HlqzP2Iu.4t95cmQTM1HEJ1Wct.')
ON CONFLICT (user_id) DO NOTHING;

-- RLS 활성화 (외부에서 직접 조회 차단)
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
