"use client";

import Link from "next/link";

const SIZES = {
  md: "h-10 px-5 text-sm",
  sm: "h-[30px] px-[18px] text-[13px]",
};

const VARIANTS = {
  primary: "border border-transparent bg-brand text-white",
  outline: "border border-brand bg-white text-brand",
  secondary: "border border-border bg-white text-ink hover:border-brand hover:text-brand",
  text: "border border-transparent bg-transparent px-2 text-brand",
  danger: "border border-transparent bg-transparent px-2 text-error",
};

// 화면 공통 버튼. 한 화면의 primary는 하나만 둔다.
// href가 있으면 링크, 없으면 button. size sm은 30px 보조 버튼.
// 비활성은 종류와 상관없이 회색 바탕, 회색 글씨, 테두리 없음이다.
export default function Button({
  variant = "primary",
  size = "md",
  href,
  onClick,
  disabled = false,
  className,
  type = "button",
  children,
  ...rest
}) {
  const classes = `inline-flex box-border items-center justify-center rounded-[10px] font-bold whitespace-nowrap focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${SIZES[size]} ${
    disabled ? "cursor-default border-0 bg-line text-[#9AA0A8]" : `cursor-pointer ${VARIANTS[variant]}`
  } ${className ?? ""}`;

  if (href && !disabled) {
    return (
      <Link href={href} onClick={onClick} className={classes} {...rest}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} onClick={onClick} disabled={disabled} className={classes} {...rest}>
      {children}
    </button>
  );
}
