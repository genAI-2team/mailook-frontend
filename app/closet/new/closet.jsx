
"use client";

import {
  createClothes,
  createStorageLocation,
  getStorageLocations,
} from "@/api/clothesApi";
import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/common";
import { levelToClo } from "@/utils/warmth";
import {
  BREATHABILITY_OPTIONS,
  CLOTHES_CATEGORY,
  CLOTHES_CATEGORIES,
  DEFAULT_CATEGORY,
  DEFAULT_MATERIAL,
  DEFAULT_STORAGE_LOCATIONS,
  DEFAULT_STORAGE_STATUS,
  DEFAULT_WARMTH_LEVEL,
  MATERIAL_LABELS,
  NECK_COVER_OPTIONS,
  NO_STORAGE_LOCATION,
  STORAGE_STATUS_LABELS,
  WARMTH_LEVELS,
} from "../enums/clothesOptions";

const PHOTO_TYPES = ["image/jpeg", "image/png", "image/gif"];
const MAX_PHOTO_BYTES = 10 * 1024 * 1024;

export default function Closet() {
  const router = useRouter();
  const fileInputRef = useRef(null);

  // ========================================
  // 1. 이미지 관련 상태
  // ========================================

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

  // ========================================
  // 2. 옷 정보
  // ========================================

  const [name, setName] = useState("");
  const [category, setCategory] = useState(DEFAULT_CATEGORY);
  const [subType, setSubType] = useState(CLOTHES_CATEGORIES[DEFAULT_CATEGORY].types[0]);
  const [material, setMaterial] = useState(DEFAULT_MATERIAL);
  const isCarryItem = category === CLOTHES_CATEGORY.CARRY_ITEM;

  // ========================================
  // 3. 보온력, 통풍, 목 부분
  // ========================================

  const [warmth, setWarmth] = useState(DEFAULT_WARMTH_LEVEL);
  const [breathability, setBreathability] = useState(BREATHABILITY_OPTIONS[0].value);
  const [neckCover, setNeckCover] = useState(NECK_COVER_OPTIONS[0].value);

  // ========================================
  // 4. 보관 위치 및 상태
  // ========================================

  const [storageLocationId, setStorageLocationId] = useState(NO_STORAGE_LOCATION.id);
  const [storageStatus, setStorageStatus] = useState(DEFAULT_STORAGE_STATUS);

  const [locations, setLocations] = useState([]);
  const locationOptions = [
    ...locations.map(({ storageLocationId, name }) => ({ id: String(storageLocationId), name })),
    ...DEFAULT_STORAGE_LOCATIONS.filter((option) => !locations.some(({ name }) => name === option.name)),
    NO_STORAGE_LOCATION,
  ];
  const [loadingLocations, setLoadingLocations] = useState(true);
  const [locationLoadError, setLocationLoadError] = useState("");
  const [newLocation, setNewLocation] = useState("");
  const [locationOpen, setLocationOpen] = useState(false);
  const [savingLocation, setSavingLocation] = useState(false);
  const savingLocationRef = useRef(false);

  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;
    async function loadLocations() {
      try {
        const savedLocations = await getStorageLocations(signal);
        if (!signal.aborted) setLocations(savedLocations);
      } catch (error) {
        if (!signal.aborted) {
          setLocationLoadError(error.response?.data?.message || "보관 위치를 불러오지 못했습니다.");
        }
      } finally {
        if (!signal.aborted) setLoadingLocations(false);
      }
    }
    loadLocations();
    return () => controller.abort();
  }, []);

  // ========================================
  // 5. 여러 벌 등록
  // ========================================

  const [multiple, setMultiple] = useState(false);
  // null인 벌은 위에서 선택한 보관 위치를 따른다.
  const [pieces, setPieces] = useState([null]);

  // 저장 중 상태
  const [saving, setSaving] = useState(false);
  const savingRef = useRef(false);

  // ========================================
  // 6. 이미지 선택 및 미리보기
  // ========================================

  const handleImage = (file) => {
    if (!file) return;

    if (!PHOTO_TYPES.includes(file.type) || file.size === 0 || file.size > MAX_PHOTO_BYTES) {
      alert("10MB 이하의 JPG, PNG, GIF 사진을 선택해 주세요.");
      return;
    }

    setImageFile(file);

    const reader = new FileReader();

    reader.onload = () => {
      setImagePreview(reader.result);
    };

    reader.readAsDataURL(file);
  };

  // ========================================
  // 7. 보관 위치 등록
  // ========================================

  const handleAddLocation = async () => {
    const name = newLocation.trim();
    if (!name || savingLocationRef.current) return;

    savingLocationRef.current = true;
    setSavingLocation(true);
    try {
      const location = await createStorageLocation(name);
      setLocations((previous) => [...previous, location]);
      const savedId = String(location.storageLocationId);
      const defaultLocation = DEFAULT_STORAGE_LOCATIONS.find((option) => option.name === location.name);
      setStorageLocationId(savedId);
      if (defaultLocation) {
        setPieces((previous) => previous.map((piece) => piece === defaultLocation.id ? savedId : piece));
      }
      setNewLocation("");
      setLocationOpen(false);
    } catch (error) {
      alert(error.response?.data?.message || "보관 위치를 추가하지 못했습니다.");
    } finally {
      savingLocationRef.current = false;
      setSavingLocation(false);
    }
  };

  // ========================================
  // 8. 옷 등록 API 요청 (핵심 수정 부분)
  // ========================================

  const handleSave = async () => {

    if (savingRef.current) return;

    if (!imageFile) {
      alert("옷 사진을 첨부해 주세요.");
      return;
    }

    // 이름 필수 입력 확인
    if (!name.trim()) {
      alert("옷 이름을 입력해주세요.");
      return;
    }

    const locationIds = multiple
      ? [storageLocationId, ...pieces.map((locationId) => locationId ?? storageLocationId)]
      : [storageLocationId];

    // 백엔드 DTO에 전달할 JSON 데이터
    const clothesData = {
      name: name.trim(),
      category: category,
      subType: subType,
      material: material,

      clo: isCarryItem ? null : Number(levelToClo(warmth).toFixed(2)),

      breathability: isCarryItem ? null : breathability,

      neckCover:
        category === CLOTHES_CATEGORY.TOP ? neckCover : false,

      storageStatus: storageStatus,

      userEdited: true,
    };

    savingRef.current = true;
    setSaving(true);

    try {
      const resolvedIds = new Map();
      for (const id of new Set(locationIds)) {
        const defaultLocation = DEFAULT_STORAGE_LOCATIONS.find((option) => option.id === id);
        if (!defaultLocation) {
          resolvedIds.set(id, id === NO_STORAGE_LOCATION.id ? null : Number(id));
          continue;
        }

        const location = await createStorageLocation(defaultLocation.name);
        const savedId = String(location.storageLocationId);
        resolvedIds.set(id, location.storageLocationId);
        setLocations((previous) => [...previous, location]);
        setStorageLocationId((previous) => previous === id ? savedId : previous);
        setPieces((previous) => previous.map((piece) => piece === id ? savedId : piece));
      }

      const storageLocations = locationIds.map((id) => ({ storageLocationId: resolvedIds.get(id) }));
      await createClothes({
        ...clothesData,
        ...(multiple ? { pieces: storageLocations } : storageLocations[0]),
      }, imageFile);

      alert("옷 등록 성공!");

      // 등록 성공 후 내 옷장으로 이동
      router.push("/closet");

    } catch (error) {

      console.error("옷 등록 실패:", error);

      console.error(
        "서버 오류 응답:",
        error.response?.data
      );

      console.error(
        "HTTP 상태 코드:",
        error.response?.status
      );

      alert(error.response?.data?.message || "옷 등록에 실패했습니다. Console을 확인해주세요.");

    } finally {

      savingRef.current = false;
      setSaving(false);

    }
  };

  // ========================================
  // 9. 공통 CSS 스타일
  // ========================================

  const inputStyle =
    "w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm";

  const activeStyle =
    "flex-1 rounded-xl border border-[#a50034] bg-[#a50034] py-2.5 text-sm font-bold text-white";

  const inactiveStyle =
    "flex-1 rounded-xl border border-gray-300 bg-white py-2.5 text-sm";

  // ========================================
  // 10. 화면 구성
  // ========================================

  return (
    <main className="mx-auto flex w-full max-w-[1200px] flex-1 flex-col gap-5 px-6 py-8 md:px-10">

      {/* 상단 제목 */}

      <button
        onClick={() => router.push("/closet")}
        className="w-fit text-sm text-gray-500"
      >
        ‹ 내 옷장
      </button>

      <h1 className="text-[28px] font-bold text-ink">
        옷 등록
      </h1>

      <div className="grid grid-cols-1 gap-10 md:grid-cols-[38%_1fr]">

        {/* ============================== */}
        {/* 왼쪽: 이미지 업로드 */}
        {/* ============================== */}

        <section className="flex flex-col gap-3">

          <input
            type="file"
            accept={PHOTO_TYPES.join(",")}
            ref={fileInputRef}
            className="hidden"
            onChange={(e) => {
              handleImage(e.target.files?.[0]);
              e.target.value = "";
            }}
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              handleImage(e.dataTransfer.files?.[0]);
            }}
            className="relative flex aspect-square w-full cursor-pointer flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50"
          >

            {imagePreview ? (

              <Image
                src={imagePreview}
                alt="업로드한 옷"
                fill
                unoptimized
                className="object-contain"
              />

            ) : (

              <>
                <span className="mb-3 text-3xl">
                  📷
                </span>

                <p className="font-bold">
                  업로드한 옷 사진
                </p>

                <p className="mt-2 text-xs text-gray-500">
                  끌어다 놓거나 눌러서 골라주세요
                </p>
              </>

            )}

          </button>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className={inputStyle}
          >
            다른 사진으로 바꾸기
          </button>

          <p className="text-xs text-gray-500">
            직접 찍은 사진이 없으면 쇼핑몰 상품 사진을
            저장해서 올려도 돼요.
          </p>

        </section>

        {/* ============================== */}
        {/* 오른쪽: 옷 정보 입력 */}
        {/* ============================== */}

        <section className="flex flex-col gap-5">

          <div>
            <h2 className="text-lg font-bold">
              AI 분류 결과
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              현재는 직접 입력해주세요.
              AI 자동 분류는 추후 연결됩니다.
            </p>
          </div>

          {/* 옷 이름 */}

          <div>

            <label className="mb-2 block text-sm">
              이름
            </label>

            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="예: 울 터틀넥 니트"
              className={inputStyle}
            />

            <p className="mt-2 text-xs text-gray-500">
              옷장과 추천에 이 이름으로 보여요.
            </p>

          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label htmlFor="clothes-category" className="mb-2 block text-sm">분류</label>
              <select
                id="clothes-category"
                value={category}
                onChange={(event) => {
                  const nextCategory = event.target.value;
                  setCategory(nextCategory);
                  setSubType(CLOTHES_CATEGORIES[nextCategory].types[0]);
                  setMaterial(DEFAULT_MATERIAL);
                }}
                className={inputStyle}
              >
                {Object.entries(CLOTHES_CATEGORIES).map(([value, { label }]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="clothes-type" className="mb-2 block text-sm">종류</label>
              <select
                id="clothes-type"
                value={subType}
                onChange={(event) => {
                  setSubType(event.target.value);
                  setMaterial(DEFAULT_MATERIAL);
                }}
                className={inputStyle}
              >
                {CLOTHES_CATEGORIES[category].types.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="clothes-material" className="mb-2 block text-sm">소재</label>
              <select
                id="clothes-material"
                value={material}
                onChange={(event) => setMaterial(event.target.value)}
                className={inputStyle}
              >
                {Object.entries(MATERIAL_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* 따뜻함 10단계 */}

          <div hidden={isCarryItem}>

            <div className="mb-3 flex justify-between text-sm font-medium">

              <span>얇음 · 더운 날</span>

              <span>두꺼움 · 추운 날</span>

            </div>

            <div className="flex gap-1">

              {WARMTH_LEVELS.map((level) => (

                <button
                  key={level}
                  type="button"
                  aria-label={`따뜻함 ${level}단계`}
                  aria-pressed={level === warmth}
                  onClick={() => setWarmth(level)}
                  className={`h-3 flex-1 rounded-full ${
                    level <= warmth
                      ? "bg-orange-500"
                      : "bg-gray-200"
                  }`}
                />

              ))}

            </div>

            <div className="mt-2 flex justify-between text-xs text-gray-500">

              <span>직접 조절할 수 있어요.</span>

              <span>
                {warmth}단계
              </span>

            </div>

          </div>

          {/* 통풍 및 목 부분 */}

          <div className={isCarryItem ? "hidden" : "grid grid-cols-2 gap-4"}>

            <div>

              <label className="mb-2 block text-sm">
                통풍
              </label>

              <div className="flex gap-1">

                {BREATHABILITY_OPTIONS.map(({ value, label }) => (

                  <button
                    key={value}
                    type="button"
                    onClick={() => setBreathability(value)}
                    className={
                      breathability === value
                        ? activeStyle
                        : inactiveStyle
                    }
                  >
                    {label}
                  </button>

                ))}

              </div>

            </div>

            {category === CLOTHES_CATEGORY.TOP && (

              <div>

                <label className="mb-2 block text-sm">
                  목 부분
                </label>

                <div className="flex gap-1">

                  {NECK_COVER_OPTIONS.map(({ value, label }) => (
                    <button
                      key={label}
                      type="button"
                      onClick={() => setNeckCover(value)}
                      className={neckCover === value ? activeStyle : inactiveStyle}
                    >
                      {label}
                    </button>
                  ))}

                </div>

              </div>

            )}

          </div>

          <hr className="my-2 border-gray-200" />

          {/* ============================== */}
          {/* 보관 위치 */}
          {/* ============================== */}

          <div>

            <h2 className="text-lg font-bold">
              보관 위치
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              추천받을 때 어디서 꺼내면 되는지
              같이 알려드려요.
            </p>

          </div>

          <div className="grid grid-cols-2 gap-4">

            <div>

              <label className="mb-2 block text-sm">
                위치
              </label>

              <select
                value={storageLocationId}
                onChange={(e) =>
                  setStorageLocationId(e.target.value)
                }
                className={inputStyle}
              >

                {locationOptions.map((location) => (
                  <option key={location.id} value={location.id}>
                    {location.name}
                  </option>
                ))}

              </select>

              <button
                type="button"
                onClick={() => setLocationOpen(true)}
                disabled={loadingLocations || saving}
                className="mt-3 text-sm font-bold text-[#a50034] disabled:opacity-50"
              >
                + 새 위치 만들기
              </button>
              {loadingLocations && <p role="status" className="mt-2 text-xs text-gray-500">보관 위치를 불러오는 중이에요.</p>}
              {locationLoadError && <p role="alert" className="mt-2 text-xs text-red-700">{locationLoadError}</p>}

            </div>

            <div>

              <label className="mb-2 block text-sm">
                상태
              </label>

              <div className="flex gap-1">

                {Object.entries(STORAGE_STATUS_LABELS).map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setStorageStatus(value)}
                    aria-pressed={storageStatus === value}
                    className={storageStatus === value ? activeStyle : inactiveStyle}
                  >
                    {label}
                  </button>
                ))}

              </div>

            </div>

          </div>

          {/* ============================== */}
          {/* 여러 벌 등록 */}
          {/* ============================== */}

          <div className="rounded-xl bg-gray-100 p-4">

            <div className="flex items-center justify-between gap-3">

              <div>

                <p className="text-sm font-bold">
                  같은 옷이 여러 벌인가요?
                </p>

                <p className="mt-1 text-xs text-gray-500">
                  같은 옷을 여러 벌 가지고 있다면
                  한 번에 등록해요.
                </p>

              </div>

              <button
                type="button"
                onClick={() => setMultiple((current) => !current)}
                aria-pressed={multiple}
                className={`shrink-0 rounded-full border px-4 py-2 text-sm font-bold ${
                  multiple ? "border-[#a50034] bg-[#a50034] text-white" : "border-gray-300 bg-white"
                }`}
              >
                여러 벌이에요
              </button>
            </div>

            {multiple && (
              <div className="mt-3 flex flex-col gap-3 border-t border-gray-200 pt-3">
                <div className="flex items-center gap-3 text-sm">
                  <span>몇 벌인가요?</span>
                  <button
                    type="button"
                    aria-label="한 벌 줄이기"
                    disabled={pieces.length === 1}
                    onClick={() => setPieces((prev) => prev.length > 1 ? prev.slice(0, -1) : prev)}
                    className="h-9 w-9 rounded-xl border border-gray-300 bg-white disabled:opacity-50"
                  >
                    −
                  </button>
                  <output className="font-bold">{pieces.length + 1}벌</output>
                  <button
                    type="button"
                    aria-label="한 벌 추가"
                    onClick={() => setPieces((prev) => [...prev, null])}
                    className="h-9 w-9 rounded-xl border border-gray-300 bg-white"
                  >
                    +
                  </button>
                </div>

                {pieces.map((piece, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <label htmlFor={`piece-location-${index}`} className="w-24 shrink-0 text-sm">
                      {index + 2}번째 벌
                    </label>
                    <select
                      id={`piece-location-${index}`}
                      value={piece ?? storageLocationId}
                      onChange={(event) => {
                        const locationId = event.target.value;
                        setPieces((prev) => prev.map((item, i) => i === index ? locationId : item));
                      }}
                      className={inputStyle}
                    >
                      {locationOptions.map((location) => (
                        <option key={location.id} value={location.id}>
                          {location.name}
                        </option>
                      ))}

                    </select>
                  </div>
                ))}

                <p className="text-xs text-gray-500">
                  첫 번째 벌은 위에서 고른 위치를 사용해요. 나머지 벌은 위치를 각각 선택할 수 있어요.
                </p>
              </div>
            )}

          </div>

          <p className="text-xs text-gray-500">
            계절이 지나 보관해두었다면 &apos;보관 중&apos;으로 두세요.
          </p>

          <hr className="my-2 border-gray-200" />

          {/* ============================== */}
          {/* 하단 저장 버튼 */}
          {/* ============================== */}

          <div className="flex justify-end gap-3">

            <Button
              href="/closet"
              variant="secondary"
            >
              취소
            </Button>

            <Button
              onClick={handleSave}
              disabled={saving || loadingLocations}
            >
              {saving ? "저장 중..." : "옷장에 저장"}
            </Button>

          </div>

        </section>

      </div>

      {/* ============================== */}
      {/* 새 보관 위치 등록 모달 */}
      {/* ============================== */}

      {locationOpen && (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">

          <div className="w-full max-w-sm rounded-2xl bg-white p-6">

            <h2 className="mb-4 text-lg font-bold">
              새 위치 만들기
            </h2>

            <input
              value={newLocation}
              onChange={(e) =>
                setNewLocation(e.target.value)
              }
              placeholder="예: 안방 옷장"
              className={inputStyle}
            />

            <div className="mt-4 flex justify-end gap-3">

              <Button
                variant="secondary"
                onClick={() => setLocationOpen(false)}
                disabled={savingLocation}
              >
                취소
              </Button>

              <Button onClick={handleAddLocation} disabled={savingLocation || !newLocation.trim()}>
                {savingLocation ? "추가 중..." : "추가"}
              </Button>

            </div>

          </div>

        </div>

      )}

    </main>
  );
}
