"use client";

import { UserMenu } from "./user-menu";

interface TopbarProps {
  title: string;
}

export function Topbar({ title }: TopbarProps) {
  return (
    <header className="flex h-14 items-center justify-between border-b bg-card/50 backdrop-blur-sm px-4 sm:px-6">
      {/* Left padding on mobile to avoid hamburger menu overlap */}
      <h1 className="pl-10 text-lg font-semibold md:pl-0">{title}</h1>
      <UserMenu />
    </header>
  );
}
