-- =====================================================
-- TB_USR_CHAT_MSG : 예약번호 기반 채팅 메시지 테이블
-- =====================================================
CREATE TABLE IF NOT EXISTS tb_usr_chat_msg (
    id          BIGSERIAL       NOT NULL,
    rsvn_no     VARCHAR(50)     NOT NULL,
    biz_reg_no  VARCHAR(10)     NOT NULL,
    uuid        VARCHAR(36)     NULL,
    nickname    VARCHAR(30)     NULL,
    message     TEXT            NOT NULL,
    reg_usr_id  VARCHAR(50)     NULL,
    reg_dt      TIMESTAMP       NOT NULL    DEFAULT NOW(),
    reg_ip      VARCHAR(50)     NULL,
    upd_usr_id  VARCHAR(50)     NULL,
    upd_dt      TIMESTAMP       NULL,
    upd_ip      VARCHAR(50)     NULL,

    CONSTRAINT pk_tb_usr_chat_msg PRIMARY KEY (id)
);

CREATE INDEX IF NOT EXISTS idx_chat_msg_rsvn ON tb_usr_chat_msg (rsvn_no);

COMMENT ON TABLE  tb_usr_chat_msg              IS '예약번호 기반 채팅 메시지';
COMMENT ON COLUMN tb_usr_chat_msg.id           IS 'PK(자동증가)';
COMMENT ON COLUMN tb_usr_chat_msg.rsvn_no      IS '예약번호';
COMMENT ON COLUMN tb_usr_chat_msg.biz_reg_no   IS '사업자번호';
COMMENT ON COLUMN tb_usr_chat_msg.uuid         IS '사용자 UUID(localStorage)';
COMMENT ON COLUMN tb_usr_chat_msg.nickname     IS '닉네임';
COMMENT ON COLUMN tb_usr_chat_msg.message      IS '메시지 내용';
COMMENT ON COLUMN tb_usr_chat_msg.reg_usr_id   IS '등록자ID';
COMMENT ON COLUMN tb_usr_chat_msg.reg_dt       IS '등록일시';
COMMENT ON COLUMN tb_usr_chat_msg.reg_ip       IS '등록IP';
COMMENT ON COLUMN tb_usr_chat_msg.upd_usr_id   IS '수정자ID';
COMMENT ON COLUMN tb_usr_chat_msg.upd_dt       IS '수정일시';
COMMENT ON COLUMN tb_usr_chat_msg.upd_ip       IS '수정IP';

-- Supabase Realtime 활성화 (Dashboard > Database > Replication 에서도 설정 필요)
ALTER PUBLICATION supabase_realtime ADD TABLE tb_usr_chat_msg;
