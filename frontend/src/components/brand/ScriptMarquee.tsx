"use client";
import React from "react";

const SCRIPT_CLAIMS = [
  { script: "हिन्दी", text: "दावा" },
  { script: "தமிழ்", text: "கோரிக்கை" },
  { script: "తెలుగు", text: "దావా" },
  { script: "বাংলা", text: "দাবি" },
  { script: "मराठी", text: "दावा" },
  { script: "ਪੰਜਾਬੀ", text: "ਦਾਅਵਾ" },
  { script: "ಕನ್ನಡ", text: "ದಾವೆ" },
  { script: "മലയാളം", text: "ക്ലെയിം" },
  { script: "ગુજરાતી", text: "દાવો" },
  { script: "ଓଡ଼ିଆ", text: "ଦାବି" },
  { script: "English", text: "Claim" }
];

export function ScriptMarquee() {
  return (
    <div className="w-full overflow-hidden border-y border-[#D8D1C2] bg-[#E9E4D8]/50 py-2.5">
      <div className="flex w-max animate-marquee space-x-8 items-center text-sm font-medium text-[#5C5A54]">
        {[...SCRIPT_CLAIMS, ...SCRIPT_CLAIMS, ...SCRIPT_CLAIMS].map((item, idx) => (
          <div key={idx} className="flex items-center gap-2 select-none hover:text-[#151513] transition-colors">
            <span className="font-serif text-base text-[#151513] font-semibold">{item.text}</span>
            <span className="font-mono text-[10px] uppercase text-[#5C5A54] tracking-wider px-1 bg-[#D8D1C2]/60 rounded-xs">
              {item.script}
            </span>
            <span className="text-[#D8D1C2] ml-2">·</span>
          </div>
        ))}
      </div>
    </div>
  );
}
