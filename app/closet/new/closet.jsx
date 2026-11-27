
"use client";

import { createClothes } from "@/api/clothesApi";
import { useState, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/common";

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
  const [category, setCategory] = useState("TOP");
  const [subType, setSubType] = useState("니트");
  const [material, setMaterial] = useState("WOOL");

  // ========================================
  // 3. 보온력, 통풍, 목 부분
  // ========================================

  const [warmth, setWarmth] = useState(5);
  const [breathability, setBreathability] = useState(1);
  const [neckCover, setNeckCover] = useState(false);

  // ========================================
  // 4. 보관 위치 및 상태
  // ========================================

  const [storageLocationId, setStorageLocationId] = useState("");
  const [storageStatus, setStorageStatus] = useState("AVAILABLE");

  const [locations, setLocations] = useState([]);
  const [newLocation, setNewLocation] = useState("");
  const [locationOpen, setLocationOpen] = useState(false);

  // ========================================
  // 5. 여러 벌 등록
  // ========================================

  const [multiple, setMultiple] = useState(false);
  const [pieces, setPieces] = useState(["", ""]);

  // 저장 중 상태
  const [saving, setSaving] = useState(false);
  const savingRef = useRef(false);

  // ========================================
  // 6. 이미지 선택 및 미리보기
  // ========================================

  const handleImage = (file) => {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("이미지 파일만 등록할 수 있습니다.");
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
  // 7. 임시 보관 위치 추가
  // ========================================

  const handleAddLocation = () => {
    if (!newLocation.trim()) return;

    const id = `temp-${Date.now()}`;

    setLocations((prev) => [
      ...prev,
      {
        id,
        name: newLocation.trim()
      }
    ]);

    setStorageLocationId(id);
    setNewLocation("");
    setLocationOpen(false);
  };

  // ========================================
  // 8. 옷 등록 API 요청 (핵심 수정 부분)
  // ========================================

  const handleSave = async () => {

    if (savingRef.current) return;

    // 이름 필수 입력 확인
    if (!name.trim()) {
      alert("옷 이름을 입력해주세요.");
      return;
    }

    // 현재는 한 벌 등록만 지원
    if (multiple) {
      alert("현재는 한 벌 등록만 가능합니다.");
      return;
    }

    // 임시 보관 위치는 실제 DB에 존재하지 않음
    if (storageLocationId.startsWith("temp-")) {
      alert("현재 테스트에서는 보관 위치를 지정 없음으로 선택해주세요.");
      return;
    }

    // 백엔드 DTO에 전달할 JSON 데이터
    const clothesData = {
      name: name.trim(),
      category: category,
      subType: subType,
      material: material,

      clo: Number((warmth * 0.08).toFixed(2)),

      breathability: breathability,

      neckCover:
        category === "TOP" ? neckCover : false,

      storageLocationId:
        storageLocationId
          ? Number(storageLocationId)
          : null,

      storageStatus: storageStatus,

      userEdited: true,

      // 현재는 이미지 URL 테스트
      imageUrl: "https://example.com/coat.jpg"
    };

    console.log("옷 등록 요청 데이터:", clothesData);
    console.log("선택한 이미지 파일:", imageFile);

    savingRef.current = true;
    setSaving(true);

    try {

      const response = await createClothes(clothesData);
      console.log("서버 응답:", response);

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

      alert("옷 등록에 실패했습니다. Console을 확인해주세요.");

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
            accept="image/*"
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

          {/* 종류 및 소재 */}

          <div className="grid grid-cols-2 gap-4">

            <div>

              <label className="mb-2 block text-sm">
                종류
              </label>

              <select
                value={`${category}:${subType}`}
                onChange={(e) => {
                  const [cat, sub] =
                    e.target.value.split(":");

                  setCategory(cat);
                  setSubType(sub);
                }}
                className={inputStyle}
              >

                <option value="TOP:니트">
                  상의 · 니트
                </option>

                <option value="TOP:셔츠">
                  상의 · 셔츠
                </option>

                <option value="TOP:반팔">
                  상의 · 반팔
                </option>

                <option value="BOTTOM:청바지">
                  하의 · 청바지
                </option>

                <option value="BOTTOM:슬랙스">
                  하의 · 슬랙스
                </option>

                <option value="OUTER:코트">
                  아우터 · 코트
                </option>

                <option value="OUTER:패딩">
                  아우터 · 패딩
                </option>

              </select>

            </div>

            <div>

              <label className="mb-2 block text-sm">
                소재
              </label>

              <select
                value={material}
                onChange={(e) => setMaterial(e.target.value)}
                className={inputStyle}
              >

                <option value="WOOL">울</option>
                <option value="COTTON">면</option>
                <option value="POLYESTER">폴리에스터</option>
                <option value="NYLON">나일론</option>

              </select>

            </div>

          </div>

          {/* 따뜻함 10단계 */}

          <div>

            <div className="mb-3 flex justify-between text-sm font-medium">

              <span>얇음 · 더운 날</span>

              <span>두꺼움 · 추운 날</span>

            </div>

            <div className="flex gap-1">

              {Array.from(
                { length: 10 },
                (_, i) => i + 1
              ).map((level) => (

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

          <div className="grid grid-cols-2 gap-4">

            <div>

              <label className="mb-2 block text-sm">
                통풍
              </label>

              <div className="flex gap-1">

                {["낮음", "보통", "높음"].map((text, i) => (

                  <button
                    key={text}
                    type="button"
                    onClick={() => setBreathability(i + 1)}
                    className={
                      breathability === i + 1
                        ? activeStyle
                        : inactiveStyle
                    }
                  >
                    {text}
                  </button>

                ))}

              </div>

            </div>

            {category === "TOP" && (

              <div>

                <label className="mb-2 block text-sm">
                  목 부분
                </label>

                <div className="flex gap-1">

                  <button
                    type="button"
                    onClick={() => setNeckCover(false)}
                    className={
                      !neckCover
                        ? activeStyle
                        : inactiveStyle
                    }
                  >
                    드러남
                  </button>

                  <button
                    type="button"
                    onClick={() => setNeckCover(true)}
                    className={
                      neckCover
                        ? activeStyle
                        : inactiveStyle
                    }
                  >
                    덮여짐
                  </button>

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

                <option value="">
                  지정 없음
                </option>

                {locations.map((location) => (

                  <option
                    key={location.id}
                    value={location.id}
                  >
                    {location.name}
                  </option>

                ))}

              </select>

              <button
                type="button"
                onClick={() => setLocationOpen(true)}
                className="mt-3 text-sm font-bold text-[#a50034]"
              >
                + 새 위치 만들기
              </button>

            </div>

            <div>

              <label className="mb-2 block text-sm">
                상태
              </label>

              <div className="flex gap-1">

                <button
                  type="button"
                  onClick={() => setStorageStatus("AVAILABLE")}
                  className={
                    storageStatus === "AVAILABLE"
                      ? activeStyle
                      : inactiveStyle
                  }
                >
                  바로 꺼낼 수 있음
                </button>

                <button
                  type="button"
                  onClick={() => setStorageStatus("STORED")}
                  className={
                    storageStatus === "STORED"
                      ? activeStyle
                      : inactiveStyle
                  }
                >
                  보관 중
                </button>

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
                onClick={() => setMultiple(!multiple)}
                className="shrink-0 rounded-full border bg-white px-4 py-2 text-sm"
              >
                {multiple
                  ? "한 벌이에요"
                  : "여러 벌이에요"}
              </button>

            </div>

            {multiple && (

              <div className="mt-4 flex flex-col gap-3">

                {pieces.map((piece, index) => (

                  <div
                    key={index}
                    className="flex items-center gap-3"
                  >

                    <span className="shrink-0 text-sm">
                      {index + 1}번째 옷
                    </span>

                    <select
                      value={piece}
                      onChange={(e) => {

                        setPieces((prev) =>
                          prev.map((item, i) =>
                            i === index
                              ? e.target.value
                              : item
                          )
                        );

                      }}
                      className={inputStyle}
                    >

                      <option value="">
                        지정 없음
                      </option>

                      {locations.map((location) => (

                        <option
                          key={location.id}
                          value={location.id}
                        >
                          {location.name}
                        </option>

                      ))}

                    </select>

                  </div>

                ))}

                <button
                  type="button"
                  onClick={() =>
                    setPieces((prev) => [...prev, ""])
                  }
                  className="text-sm font-bold text-[#a50034]"
                >
                  + 한 벌 추가
                </button>

                {pieces.length > 2 && (

                  <button
                    type="button"
                    onClick={() =>
                      setPieces((prev) => prev.slice(0, -1))
                    }
                    className="text-sm text-gray-500"
                  >
                    - 한 벌 줄이기
                  </button>

                )}

              </div>

            )}

          </div>

          <p className="text-xs text-gray-500">
            계절이 지나 보관해두었다면
            '보관 중'으로 두세요.
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
              disabled={saving}
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
              >
                취소
              </Button>

              <Button onClick={handleAddLocation}>
                추가
              </Button>

            </div>

          </div>

        </div>

      )}

    </main>
  );
}
