-- =====================================================
-- TB_BIZ_MENU : 메뉴 테이블
-- =====================================================
CREATE TABLE IF NOT EXISTS tb_biz_menu (
    menu_cd       VARCHAR(10)     NOT NULL,
    biz_reg_no    VARCHAR(20)     NOT NULL,
    biz_cat_cd    VARCHAR(10)     NOT NULL,
    menu_nm       VARCHAR(100)    NOT NULL,
    menu_desc     VARCHAR(500)    NULL,
    price         INTEGER         NOT NULL    DEFAULT 0,
    img_url       VARCHAR(500)    NULL,
    badge         VARCHAR(20)     NULL,
    sort_ord      INTEGER         NOT NULL    DEFAULT 999,
    use_yn        CHAR(1)         NOT NULL    DEFAULT 'Y',
    rmrk          VARCHAR(500)    NULL,
    reg_usr_id    VARCHAR(50)     NULL,
    reg_dt        TIMESTAMP       NOT NULL    DEFAULT NOW(),
    reg_ip        VARCHAR(50)     NULL,
    upd_usr_id    VARCHAR(50)     NULL,
    upd_dt        TIMESTAMP       NULL,
    upd_ip        VARCHAR(50)     NULL,

    CONSTRAINT pk_tb_biz_menu PRIMARY KEY (menu_cd),
    CONSTRAINT fk_tb_biz_menu_biz FOREIGN KEY (biz_reg_no) REFERENCES tb_biz (biz_reg_no),
    CONSTRAINT fk_tb_biz_menu_cat FOREIGN KEY (biz_cat_cd) REFERENCES tb_biz_cat (biz_cat_cd)
);

COMMENT ON TABLE  tb_biz_menu               IS '메뉴';
COMMENT ON COLUMN tb_biz_menu.menu_cd       IS '메뉴코드';
COMMENT ON COLUMN tb_biz_menu.biz_reg_no    IS '사업자번호';
COMMENT ON COLUMN tb_biz_menu.biz_cat_cd    IS '사업장카테고리코드';
COMMENT ON COLUMN tb_biz_menu.menu_nm       IS '메뉴명';
COMMENT ON COLUMN tb_biz_menu.menu_desc     IS '메뉴설명';
COMMENT ON COLUMN tb_biz_menu.price         IS '가격';
COMMENT ON COLUMN tb_biz_menu.img_url       IS '이미지경로(Supabase Storage URL)';
COMMENT ON COLUMN tb_biz_menu.badge         IS '배지(인기/베스트/추천)';
COMMENT ON COLUMN tb_biz_menu.sort_ord      IS '정렬순서';
COMMENT ON COLUMN tb_biz_menu.use_yn        IS '사용여부(Y/N)';
COMMENT ON COLUMN tb_biz_menu.rmrk          IS '비고';
COMMENT ON COLUMN tb_biz_menu.reg_usr_id    IS '등록자ID';
COMMENT ON COLUMN tb_biz_menu.reg_dt        IS '등록일시';
COMMENT ON COLUMN tb_biz_menu.reg_ip        IS '등록IP';
COMMENT ON COLUMN tb_biz_menu.upd_usr_id    IS '수정자ID';
COMMENT ON COLUMN tb_biz_menu.upd_dt        IS '수정일시';
COMMENT ON COLUMN tb_biz_menu.upd_ip        IS '수정IP';


-- =====================================================
-- 샘플 데이터 INSERT
-- Storage URL: https://zhtqkjorhhqnnhgsddmn.supabase.co/storage/v1/object/public/menu-image/2122544531/{파일명}
-- =====================================================
INSERT INTO tb_biz_menu (menu_cd, biz_reg_no, biz_cat_cd, menu_nm, menu_desc, price, img_url, badge, sort_ord, use_yn, reg_usr_id, reg_ip)
VALUES
  -- 고기류
  ('M00001', '2122544531',
   (SELECT biz_cat_cd FROM tb_biz_cat WHERE biz_reg_no='2122544531' AND biz_cat_nm='고기류'),
   '캠프 직화 삼겹살', '국내산 생삼겹살 200g, 쌈채소·된장 포함', 18000,
   'https://zhtqkjorhhqnnhgsddmn.supabase.co/storage/v1/object/public/menu-image/2122544531/samgyubsal.jpg',
   '인기', 10, 'Y', 'SYSTEM', '127.0.0.1'),

  ('M00002', '2122544531',
   (SELECT biz_cat_cd FROM tb_biz_cat WHERE biz_reg_no='2122544531' AND biz_cat_nm='고기류'),
   '허브 치킨 구이', '허브 마리네이드 반마리, 감자·옥수수 곁들임', 16000,
   'https://zhtqkjorhhqnnhgsddmn.supabase.co/storage/v1/object/public/menu-image/2122544531/chicken.jpg',
   NULL, 20, 'Y', 'SYSTEM', '127.0.0.1'),

  -- 밥류
  ('M00003', '2122544531',
   (SELECT biz_cat_cd FROM tb_biz_cat WHERE biz_reg_no='2122544531' AND biz_cat_nm='밥류'),
   '돌솥 비빔밥', '제철 나물과 고추장, 달걀 반숙 토핑', 13000,
   'https://zhtqkjorhhqnnhgsddmn.supabase.co/storage/v1/object/public/menu-image/2122544531/bibimbap.jpg',
   '추천', 10, 'Y', 'SYSTEM', '127.0.0.1'),

  ('M00004', '2122544531',
   (SELECT biz_cat_cd FROM tb_biz_cat WHERE biz_reg_no='2122544531' AND biz_cat_nm='밥류'),
   '김치찌개 정식', '묵은지 김치찌개에 공기밥·반찬 3종 포함', 11000,
   'https://zhtqkjorhhqnnhgsddmn.supabase.co/storage/v1/object/public/menu-image/2122544531/kimchijjigae.jpg',
   NULL, 20, 'Y', 'SYSTEM', '127.0.0.1'),

  ('M00005', '2122544531',
   (SELECT biz_cat_cd FROM tb_biz_cat WHERE biz_reg_no='2122544531' AND biz_cat_nm='밥류'),
   '제육볶음 정식', '매콤한 제육볶음에 공기밥·된장국 포함', 12000,
   'https://zhtqkjorhhqnnhgsddmn.supabase.co/storage/v1/object/public/menu-image/2122544531/jeyook.jpg',
   NULL, 30, 'Y', 'SYSTEM', '127.0.0.1'),

  -- 면류
  ('M00006', '2122544531',
   (SELECT biz_cat_cd FROM tb_biz_cat WHERE biz_reg_no='2122544531' AND biz_cat_nm='면류'),
   '야생 버섯 칼국수', '직접 뽑은 수제면에 진한 사골 육수', 12000,
   'https://zhtqkjorhhqnnhgsddmn.supabase.co/storage/v1/object/public/menu-image/2122544531/kalguksu.jpg',
   '베스트', 10, 'Y', 'SYSTEM', '127.0.0.1'),

  -- 사이드
  ('M00007', '2122544531',
   (SELECT biz_cat_cd FROM tb_biz_cat WHERE biz_reg_no='2122544531' AND biz_cat_nm='사이드'),
   '캠프파이어 피자', '화덕에서 구운 나폴리 스타일, 모짜렐라 듬뿍', 22000,
   'https://zhtqkjorhhqnnhgsddmn.supabase.co/storage/v1/object/public/menu-image/2122544531/pizza.jpg',
   NULL, 10, 'Y', 'SYSTEM', '127.0.0.1'),

  ('M00008', '2122544531',
   (SELECT biz_cat_cd FROM tb_biz_cat WHERE biz_reg_no='2122544531' AND biz_cat_nm='사이드'),
   '그린 샐러드 볼', '제철 채소와 수제 드레싱, 견과류 토핑', 10000,
   'https://zhtqkjorhhqnnhgsddmn.supabase.co/storage/v1/object/public/menu-image/2122544531/salad.jpg',
   NULL, 20, 'Y', 'SYSTEM', '127.0.0.1'),

  -- 음료
  ('M00009', '2122544531',
   (SELECT biz_cat_cd FROM tb_biz_cat WHERE biz_reg_no='2122544531' AND biz_cat_nm='음료'),
   '캠프 아메리카노', '직접 로스팅한 원두, 더치커피 선택 가능', 5000,
   'https://zhtqkjorhhqnnhgsddmn.supabase.co/storage/v1/object/public/menu-image/2122544531/americano.jpg',
   NULL, 10, 'Y', 'SYSTEM', '127.0.0.1')

ON CONFLICT (menu_cd) DO NOTHING;
