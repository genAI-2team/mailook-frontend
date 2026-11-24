"use client";

import { useEffect, useRef, useState } from "react";
import Script from "next/script";
import { useRouter } from "next/navigation";
import { trace } from "../../lib/logger";
import styles from "./info.module.css";
import { saveSignupPlaces } from "../../../api/placeApi";
import { DAYS, ENVIRONMENTS, INDOOR_TEMPS, validatePlaces, buildPlacesPayload } from "./place-form.mjs";

/** 회원가입 두 번째 단계. 집과 활동 장소의 기본 정보를 입력하는 화면이다. */
export default function Info() {
  const router = useRouter();
  const [input, setInput] = useState({ home_address: "", depart_time: "07:30", home_arrive_time: "19:00", name: "", address: "", arrive_time: "09:00", leave_time: "18:30", day_of_week: ["MON", "TUE", "WED", "THU", "FRI"], environment: "INDOOR", indoor_temp: "NORMAL", location_consent: false });
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
    return trace("SignupInfo.handleChange", () => {
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
    return trace("SignupInfo.navigate", () => router.push(path));
  }

  function handleSearch(field) {
    return trace("SignupInfo.handleSearch", () => {
      if (!input[field].trim()) {
        setErrors((previous) => ({ ...previous, [field]: "검색할 주소를 입력해 주세요." }));
        return;
      }
      if (!mapReady || !map.current) {
        setMapMessage("지도가 준비된 후 다시 검색해 주세요.");
        return;
      }
      const id = ++requestId.current;
      setSearchResults(null);
      setMapMessage("주소를 검색하고 있어요.");
      const { services } = window.kakao.maps;
      new services.Geocoder().addressSearch(input[field].trim(), (results, status) => {
        if (id !== requestId.current || !map.current) return;
        if (status === services.Status.OK && results.length) {
          setSearchResults({ field, items: results });
          setMapMessage("검색 결과에서 원하는 주소를 선택해 주세요.");
          return;
        }
        new services.Places().keywordSearch(input[field].trim(), (places, placeStatus) => {
          if (id !== requestId.current || !map.current) return;
          if (placeStatus !== services.Status.OK || !places.length) {
            setMapMessage("주소를 찾지 못했어요. 도로명·지번 주소로 다시 검색해 주세요.");
            return;
          }
          setSearchResults({ field, items: places });
          setMapMessage("검색 결과에서 원하는 장소를 선택해 주세요.");
        });
      });
    });
  }

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
    const nextErrors = validatePlaces(input, positions);
    setErrors(nextErrors);
    setSaveMessage("");
    if (Object.keys(nextErrors).length) return;
    saving.current = true;
    setBusy(true);
    requestId.current += 1;
    try {
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
        <input id={field} name="address" data-place-type={field === "home_address" ? "HOME" : "ACTIVITY"}
          placeholder={field === "home_address" ? "집 주소를 검색해 주세요" : "주소 또는 건물명을 검색해 주세요"}
          value={input[field]} onChange={event => handleChange({ target: { name: field, value: event.target.value } })}
          onKeyDown={event => { if (event.key === "Enter") { event.preventDefault(); handleSearch(field); } }}
          maxLength={100} aria-invalid={!!errors[field]} aria-describedby={errors[field] ? field + "-error" : undefined} />
        <button type="button" onClick={() => handleSearch(field)} disabled={!mapReady}>검색</button>
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

  function timeField(field, label, name = field) {
    return <div className={styles.field}>
      <label htmlFor={field}>{label}</label>
      <input id={field} name={name} type="time" value={input[field]}
        onChange={event => handleChange({ target: { name: field, value: event.target.value } })}
        aria-invalid={!!errors[field]} aria-describedby={errors[field] ? field + "-error" : undefined} />
      {errorFor(field)}
    </div>;
  }

  return trace("SignupInfo.render", () => (
    <main className={styles.page} lang="ko">
      <header className={styles.header}>
        <span className={styles.brand}>mAILOOK</span>
        <button type="button" className={styles.login} onClick={() => navigate("/login")}>로그인</button>
      </header>
      <section className={styles.card} aria-labelledby="info-title">
        <div className={styles.heading}>
          <div><h1 id="info-title">회원가입</h1><p>집과 활동 장소, 가는 시간을 알려주세요.</p></div>
          <ol className={styles.steps} aria-label="회원가입 단계"><li>1 계정</li><li aria-current="step">2 기본 정보</li><li>3 내 성향</li></ol>
        </div>
        <form onSubmit={handleNext} aria-busy={busy}>
        <div className={styles.columns}>
          <fieldset className={styles.fields} disabled={busy}>
            <legend className={styles.srOnly}>집과 활동 장소 정보</legend>
            {addressField("home_address", "집")}
            <div className={styles.timeRow}>
              {timeField("depart_time", "나가는 시간")}
              {timeField("home_arrive_time", "돌아오는 시간", "arrive_time")}
            </div>
            <fieldset className={styles.place}>
              <legend>활동 장소</legend>
              <div className={styles.field}>
                <label htmlFor="name">이름</label>
                <input id="name" name="name" placeholder="직장" value={input.name} onChange={handleChange} maxLength={30} aria-invalid={!!errors.name} aria-describedby={errors.name ? "name-error" : undefined} />
                {errorFor("name")}
              </div>
              {addressField("address", "위치")}
              <fieldset className={styles.choiceGroup}>
                <legend>가는 요일</legend>
                <div className={styles.days}>{DAYS.map(([value, label]) => <label key={value}>
                  <input type="checkbox" name="day_of_week" value={value} checked={input.day_of_week.includes(value)} onChange={() => toggleDay(value)} />
                  <span>{input.day_of_week.includes(value) ? "✓ " : ""}{label}</span>
                </label>)}</div>
                {errorFor("day_of_week")}
              </fieldset>
              <div className={styles.timeRow}>
                {timeField("arrive_time", "도착 시간")}
                {timeField("leave_time", "떠나는 시간")}
              </div>
              <fieldset className={styles.choiceGroup}>
                <legend>주로 머무는 곳</legend>
                <div className={styles.segments}>{ENVIRONMENTS.map(([value, label]) => <label key={value}>
                  <input type="radio" name="environment" value={value} checked={input.environment === value} onChange={handleChange} /><span>{label}</span>
                </label>)}</div>
                {errorFor("environment")}
              </fieldset>
              <fieldset className={styles.choiceGroup} disabled={input.environment === "OUTDOOR"}>
                <legend>실내 온도</legend>
                <div className={styles.segments}>{INDOOR_TEMPS.map(([value, label]) => <label key={value}>
                  <input type="radio" name="indoor_temp" value={value} checked={input.environment !== "OUTDOOR" && input.indoor_temp === value} onChange={handleChange} /><span>{label}</span>
                </label>)}</div>
                {errorFor("indoor_temp")}
              </fieldset>
              <p className={styles.help}>다른 활동 장소는 가입 후 내 설정 › 장소·일정 설정에서 더할 수 있어요.</p>
            </fieldset>
            <div className={styles.consent}>
              <label><input type="checkbox" name="location_consent" checked={input.location_consent} onChange={handleChange} /><span>(필수) 위치 정보 이용에 동의해요</span></label>
              {errorFor("location_consent")}
            </div>
          </fieldset>
          <aside className={styles.mapArea} aria-label="지도 안내">
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
            <button type="button" className={styles.locationButton} disabled={!mapReady} onClick={locateCurrentPosition}>현재 위치로 이동</button>
            <p>위치 권한을 허용하면 현재 위치를 지도에 표시해요. 주소 검색으로 집과 활동 장소를 확인할 수 있어요.</p>
            {mapMessage && <p className={styles.notice} role="status">{mapMessage}</p>}
          </aside>
        </div>
        {saveMessage && <p className={styles.error} role="alert">{saveMessage}</p>}
        <footer className={styles.actions}>
          <button type="button" disabled={busy} onClick={() => navigate("/signup")}>이전</button>
          <button type="submit" className={styles.next} disabled={busy}>{busy ? "저장 중…" : "저장하고 다음"}</button>
        </footer>
        </form>
      </section>
    </main>
  ));
}
