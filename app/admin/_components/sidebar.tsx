"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "../actions";

const NAV = [
  { href: "/admin", label: "Inquiries", match: (p: string) => p === "/admin" },
  {
    href: "/admin/affiliates",
    label: "Affiliates",
    match: (p: string) => p.startsWith("/admin/affiliates"),
  },
];

export function Sidebar({
  userEmail,
  inquiryCount,
}: {
  userEmail: string;
  inquiryCount?: number;
}) {
  const pathname = usePathname();
  return (
    <aside className="concierge-sidebar">
      <div className="brand">
        <svg width="22" height="14" viewBox="0 0 28 18" fill="none" aria-hidden>
          <path d="M0 18 L9 4 L14 10 L19 2 L28 18 Z" fill="#C41E3A" />
          <path d="M0 18 L9 4 L11 7 L4 18 Z" fill="#FF8C00" />
        </svg>
        <div>
          <span className="word">Bhutan-Luxe</span>
          <span className="sub">The Concierge</span>
        </div>
      </div>
      <nav>
        {NAV.map((n) => (
          <Link
            key={n.href}
            href={n.href}
            className={`nav-item${n.match(pathname) ? " active" : ""}`}
          >
            <span>{n.label}</span>
            {n.label === "Inquiries" && typeof inquiryCount === "number" ? (
              <span className="count">{inquiryCount}</span>
            ) : null}
          </Link>
        ))}
      </nav>
      <div className="footer">
        <div className="user">{userEmail}</div>
        <form action={signOut}>
          <button type="submit" className="signout-btn">
            Sign out
          </button>
        </form>
      </div>
    </aside>
  );
}
