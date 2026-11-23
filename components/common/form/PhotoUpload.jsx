"use client";

import { useRef } from "react";
import Image from "next/image";
import Button from "../control/Button";

// 사진을 올리거나 바꾸는 칸. 눌러서 고르거나, 파일을 끌어다 놓는다.
// previewUrl이 있으면 점선 없이 사진 칸으로 두고, 12px 아래에 같은 폭의 바꾸기 버튼을 둔다.
export default function PhotoUpload({
  title,
  description = "끌어다 놓거나 눌러서 골라주세요",
  icon,
  height,
  previewUrl,
  onSelect,
  changeLabel = "다른 사진으로 바꾸기",
}) {
  const inputRef = useRef(null);

  function openPicker() {
    inputRef.current?.click();
  }

  function takeFile(file) {
    if (file) onSelect?.(file);
  }

  return (
    <div className="flex w-full flex-col items-center gap-3">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={(event) => {
          takeFile(event.target.files?.[0]);
          event.target.value = "";
        }}
      />
      <button
        type="button"
        aria-label={title}
        onClick={openPicker}
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => {
          event.preventDefault();
          takeFile(event.dataTransfer.files?.[0]);
        }}
        style={{ "--photo-height": typeof height === "number" ? `${height}px` : height }}
        className={`relative flex aspect-[4/3] w-full cursor-pointer flex-col items-center justify-center overflow-hidden rounded-[14px] md:aspect-auto md:h-[var(--photo-height)] ${
          previewUrl ? "bg-photo" : "gap-2.5 border-2 border-dashed border-[#C7CBD1] bg-bg-1 px-4"
        }`}
      >
        {previewUrl ? (
          <Image src={previewUrl} alt="" fill className="object-contain" />
        ) : (
          <>
            <span className="flex size-9 items-center justify-center text-sub">{icon}</span>
            {title ? <span className="text-[15px] font-bold text-ink">{title}</span> : null}
            {description ? <span className="text-xs text-sub">{description}</span> : null}
          </>
        )}
      </button>
      {previewUrl ? (
        <Button variant="secondary" onClick={openPicker} className="w-full">
          {changeLabel}
        </Button>
      ) : null}
    </div>
  );
}
