"use client";

import { useEffect, useRef, useState } from "react";
import Script from "next/script";
import { useRouter } from "next/navigation";
import { trace } from "../../lib/logger";
import styles from "./info.module.css";

/** 회원가입 두 번째 단계. 집과 활동 장소의 기본 정보를 입력하는 화면이다. */
export default function Info() {
  const router = useRouter();
  const [input, setInput] = useState({ home: "", departure: "07:30", placeName: "", placeAddress: "", returning: "19:00", consent: false });
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
      setMapMessage("주소를 검색하고 있어요.");
      const { services } = window.kakao.maps;
      new services.Geocoder().addressSearch(input[field].trim(), (results, status) => {
        if (id !== requestId.current || !map.current) return;
        if (status !== services.Status.OK || !results.length) {
          setMapMessage("주소를 찾지 못했어요. 도로명 또는 지번 주소를 입력해 주세요.");
          return;
        }
        const result = results[0];
        showPosition(new window.kakao.maps.LatLng(Number(result.y), Number(result.x)));
        setMapMessage(`${result.address_name} 위치를 표시했어요.`);
      });
    });
  }

  function handleNext() {
    return trace("SignupInfo.handleNext", () => {
      const nextErrors = {};
      if (!input.home.trim()) nextErrors.home = "집 위치를 입력해 주세요.";
      if (!input.departure) nextErrors.departure = "나가는 시간을 선택해 주세요.";
      if (!input.placeName.trim()) nextErrors.placeName = "활동 장소 이름을 입력해 주세요.";
      if (!input.placeAddress.trim()) nextErrors.placeAddress = "활동 장소 위치를 입력해 주세요.";
      if (!input.returning) nextErrors.returning = "돌아오는 시간을 선택해 주세요.";
      if (!input.consent) nextErrors.consent = "다음 단계로 가려면 위치 정보 이용에 동의해 주세요.";
      setErrors(nextErrors);
      if (!Object.keys(nextErrors).length) router.push("/signup/preference");
    });
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
        <div className={styles.columns}>
          <div className={styles.fields}>
            <div className={styles.field}>
              <label htmlFor="home-address">집</label>
              <div className={styles.searchRow}>
                <input id="home-address" name="home" placeholder="예: 경기 용인시 수지구 풍덕천동" value={input.home} onChange={handleChange} maxLength={100} aria-invalid={!!errors.home} aria-describedby="home-error" />
                <button type="button" onClick={() => handleSearch("home")} aria-label="집 위치 검색">검색</button>
              </div>
              <p id="home-error" className={styles.error} role="alert">{errors.home}</p>
            </div>
            <div className={styles.field}>
              <label htmlFor="departure-time">나가는 시간</label>
              <input id="departure-time" name="departure" type="time" value={input.departure} onChange={handleChange} aria-invalid={!!errors.departure} aria-describedby="departure-error" />
              <p id="departure-error" className={styles.error} role="alert">{errors.departure}</p>
            </div>
            <fieldset className={styles.place}>
              <legend>활동 장소</legend>
              <div className={styles.field}>
                <label htmlFor="place-name">이름</label>
                <input id="place-name" name="placeName" placeholder="예: 직장" value={input.placeName} onChange={handleChange} maxLength={50} aria-invalid={!!errors.placeName} aria-describedby="place-name-error" />
                <p id="place-name-error" className={styles.error} role="alert">{errors.placeName}</p>
              </div>
              <div className={styles.field}>
                <label htmlFor="place-address">위치</label>
                <div className={styles.searchRow}>
                  <input id="place-address" name="placeAddress" placeholder="활동 장소 주소" value={input.placeAddress} onChange={handleChange} maxLength={100} aria-invalid={!!errors.placeAddress} aria-describedby="place-address-error" />
                  <button type="button" onClick={() => handleSearch("placeAddress")} aria-label="활동 장소 위치 검색">검색</button>
                </div>
                <p id="place-address-error" className={styles.error} role="alert">{errors.placeAddress}</p>
              </div>
            </fieldset>
            <div className={styles.field}>
              <label htmlFor="return-time">돌아오는 시간</label>
              <input id="return-time" name="returning" type="time" value={input.returning} onChange={handleChange} aria-invalid={!!errors.returning} aria-describedby="return-error" />
              <p id="return-error" className={styles.error} role="alert">{errors.returning}</p>
            </div>
            <div className={styles.consent}>
              <label><input type="checkbox" name="consent" checked={input.consent} onChange={handleChange} aria-invalid={!!errors.consent} aria-describedby="consent-help consent-error" /><span>(필수) 위치 정보 이용에 동의해요</span></label>
              <p id="consent-help">집과 활동 장소의 위치로 날씨를 조회해요. 동의하지 않으면 추천을 받을 수 없어요.</p>
              <p id="consent-error" className={styles.error} role="alert">{errors.consent}</p>
            </div>
          </div>
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
        <footer className={styles.actions}>
          <button type="button" onClick={() => navigate("/signup")}>이전</button>
          <button type="button" className={styles.next} onClick={handleNext}>다음</button>
        </footer>
      </section>
    </main>
  ));
}
