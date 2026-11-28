"use client";

import { useEffect, useRef, useState } from "react";
import Script from "next/script";
import { useRouter } from "next/navigation";
import { trace, logExecution } from "@/app/lib/logger";
// [변경 전 — 2026-11-28] import styles from "./info.module.css";
// [변경 후 — 2026-11-28] /places로 이동하고 스타일 이름을 통일한다.
import styles from "./places.module.css";
// [변경 후 — 2026-11-27] 공통 화면 요소와 enum 상수를 사용한다.
import { Button, Input, Chip, Segmented, CheckItem, AlertBox } from "@/components/common";
import { PLACE_TYPE, PLACE_ENVIRONMENT, INDOOR_TEMP } from "@/constants";
// [신규 — 2026-11-27] 가입 화면에서 설정한 회원 정보를 공통 Context로 받는다.
import { useAuth } from "@/app/context/AuthContext";
// [변경 전 — 2026-11-27] import { saveSignupPlaces } from "../../../api/placeApi";
// [변경 전 — 2026-11-27] user 패키지 InfoController의 등록 API를 사용했다.
// [변경 전 — 2026-11-28] import { saveInfo } from "@/api/infoApi";
// [변경 후 — 2026-11-28] PlaceController와 연결되는 공통 장소 API를 사용한다.
import { saveSignupPlaces } from "@/api/placeApi";
// [변경 전 — 2026-11-28] import { DAYS, ENVIRONMENTS, INDOOR_TEMPS, validatePlaces, buildPlacesPayload } from "./place-form.mjs";
import { DAYS, ENVIRONMENTS, INDOOR_TEMPS, validatePlaces, buildPlacesPayload, toTimeValue, searchPlaceAddresses } from "./place-form.mjs";

// [신규 — 2026-11-28] 시·분은 목록 선택과 직접 입력을 지원하고, 시계는 브라우저 시간 선택창을 연다.
function PlaceTimeInput({ id, label, name, value, onChange, error }) {
  const initialHour = Number(value.split(":")[0] || 0);
  const [period, setPeriod] = useState(initialHour >= 12 ? "PM" : "AM");
  const [hour, setHour] = useState(String(initialHour % 12 || 12).padStart(2, "0"));
  const [minute, setMinute] = useState(value.split(":")[1] || "00");
  const [openPart, setOpenPart] = useState(null);
  const nativeTime = useRef(null);

  function commit(nextPeriod, nextHour, nextMinute) {
    onChange(toTimeValue(nextPeriod, nextHour, nextMinute));
  }

  function changePart(part, text) {
    if (!/^\d{0,2}$/.test(text)) return;
    if (part === "hour") { setHour(text); commit(period, text, minute); }
    else { setMinute(text); commit(period, hour, text); }
  }

  function openPicker() {
    if (nativeTime.current?.showPicker) {
      try { nativeTime.current.showPicker(); return; } catch { /* 지원되지 않으면 기본 입력에 포커스한다. */ }
    }
    nativeTime.current?.focus();
    nativeTime.current?.click();
  }

  function partInput(part, text, max, caption) {
    function choose(number) {
      changePart(part, String(number).padStart(2, "0"));
      setOpenPart(null);
    }
    return <div className={styles.timePart}>
      <input id={id + "-" + part} aria-label={label + " " + caption} type="text" inputMode="numeric" autoComplete="off" maxLength={2}
        role="combobox" aria-expanded={openPart === part} aria-controls={id + "-" + part + "-options"} aria-autocomplete="list" aria-invalid={!!error}
        placeholder={caption} value={text} onFocus={event => { event.target.select(); setOpenPart(part); }}
        onClick={() => setOpenPart(part)} onChange={event => changePart(part, event.target.value)}
        onBlur={() => { setOpenPart(null); if (/^\d{1,2}$/.test(text)) { if (part === "hour") setHour(text.padStart(2, "0")); else setMinute(text.padStart(2, "0")); } }}
        onKeyDown={event => {
          if (event.key === "Escape" || event.key === "Enter") { if (openPart === part) event.preventDefault(); setOpenPart(null); }
          if (event.key === "ArrowDown" || event.key === "ArrowUp") {
            event.preventDefault();
            const min = part === "hour" ? 1 : 0;
            const range = max - min + 1;
            const next = (Number(text) - min + (event.key === "ArrowDown" ? 1 : -1) + range) % range + min;
            changePart(part, String(next).padStart(2, "0")); setOpenPart(part);
          }
        }} />
      {openPart === part && <div id={id + "-" + part + "-options"} role="listbox" aria-label={label + " " + caption + " 선택"} className={styles.timeOptions}>
        {Array.from({ length: part === "hour" ? 12 : 60 }, (_, index) => {
          const number = part === "hour" ? index + 1 : index;
          return <button key={number} type="button" role="option" tabIndex={-1} aria-selected={Number(text) === number}
            onMouseDown={event => event.preventDefault()} onClick={() => choose(number)}>{String(number).padStart(2, "0")}</button>;
        })}
      </div>}
    </div>;
  }

  return <div className={styles.field}>
    <label htmlFor={id + "-hour"}>{label}</label>
    <div className={styles.timeInput} role="group" aria-label={label} data-invalid={!!error} aria-describedby={error ? id + "-error" : undefined}>
      <select aria-label={label + " 오전/오후"} value={period} onChange={event => { setPeriod(event.target.value); commit(event.target.value, hour, minute); }}>
        <option value="AM">오전</option><option value="PM">오후</option>
      </select>
      {partInput("hour", hour, 12, "시")}
      <span aria-hidden="true">:</span>
      {partInput("minute", minute, 59, "분")}
      <button type="button" className={styles.clockButton} aria-label={label + " 시간 선택창 열기"} onClick={openPicker}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><circle cx="12" cy="12" r="9" /><path d="M12 6v6l4 2" /></svg>
      </button>
      <input ref={nativeTime} className={styles.nativeTime} type="time" name={name} value={value} tabIndex={-1} aria-label={label + " 기본 시간 선택"}
        onChange={event => { const next = event.target.value; const h = Number(next.split(":")[0]); setPeriod(h >= 12 ? "PM" : "AM"); setHour(String(h % 12 || 12).padStart(2, "0")); setMinute(next.split(":")[1] || "00"); onChange(next); }} />
    </div>
    {error && <p id={id + "-error"} className={styles.error} role="alert">{error}</p>}
  </div>;
}

/** 회원가입 두 번째 단계. 집과 활동 장소의 기본 정보를 입력하는 화면이다. */
// [변경 전 — 2026-11-28] export default function Info() {
export default function Places() {
  const router = useRouter();
  const { user, isRestoring } = useAuth();

  // [?? ?] ??? ? trace ?? useEffect?? ?? ?? ??? ????.
  // ???? ??? ? ???? logger? new Date()? ?? ??? ? ???? ?? ??.
  useEffect(() => {
    logExecution("EFFECT Places: ?? ??");
  }, []);
  const [input, setInput] = useState({ home_address: "", depart_time: "07:30", home_arrive_time: "19:00", name: "", address: "", arrive_time: "09:00", leave_time: "18:30", day_of_week: ["MON", "TUE", "WED", "THU", "FRI"], environment: PLACE_ENVIRONMENT.INDOOR, indoor_temp: INDOOR_TEMP.NORMAL, location_consent: false });
  const [positions, setPositions] = useState({ home_address: null, address: null });
  const [searchResults, setSearchResults] = useState(null);
  const [busy, setBusy] = useState(false);
  const saving = useRef(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [errors, setErrors] = useState({});
  const [mapMessage, setMapMessage] = useState("");
  const [mapReady, setMapReady] = useState(false);
  const mapContainer = useRef(null);
  const map = useRef(null);
  const marker = useRef(null);
  const requestId = useRef(0);
  const appKey = process.env.NEXT_PUBLIC_KAKAO_MAP_APP_KEY;

  useEffect(() => () => {
    requestId.current += 1;
    marker.current?.setMap(null);
    marker.current = null;
    map.current = null;
  }, []);

  function showPosition(position) {
    if (!map.current) return;
    if (!marker.current) {
      marker.current = new window.kakao.maps.Marker({ map: map.current, position });
    } else {
      marker.current.setPosition(position);
    }
    map.current.setCenter(position);
    map.current.setLevel(3);
  }

  function locateCurrentPosition() {
    const id = ++requestId.current;
    if (!navigator.geolocation) {
      setMapMessage("현재 위치를 지원하지 않는 브라우저예요. 주소를 검색해 주세요.");
      return;
    }
    setMapMessage("현재 위치를 확인하고 있어요. 브라우저의 위치 권한을 허용해 주세요.");
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        if (id !== requestId.current || !map.current) return;
        showPosition(new window.kakao.maps.LatLng(coords.latitude, coords.longitude));
        setMapMessage("현재 위치를 표시했어요. 집이나 활동 장소는 주소를 검색해 지정해 주세요.");
      },
      (error) => {
        if (id !== requestId.current || !map.current) return;
        setMapMessage(error.code === 1
          ? "위치 권한이 차단되어 있어요. 브라우저에서 권한을 허용하거나 주소를 검색해 주세요."
          : "현재 위치를 확인하지 못했어요. 다시 시도하거나 주소를 검색해 주세요.");
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 },
    );
  }

  function initializeMap() {
    window.kakao.maps.load(() => {
      if (!mapContainer.current || map.current) return;
      try {
        map.current = new window.kakao.maps.Map(mapContainer.current, {
          center: new window.kakao.maps.LatLng(37.5665, 126.978),
          level: 5,
        });
        map.current.addControl(new window.kakao.maps.ZoomControl(), window.kakao.maps.ControlPosition.RIGHT);
        setMapReady(true);
        locateCurrentPosition();
      } catch {
        setMapMessage("지도를 시작하지 못했어요. 카카오 키와 허용 도메인 설정을 확인해 주세요.");
      }
    });
  }

  function handleChange(event) {
    return trace("Places.handleChange", () => {
      const { name, value, type, checked } = event.target;
      setInput((previous) => ({ ...previous, [name]: type === "checkbox" ? checked : value }));
      setErrors((previous) => ({ ...previous, [name]: "" }));
      setSaveMessage("");
      if (name === "home_address" || name === "address") {
        requestId.current += 1;
        setPositions(previous => ({ ...previous, [name]: null }));
        setSearchResults(null);
      }
    });
  }

  function navigate(path) {
    return trace("Places.navigate", () => router.push(path));
  }

  // [변경 후 — 2026-11-28] 두 주소 모두 같은 검색 모듈을 호출하고 해당 입력란 아래 목록을 표시한다.
  async function handleSearch(field) {
    if (!input[field].trim()) {
      setErrors(previous => ({ ...previous, [field]: "검색할 주소 또는 장소 이름을 입력해 주세요." }));
      return;
    }
    if (!mapReady || !map.current) {
      setMapMessage("지도가 준비된 후 다시 검색해 주세요.");
      return;
    }
    const id = ++requestId.current;
    setSearchResults(null);
    setErrors(previous => ({ ...previous, [field]: "" }));
    setMapMessage("주소 또는 장소 이름을 검색하고 있어요.");
    try {
      const items = await searchPlaceAddresses(window.kakao.maps.services, input[field]);
      if (id !== requestId.current || !map.current) return;
      if (!items.length) {
        const message = "검색 결과가 없어요. 장소 이름의 핵심 단어나 도로명·지번 주소로 다시 검색해 주세요.";
        setErrors(previous => ({ ...previous, [field]: message }));
        setMapMessage(message);
        return;
      }
      setSearchResults({ field, items });
      setMapMessage("검색 결과에서 원하는 장소를 선택해 주세요.");
    } catch (error) {
      if (id !== requestId.current || !map.current) return;
      setErrors(previous => ({ ...previous, [field]: error.message }));
      setMapMessage(error.message);
    }
  }

  // [변경 전 — 2026-11-28] 주소 검색 후 명칭 검색을 시도하던 이전 처리.
//   function handleSearch(field) {
//     return trace("Places.handleSearch", () => {
//       if (!input[field].trim()) {
//         setErrors((previous) => ({ ...previous, [field]: "검색할 주소를 입력해 주세요." }));
//         return;
//       }
//       if (!mapReady || !map.current) {
//         setMapMessage("지도가 준비된 후 다시 검색해 주세요.");
//         return;
//       }
//       const id = ++requestId.current;
//       setSearchResults(null);
//       setMapMessage("주소를 검색하고 있어요.");
//       const { services } = window.kakao.maps;
//       new services.Geocoder().addressSearch(input[field].trim(), (results, status) => {
//         if (id !== requestId.current || !map.current) return;
//         if (status === services.Status.OK && results.length) {
//           setSearchResults({ field, items: results });
//           setMapMessage("검색 결과에서 원하는 주소를 선택해 주세요.");
//           return;
//         }
//         new services.Places().keywordSearch(input[field].trim(), (places, placeStatus) => {
//           if (id !== requestId.current || !map.current) return;
//           if (placeStatus !== services.Status.OK || !places.length) {
//             setMapMessage("주소를 찾지 못했어요. 도로명·지번 주소로 다시 검색해 주세요.");
//             return;
//           }
//           setSearchResults({ field, items: places });
//           setMapMessage("검색 결과에서 원하는 장소를 선택해 주세요.");
//         });
//       });
//     });
//   }
// 
// 

  function selectAddress(result) {
    const field = searchResults.field;
    const id = ++requestId.current;
    const latitude = Number(result.y);
    const longitude = Number(result.x);
    const { services } = window.kakao.maps;
    new services.Geocoder().coord2RegionCode(longitude, latitude, (regions, status) => {
      if (id !== requestId.current || !map.current) return;
      const region = status === services.Status.OK && regions.find(item => item.region_type === "B");
      if (!region) {
        setMapMessage("동 주소를 확인하지 못했어요. 다시 검색해 주세요.");
        return;
      }
      const address = [region.region_1depth_name, region.region_2depth_name, region.region_3depth_name].filter(Boolean).join(" ");
      setInput(previous => ({ ...previous, [field]: result.road_address_name || result.address_name }));
      setPositions(previous => ({ ...previous, [field]: { latitude, longitude, address } }));
      setErrors(previous => ({ ...previous, [field]: "" }));
      setSearchResults(null);
      showPosition(new window.kakao.maps.LatLng(latitude, longitude));
      setMapMessage("선택한 위치를 확인했어요.");
    });
  }

  function toggleDay(day) {
    setInput(previous => ({ ...previous, day_of_week: previous.day_of_week.includes(day)
      ? previous.day_of_week.filter(value => value !== day) : [...previous.day_of_week, day] }));
    setErrors(previous => ({ ...previous, day_of_week: "" }));
  }

  async function handleNext(event) {
    event.preventDefault();
    if (saving.current) return;
    // [신규 — 2026-11-28] 버튼뿐 아니라 Enter 제출도 동의 체크 없이는 저장하지 않는다.
    if (input.location_consent !== true) {
      setErrors(previous => ({ ...previous, location_consent: "위치 정보 이용에 동의해 주세요." }));
      return;
    }
    // [신규 — 2026-11-27] Enter 제출에서도 가입 계정 확인 전 저장을 막는다.
    if (isRestoring || !user) {
      setSaveMessage("회원가입 또는 로그인 후 기본 정보를 등록해 주세요.");
      return;
    }
    const nextErrors = validatePlaces(input, positions);
    setErrors(nextErrors);
    setSaveMessage("");
    if (Object.keys(nextErrors).length) return;
    saving.current = true;
    setBusy(true);
    requestId.current += 1;
    try {
      // [변경 전 — 2026-11-27] await saveSignupPlaces(buildPlacesPayload(input, positions));
      // [변경 전 — 2026-11-27] HOME·ACTIVITY와 체크한 요일을 /api/auth/info에 등록했다.
      // 로그인 JWT는 공통 axios가 첨부한다. user_id/place_id는 요청에 넣지 않는다.
      // [변경 전 — 2026-11-28] await saveInfo(buildPlacesPayload(input, positions));
      // [변경 후 — 2026-11-28] POST /api/places/signup → PlaceController.insert
      await saveSignupPlaces(buildPlacesPayload(input, positions));
      router.push("/signup/preference");
    } catch (error) {
      setSaveMessage(error.message);
    } finally {
      saving.current = false;
      setBusy(false);
    }
  }

  function errorFor(field) {
    return errors[field] && <p id={field + "-error"} className={styles.error} role="alert">{errors[field]}</p>;
  }

  function addressField(field, label) {
    return <div className={styles.field}>
      <label htmlFor={field}>{label}</label>
      <div className={styles.searchRow}>
        <Input id={field} name={field} data-place-type={field === "home_address" ? PLACE_TYPE.HOME : PLACE_TYPE.ACTIVITY}
          placeholder={field === "home_address" ? "집 주소를 검색해 주세요" : "주소 또는 건물명을 검색해 주세요"}
          value={input[field]} onChange={event => handleChange({ target: { name: field, value: event.target.value } })}
          onKeyDown={event => { if (event.key === "Enter") { event.preventDefault(); handleSearch(field); } }}
          maxLength={100} aria-invalid={!!errors[field]} aria-describedby={errors[field] ? field + "-error" : undefined} />
        <Button variant="secondary" onClick={() => handleSearch(field)} disabled={!mapReady}>검색</Button>
      </div>
      {searchResults?.field === field && <ul className={styles.results} aria-label={label + " 검색 결과"}>
        {searchResults.items.map((result, index) => <li key={index}><button type="button" onClick={() => selectAddress(result)}>
          {result.place_name && <strong>{result.place_name}<br /></strong>}{result.road_address_name || result.address_name}
        </button></li>)}
      </ul>}
      {positions[field] && <small className={styles.coordinate}>위도 {positions[field].latitude.toFixed(2)} / 경도 {positions[field].longitude.toFixed(2)}</small>}
      {errorFor(field)}
    </div>;
  }

  // [변경 전 — 2026-11-28] 공통 Input의 type="time"만 사용하여 브라우저별 입력 방식이 달랐다.
  // return <Input id={field} label={label} name={name} type="time" value={input[field]}
  //   onChange={event => handleChange({ target: { name: field, value: event.target.value } })} error={errors[field]} />;
  // [변경 후 — 2026-11-28] 네 시간 입력 모두 같은 선택/직접 입력 방식을 사용한다.
  function timeField(field, label, name = field) {
    return <PlaceTimeInput id={field} label={label} name={name} value={input[field]}
      onChange={value => handleChange({ target: { name: field, value } })}
      error={errors[field]} />;
  }

  // [변경 후 — 2026-11-27] 공통 Header/Footer와 전체 너비의 반응형 회원가입 화면.
  return (
    <div className={styles.shell}>
      {/* [변경 전 — 2026-11-28] <Header /> */}
      {/* [변경 후 — 2026-11-28] /places는 AppShell에서 공통 헤더·푸터를 적용한다. */}
      <main className={styles.page} lang="ko">
        <section className={styles.card} aria-labelledby="places-title">
          <div className={styles.heading}>
            {/* [변경 전 — 2026-11-27] 계정 표시 없이 안내 문구만 출력했다. */}
            {/* [변경 후 — 2026-11-27] 서버에서 가입 완료된 계정 정보를 표시한다. */}
            <div><p className={styles.eyebrow}>나에게 맞는 옷차림의 시작</p><h1 id="places-title">기본 정보 입력</h1><p>집과 활동 장소, 가는 시간을 알려주세요.</p>
              <p role="status">{isRestoring ? "가입 계정 확인 중…" : user ? `가입 계정: ${user.email}${user.nickname ? ` · ${user.nickname}님` : ""}` : "회원가입 또는 로그인 후 기본 정보를 등록해 주세요."}</p>
            </div>
            <ol className={styles.steps} aria-label="회원가입 단계"><li>1 계정</li><li aria-current="step">2 기본 정보</li><li>3 내 성향</li></ol>
          </div>
          <form onSubmit={handleNext} aria-busy={busy}>
            <div className={styles.columns}>
              <fieldset className={styles.fields} disabled={busy}>
                <legend className={styles.srOnly}>집과 활동 장소 정보</legend>
                <section className={styles.section} aria-labelledby="home-title">
                  <div className={styles.sectionHeading}><h2 id="home-title">집</h2><span>매일의 출발점</span></div>
                  {addressField("home_address", "집 주소")}
                  <div className={styles.timeRow}>{timeField("depart_time", "나가는 시간")}{timeField("home_arrive_time", "돌아오는 시간", "arrive_time")}</div>
                </section>
                <section className={styles.section} aria-labelledby="activity-title">
                  <div className={styles.sectionHeading}><h2 id="activity-title">활동 장소</h2><span>직장 · 학교 · 자주 가는 곳</span></div>
                  <Input id="name" name="name" label="장소 이름" placeholder="예: 직장, 학교, 운동" value={input.name} onChange={handleChange} maxLength={30} error={errors.name} />
                  {addressField("address", "활동 장소 주소")}
                  <fieldset className={styles.choiceGroup}><legend>가는 요일</legend>
                    <div className={styles.days}>{DAYS.map(([value, label]) => <Chip key={value} selected={input.day_of_week.includes(value)} showCheck onClick={() => toggleDay(value)}>{label}</Chip>)}</div>
                    {errorFor("day_of_week")}
                  </fieldset>
                  <div className={styles.timeRow}>{timeField("arrive_time", "도착 시간")}{timeField("leave_time", "떠나는 시간")}</div>
                  <fieldset className={styles.choiceGroup}><legend>주로 머무는 곳</legend>
                    <Segmented label="주로 머무는 곳" options={ENVIRONMENTS.map(([value, label]) => ({ value, label }))} value={input.environment} onChange={value => handleChange({ target: { name: "environment", value } })} />
                    {errorFor("environment")}
                  </fieldset>
                  <fieldset className={styles.choiceGroup} disabled={input.environment === PLACE_ENVIRONMENT.OUTDOOR}><legend>실내 온도</legend>
                    <Segmented label="실내 온도" options={INDOOR_TEMPS.map(([value, label]) => ({ value, label }))} value={input.environment === PLACE_ENVIRONMENT.OUTDOOR ? null : input.indoor_temp} onChange={value => handleChange({ target: { name: "indoor_temp", value } })} />
                    {errorFor("indoor_temp")}
                  </fieldset>
                  <p className={styles.help}>다른 활동 장소는 가입 후 장소·일정 설정에서 추가할 수 있어요.</p>
                </section>
                <div className={styles.consent}><CheckItem checked={input.location_consent} title="위치 정보 이용에 동의합니다. (필수)" description="주소는 동 단위, 좌표는 소수점 둘째 자리까지만 저장해요." onChange={checked => handleChange({ target: { name: "location_consent", type: "checkbox", checked } })} />{errorFor("location_consent")}</div>
              </fieldset>
          <aside className={styles.mapArea} aria-label="지도 안내"><div className={styles.mapHeading}><h2>장소 확인</h2><p>검색한 집과 활동 장소를 지도에서 확인하세요.</p></div>
            {appKey && <Script
              id="kakao-map-sdk"
              src={`https://dapi.kakao.com/v2/maps/sdk.js?appkey=${encodeURIComponent(appKey)}&autoload=false&libraries=services`}
              onReady={initializeMap}
              onError={() => setMapMessage("지도를 불러오지 못했어요. 네트워크와 카카오 키, 허용 도메인을 확인해 주세요.")}
            />}
            <div className={styles.mapFrame}>
              <div ref={mapContainer} className={styles.mapCanvas} role="region" aria-label="현재 위치 및 검색한 주소 지도" />
              {!mapReady && <div className={styles.mapPlaceholder}>
                <strong>카카오 지도</strong>
                <span>{appKey ? "지도를 불러오고 있어요." : "카카오 지도 키를 등록하면 현재 위치 지도를 볼 수 있어요."}</span>
              </div>}
            </div>
            <Button variant="secondary" className={styles.locationButton} disabled={!mapReady} onClick={locateCurrentPosition}>현재 위치로 이동</Button>
            <p>위치 권한을 허용하면 현재 위치를 지도에 표시해요. 주소 검색으로 집과 활동 장소를 확인할 수 있어요.</p>
            {mapMessage && <p className={styles.notice} role="status">{mapMessage}</p>}
          </aside>
            </div>
            {saveMessage && <AlertBox title="기본 정보를 저장하지 못했어요" message={saveMessage} />}
            {/* [변경 전 — 2026-11-27] disabled={busy || !input.location_consent} */}
            {/* [변경 후 — 2026-11-27] 회원 정보가 확인된 경우에만 저장을 허용한다. */}
            <div className={styles.actions}><Button variant="secondary" disabled={busy} onClick={() => navigate("/signup")}>이전</Button><Button type="submit" disabled={busy || isRestoring || !user || input.location_consent !== true}>{busy ? "저장 중…" : "저장하고 다음"}</Button></div>
          </form>
        </section>
      </main>
      {/* [변경 전 — 2026-11-28] <Footer /> — AppShell에서 표시 */}
    </div>
  );
}
 
