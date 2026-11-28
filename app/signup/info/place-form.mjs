// db/schema.sql: places / place_schedules CHECK constraints.
export const DAYS = [["MON", "월"], ["TUE", "화"], ["WED", "수"], ["THU", "목"], ["FRI", "금"], ["SAT", "토"], ["SUN", "일"]];
export const ENVIRONMENTS = [["INDOOR", "실내"], ["OUTDOOR", "야외"], ["MIXED", "둘 다"]];
export const INDOOR_TEMPS = [["HOT", "더운 편"], ["NORMAL", "보통"], ["COLD", "추운 편"]];

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
  if (input.environment !== "OUTDOOR" && !INDOOR_TEMPS.some(([value]) => value === input.indoor_temp)) errors.indoor_temp = "실내 온도를 선택해 주세요.";
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
    home: { place_type: "HOME", name: "집", ...coordinates("home_address"), depart_time: input.depart_time, arrive_time: input.home_arrive_time },
    activity: {
      place_type: "ACTIVITY", name: input.name.trim(), ...coordinates("address"),
      arrive_time: input.arrive_time, leave_time: input.leave_time,
      environment: input.environment, indoor_temp: input.environment === "OUTDOOR" ? null : input.indoor_temp,
      schedules: DAYS.filter(([day]) => input.day_of_week.includes(day)).map(([day_of_week]) => ({ day_of_week })),
    },
  };
}
