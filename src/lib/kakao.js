// 카카오 로그인 인가코드 요청 URL. redirect_uri는 카카오 디벨로퍼스에 등록해둔 값과
// 정확히 똑같아야 해서(오타/트레일링 슬래시 하나만 달라도 실패) 리터럴로 고정해서 쓴다.
const KAKAO_REST_API_KEY = process.env.EXPO_PUBLIC_KAKAO_REST_API_KEY || "2d3c372b212e4d3e4524935c100a859e";
export const KAKAO_REDIRECT_URI = "https://www.jkscaneat.com/admin/kakao/callback";

export function startKakaoLogin() {
  const url = `https://kauth.kakao.com/oauth/authorize?client_id=${KAKAO_REST_API_KEY}&redirect_uri=${encodeURIComponent(KAKAO_REDIRECT_URI)}&response_type=code`;
  window.location.href = url;
}
