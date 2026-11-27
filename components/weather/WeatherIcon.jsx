// 날씨 아이콘 (프로토타입과 같은 선 아이콘, 24×24 viewBox)
// 기상청 값 매핑: SKY 1 맑음 / 3 구름많음 / 4 흐림, PTY 1 비 / 2 비·눈 / 3 눈 / 4 소나기
// PTY(강수형태)가 0이 아니면 PTY 아이콘을, 0이면 SKY 아이콘을 씁니다.

const SUN = '#B7791F';
const CLOUD = '#5B6B7F';
const RAIN = '#0B6FA4';

const SUN_RAYS =
  'M12 2.5v2.2M12 19.3v2.2M4.6 4.6l1.6 1.6M17.8 17.8l1.6 1.6M2.5 12h2.2M19.3 12h2.2M4.6 19.4l1.6-1.6M17.8 6.2l1.6-1.6';
// 비·눈·소나기용으로 위로 올린 구름
const CLOUD_HIGH =
  'M7 14.5h10a4 4 0 0 0 .6-7.95A5.5 5.5 0 0 0 7.1 5.6 4.5 4.5 0 0 0 7 14.5z';

const ICONS = {
  // 맑음 (프로토타입)
  CLEAR: (
    <g stroke={SUN}>
      <circle cx="12" cy="12" r="4.2" />
      <path d={SUN_RAYS} />
    </g>
  ),
  // 구름많음 (프로토타입)
  PARTLY_CLOUDY: (
    <>
      <g stroke={SUN}>
        <circle cx="8.5" cy="8.5" r="3" />
        <path d="M8.5 2.5v1.4M2.5 8.5h1.4M4.3 4.3l1 1M12.7 4.3l-1 1" />
      </g>
      <path stroke={CLOUD} d="M9 20h8.5a3.5 3.5 0 0 0 .5-6.96A4.8 4.8 0 0 0 9.2 12 3.9 3.9 0 0 0 9 20z" />
    </>
  ),
  // 흐림 (프로토타입)
  CLOUDY: (
    <path stroke={CLOUD} d="M7 18.5h10a4 4 0 0 0 .6-7.95A5.5 5.5 0 0 0 7.1 9.6 4.5 4.5 0 0 0 7 18.5z" />
  ),
  // 비 (프로토타입)
  RAIN: (
    <g stroke={RAIN}>
      <path d={CLOUD_HIGH} />
      <path d="M8.5 17.5l-1 2.5M12.5 17.5l-1 2.5M16.5 17.5l-1 2.5" />
    </g>
  ),
  // 비/눈 (새로 그림)
  SLEET: (
    <>
      <path stroke={RAIN} d={CLOUD_HIGH} />
      <path stroke={RAIN} d="M8.5 17.5l-1 2.5M16.5 17.5l-1 2.5" />
      <path stroke={CLOUD} d="M12 17.5v3M10.7 18.25l2.6 1.5M13.3 18.25l-2.6 1.5" />
    </>
  ),
  // 눈 (새로 그림)
  SNOW: (
    <>
      <path stroke={CLOUD} d={CLOUD_HIGH} />
      <path
        stroke={CLOUD}
        d="M8 17.5v3M6.7 18.25l2.6 1.5M9.3 18.25l-2.6 1.5M16 17.5v3M14.7 18.25l2.6 1.5M17.3 18.25l-2.6 1.5"
      />
    </>
  ),
  // 소나기 (새로 그림: 해 + 구름 + 빗줄기)
  SHOWER: (
    <>
      <g stroke={SUN}>
        <circle cx="17" cy="6" r="2.4" />
        <path d="M17 1.8v1M21.2 6h-1M20 3l-.7.7" />
      </g>
      <path stroke={RAIN} d="M5.5 15h9a3.5 3.5 0 0 0 .4-6.97A4.8 4.8 0 0 0 5.7 8.5 3.3 3.3 0 0 0 5.5 15z" />
      <path stroke={RAIN} d="M7.5 18l-1 2.5M11.5 18l-1 2.5" />
    </>
  ),
};

const LABELS = {
  CLEAR: '맑음',
  PARTLY_CLOUDY: '구름많음',
  CLOUDY: '흐림',
  RAIN: '비',
  SLEET: '비/눈',
  SNOW: '눈',
  SHOWER: '소나기',
};

// 기상청 SKY·PTY 코드를 아이콘 이름으로 바꿉니다.
export function toWeatherIconType(sky, pty) {
  const p = Number(pty);
  if (p === 1) return 'RAIN';
  if (p === 2) return 'SLEET';
  if (p === 3) return 'SNOW';
  if (p === 4) return 'SHOWER';
  const s = Number(sky);
  if (s === 3) return 'PARTLY_CLOUDY';
  if (s === 4) return 'CLOUDY';
  return 'CLEAR';
}

// type: CLEAR | PARTLY_CLOUDY | CLOUDY | RAIN | SLEET | SNOW | SHOWER
// size: px (기본 24, 홈 날씨 띠는 32)
// label: 넣으면 스크린리더가 읽음. 옆에 날씨 글자가 이미 있으면 비워 둠
export default function WeatherIcon({ type = 'CLEAR', size = 24, label, className }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      role={label ? 'img' : undefined}
      aria-label={label || undefined}
      aria-hidden={label ? undefined : true}
    >
      {ICONS[type] ?? ICONS.CLEAR}
    </svg>
  );
}

export { LABELS as WEATHER_LABELS };
