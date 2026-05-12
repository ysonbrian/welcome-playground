"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { type Session } from "next-auth";

interface NavbarProps {
  session: Session | null;
}

export function Navbar({ session }: NavbarProps) {
  const pathname = usePathname();

  const navItems = [
    { href: "/map", label: "지도" },
    { href: "/wheel", label: "돌림판" },
  ];

  return (
    <nav className="fixed left-0 right-0 top-0 z-50 flex h-16 items-center border-b border-gray-200 bg-white px-3 shadow-sm md:px-6">
      <Link href="/" className="mr-4 text-base font-bold text-gray-900 md:mr-8 md:text-lg">
        Randoo
      </Link>

      <div className="flex gap-0.5 md:gap-1">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`rounded-lg px-2.5 py-2 text-xs font-medium transition-colors md:px-4 md:text-sm ${
              pathname === item.href
                ? "bg-blue-100 text-blue-700"
                : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
            }`}
          >
            {item.label}
          </Link>
        ))}
      </div>

      <div className="ml-auto">
        {session?.user ? (
          <div className="flex items-center gap-2 md:gap-3">
            <span className="hidden max-w-[80px] truncate text-sm text-gray-600 sm:inline md:max-w-none">
              {session.user.name}
            </span>
            <Link
              href="/api/auth/signout"
              className="rounded-lg border border-gray-300 px-2.5 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-100 md:px-3 md:text-sm"
            >
              로그아웃
            </Link>
          </div>
        ) : (
          <Link
            href="/api/auth/signin"
            className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-blue-700 md:px-4 md:text-sm"
          >
            로그인
          </Link>
        )}
      </div>
    </nav>
  );
}
