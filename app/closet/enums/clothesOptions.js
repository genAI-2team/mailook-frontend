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
  [CLOTHES_CATEGORY.ACCESSORY]: { label: "액세서리", types: ["목도리", "장갑"] },
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

export const WARMTH_LEVELS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
export const DEFAULT_WARMTH_LEVEL = 5;

export const BREATHABILITY_OPTIONS = [
  { value: 1, label: "낮음" },
  { value: 2, label: "보통" },
  { value: 3, label: "높음" },
];
export const NECK_COVER_OPTIONS = [
  { value: false, label: "드러남" },
  { value: true, label: "덮여짐" },
];

export const NO_STORAGE_LOCATION = { id: "", name: "지정 없음" };

export const DEFAULT_STORAGE_LOCATIONS = [
  { id: "default-master-closet", name: "안방 옷장" },
  { id: "default-master-drawer", name: "안방 서랍 2칸" },
  { id: "default-small-room-closet", name: "작은방 옷장" },
  { id: "default-shoe-cabinet", name: "신발장" },
  { id: "default-storage-box", name: "창고 리빙박스" },
];

