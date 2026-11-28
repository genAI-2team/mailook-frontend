// 기존에 발급받은 로그인 상태를 유지하도록 저장 키의 값은 변경하지 않는다.
export const ACCESS_TOKEN_KEY = "mailook_access_token";

// 기본 설정. 상수 값은 서버 ENUM 이름과 같다.
export const WARMTH_STYLE = {
  INNER_LAYER: "INNER_LAYER",
  OUTER_LAYER: "OUTER_LAYER",
  ANY: "ANY",
};

export const SENSITIVITY = {
  LESS: "LESS",
  NORMAL: "NORMAL",
  MORE: "MORE",
};
// [신규 — 2026-11-27] 장소 입력 공통 상수. 백엔드 enum의 이름과 동일하게 사용한다.
export const PLACE_TYPE = { HOME: "HOME", ACTIVITY: "ACTIVITY" };
export const PLACE_ENVIRONMENT = { INDOOR: "INDOOR", OUTDOOR: "OUTDOOR", MIXED: "MIXED" };
export const INDOOR_TEMP = { HOT: "HOT", NORMAL: "NORMAL", COLD: "COLD" };
export const PLACE_DAYS = [["MON", "월"], ["TUE", "화"], ["WED", "수"], ["THU", "목"], ["FRI", "금"], ["SAT", "토"], ["SUN", "일"]];
export const PLACE_ENVIRONMENTS = [[PLACE_ENVIRONMENT.INDOOR, "실내"], [PLACE_ENVIRONMENT.OUTDOOR, "야외"], [PLACE_ENVIRONMENT.MIXED, "둘 다"]];
export const PLACE_INDOOR_TEMPS = [[INDOOR_TEMP.HOT, "더운 편"], [INDOOR_TEMP.NORMAL, "보통"], [INDOOR_TEMP.COLD, "추운 편"]];

// [신규 — 2026-11-27] 회원가입 화면의 공통 입력 제한과 단계 표시.
export const SIGNUP_LIMITS = { EMAIL: 50, PASSWORD: 20, NICKNAME: 50 };
export const SIGNUP_STEPS = [
  { id: "account", label: "1 계정" },
  { id: "info", label: "2 기본 정보" },
  { id: "preference", label: "3 내 성향" },
];
