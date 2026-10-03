"use client";
import React, { useState } from "react";
import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { ScriptMarquee } from "@/components/brand/ScriptMarquee";
import { LanguageSwitcher } from "@/components/brand/LanguageSwitcher";
import { ListenButton } from "@/components/voice/ListenButton";
import { Stamp } from "@/components/ledger/Stamp";
import { HoldToSign } from "@/components/control/HoldToSign";
import { formatINR } from "@/lib/formatINR";
import { ArrowRight, ShieldCheck, FileText, CheckCircle2, Volume2 } from "lucide-react";

export default function LandingPage() {
  const [lang, setLang] = useState("hi-IN");
  const [activeTab, setActiveTab] = useState("health");
  const [isDemoSigned, setIsDemoSigned] = useState(false);

  const heroReceiptRows = [
    { desc: "Room rent × 3 days (Deluxe)", billed: 24000, payable: 15000, stamp: "partial", note: "Cl. 4.2 (p.12)" },
    { desc: "Senior Surgeon Fee", billed: 40000, payable: 25000, stamp: "partial", note: "Prop. Cut (62.5%)" },
    { desc: "Surgical Examination Gloves", billed: 1250, payable: 0, stamp: "deducted", note: "IRDAI List I" },
    { desc: "Pre-hosp MRI Spine (Day -12)", billed: 8400, payable: 8400, stamp: "payable", note: "Pre-Hosp Benefit" },
  ];

  return (
    <div className="min-h-screen bg-[#F3EFE6] text-[#151513] flex flex-col justify-between selection:bg-[#B3261E] selection:text-white">
      {/* Top Navigation */}
      <nav className="w-full bg-[#FBF9F4] border-b border-[#D8D1C2] px-6 py-3.5 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Logo size="lg" />
          <div className="flex items-center gap-4">
            <LanguageSwitcher currentLang={lang} onSelectLang={setLang} />
            <Link
              href="/app"
              className="px-4 py-2 bg-[#B3261E] text-[#FBF9F4] font-mono text-xs uppercase font-bold border-2 border-[#151513] shadow-[3px_3px_0_#151513] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[1px_1px_0_#151513] transition-all flex items-center gap-1.5"
            >
              <span>Open App (ऐप खोलें)</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </nav>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-6 py-12 md:py-20 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Headline */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-[#E9E4D8] border border-[#151513] text-[11px] font-mono tracking-wider uppercase">
              <span className="w-2 h-2 rounded-full bg-[#B3261E]" />
              <span>Built on Sarvam AI · Multilingual Claim Copilot</span>
            </div>

            <h1 className="font-serif font-black text-5xl md:text-7xl leading-[1.05] tracking-tight text-[#151513]">
              Every rupee <br />
              of your claim, <br />
              <span className="italic text-[#B3261E] font-serif">explained.</span>
            </h1>

            <p className="font-sans text-lg md:text-xl text-[#5C5A54] max-w-xl leading-relaxed">
              ClaimMate reads your policy wording and hospital bills, calculates what you will get back line by line with clause citations, in your own language.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link
                href="/app"
                className="px-7 py-3.5 bg-[#B3261E] text-[#FBF9F4] font-mono font-bold text-sm uppercase tracking-wider border-2 border-[#151513] shadow-[4px_4px_0_#151513] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0_#151513] transition-all flex items-center gap-2"
              >
                <span>Check My Claim Now</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <ListenButton
                text="கிளைம்மேட் உங்கள் மருத்துவக் காப்பீட்டுக் கொள்கை மற்றும் பில்களைப் படித்து, ஒவ்வொரு ரூபாய்க்கும் காரணத்தை விளக்குகிறது."
                lang="ta-IN"
                label="Hear it in Tamil (தமிழில் கேளுங்கள்)"
              />
            </div>

            <div className="pt-4 flex items-center gap-6 text-xs font-mono text-[#5C5A54]">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#1E6B45]" />
                Zero Rupee Guesswork
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#1E6B45]" />
                Human Approves Every Step
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#1E6B45]" />
                11 Indian Languages
              </span>
            </div>
          </div>

          {/* Right Live Printed Receipt */}
          <div className="lg:col-span-5">
            <div className="w-full bg-[#FBF9F4] border-2 border-[#151513] shadow-[6px_6px_0_#151513] relative overflow-hidden">
              {/* Receipt Header */}
              <div className="p-4 border-b border-dashed border-[#D8D1C2] bg-[#F3EFE6] flex items-center justify-between">
                <div>
                  <span className="font-serif font-black text-base text-[#151513] block">
                    APOLLO-ISH HOSPITAL · BILL #4881
                  </span>
                  <span className="font-mono text-[10px] text-[#5C5A54] uppercase">
                    Patient: Ramesh Kumar · 3 Days Inpatient
                  </span>
                </div>
                <Stamp variant="payable" text="ADJUDICATED" />
              </div>

              {/* Rows */}
              <div className="p-4 space-y-3.5 divide-y divide-[#D8D1C2]/60">
                {heroReceiptRows.map((r, idx) => (
                  <div key={idx} className="pt-2 first:pt-0 flex items-center justify-between text-xs">
                    <div className="pr-2">
                      <span className="font-serif font-bold text-[#151513] block">
                        {r.desc}
                      </span>
                      <span className="font-mono text-[10px] text-[#1E6B45]">
                        {r.note}
                      </span>
                    </div>
                    <div className="text-right flex items-center gap-2">
                      <div>
                        <span className="font-mono text-xs text-[#5C5A54] line-through block">
                          {formatINR(r.billed)}
                        </span>
                        <span className="font-mono text-sm font-bold text-[#151513]">
                          {formatINR(r.payable)}
                        </span>
                      </div>
                      <Stamp variant={r.stamp as any} text={r.stamp.toUpperCase()} />
                    </div>
                  </div>
                ))}
              </div>

              {/* Receipt Total */}
              <div className="p-4 border-t-2 border-[#151513] bg-[#E9E4D8]/60 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-[#5C5A54] block font-bold">
                    NET EXPECTED PAYOUT
                  </span>
                  <span className="font-serif font-black text-3xl text-[#1E6B45]">
                    ₹1,21,300
                  </span>
                </div>
                <span className="font-mono text-[10px] text-[#5C5A54] text-right">
                  Deductions: ₹27,300<br />
                  Missed Pre/Post: ₹12,400
                </span>
              </div>

              {/* Perforated Edge Bottom */}
              <div className="perforated-edge-bottom" />
            </div>
          </div>
        </section>

        {/* Script Marquee */}
        <ScriptMarquee />

        {/* Stat Block */}
        <section className="border-b border-[#D8D1C2] bg-[#FBF9F4] py-14 px-6 text-center">
          <div className="max-w-4xl mx-auto space-y-3">
            <span className="font-serif font-black text-6xl md:text-8xl text-[#B3261E] tracking-tight block">
              ₹26,000 crore
            </span>
            <h2 className="font-serif text-xl md:text-2xl text-[#151513] font-bold">
              of Indian health claims were cut or rejected in FY24.
            </h2>
            <p className="font-mono text-xs text-[#5C5A54]">
              ¹ Source: IRDAI Annual Report 2023–24 (₹15,100 cr disallowed · ₹10,937 cr repudiated).
            </p>
          </div>
        </section>

        {/* How It Works (Ledger List) */}
        <section className="max-w-5xl mx-auto px-6 py-16 space-y-8">
          <div className="border-b-2 border-[#151513] pb-3 flex items-center justify-between">
            <h2 className="font-serif font-black text-3xl text-[#151513]">
              HOW IT WORKS · बही-खाता प्रक्रिया
            </h2>
            <span className="font-mono text-xs text-[#5C5A54] uppercase">
              Deterministic & Verifiable
            </span>
          </div>

          <div className="divide-y divide-[#D8D1C2]">
            <div className="py-5 flex flex-col md:flex-row md:items-center justify-between gap-4 group hover:bg-[#FBF9F4] px-4 transition-colors">
              <span className="font-mono font-bold text-sm text-[#B3261E]">01</span>
              <span className="font-serif font-bold text-xl text-[#151513] md:w-1/3">
                Keep your policies in one wallet
              </span>
              <p className="font-sans text-sm text-[#5C5A54] md:w-1/2">
                Drop your policy wording PDF. Vision 1.5 digitises up to 60 pages with page preservation, extracting room rent caps, co-pay, and waiting periods with quotes.
              </p>
            </div>

            <div className="py-5 flex flex-col md:flex-row md:items-center justify-between gap-4 group hover:bg-[#FBF9F4] px-4 transition-colors">
              <span className="font-mono font-bold text-sm text-[#B3261E]">02</span>
              <span className="font-serif font-bold text-xl text-[#151513] md:w-1/3">
                Tell us what happened in any language
              </span>
              <p className="font-sans text-sm text-[#5C5A54] md:w-1/2">
                Speak in Hindi, Tamil, Hinglish, or Marathi. Saaras v4 transcribes code-mixed audio and Triage Agent matches your incident across health, motor, and personal accident covers.
              </p>
            </div>

            <div className="py-5 flex flex-col md:flex-row md:items-center justify-between gap-4 group hover:bg-[#FBF9F4] px-4 transition-colors">
              <span className="font-mono font-bold text-sm text-[#B3261E]">03</span>
              <span className="font-serif font-bold text-xl text-[#151513] md:w-1/3">
                We check every bill against every clause
              </span>
              <p className="font-sans text-sm text-[#5C5A54] md:w-1/2">
                Our pure-Python rules engine applies IRDAI non-payables, room-rent proportionate cuts, and unlocks pre/post hospitalisation benefits without LLM hallucination.
              </p>
            </div>

            <div className="py-5 flex flex-col md:flex-row md:items-center justify-between gap-4 group hover:bg-[#FBF9F4] px-4 transition-colors">
              <span className="font-mono font-bold text-sm text-[#B3261E]">04</span>
              <span className="font-serif font-bold text-xl text-[#151513] md:w-1/3">
                You review, edit, and sign
              </span>
              <p className="font-sans text-sm text-[#5C5A54] md:w-1/2">
                Physical Hold-to-sign gates guarantee human control. Auto-fills official IRDAI Part A forms and compiles an indexed document submission pack.
              </p>
            </div>
          </div>
        </section>

        {/* Index Tabs for Insurance Types */}
        <section className="max-w-5xl mx-auto px-6 py-10">
          <div className="flex border-b-2 border-[#151513] gap-2 overflow-x-auto">
            {["health", "motor", "life", "travel", "property", "crop"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 font-mono text-xs uppercase font-bold tracking-wider rounded-t-xs border-t-2 border-x-2 transition-all ${
                  activeTab === tab
                    ? "bg-[#FBF9F4] border-[#151513] text-[#B3261E] -mb-0.5 border-b-2 border-b-[#FBF9F4]"
                    : "bg-[#E9E4D8]/60 border-transparent text-[#5C5A54] hover:bg-[#E9E4D8]"
                }`}
              >
                {tab.toUpperCase()}
              </button>
            ))}
          </div>

          <div className="bg-[#FBF9F4] border-2 border-[#151513] border-t-0 p-6 shadow-[3px_3px_0_#151513]">
            {activeTab === "health" && (
              <div className="space-y-3">
                <h3 className="font-serif font-bold text-xl text-[#151513]">
                  Health Insurance: The Room-Rent & Proportionate Deduction Trap
                </h3>
                <p className="font-sans text-sm text-[#5C5A54] leading-relaxed">
                  Choosing a ₹8,000/day Deluxe room on a ₹5,000/day policy doesn’t just cost an extra ₹3,000/day. Insurers cut 37.5% from your surgeon fees, OT charges, and anaesthetist fees too! ClaimMate models this with live slider what-if simulations.
                </p>
              </div>
            )}
            {activeTab === "motor" && (
              <div className="space-y-3">
                <h3 className="font-serif font-bold text-xl text-[#151513]">
                  Motor Insurance: Should I Claim? (No-Claim Bonus Calculator)
                </h3>
                <p className="font-sans text-sm text-[#5C5A54] leading-relaxed">
                  Claiming for a minor ₹4,500 bumper dent resets your 35% No-Claim Bonus to 0%, costing you ₹6,800 over the next 3 renewal premiums. Our balance scale tells you exactly when to pay out-of-pocket.
                </p>
              </div>
            )}
            {activeTab !== "health" && activeTab !== "motor" && (
              <div className="space-y-3">
                <h3 className="font-serif font-bold text-xl text-[#151513]">
                  {activeTab.toUpperCase()} Claim Pack Ready
                </h3>
                <p className="font-sans text-sm text-[#5C5A54] leading-relaxed">
                  Standardized YAML configuration pack loaded with checklists, mandatory documents, and Ombudsman escalation paths.
                </p>
              </div>
            )}
          </div>
        </section>

        {/* Hold to Sign Demo */}
        <section className="max-w-xl mx-auto px-6 py-12 text-center space-y-4">
          <span className="font-mono text-xs uppercase text-[#5C5A54] font-bold">
            HUMAN IN CONTROL · TRY THE HOLD-TO-SIGN GESTURE
          </span>
          <HoldToSign
            onSigned={() => setIsDemoSigned(true)}
            label="Try it: Hold for 1.2s to sign approval"
            signedLabel="VERIFIED & DIGITALLY APPROVED"
          />
          {isDemoSigned && (
            <p className="font-mono text-xs text-[#1E6B45]">
              ✓ Gesture verified. In ClaimMate, nothing is submitted without this physical approval.
            </p>
          )}
        </section>
      </main>

      {/* Colophon Footer */}
      <footer className="w-full bg-[#151513] text-[#FBF9F4] border-t-2 border-[#151513] px-6 py-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <span className="font-serif font-black text-2xl text-[#FBF9F4] block">
              ClaimMate
            </span>
            <span className="font-mono text-xs text-[#A19D93]">
              The Modern Bahi-Khata for Indian Insurance.
            </span>
          </div>
          <div className="font-mono text-xs text-[#A19D93] text-center md:text-right space-y-1">
            <p>Built with Sarvam AI: Vision 1.5 · Sarvam-105B · Saaras v4 · Bulbul v3 · Mayura</p>
            <p className="text-[#ECE7DC]">Pure Python Adjudication · Zero Rupee LLM Hallucinations · Human Gates</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
