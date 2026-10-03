"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/brand/Logo";
import { LANGUAGES } from "@/components/brand/LanguageSwitcher";
import { Seal } from "@/components/voice/Seal";
import { ArrowRight, Check } from "lucide-react";

export default function OnboardingPage() {
  const router = useRouter();
  const [selectedLang, setSelectedLang] = useState("hi-IN");

  const handleVoiceDetected = (text: string) => {
    // If user spoke in Hindi
    setSelectedLang("hi-IN");
  };

  return (
    <div className="min-h-screen bg-[#F3EFE6] flex flex-col justify-between p-6">
      <header className="max-w-4xl mx-auto w-full flex items-center justify-between border-b border-[#D8D1C2] pb-4">
        <Logo size="md" />
        <span className="font-mono text-xs uppercase text-[#5C5A54]">
          Step 1 of 2 · भाषा चयन
        </span>
      </header>

      <main className="max-w-4xl mx-auto w-full py-8 space-y-8">
        <div className="text-center space-y-2">
          <h1 className="font-serif font-black text-3xl md:text-5xl text-[#151513]">
            Choose your language
          </h1>
          <p className="font-serif text-lg text-[#5C5A54]">
            अपनी भाषा चुनें · உங்கள் மொழியைத் தேர்ந்தெடுக்கவும் · మీ భాషను ఎంచుకోండి
          </p>
        </div>

        {/* 11 Indic Language Tiles */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {LANGUAGES.map((l) => {
            const isSelected = selectedLang === l.code;
            return (
              <button
                key={l.code}
                onClick={() => setSelectedLang(l.code)}
                className={`p-4 border-2 rounded-xs flex flex-col items-center justify-center text-center transition-all ${
                  isSelected
                    ? "bg-[#FBF9F4] border-[#151513] shadow-[4px_4px_0_#B3261E] -translate-y-0.5"
                    : "bg-[#FBF9F4]/70 border-[#D8D1C2] hover:border-[#151513] hover:bg-[#FBF9F4]"
                }`}
              >
                <span className="font-serif font-bold text-2xl text-[#151513] mb-1">
                  {l.script}
                </span>
                <span className="font-mono text-xs text-[#5C5A54] uppercase tracking-wider">
                  {l.name}
                </span>
                {isSelected && (
                  <span className="mt-2 font-mono text-[9px] uppercase font-bold text-[#1E6B45] bg-[#1E6B45]/10 px-1.5 py-0.5 rounded-xs flex items-center gap-1">
                    <Check className="w-3 h-3 stroke-[3]" /> SELECTED
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Voice alternative */}
        <div className="bg-[#FBF9F4] border border-[#151513] p-6 shadow-[3px_3px_0_#151513] flex flex-col items-center text-center space-y-3">
          <span className="font-mono text-xs uppercase text-[#5C5A54] font-bold">
            OR JUST SAY HELLO IN YOUR LANGUAGE
          </span>
          <Seal onRecordingComplete={handleVoiceDetected} />
        </div>

        {/* CTA to Continue */}
        <div className="flex justify-end pt-4">
          <Link
            href="/app"
            className="px-6 py-3 bg-[#B3261E] text-[#FBF9F4] font-mono font-bold text-sm uppercase tracking-wider border-2 border-[#151513] shadow-[4px_4px_0_#151513] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0_#151513] transition-all flex items-center gap-2"
          >
            <span>Enter Wallet (वॉलेट में जाएं)</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </main>

      <footer className="max-w-4xl mx-auto w-full border-t border-[#D8D1C2] pt-4 text-center text-xs font-mono text-[#5C5A54]">
        ClaimMate · Built on Sarvam AI · Saaras v4 · Bulbul v3 · Mayura · Vision 1.5
      </footer>
    </div>
  );
}
