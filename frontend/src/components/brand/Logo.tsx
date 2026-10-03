import React from "react";
import Link from "next/link";

export function Logo({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const isLarge = size === "lg";
  return (
    <Link href="/" className="inline-flex items-center gap-2 group text-decoration-none">
      <div className="w-8 h-8 rounded-sm bg-[#B3261E] flex items-center justify-center text-[#FBF9F4] font-serif font-black text-lg border border-[#151513] shadow-[2px_2px_0_#151513] transition-transform group-hover:translate-x-0.5 group-hover:translate-y-0.5 group-hover:shadow-[1px_1px_0_#151513]">
        क
      </div>
      <div className="flex flex-col">
        <span className={`font-serif tracking-tight font-black ${isLarge ? "text-2xl" : "text-xl"} text-[#151513]`}>
          ClaimMate
        </span>
        <span className="text-[9px] font-mono tracking-widest text-[#5C5A54] uppercase -mt-1">
          बही-खाता · Copilot
        </span>
      </div>
    </Link>
  );
}
