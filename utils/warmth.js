// 서버는 clo만 주고받는다. 화면의 따뜻한 정도(1~10)로 바꿀 때만 쓴다.
export const cloToLevel = (clo) => Math.min(10, Math.max(1, Math.round(clo / 0.08)));
export const levelToClo = (level) => level * 0.08;
