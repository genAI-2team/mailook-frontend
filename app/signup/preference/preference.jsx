"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Chip, Footer, Header, formatDegree } from "@/components/common";
import { createUserSetting, getUserSetting } from "@/api/userSetting";
import { SENSITIVITY, WARMTH_STYLE } from "@/constants";

const COLD_OFFSET = {
  [SENSITIVITY.LESS]: -4,
  [SENSITIVITY.NORMAL]: 0,
  [SENSITIVITY.MORE]: 4,
};

const HEAT_OFFSET = {
  [SENSITIVITY.LESS]: 4,
  [SENSITIVITY.NORMAL]: 0,
  [SENSITIVITY.MORE]: -4,
};

function answerSentence(cold, heat) {
  const coldWord = cold > 0
    ? "추운 날은 평균보다 한 단계 따뜻하게"
    : cold < 0
      ? "추운 날은 평균보다 한 단계 가볍게"
      : "추운 날은 평균대로";
  const heatWord = heat > 0
    ? "더운 날은 평균보다 한 단계 덜 벗기고"
    : heat < 0
      ? "더운 날은 평균보다 한 단계 가볍게"
      : "더운 날은 평균대로";
  return `${coldWord}, ${heatWord} 추천해요.`;
}

function errorMessage(error) {
  return error.response?.data?.message || error.message || "기본 설정을 저장하지 못했습니다.";
}

export default function Preference({ variant = "signup" }) {
  const isSignup = variant === "signup";
  const router = useRouter();
  const [setting, setSetting] = useState({
    warmthStyle: WARMTH_STYLE.ANY,
    coldSensitivity: SENSITIVITY.NORMAL,
    heatSensitivity: SENSITIVITY.NORMAL,
  });
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const saved = await getUserSetting();
        if (!saved) return;
        setSetting({
          warmthStyle: saved.warmthStyle,
          coldSensitivity: saved.coldSensitivity,
          heatSensitivity: saved.heatSensitivity,
        });
      } catch {
        // 가입 중에는 아직 로그인 전이거나 줄이 없을 수 있다.
      }
    };
    load();
  }, []);

  async function handleComplete() {
    if (busy) return;
    setBusy(true);
    setMessage("");
    try {
      await createUserSetting(setting);
      router.push("/");
    } catch (error) {
      setMessage(errorMessage(error));
    } finally {
      setBusy(false);
    }
  }

  const cold = COLD_OFFSET[setting.coldSensitivity];
  const heat = HEAT_OFFSET[setting.heatSensitivity];

  return (
    <div className={isSignup ? "flex min-h-screen flex-col bg-bg-2" : "flex flex-1 flex-col bg-bg-2"}>
      {isSignup ? <Header /> : null}
      <main className="flex flex-1 items-start justify-center px-6 py-12">
        <section
          aria-label={isSignup ? "회원가입" : "내 성향"}
          className="flex w-full max-w-220 flex-col gap-8 rounded-[18px] bg-white px-10 py-9"
        >
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div className="flex flex-col gap-1">
              <h1 className="text-2xl font-bold text-ink">{isSignup ? "회원가입" : "내 성향"}</h1>
              <p className="text-sm text-sub">체질에 대해서 알려주세요. 추천에서 참고해요.</p>
            </div>
            {isSignup ? (
              <ol aria-label="진행 단계" className="flex list-none gap-2 p-0">
                <li className="rounded-full bg-bg-2 px-3 py-1.5 text-[13px] text-sub">1 계정</li>
                <li className="rounded-full bg-bg-2 px-3 py-1.5 text-[13px] text-sub">2 기본 정보</li>
                <li aria-current="step" className="rounded-full bg-brand px-3 py-1.5 text-[13px] font-bold text-white">
                  3 내 성향
                </li>
              </ol>
            ) : null}
          </div>

          <div className="flex flex-wrap items-start gap-12">
            <div className="flex min-w-0 flex-[1.15] basis-84 flex-col gap-6">
              <div className="flex flex-col gap-2">
                <span className="text-base font-bold text-ink">남들보다 추위를 타는 편인가요?</span>
                <div role="group" aria-label="남들보다 추위를 타는 편인가요?" className="flex flex-wrap gap-2">
                  <Chip selected={setting.coldSensitivity === SENSITIVITY.LESS} onClick={() => setSetting((current) => ({ ...current, coldSensitivity: SENSITIVITY.LESS }))}>덜 타요</Chip>
                  <Chip selected={setting.coldSensitivity === SENSITIVITY.NORMAL} onClick={() => setSetting((current) => ({ ...current, coldSensitivity: SENSITIVITY.NORMAL }))}>비슷해요</Chip>
                  <Chip selected={setting.coldSensitivity === SENSITIVITY.MORE} onClick={() => setSetting((current) => ({ ...current, coldSensitivity: SENSITIVITY.MORE }))}>더 타요</Chip>
                </div>
                <span className="text-sm text-sub">추운 날 추천에 참고해요.</span>
              </div>
              <div className="flex flex-col gap-2">
                <span className="text-base font-bold text-ink">남들보다 더위를 타는 편인가요?</span>
                <div role="group" aria-label="남들보다 더위를 타는 편인가요?" className="flex flex-wrap gap-2">
                  <Chip selected={setting.heatSensitivity === SENSITIVITY.LESS} onClick={() => setSetting((current) => ({ ...current, heatSensitivity: SENSITIVITY.LESS }))}>덜 타요</Chip>
                  <Chip selected={setting.heatSensitivity === SENSITIVITY.NORMAL} onClick={() => setSetting((current) => ({ ...current, heatSensitivity: SENSITIVITY.NORMAL }))}>비슷해요</Chip>
                  <Chip selected={setting.heatSensitivity === SENSITIVITY.MORE} onClick={() => setSetting((current) => ({ ...current, heatSensitivity: SENSITIVITY.MORE }))}>더 타요</Chip>
                </div>
                <span className="text-sm text-sub">더운 날 추천에 참고해요.</span>
              </div>
              <div className="flex flex-col gap-2">
                <span className="text-base font-bold text-ink">보온은 어떻게 챙기는 편인가요?</span>
                <div role="group" aria-label="보온은 어떻게 챙기는 편인가요?" className="flex flex-wrap gap-2">
                  <Chip selected={setting.warmthStyle === WARMTH_STYLE.INNER_LAYER} onClick={() => setSetting((current) => ({ ...current, warmthStyle: WARMTH_STYLE.INNER_LAYER }))}>안에 껴입는 편</Chip>
                  <Chip selected={setting.warmthStyle === WARMTH_STYLE.OUTER_LAYER} onClick={() => setSetting((current) => ({ ...current, warmthStyle: WARMTH_STYLE.OUTER_LAYER }))}>겉옷을 두껍게</Chip>
                  <Chip selected={setting.warmthStyle === WARMTH_STYLE.ANY} onClick={() => setSetting((current) => ({ ...current, warmthStyle: WARMTH_STYLE.ANY }))}>상관없음</Chip>
                </div>
                <span className="text-sm text-sub">선호하는 보온 방식을 고르시면 추천에 참고해요.</span>
              </div>
            </div>

            <aside
              aria-label="처음 추천 기준"
              className="flex min-w-0 flex-1 basis-80 flex-col gap-4 rounded-[14px] bg-bg-2 p-6"
            >
              <h2 className="text-base font-bold text-ink">초반 추천은 이렇게 시작돼요</h2>
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between gap-2 rounded-[10px] bg-white px-4 py-3.5">
                  <span className="text-sm text-ink-2">추위 보정 (체감 20° 미만)</span>
                  <span className="text-xl font-bold text-ink">{formatDegree(cold)}</span>
                </div>
                <div className="flex items-center justify-between gap-2 rounded-[10px] bg-white px-4 py-3.5">
                  <span className="text-sm text-ink-2">더위 보정 (체감 20° 이상)</span>
                  <span className="text-xl font-bold text-ink">{formatDegree(heat)}</span>
                </div>
              </div>
              <p className="text-sm leading-normal text-ink-2">{answerSentence(cold, heat)}</p>
              <p className="text-xs leading-normal text-sub">
                한 단계는 약 4°씩으로 취급해요.
                <br />
                초반 설정이라 추천에 대해 피드백을 하면 나에게 맞도록 바뀌어요.
                <br />
                이후 내 성향에서 언제든 고칠 수 있어요.
              </p>
            </aside>
          </div>

          {message ? <p className="text-sm text-error" role="alert">{message}</p> : null}

          <div className={`flex gap-2 border-t border-line-2 pt-5 ${isSignup ? "justify-between" : "justify-end"}`}>
            {isSignup ? <Button href="/signup/info" variant="secondary" disabled={busy}>이전</Button> : null}
            <Button onClick={handleComplete} disabled={busy}>
              {busy ? "저장 중…" : isSignup ? "가입 완료" : "설정 완료"}
            </Button>
          </div>
        </section>
      </main>
      {isSignup ? <Footer /> : null}
    </div>
  );
}
