"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/brand/Logo";
import { LanguageSwitcher } from "@/components/brand/LanguageSwitcher";
import { MessageSquareQuote, ShieldAlert } from "lucide-react";

export function Header({
  lang = "hi-IN",
  onSelectLang,
  onOpenAskDrawer
}: {
  lang?: string;
  onSelectLang: (lang: string) => void;
  onOpenAskDrawer: () => void;
}) {
  const pathname = usePathname();

  return (
    <header className="w-full bg-[#FBF9F4] border-b border-[#D8D1C2] sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-6">
          <Logo size="md" />
          <nav className="hidden md:flex items-center gap-5 text-xs font-mono tracking-wider uppercase text-[#5C5A54]">
            <Link
              href="/app"
              className={`hover:text-[#151513] transition-colors ${pathname === "/app" ? "text-[#B3261E] font-bold" : ""}`}
            >
              Wallet
            </Link>
            <Link
              href="/app/incident"
              className={`hover:text-[#151513] transition-colors flex items-center gap-1 ${pathname.includes("incident") ? "text-[#B3261E] font-bold" : ""}`}
            >
              <span className="w-2 h-2 rounded-full bg-[#B3261E] animate-ping" />
              <span>Something Happened</span>
            </Link>
            <Link
              href="/app/claims/CLM-HEALTH-001"
              className={`hover:text-[#151513] transition-colors ${pathname.includes("claims") ? "text-[#B3261E] font-bold" : ""}`}
            >
              Claim Workspace
            </Link>
          </nav>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-3">
          {/* Honest Demo Mode Tag */}
          <span className="hidden sm:inline-block font-mono text-[10px] text-[#5C5A54] border border-[#D8D1C2] bg-[#E9E4D8]/60 px-1.5 py-0.5 rounded-xs">
            DEMO MODE
          </span>

          {/* Ask Assistant Drawer Button */}
          <button
            onClick={onOpenAskDrawer}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#F3EFE6] border border-[#151513] rounded-xs font-mono text-xs text-[#151513] shadow-[2px_2px_0_#151513] hover:bg-[#E9E4D8] transition-all"
          >
            <MessageSquareQuote className="w-3.5 h-3.5 text-[#B3261E]" />
            <span className="hidden sm:inline">Ask ClaimMate</span>
          </button>

          {/* Language Switcher */}
          <LanguageSwitcher currentLang={lang} onSelectLang={onSelectLang} />
        </div>
      </div>
    </header>
  );
}
