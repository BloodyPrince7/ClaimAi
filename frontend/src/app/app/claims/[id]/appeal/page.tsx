"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Header } from "@/components/brand/Header";
import { Stamp } from "@/components/ledger/Stamp";
import { api } from "@/lib/api";
import { ArrowLeft, Copy, Check, ShieldAlert, ArrowRight, FileText } from "lucide-react";

export default function AppealPage() {
  const params = useParams();
  const claimId = (params?.id as string) || "CLM-HEALTH-001";
  const [lang, setLang] = useState("hi-IN");
  const [appealData, setAppealData] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    api.draftAppeal(claimId, lang).then((data) => setAppealData(data));
  }, [claimId, lang]);

  const handleCopy = () => {
    if (appealData?.letter_en) {
      navigator.clipboard.writeText(appealData.letter_en);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-[#F3EFE6] flex flex-col justify-between">
      <Header lang={lang} onSelectLang={setLang} onOpenAskDrawer={() => {}} />

      <main className="max-w-6xl mx-auto w-full px-6 py-8 flex-1 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between border-b-2 border-[#151513] pb-4">
          <div>
            <Link
              href={`/app/claims/${claimId}`}
              className="inline-flex items-center gap-1 font-mono text-xs text-[#5C5A54] hover:text-[#151513] mb-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Claim Workspace</span>
            </Link>
            <h1 className="font-serif font-black text-3xl md:text-4xl text-[#151513]">
              Grievance Appeal Drafter & Escalation Rail
            </h1>
            <p className="font-mono text-xs text-[#5C5A54] mt-1">
              Contesting Claim Repudiation for Ref: {claimId} · Statutory 3-Tier IRDAI Escalation
            </p>
          </div>
          <Stamp variant="deducted" text="CONTEST REPUDIATION" />
        </div>

        {/* 3-Tier Escalation Rail */}
        <div className="bg-[#FBF9F4] border-2 border-[#151513] p-5 shadow-[4px_4px_0_#151513] space-y-3">
          <span className="font-mono text-xs uppercase text-[#5C5A54] font-bold block">
            STATUTORY IRDAI ESCALATION PATHWAY
          </span>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-3 bg-[#1E6B45]/5 border-2 border-[#1E6B45] rounded-xs space-y-1">
              <span className="font-mono text-[10px] uppercase font-bold text-[#1E6B45] block">
                STAGE 1 · INSURER GRO (ACTIVE)
              </span>
              <h4 className="font-serif font-bold text-sm text-[#151513]">
                Grievance Redressal Officer
              </h4>
              <p className="text-xs font-mono text-[#5C5A54]">
                SLA: 15 Working Days · gro@starhealth.in
              </p>
            </div>

            <div className="p-3 bg-[#F3EFE6] border border-[#D8D1C2] rounded-xs space-y-1">
              <span className="font-mono text-[10px] uppercase font-bold text-[#5C5A54] block">
                STAGE 2 · REGULATOR PORTAL
              </span>
              <h4 className="font-serif font-bold text-sm text-[#151513]">
                IRDAI Bima Bharosa
              </h4>
              <p className="text-xs font-mono text-[#5C5A54]">
                SLA: 15 Days · bimabharosa.irdai.gov.in
              </p>
            </div>

            <div className="p-3 bg-[#F3EFE6] border border-[#D8D1C2] rounded-xs space-y-1">
              <span className="font-mono text-[10px] uppercase font-bold text-[#5C5A54] block">
                STAGE 3 · BINDING TRIBUNAL
              </span>
              <h4 className="font-serif font-bold text-sm text-[#151513]">
                Insurance Ombudsman
              </h4>
              <p className="text-xs font-mono text-[#5C5A54]">
                SLA: 30 Days · Up to ₹50 Lakh awards
              </p>
            </div>
          </div>
        </div>

        {/* Bilingual Letter View (Side-by-Side) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs uppercase text-[#5C5A54] font-bold">
              BILINGUAL APPEAL LETTER (GROUNDED IN MASTER CIRCULARS)
            </span>
            <button
              onClick={handleCopy}
              className="px-3 py-1 bg-[#151513] text-[#FBF9F4] font-mono text-xs uppercase font-bold border border-[#151513] flex items-center gap-1.5 shadow-[2px_2px_0_#B3261E]"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-[#4FB585]" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? "Copied English Text" : "Copy English Letter"}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* English Official Version */}
            <div className="bg-[#FBF9F4] border-2 border-[#151513] p-5 shadow-[3px_3px_0_#151513] space-y-2">
              <div className="flex items-center justify-between border-b border-[#D8D1C2] pb-2">
                <span className="font-mono text-xs uppercase font-bold text-[#151513]">
                  ENGLISH (OFFICIAL COPY TO SUBMIT)
                </span>
                <span className="font-mono text-[10px] text-[#5C5A54]">Legal Copy</span>
              </div>
              <pre className="font-mono text-xs text-[#151513] whitespace-pre-wrap leading-relaxed select-all">
                {appealData?.letter_en}
              </pre>
            </div>

            {/* Localized User-Understanding Version */}
            <div className="bg-[#FBF9F4] border-2 border-[#151513] p-5 shadow-[3px_3px_0_#151513] space-y-2">
              <div className="flex items-center justify-between border-b border-[#D8D1C2] pb-2">
                <span className="font-mono text-xs uppercase font-bold text-[#B3261E]">
                  LOCALIZED (आपकी समझ के लिए)
                </span>
                <span className="font-mono text-[10px] text-[#5C5A54]">{lang}</span>
              </div>
              <pre className="font-sans text-xs text-[#151513] whitespace-pre-wrap leading-relaxed">
                {appealData?.letter_localized}
              </pre>
            </div>
          </div>
        </div>
      </main>

      <footer className="w-full border-t border-[#D8D1C2] bg-[#FBF9F4] py-4 text-center text-xs font-mono text-[#5C5A54]">
        ClaimMate · Insurance Appeal & Legal Grievance Engine
      </footer>
    </div>
  );
}
