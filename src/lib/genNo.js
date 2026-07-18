// 예약번호/픽업번호 등 공용 번호 생성. 형식: yyMMdd-##### (5자리 랜덤)
export const generateRsvnNo = () => {
  const d = new Date();
  const yy = String(d.getFullYear()).slice(2);
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const rand = String(Math.floor(Math.random() * 100000)).padStart(5, "0");
  return `${yy}${mm}${dd}-${rand}`;
};
