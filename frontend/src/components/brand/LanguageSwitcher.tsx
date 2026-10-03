"use client";
import React, { useState } from "react";
import { Globe, Check } from "lucide-react";

export const LANGUAGES = [
  { code: "hi-IN", name: "Hindi", script: "हिन्दी" },
  { code: "ta-IN", name: "Tamil", script: "தமிழ்" },
  { code: "te-IN", name: "Telugu", script: "తెలుగు" },
  { code: "bn-IN", name: "Bangla", script: "বাংলা" },
  { code: "mr-IN", name: "Marathi", script: "मराठी" },
  { code: "gu-IN", name: "Gujarati", script: "ગુજરાતી" },
  { code: "kn-IN", name: "Kannada", script: "ಕನ್ನಡ" },
  { code: "ml-IN", name: "Malayalam", script: "മലയാളം" },
  { code: "pa-IN", name: "Punjabi", script: "ਪੰਜਾਬੀ" },
  { code: "od-IN", name: "Odia", script: "ଓଡ଼ିଆ" },
  { code: "en-IN", name: "English", script: "English" }
];

export function LanguageSwitcher({
  currentLang = "hi-IN",
  onSelectLang
}: {
  currentLang?: string;
  onSelectLang: (lang: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const activeLang = LANGUAGES.find((l) => l.code === currentLang) || LANGUAGES[0];

  return (
    <div className="relative inline-block text-left">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-[#FBF9F4] border border-[#151513] text-[#151513] rounded-xs font-mono text-xs shadow-[2px_2px_0_#151513] hover:bg-[#E9E4D8] transition-all"
      >
        <Globe className="w-3.5 h-3.5 text-[#B3261E]" />
        <span className="font-serif font-bold">{activeLang.script}</span>
        <span className="text-[10px] text-[#5C5A54] uppercase">▾</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1 w-48 bg-[#FBF9F4] border-2 border-[#151513] shadow-[4px_4px_0_#151513] z-50 divide-y divide-[#D8D1C2] max-h-72 overflow-y-auto">
          {LANGUAGES.map((l) => {
            const isSelected = l.code === currentLang;
            return (
              <button
                key={l.code}
                onClick={() => {
                  onSelectLang(l.code);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-3 py-2 flex items-center justify-between text-xs transition-colors ${
                  isSelected ? "bg-[#F3EFE6] font-bold text-[#B3261E]" : "hover:bg-[#E9E4D8] text-[#151513]"
                }`}
              >
                <div>
                  <span className="font-serif text-sm block">{l.script}</span>
                  <span className="font-mono text-[10px] text-[#5C5A54] uppercase">{l.name}</span>
                </div>
                {isSelected && <Check className="w-3.5 h-3.5 text-[#B3261E]" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
