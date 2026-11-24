"use client";

import { useState } from "react";
import {
  AlertBox,
  Button,
  CheckItem,
  Chip,
  ChoiceCard,
  ConfirmModal,
  EmptyState,
  Input,
  Loading,
  Modal,
  Pagination,
  PhotoUpload,
  Segmented,
  Select,
  StatusBadge,
  Stepper,
  formatDegree,
  Tag,
  Textarea,
  Toggle,
  useToast,
  WarmthBar,
  WarmthPicker,
  WarningLine,
} from "@/components/common";

const SITUATIONS = ["출근", "등교", "약속", "운동"];

function PhotoIcon() {
  return (
    <svg width="36" height="36" viewBox="0 0 36 36" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <rect x="5" y="8" width="26" height="20" rx="3" />
      <circle cx="13" cy="15" r="2" />
      <path d="m8 25 6-6 4 4 3-3 7 7" />
    </svg>
  );
}

function Group({ title, description, children }) {
  return (
    <section className="mt-10 flex flex-col gap-2">
      <h2 className="text-[15px] font-bold text-brand">{title}</h2>
      <p className="text-[13px] text-sub">{description}</p>
      <div className="flex flex-col gap-6">{children}</div>
    </section>
  );
}

function Section({ title, children }) {
  return (
    <section className="flex flex-col gap-3 border-t border-line pt-6">
      <h3 className="text-lg font-bold text-ink">{title}</h3>
      {children}
    </section>
  );
}

export default function DemoPage() {
  const { showToast } = useToast();
  const [selected, setSelected] = useState(["출근"]);
  const [bodyOn, setBodyOn] = useState(false);
  const [officeOn, setOfficeOn] = useState(true);
  const [vent, setVent] = useState("보통");
  const [adjust, setAdjust] = useState(-3);
  const [warmth, setWarmth] = useState(5);
  const [outfitChoice, setOutfitChoice] = useState("이대로 좋아요");
  const [arriveChoice, setArriveChoice] = useState("네, 입고 오가요");
  const [page, setPage] = useState(1);
  const [category, setCategory] = useState("outer");
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  function toggleChip(name) {
    setSelected((current) =>
      current.includes(name) ? current.filter((item) => item !== name) : [...current, name],
    );
  }

  return (
    <main className="mx-auto flex w-full max-w-[1200px] flex-1 flex-col gap-6 px-10 py-8">
      <div>
        <h1 className="text-[28px] font-bold text-ink">공통 컴포넌트 데모</h1>
        <p className="mt-2 text-sm text-sub">확인이 끝나면 이 페이지는 삭제합니다.</p>
      </div>

      <Group title="화면 틀" description="헤더, 하단 탭, 푸터. 이 페이지 위아래에 붙어 있습니다. 로그인 화면에는 없습니다.">
        <p className="text-sm text-ink">좁은 화면에서는 메뉴 대신 아래 탭이 나옵니다.</p>
      </Group>

      <Group title="버튼·선택" description="누르거나 하나만 고르는 컨트롤입니다.">
      <Section title="Button">
        <div className="flex flex-wrap items-center gap-3">
          <Button onClick={() => showToast("옷을 삭제했어요.")}>피드백 저장</Button>
          <Button variant="outline">이걸로 입을게요</Button>
          <Button variant="secondary">취소</Button>
          <Button variant="text">직접 고르기</Button>
          <Button variant="danger" onClick={() => setConfirmOpen(true)}>
            이 옷 삭제
          </Button>
          <Button size="sm" variant="secondary">
            바꾸기
          </Button>
          <Button disabled>비활성</Button>
        </div>
      </Section>

      <Section title="Chip">
        <div className="flex flex-wrap gap-2">
          {SITUATIONS.map((name) => (
            <Chip key={name} selected={selected.includes(name)} showCheck onClick={() => toggleChip(name)}>
              {name}
            </Chip>
          ))}
        </div>
      </Section>

      <Section title="Toggle">
        <Toggle checked={bodyOn} onChange={setBodyOn} label="오늘은 몸이 안 좋아요" />
      </Section>

      <Section title="CheckItem">
        <div className="max-w-md">
          <CheckItem
            checked={officeOn}
            title="회사"
            description="월·수·금 · 09:00–18:00"
            tag="기본"
            onChange={setOfficeOn}
          />
          <CheckItem checked disabled title="집" description="오늘 저녁" />
        </div>
      </Section>

      <Section title="Segmented">
        <div className="max-w-md">
          <Segmented
            label="통풍"
            options={[
              { value: "낮음", label: "낮음" },
              { value: "보통", label: "보통" },
              { value: "높음", label: "높음" },
            ]}
            value={vent}
            onChange={setVent}
          />
        </div>
      </Section>

      <Section title="Stepper">
        <div className="flex max-w-md flex-col gap-2">
          <p className="text-sm font-bold text-ink">추위 보정</p>
          <div className="flex items-center justify-between gap-4">
            <p className="text-[28px] leading-none font-bold text-ink tabular-nums">{formatDegree(adjust)}</p>
            <Stepper
              value={adjust}
              min={-5}
              max={5}
              onChange={setAdjust}
              decreaseLabel="추위 보정 더 가볍게"
              increaseLabel="추위 보정 더 두껍게"
            />
          </div>
        </div>
      </Section>

      <Section title="Pagination">
        <Pagination page={page} totalPages={12} onChange={setPage} />
      </Section>

      <Section title="ChoiceCard">
        <ChoiceCard
          label="오늘 차림"
          direction="row"
          value={outfitChoice}
          onChange={setOutfitChoice}
          options={[
            {
              value: "더 따뜻하게 입을래요",
              title: "더 따뜻하게 입을래요",
              description: "다음 추천을 더 두껍게 해요",
            },
            { value: "이대로 좋아요", title: "이대로 좋아요", description: "추천 기준을 유지해요" },
            {
              value: "더 가볍게 입을래요",
              title: "더 가볍게 입을래요",
              description: "다음 추천을 더 얇게 해요",
            },
          ]}
        />
        <ChoiceCard
          label="입고 오기"
          direction="column"
          value={arriveChoice}
          onChange={setArriveChoice}
          options={[
            {
              value: "네, 입고 오가요",
              title: "네, 입고 오가요",
              description: "교복, 출근 유니폼 · 하루 종일 이 옷 위아래로 더할 것만 추천",
            },
            {
              value: "아니요, 도착해서 갈아입어요",
              title: "아니요, 도착해서 갈아입어요",
              description: "작업복, 실험복 · 오가는 옷과 현장에서 받쳐 입을 이너를 따로 추천",
            },
          ]}
        />
      </Section>
      </Group>

      <Group title="입력" description="글자와 값을 넣는 칸입니다. WarmthPicker는 따뜻한 정도를 고치는 입력이고, 표시의 WarmthBar와 다릅니다.">
      <Section title="Input / Select / WarningLine">
        <div className="grid max-w-md gap-4">
          <Input label="이메일" hint="로그인에 사용해요." placeholder="mail@example.com" />
          <Input label="이메일" defaultValue="mail@example.com" error="이미 가입된 이메일이에요." />
          <WarningLine>같은 시간에 다른 장소가 있어요.</WarningLine>
          <Select
            label="카테고리"
            value={category}
            onChange={setCategory}
            options={[
              { value: "outer", label: "아우터" },
              { value: "top", label: "상의" },
              { value: "bottom", label: "하의" },
            ]}
          />
        </div>
      </Section>

      <Section title="WarmthPicker">
        <WarmthPicker
          value={warmth}
          onChange={setWarmth}
          hint="AI가 채운 값이에요. 반 칸 단위로 고칠 수 있어요."
        />
      </Section>

      <Section title="Textarea">
        <div className="max-w-md">
          <Textarea
            label="더 남기고 싶은 말"
            maxLength={200}
            placeholder="예: 점심시간에 밖에서 줄을 오래 서 있었어요"
          />
        </div>
      </Section>

      <Section title="PhotoUpload">
        <div className="flex max-w-md flex-col gap-8">
          <PhotoUpload title="옷 사진 올리기" height={420} icon={<PhotoIcon />} onSelect={() => {}} />
          <PhotoUpload
            title="옷 사진 올리기"
            height={340}
            icon={<PhotoIcon />}
            previewUrl="/logo.png"
            onSelect={() => {}}
          />
        </div>
      </Section>
      </Group>

      <Group title="표시" description="읽기만 합니다. WarmthBar는 옷이 얼마나 따뜻한지 보여 주고, 값을 고치지는 않습니다.">
      <Section title="WarmthBar">
        <div className="flex flex-col items-start gap-3">
          <WarmthBar level={1} />
          <WarmthBar level={5} />
          <WarmthBar level={10} />
        </div>
      </Section>

      <Section title="Tag / StatusBadge">
        <div className="flex items-center gap-4">
          <Tag>출근</Tag>
          <div className="relative h-28 w-28 rounded-xl bg-photo">
            <StatusBadge>보관 중</StatusBadge>
          </div>
        </div>
      </Section>
      </Group>

      <Group title="안내" description="실패, 빈 화면, 불러오는 중, 확인하고 알리는 창입니다.">
      <Section title="AlertBox">
        <AlertBox
          title="오늘 날씨를 불러오지 못했어요."
          message="기상청 응답이 늦어지고 있어요. 잠시 뒤 다시 시도해 주세요."
          actionLabel="다시 시도"
          onAction={() => showToast("다시 시도했어요.")}
        />
      </Section>

      <Section title="EmptyState">
        <EmptyState
          title="등록된 옷이 없어요."
          description="옷장에 옷을 등록하면 오늘 차림을 골라 드려요. 사진 한 장으로 시작할 수 있어요."
          actionLabel="옷 등록하기"
          actionHref="/closet/new"
        />
      </Section>

      <Section title="Loading">
        <Loading
          variant="cards"
          title="오늘 날씨에 맞는 조합을 고르고 있어요"
          message="날씨와 내 옷장을 함께 보고 있어요."
        />
      </Section>

      <Section title="Modal / ConfirmModal / Toast">
        <div className="relative h-80 overflow-hidden rounded-[18px]">
          <Modal
            embedded
            open
            title="장소·일정 설정"
            onClose={() => {}}
            footer={
              <>
                <Button variant="secondary">취소</Button>
                <Button>저장</Button>
              </>
            }
          />
        </div>
        <div className="relative h-80 overflow-hidden rounded-[18px]">
          <ConfirmModal
            embedded
            open
            title="이 옷 삭제"
            confirmLabel="삭제"
            danger
            onCancel={() => {}}
            onConfirm={() => {}}
          />
        </div>
        <div className="flex justify-center">
          <div role="status" className="flex h-11 items-center gap-2 rounded-[10px] bg-ink px-4 text-sm text-white">
            <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
              <path fill="currentColor" d="M6.2 11.2 2.9 7.9l1.1-1.1 2.2 2.2 5-5 1.1 1.1-6.1 6.1Z" />
            </svg>
            옷을 삭제했어요.
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button variant="secondary" onClick={() => setModalOpen(true)}>
            모달 열기
          </Button>
          <Button variant="danger" onClick={() => setConfirmOpen(true)}>
            삭제 확인
          </Button>
          <Button variant="secondary" onClick={() => showToast("옷을 삭제했어요.")}>
            토스트 보기
          </Button>
        </div>
        <Modal
          open={modalOpen}
          title="장소·일정 설정"
          onClose={() => setModalOpen(false)}
          footer={
            <>
              <Button variant="secondary" onClick={() => setModalOpen(false)}>
                취소
              </Button>
              <Button onClick={() => setModalOpen(false)}>저장</Button>
            </>
          }
        />
        <ConfirmModal
          open={confirmOpen}
          title="이 옷 삭제"
          confirmLabel="삭제"
          danger
          onCancel={() => setConfirmOpen(false)}
          onConfirm={() => {
            setConfirmOpen(false);
            showToast("옷을 삭제했어요.");
          }}
        />
      </Section>
      </Group>
    </main>
  );
}
