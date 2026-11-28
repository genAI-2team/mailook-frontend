// [변경 전 — 2026-11-27] 화면 전용 상수는 아래 주석으로 보존한다.
// // db/schema.sql: places / place_schedules CHECK constraints.
// export const DAYS = [["MON", "월"], ["TUE", "화"], ["WED", "수"], ["THU", "목"], ["FRI", "금"], ["SAT", "토"], ["SUN", "일"]];
// export const ENVIRONMENTS = [["INDOOR", "실내"], ["OUTDOOR", "야외"], ["MIXED", "둘 다"]];
// export const INDOOR_TEMPS = [["HOT", "더운 편"], ["NORMAL", "보통"], ["COLD", "추운 편"]];
// [변경 후 — 2026-11-27] 화면과 검증·요청 생성 모듈이 공통 상수를 함께 사용한다.
import { PLACE_TYPE, PLACE_ENVIRONMENT, PLACE_DAYS, PLACE_ENVIRONMENTS, PLACE_INDOOR_TEMPS } from "../../constants.js";
export const DAYS = PLACE_DAYS;
export const ENVIRONMENTS = PLACE_ENVIRONMENTS;
export const INDOOR_TEMPS = PLACE_INDOOR_TEMPS;

// [신규 — 2026-11-28] 오전/오후와 직접 입력한 시·분을 서버용 24시간 HH:mm으로 변환한다.
export function toTimeValue(period, hour, minute) {
  if (!['AM', 'PM'].includes(period) || !/^\d{1,2}$/.test(hour) || !/^\d{1,2}$/.test(minute)
      || Number(hour) < 1 || Number(hour) > 12 || Number(minute) > 59) return "";
  const hours24 = Number(hour) % 12 + (period === "PM" ? 12 : 0);
  return `${String(hours24).padStart(2, "0")}:${minute.padStart(2, "0")}`;
}

// [신규 — 2026-11-28] 집/활동 장소 모두 같은 명칭 검색 → 공백 정리 재검색 → 주소 검색을 사용한다.
export async function searchPlaceAddresses(services, query) {
  const normalized = query.trim().replace(/\s+/g, " ");
  if (!normalized) return [];
  const geocoder = new services.Geocoder();
  const places = new services.Places();
  function lookup(method, receiver, keyword) {
    return new Promise(resolve => {
      method.call(receiver, keyword, (items, status) => resolve({ items, status }));
    });
  }
  let serviceError = false;
  for (const keyword of [...new Set([normalized, normalized.replace(/\s+/g, "")])]) {
    const result = await lookup(places.keywordSearch, places, keyword);
    if (result.status === services.Status.OK && result.items?.length) return result.items;
    if (result.status === services.Status.ERROR) serviceError = true;
  }
  const address = await lookup(geocoder.addressSearch, geocoder, normalized);
  if (address.status === services.Status.OK && address.items?.length) return address.items;
  if (serviceError || address.status === services.Status.ERROR) {
    throw new Error("장소 검색에 실패했어요. 네트워크와 지도 서비스 설정을 확인한 뒤 다시 검색해 주세요.");
  }
  return [];
}

export function validatePlaces(input, positions) {
  const errors = {};
  for (const field of ["home_address", "address"]) {
    if (!input[field].trim() || !positions[field]) errors[field] = "주소를 검색하고 결과를 선택해 주세요.";
  }
  if (!input.name.trim() || input.name.trim().length > 30) errors.name = "장소 이름을 1~30자로 입력해 주세요.";
  for (const field of ["depart_time", "home_arrive_time", "arrive_time", "leave_time"]) {
    if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(input[field])) errors[field] = "시간을 선택해 주세요.";
  }
  if (!input.day_of_week.length || input.day_of_week.some(day => !DAYS.some(([value]) => value === day))) errors.day_of_week = "가는 요일을 선택해 주세요.";
  if (!ENVIRONMENTS.some(([value]) => value === input.environment)) errors.environment = "머무는 곳을 선택해 주세요.";
// [변경 전 — 2026-11-27] if (input.environment !== "OUTDOOR" && !INDOOR_TEMPS.some(([value]) => value === input.indoor_temp)) errors.indoor_temp = "실내 온도를 선택해 주세요.";
// [변경 후 — 2026-11-27]
  if (input.environment !== PLACE_ENVIRONMENT.OUTDOOR && !INDOOR_TEMPS.some(([value]) => value === input.indoor_temp)) errors.indoor_temp = "실내 온도를 선택해 주세요.";
  if (!input.location_consent) errors.location_consent = "위치 정보 이용에 동의해 주세요.";
  return errors;
}

export function buildPlacesPayload(input, positions) {
  const coordinates = field => ({
    address: positions[field].address,
    latitude: Number(positions[field].latitude.toFixed(2)),
    longitude: Number(positions[field].longitude.toFixed(2)),
  });
  return {
    location_consent: input.location_consent,
// [변경 전 — 2026-11-27] home: { place_type: "HOME", name: "집", ...coordinates("home_address"), depart_time: input.depart_time, arrive_time: input.home_arrive_time },
// [변경 후 — 2026-11-27]
    home: { place_type: PLACE_TYPE.HOME, name: "집", ...coordinates("home_address"), depart_time: input.depart_time, arrive_time: input.home_arrive_time },
    activity: {
// [변경 전 — 2026-11-27] place_type: "ACTIVITY", name: input.name.trim(), ...coordinates("address"),
// [변경 후 — 2026-11-27]
      place_type: PLACE_TYPE.ACTIVITY, name: input.name.trim(), ...coordinates("address"),
      arrive_time: input.arrive_time, leave_time: input.leave_time,
// [변경 전 — 2026-11-27] environment: input.environment, indoor_temp: input.environment === "OUTDOOR" ? null : input.indoor_temp,
// [변경 후 — 2026-11-27]
      environment: input.environment, indoor_temp: input.environment === PLACE_ENVIRONMENT.OUTDOOR ? null : input.indoor_temp,
      schedules: DAYS.filter(([day]) => input.day_of_week.includes(day)).map(([day_of_week]) => ({ day_of_week })),
    },
  };
}
