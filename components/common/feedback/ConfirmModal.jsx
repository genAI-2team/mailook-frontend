"use client";

import Button from "../control/Button";
import Modal from "./Modal";

// 삭제·탈퇴처럼 한 번 더 묻는 확인 창. Modal 위에 취소와 확인 버튼을 붙인다.
// danger면 확인 버튼을 빨강으로 둔다.
export default function ConfirmModal({
  open,
  title,
  message,
  confirmLabel,
  danger = false,
  onConfirm,
  onCancel,
  embedded = false,
}) {
  return (
    <Modal
      open={open}
      embedded={embedded}
      title={title}
      onClose={onCancel}
      footer={
        <>
          <Button variant="secondary" onClick={onCancel}>
            취소
          </Button>
          <Button
            variant="primary"
            onClick={onConfirm}
            style={danger ? { backgroundColor: "#B91C1C" } : undefined}
          >
            {confirmLabel}
          </Button>
        </>
      }
    >
      {message}
    </Modal>
  );
}
