-- =====================================================
-- TB_BIZ_MENU_OPT_GRP : 메뉴 옵션그룹 테이블 (맵기/사이즈/추가옵션 등)
-- =====================================================
CREATE TABLE IF NOT EXISTS tb_biz_menu_opt_grp (
    opt_grp_cd    VARCHAR(10)     NOT NULL,
    menu_cd       VARCHAR(10)     NOT NULL,
    opt_grp_nm    VARCHAR(50)     NOT NULL,
    opt_type      CHAR(1)         NOT NULL    DEFAULT 'R',
    required_yn   CHAR(1)         NOT NULL    DEFAULT 'Y',
    sort_ord      INTEGER         NOT NULL    DEFAULT 999,
    use_yn        CHAR(1)         NOT NULL    DEFAULT 'Y',
    rmrk          VARCHAR(500)    NULL,
    reg_usr_id    VARCHAR(50)     NULL,
    reg_dt        TIMESTAMP       NOT NULL    DEFAULT NOW(),
    reg_ip        VARCHAR(50)     NULL,
    upd_usr_id    VARCHAR(50)     NULL,
    upd_dt        TIMESTAMP       NULL,
    upd_ip        VARCHAR(50)     NULL,

    CONSTRAINT pk_tb_biz_menu_opt_grp PRIMARY KEY (opt_grp_cd),
    CONSTRAINT fk_tb_biz_menu_opt_grp_menu FOREIGN KEY (menu_cd) REFERENCES tb_biz_menu (menu_cd),
    CONSTRAINT ck_tb_biz_menu_opt_grp_type CHECK (opt_type IN ('R', 'C'))
);

COMMENT ON TABLE  tb_biz_menu_opt_grp                IS '메뉴 옵션그룹';
COMMENT ON COLUMN tb_biz_menu_opt_grp.opt_grp_cd     IS '옵션그룹코드';
COMMENT ON COLUMN tb_biz_menu_opt_grp.menu_cd        IS '메뉴코드';
COMMENT ON COLUMN tb_biz_menu_opt_grp.opt_grp_nm     IS '옵션그룹명 (예: 맵기 선택, 사이즈, 추가 옵션)';
COMMENT ON COLUMN tb_biz_menu_opt_grp.opt_type       IS '선택방식 (R:단일선택/라디오, C:다중선택/체크박스)';
COMMENT ON COLUMN tb_biz_menu_opt_grp.required_yn    IS '필수여부(Y/N)';
COMMENT ON COLUMN tb_biz_menu_opt_grp.sort_ord       IS '정렬순서';
COMMENT ON COLUMN tb_biz_menu_opt_grp.use_yn         IS '사용여부(Y/N)';
COMMENT ON COLUMN tb_biz_menu_opt_grp.rmrk           IS '비고';
COMMENT ON COLUMN tb_biz_menu_opt_grp.reg_usr_id     IS '등록자ID';
COMMENT ON COLUMN tb_biz_menu_opt_grp.reg_dt         IS '등록일시';
COMMENT ON COLUMN tb_biz_menu_opt_grp.reg_ip         IS '등록IP';
COMMENT ON COLUMN tb_biz_menu_opt_grp.upd_usr_id     IS '수정자ID';
COMMENT ON COLUMN tb_biz_menu_opt_grp.upd_dt         IS '수정일시';
COMMENT ON COLUMN tb_biz_menu_opt_grp.upd_ip         IS '수정IP';


-- =====================================================
-- TB_BIZ_MENU_OPT_CHOICE : 메뉴 옵션그룹별 선택지 테이블
-- =====================================================
CREATE TABLE IF NOT EXISTS tb_biz_menu_opt_choice (
    opt_cd        VARCHAR(10)     NOT NULL,
    opt_grp_cd    VARCHAR(10)     NOT NULL,
    choice_nm     VARCHAR(50)     NOT NULL,
    add_price     INTEGER         NOT NULL    DEFAULT 0,
    sort_ord      INTEGER         NOT NULL    DEFAULT 999,
    use_yn        CHAR(1)         NOT NULL    DEFAULT 'Y',
    rmrk          VARCHAR(500)    NULL,
    reg_usr_id    VARCHAR(50)     NULL,
    reg_dt        TIMESTAMP       NOT NULL    DEFAULT NOW(),
    reg_ip        VARCHAR(50)     NULL,
    upd_usr_id    VARCHAR(50)     NULL,
    upd_dt        TIMESTAMP       NULL,
    upd_ip        VARCHAR(50)     NULL,

    CONSTRAINT pk_tb_biz_menu_opt_choice PRIMARY KEY (opt_cd),
    CONSTRAINT fk_tb_biz_menu_opt_choice_grp FOREIGN KEY (opt_grp_cd) REFERENCES tb_biz_menu_opt_grp (opt_grp_cd)
);

COMMENT ON TABLE  tb_biz_menu_opt_choice               IS '메뉴 옵션그룹별 선택지';
COMMENT ON COLUMN tb_biz_menu_opt_choice.opt_cd       IS '옵션코드';
COMMENT ON COLUMN tb_biz_menu_opt_choice.opt_grp_cd   IS '옵션그룹코드';
COMMENT ON COLUMN tb_biz_menu_opt_choice.choice_nm    IS '선택지명 (예: 보통맛, 2인분, 치즈 추가)';
COMMENT ON COLUMN tb_biz_menu_opt_choice.add_price    IS '추가금액 (옵션 선택 시 더해지는 금액, 0=무료)';
COMMENT ON COLUMN tb_biz_menu_opt_choice.sort_ord     IS '정렬순서';
COMMENT ON COLUMN tb_biz_menu_opt_choice.use_yn       IS '사용여부(Y/N)';
COMMENT ON COLUMN tb_biz_menu_opt_choice.rmrk         IS '비고';
COMMENT ON COLUMN tb_biz_menu_opt_choice.reg_usr_id   IS '등록자ID';
COMMENT ON COLUMN tb_biz_menu_opt_choice.reg_dt       IS '등록일시';
COMMENT ON COLUMN tb_biz_menu_opt_choice.reg_ip       IS '등록IP';
COMMENT ON COLUMN tb_biz_menu_opt_choice.upd_usr_id   IS '수정자ID';
COMMENT ON COLUMN tb_biz_menu_opt_choice.upd_dt       IS '수정일시';
COMMENT ON COLUMN tb_biz_menu_opt_choice.upd_ip       IS '수정IP';


-- =====================================================
-- 샘플 데이터 INSERT
-- 기존 MenuDetail.jsx DUMMY_OPTIONS를 김치찌개 정식(M00004) 기준으로 이전
-- =====================================================
INSERT INTO tb_biz_menu_opt_grp (opt_grp_cd, menu_cd, opt_grp_nm, opt_type, required_yn, sort_ord, use_yn, reg_usr_id, reg_ip)
VALUES
  ('OG00000001', 'M00004', '맵기 선택', 'R', 'Y', 10, 'Y', 'SYSTEM', '127.0.0.1'),
  ('OG00000002', 'M00004', '사이즈',     'R', 'Y', 20, 'Y', 'SYSTEM', '127.0.0.1'),
  ('OG00000003', 'M00004', '추가 옵션', 'C', 'N', 30, 'Y', 'SYSTEM', '127.0.0.1')
ON CONFLICT (opt_grp_cd) DO NOTHING;

INSERT INTO tb_biz_menu_opt_choice (opt_cd, opt_grp_cd, choice_nm, add_price, sort_ord, use_yn, reg_usr_id, reg_ip)
VALUES
  ('OC00000001', 'OG00000001', '순한맛',     0,    10, 'Y', 'SYSTEM', '127.0.0.1'),
  ('OC00000002', 'OG00000001', '보통맛',     0,    20, 'Y', 'SYSTEM', '127.0.0.1'),
  ('OC00000003', 'OG00000001', '매운맛',     0,    30, 'Y', 'SYSTEM', '127.0.0.1'),

  ('OC00000004', 'OG00000002', '1인분',      0,    10, 'Y', 'SYSTEM', '127.0.0.1'),
  ('OC00000005', 'OG00000002', '2인분',      8000, 20, 'Y', 'SYSTEM', '127.0.0.1'),

  ('OC00000006', 'OG00000003', '공기밥 추가', 1000, 10, 'Y', 'SYSTEM', '127.0.0.1'),
  ('OC00000007', 'OG00000003', '치즈 추가',   2000, 20, 'Y', 'SYSTEM', '127.0.0.1'),
  ('OC00000008', 'OG00000003', '음료 추가',   2500, 30, 'Y', 'SYSTEM', '127.0.0.1')
ON CONFLICT (opt_cd) DO NOTHING;
