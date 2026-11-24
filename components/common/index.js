// 화면 틀. 로그인 화면만 빼고 모든 페이지에 붙는다.
export { default as Header } from "./layout/Header";
export { default as Footer } from "./layout/Footer";
export { default as BottomTab } from "./layout/BottomTab";

// 누르거나 하나만 고르는 컨트롤.
export { default as Button } from "./control/Button";
export { default as Chip } from "./control/Chip";
export { default as Toggle } from "./control/Toggle";
export { default as CheckItem } from "./control/CheckItem";
export { default as Segmented } from "./control/Segmented";
export { default as Stepper, formatDegree } from "./control/Stepper";
export { default as Pagination } from "./control/Pagination";
export { default as ChoiceCard } from "./control/ChoiceCard";

// 값을 넣는 칸. WarmthPicker는 따뜻한 정도 입력이고, 표시용 WarmthBar와 다르다.
export { default as Input } from "./form/Input";
export { default as Select } from "./form/Select";
export { default as WarningLine } from "./form/WarningLine";
export { default as WarmthPicker } from "./form/WarmthPicker";
export { default as Textarea } from "./form/Textarea";
export { default as PhotoUpload } from "./form/PhotoUpload";

// 알림, 확인, 빈 화면, 불러오는 중.
export { default as Modal } from "./feedback/Modal";
export { default as ConfirmModal } from "./feedback/ConfirmModal";
export { ToastProvider, useToast } from "./feedback/Toast";
export { default as AlertBox } from "./feedback/AlertBox";
export { default as EmptyState } from "./feedback/EmptyState";
export { default as Loading } from "./feedback/Loading";

// 읽기만 하는 표시. WarmthBar는 옷의 따뜻함을 보여 주기만 한다.
export { default as WarmthBar } from "./display/WarmthBar";
export { default as StatusBadge } from "./display/StatusBadge";
export { default as Tag } from "./display/Tag";
