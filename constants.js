// 기존에 발급받은 로그인 상태를 유지하도록 저장 키의 값은 변경하지 않는다.
export const ACCESS_TOKEN_KEY = "mailook_access_token";

export const CLOTHES_CATEGORY = {
  TOP: "TOP",
  BOTTOM: "BOTTOM",
  OUTER: "OUTER",
  SHOES: "SHOES",
  ACCESSORY: "ACCESSORY",
  CARRY_ITEM: "CARRY_ITEM",
};

export const CLOTHES_CATEGORIES = {
  [CLOTHES_CATEGORY.TOP]: { label: "상의", types: ["니트", "셔츠", "반팔"] },
  [CLOTHES_CATEGORY.BOTTOM]: { label: "하의", types: ["청바지", "슬랙스"] },
  [CLOTHES_CATEGORY.OUTER]: { label: "아우터", types: ["코트", "패딩"] },
  [CLOTHES_CATEGORY.SHOES]: { label: "신발", types: ["운동화", "부츠"] },
  [CLOTHES_CATEGORY.ACCESSORY]: { label: "액세서리", listLabel: "소품", types: ["목도리", "장갑"] },
  [CLOTHES_CATEGORY.CARRY_ITEM]: { label: "소지품", types: ["우산", "손난로"] },
};

export const MATERIAL_LABELS = {
  WOOL: "울",
  COTTON: "면",
  POLYESTER: "폴리에스터",
  DOWN: "다운",
  LINEN: "린넨",
  DENIM: "데님",
  ETC: "기타",
};

export const STORAGE_STATUS_LABELS = {
  AVAILABLE: "바로 꺼낼 수 있음",
  STORED: "보관 중",
};

export const DEFAULT_CATEGORY = CLOTHES_CATEGORY.TOP;
export const DEFAULT_MATERIAL = "WOOL";
export const DEFAULT_STORAGE_STATUS = "AVAILABLE";
