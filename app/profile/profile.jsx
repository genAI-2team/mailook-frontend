"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/common";
import { getUserSetting } from "@/api/userSetting";
import Preference from "../signup/preference/preference";

export default function Profile() {
  const [setting, setSetting] = useState(undefined);

  useEffect(() => {
    const load = async () => {
      try {
        setSetting(await getUserSetting());
      } catch (error) {
        if (error.response?.status === 401) return;
        setSetting(null);
      }
    };
    load();
  }, []);

  if (setting === undefined) {
    return (
      <main className="mx-auto flex w-full max-w-300 flex-1 flex-col px-10 py-8">
        <p className="text-sm text-sub">불러오는 중…</p>
      </main>
    );
  }

  if (!setting) {
    return <Preference variant="setting" />;
  }

  return (
    <main className="mx-auto flex w-full max-w-300 flex-1 flex-col gap-4 px-10 py-8">
      <h1 className="text-[28px] font-bold text-ink">3 내 성향</h1>
      <div className="flex flex-wrap gap-3">
        <Button href="/places">장소 수정</Button>
      </div>
    </main>
  );
}
