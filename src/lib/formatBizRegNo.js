// 사업자등록번호 표시용 포맷: 10자리 숫자를 XXX-XX-XXXXX 형태로 (원본 값은 그대로 두고 화면 표시에만 사용)
export const formatBizRegNo = (no) => {
  const digits = String(no || "").replace(/\D/g, "");
  if (digits.length !== 10) return no || "";
  return `${digits.slice(0, 3)}-${digits.slice(3, 5)}-${digits.slice(5)}`;
};
