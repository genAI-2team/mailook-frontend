
"use client";

import {
  createClothes,
  createStorageLocation,
  getStorageLocations,
} from "@/api/clothesApi";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertBox, Button, Chip, Input, Loading, Modal, PhotoUpload, Segmented,
  Select, WarmthPicker, useToast,
} from "@/components/common";
import { levelToClo } from "@/utils/warmth";
import {
  CLOTHES_CATEGORY,
  CLOTHES_CATEGORIES,
  DEFAULT_CATEGORY,
  DEFAULT_MATERIAL,
  DEFAULT_STORAGE_STATUS,
  MATERIAL_LABELS,
  STORAGE_STATUS_LABELS,
} from "@/constants";

const DEFAULT_WARMTH_LEVEL = 5;

const BREATHABILITY_OPTIONS = [
  { value: 1, label: "낮음" },
  { value: 2, label: "보통" },
  { value: 3, label: "높음" },
];
const NECK_COVER_OPTIONS = [
  { value: false, label: "드러남" },
  { value: true, label: "덮여짐" },
];

const NO_STORAGE_LOCATION = { id: "", name: "지정 없음" };
const DEFAULT_STORAGE_LOCATIONS = [
  { id: "default-master-closet", name: "안방 옷장" },
  { id: "default-master-drawer", name: "안방 서랍 2칸" },
  { id: "default-small-room-closet", name: "작은방 옷장" },
  { id: "default-shoe-cabinet", name: "신발장" },
  { id: "default-storage-box", name: "창고 리빙박스" },
];

const PHOTO_TYPES = ["image/jpeg", "image/png", "image/gif"];
const MAX_PHOTO_BYTES = 10 * 1024 * 1024;

export default function Closet() {
  const router = useRouter();
  const photoInputRef = useRef(null);
  const { showToast } = useToast();
  const [saveError, setSaveError] = useState("");
  const [photoError, setPhotoError] = useState("");
  const [locationError, setLocationError] = useState("");

  // 이미지 관련 상태

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

  useEffect(() => () => {
    if (imagePreview) URL.revokeObjectURL(imagePreview);
  }, [imagePreview]);

  // 옷 정보

  const [name, setName] = useState("");
  const [category, setCategory] = useState(DEFAULT_CATEGORY);
  const [subType, setSubType] = useState(CLOTHES_CATEGORIES[DEFAULT_CATEGORY].types[0]);
  const [material, setMaterial] = useState(DEFAULT_MATERIAL);
  const isCarryItem = category === CLOTHES_CATEGORY.CARRY_ITEM;

  // 보온력, 통풍, 목 부분

  const [warmth, setWarmth] = useState(DEFAULT_WARMTH_LEVEL);
  const [breathability, setBreathability] = useState(BREATHABILITY_OPTIONS[0].value);
  const [neckCover, setNeckCover] = useState(NECK_COVER_OPTIONS[0].value);

  // 보관 위치 및 상태

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

  // 여러 벌 등록

  const [multiple, setMultiple] = useState(false);
  // null인 벌은 위에서 선택한 보관 위치를 따른다.
  const [pieces, setPieces] = useState([null]);

  // 저장 중 상태
  const [saving, setSaving] = useState(false);
  const savingRef = useRef(false);

  // 이미지 선택 및 미리보기

  const handleImage = (file) => {
    if (!file) return;

    if (!PHOTO_TYPES.includes(file.type) || file.size === 0 || file.size > MAX_PHOTO_BYTES) {
      setPhotoError("10MB 이하의 JPG, PNG, GIF 사진을 선택해 주세요.");
      return;
    }

    setImageFile(file);

    setPhotoError("");
    setImagePreview(URL.createObjectURL(file));
  };

  // 보관 위치 등록

  const handleAddLocation = async () => {
    const name = newLocation.trim();
    if (!name || savingLocationRef.current) return;

    setLocationError("");
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
      setLocationError(error.response?.data?.message || "보관 위치를 추가하지 못했습니다.");
    } finally {
      savingLocationRef.current = false;
      setSavingLocation(false);
    }
  };

  // 옷 등록 API 요청

  const handleSave = async () => {

    if (savingRef.current) return;
    setSaveError("");

    if (!imageFile) {
      setSaveError("옷 사진을 첨부해 주세요.");
      return;
    }

    // 이름 필수 입력 확인
    if (!name.trim()) {
      setSaveError("옷 이름을 입력해 주세요.");
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

      showToast("옷을 등록했어요.");

      // 등록 성공 후 내 옷장으로 이동
      router.push("/closet");

    } catch (error) {

      setSaveError(error.response?.data?.message || "옷을 등록하지 못했습니다.");

    } finally {

      savingRef.current = false;
      setSaving(false);

    }
  };

  const closeLocationModal = useCallback(() => {
    if (savingLocationRef.current) return;
    setNewLocation("");
    setLocationError("");
    setLocationOpen(false);
  }, []);

  const storageOptions = locationOptions.map(({ id, name }) => ({ value: id, label: name }));
  const categoryOptions = Object.entries(CLOTHES_CATEGORIES).map(([value, { label }]) => ({ value, label }));
  const materialOptions = Object.entries(MATERIAL_LABELS).map(([value, label]) => ({ value, label }));
  const statusOptions = Object.entries(STORAGE_STATUS_LABELS).map(([value, label]) => ({ value, label }));

  return (
    <main className="mx-auto flex w-full max-w-300 flex-1 flex-col gap-5 px-6 py-8 md:px-10">
      <Button href="/closet" variant="text" className="w-fit">‹ 내 옷장</Button>
      <h1 className="text-[28px] font-bold text-ink">옷 등록</h1>

      <div className="grid gap-10 md:grid-cols-[38%_1fr]">
        <section className="flex flex-col gap-3">
          <PhotoUpload
            title="옷 사진 올리기"
            height="clamp(240px, 30vw, 440px)"
            previewUrl={imagePreview}
            onSelect={handleImage}
          />
          {!imagePreview && (
            <>
              <Input
                ref={photoInputRef}
                type="file"
                accept={PHOTO_TYPES.join(",")}
                hidden
                onChange={(event) => {
                  handleImage(event.target.files?.[0]);
                  event.target.value = "";
                }}
              />
              <Button variant="secondary" className="w-full" onClick={() => photoInputRef.current?.click()}>
                다른 사진으로 바꾸기
              </Button>
            </>
          )}
          {photoError && <AlertBox message={photoError} />}
          <p className="text-xs text-sub">쇼핑몰 상품 사진을 저장해서 올려도 돼요.</p>
        </section>

        <section className="flex min-w-0 flex-col gap-5">
          <div>
            <h2 className="text-lg font-bold">AI 분류 결과</h2>
            <p className="mt-1 text-sm text-sub">AI가 채워둔 값이에요. 다르면 직접 고쳐주세요.</p>
          </div>
          <Input
            label="이름"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="예: 울 터틀넥 니트"
            hint="옷장과 추천에 이 이름으로 보여요."
            required
          />
          <div className="grid gap-4 sm:grid-cols-3">
            <Select label="분류" options={categoryOptions} value={category} onChange={(value) => {
              setCategory(value);
              setSubType(CLOTHES_CATEGORIES[value].types[0]);
              setMaterial(DEFAULT_MATERIAL);
            }} />
            <Select label="종류" options={CLOTHES_CATEGORIES[category].types} value={subType} onChange={(value) => {
              setSubType(value);
              setMaterial(DEFAULT_MATERIAL);
            }} />
            <Select label="소재" options={materialOptions} value={material} onChange={setMaterial} />
          </div>

          {!isCarryItem && (
            <>
              <WarmthPicker value={warmth} onChange={setWarmth} hint="직접 조절할 수 있어요." />
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="mb-2 text-[13px] font-medium">통풍</p>
                  <Segmented
                    label="통풍"
                    options={BREATHABILITY_OPTIONS}
                    value={breathability}
                    onChange={setBreathability}
                  />
                  <p className="mt-2 text-xs text-sub">
                    덥고 습한 날 추천에 써요.
                  </p>
                </div>
                {category === CLOTHES_CATEGORY.TOP && (
                  <div>
                    <p className="mb-2 text-[13px] font-medium">목 부분</p>
                    <Segmented
                      label="목 부분"
                      options={NECK_COVER_OPTIONS}
                      value={neckCover}
                      onChange={setNeckCover}
                    />
                    <p className="mt-2 text-xs text-sub">
                      상의만 정해요. 바람 부는 날 추천에 써요.
                    </p>
                  </div>
                )}
              </div>
            </>
          )}

          <div className="border-t border-line pt-5">
            <h2 className="text-lg font-bold">보관 위치</h2>
            <p className="mt-1 text-sm text-sub">추천받을 때 어디서 꺼내면 되는지 같이 알려드려요.</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Select label="위치" options={storageOptions} value={storageLocationId} onChange={setStorageLocationId} />
              <Button variant="text" size="sm" className="self-start" onClick={() => setLocationOpen(true)} disabled={loadingLocations || saving}>
                ＋ 새 위치 만들기
              </Button>
              {loadingLocations && <Loading variant="text" message="보관 위치를 불러오는 중이에요." />}
              {locationLoadError && <AlertBox message={locationLoadError} />}
            </div>
            <div>
              <p className="mb-2 text-[13px] font-medium">지금 상태</p>
              <Segmented label="지금 상태" options={statusOptions} value={storageStatus} onChange={setStorageStatus} />
            </div>
          </div>

          <div className="rounded-xl bg-bg-1 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold">같은 옷이 여러 벌인가요?</p>
                <p className="mt-1 text-xs text-sub">똑같은 양말·티셔츠처럼 같은 옷을 여러 벌 가지고 있다면 한 번에 등록해요.</p>
              </div>
              <Chip selected={multiple} onClick={() => setMultiple((current) => !current)}>
                여러 벌이에요
              </Chip>
            </div>
            {multiple && (
              <div className="mt-3 flex flex-col gap-3 border-t border-line pt-3">
                <div role="group" aria-label="몇 벌인가요?" className="flex items-center gap-2">
                  <span className="text-sm text-sub">몇 벌인가요?</span>
                  <Button
                    variant="secondary"
                    size="sm"
                    aria-label="한 벌 줄이기"
                    disabled={pieces.length <= 1}
                    className="w-8"
                    onClick={() => setPieces((previous) => previous.length > 1 ? previous.slice(0, -1) : previous)}
                  >−</Button>
                  <output className="min-w-8 text-center text-sm font-bold">{pieces.length + 1}벌</output>
                  <Button
                    variant="secondary"
                    size="sm"
                    aria-label="한 벌 추가"
                    className="w-8"
                    onClick={() => setPieces((previous) => [...previous, null])}
                  >+</Button>
                </div>
                {pieces.map((piece, index) => (
                  <div key={index} className="grid grid-cols-[5.25rem_minmax(0,1fr)] items-center gap-3">
                    <label htmlFor={`piece-location-${index}`} className="text-xs text-sub">
                      {index + 2}번째 벌
                    </label>
                    <Select
                      id={`piece-location-${index}`}
                      options={storageOptions}
                      value={piece ?? storageLocationId}
                      onChange={(locationId) => setPieces((previous) =>
                        previous.map((item, pieceIndex) => pieceIndex === index ? locationId : item)
                      )}
                    />
                  </div>
                ))}
                <p className="text-xs text-sub">
                  첫 번째 벌은 위에서 고른 위치예요.
                  <br />
                  벌마다 위치를 따로 정할 수 있고, 옷장에서는 한 장으로 묶어 보여줘요.
                </p>
              </div>
            )}
          </div>
          <p className="text-xs text-sub">
            계절이 지나 보관해두었다면 &apos;보관 중&apos;으로 두세요. 바로 추천하지 않고, 필요한 시기가 오면 꺼내라고 알려드려요.
          </p>
          {saveError && <AlertBox message={saveError} />}
          <div className="flex justify-end gap-3 border-t border-line pt-5">
            <Button href="/closet" variant="secondary">취소</Button>
            <Button onClick={handleSave} disabled={saving || loadingLocations}>
              {saving ? "저장 중…" : "옷장에 저장"}
            </Button>
          </div>
        </section>
      </div>

      <Modal
        open={locationOpen}
        title="새 보관 위치 만들기"
        onClose={closeLocationModal}
        footer={
          <>
            <Button variant="secondary" onClick={closeLocationModal} disabled={savingLocation}>취소</Button>
            <Button type="submit" form="new-storage-location" disabled={savingLocation || !newLocation.trim()}>
              {savingLocation ? "만드는 중…" : "만들기"}
            </Button>
          </>
        }
      >
        <form id="new-storage-location" onSubmit={(event) => {
          event.preventDefault();
          void handleAddLocation();
        }}>
          <Input
            label="위치 이름"
            value={newLocation}
            onChange={(event) => {
              setNewLocation(event.target.value);
              if (locationError) setLocationError("");
            }}
            placeholder="예: 베란다 수납함"
            hint={
              <>
                만들면 이 옷의 위치로 바로 골라줘요.
                <br />
                이름 바꾸기·삭제는 보관 위치 관리에서 할 수 있어요.
              </>
            }
            error={locationError}
            disabled={savingLocation}
            required
          />
        </form>
      </Modal>
    </main>
  );
}
