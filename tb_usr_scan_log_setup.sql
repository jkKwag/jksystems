-- =====================================================
-- TB_USR_SCAN_LOG : 사용자 스캔 방문 로그
-- =====================================================
CREATE TABLE IF NOT EXISTS tb_usr_scan_log (
    id          BIGSERIAL       NOT NULL,
    uuid        VARCHAR(36)     NOT NULL,
    biz_reg_no  VARCHAR(10)     NOT NULL,
    vst_dt      TIMESTAMP       NOT NULL    DEFAULT NOW(),
    vst_typ_cd  VARCHAR(10)     NOT NULL,
    reg_usr_id  VARCHAR(50)     NULL,
    reg_dt      TIMESTAMP       NOT NULL    DEFAULT NOW(),
    reg_ip      VARCHAR(50)     NULL,
    upd_usr_id  VARCHAR(50)     NULL,
    upd_dt      TIMESTAMP       NULL,
    upd_ip      VARCHAR(50)     NULL,

    CONSTRAINT pk_tb_usr_scan_log PRIMARY KEY (id)
);

CREATE INDEX IF NOT EXISTS idx_scan_log_uuid ON tb_usr_scan_log (uuid);
CREATE INDEX IF NOT EXISTS idx_scan_log_biz  ON tb_usr_scan_log (biz_reg_no);

COMMENT ON TABLE  tb_usr_scan_log              IS '사용자 스캔 방문 로그';
COMMENT ON COLUMN tb_usr_scan_log.id           IS 'PK(자동증가)';
COMMENT ON COLUMN tb_usr_scan_log.uuid         IS '사용자 UUID';
COMMENT ON COLUMN tb_usr_scan_log.biz_reg_no   IS '사업자번호';
COMMENT ON COLUMN tb_usr_scan_log.vst_dt       IS '방문일시';
COMMENT ON COLUMN tb_usr_scan_log.vst_typ_cd   IS '방문유형코드(url/qr)';
COMMENT ON COLUMN tb_usr_scan_log.reg_usr_id   IS '등록자ID';
COMMENT ON COLUMN tb_usr_scan_log.reg_dt       IS '등록일시';
COMMENT ON COLUMN tb_usr_scan_log.reg_ip       IS '등록IP';
COMMENT ON COLUMN tb_usr_scan_log.upd_usr_id   IS '수정자ID';
COMMENT ON COLUMN tb_usr_scan_log.upd_dt       IS '수정일시';
COMMENT ON COLUMN tb_usr_scan_log.upd_ip       IS '수정IP';
