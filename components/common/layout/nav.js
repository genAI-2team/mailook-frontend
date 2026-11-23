export const MENUS = [
  { key: "home", label: "오늘의 옷차림", href: "/" },
  { key: "closet", label: "내 옷장", href: "/closet" },
  { key: "profile", label: "내 성향", href: "/profile" },
];

const CLOSET_ROOTS = ["/closet", "/preview", "/wear"];
const PROFILE_ROOTS = ["/profile", "/places", "/account", "/uniform"];

function matches(pathname, root) {
  return pathname === root || pathname.startsWith(`${root}/`);
}

export function activeFromPath(pathname) {
  if (!pathname || pathname === "/" || matches(pathname, "/feedback")) return "home";
  if (CLOSET_ROOTS.some((root) => matches(pathname, root))) return "closet";
  if (PROFILE_ROOTS.some((root) => matches(pathname, root))) return "profile";
  return undefined;
}

export function isSignupPath(pathname) {
  return pathname === "/signup" || pathname.startsWith("/signup/");
}
