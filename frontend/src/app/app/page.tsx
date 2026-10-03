"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Header } from "@/components/brand/Header";
import { PolicyCard, PolicyData } from "@/components/wallet/PolicyCard";
import { AskDrawer } from "@/components/ask/AskDrawer";
import { api } from "@/lib/api";
import { formatINR } from "@/lib/formatINR";
import { Plus, AlertCircle, ArrowRight, ShieldAlert } from "lucide-react";

export default function WalletPage() {
  const [policies, setPolicies] = useState<PolicyData[]>([]);
  const [lang, setLang] = useState("hi-IN");
  const [isAskOpen, setIsAskOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api.getPolicies().then((data) => {
      setPolicies(data);
      setIsLoading(false);
    });
  }, []);

  const totalCoverage = policies.reduce((acc, p) => acc + (p.sum_insured || 0), 0);

  return (
    <div className="min-h-screen bg-[#F3EFE6] flex flex-col justify-between">
      <Header
        lang={lang}
        onSelectLang={setLang}
        onOpenAskDrawer={() => setIsAskOpen(true)}
      />

      <main className="max-w-7xl mx-auto w-full px-6 py-8 flex-1 space-y-8">
        {/* Wallet Banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b-2 border-[#151513] pb-4">
          <div>
            <span className="font-mono text-xs uppercase tracking-wider text-[#5C5A54] block font-bold">
              POLICY WALLET · बीमा बही-खाता
            </span>
            <h1 className="font-serif font-black text-3xl md:text-4xl text-[#151513]">
              Your Insurance Policies
            </h1>
            <p className="font-mono text-xs text-[#5C5A54] mt-1">
              {policies.length} policies active · {formatINR(totalCoverage)} total cover · Next renewal in 41 days
            </p>
          </div>

          <Link
            href="/app/incident"
            className="px-6 py-3 bg-[#B3261E] text-[#FBF9F4] font-mono text-xs uppercase font-bold tracking-wider border-2 border-[#151513] shadow-[4px_4px_0_#151513] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0_#151513] transition-all flex items-center justify-center gap-2"
          >
            <span className="w-2.5 h-2.5 rounded-full bg-[#FBF9F4] animate-ping" />
            <span>Something Happened ● (दावा शुरू करें)</span>
          </Link>
        </div>

        {/* Coverage Check Summary Bar */}
        <div className="bg-[#FBF9F4] border border-[#151513] p-4 shadow-[3px_3px_0_#151513] space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs uppercase text-[#5C5A54] font-bold">
              COVERAGE AUDIT & BENEFIT CHECK
            </span>
            <span className="font-mono text-xs text-[#1E6B45] font-bold">
              3 Covered · 1 Potential Gap
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
            <div className="p-3 bg-[#F3EFE6] border border-[#D8D1C2] space-y-1">
              <span className="text-[#5C5A54] uppercase block">Inpatient Hospitalisation</span>
              <div className="w-full h-2 bg-[#1E6B45] rounded-xs" />
              <span className="text-[#151513] font-bold block pt-1">₹5,00,000 (Star Health)</span>
            </div>

            <div className="p-3 bg-[#F3EFE6] border border-[#D8D1C2] space-y-1">
              <span className="text-[#5C5A54] uppercase block">Vehicle Own Damage</span>
              <div className="w-full h-2 bg-[#1E6B45] rounded-xs" />
              <span className="text-[#151513] font-bold block pt-1">₹6,40,000 IDV (ICICI)</span>
            </div>

            <div className="p-3 bg-[#F3EFE6] border border-[#D8D1C2] space-y-1">
              <span className="text-[#5C5A54] uppercase block">OPD Dental / Routine</span>
              <div className="w-full h-2 bg-[#D8D1C2] rounded-xs" />
              <span className="text-[#B3261E] font-bold block pt-1 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" /> No OPD Cover (Gap)
              </span>
            </div>
          </div>
        </div>

        {/* Policies Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {policies.map((pol) => (
            <PolicyCard key={pol.id} policy={pol} />
          ))}
        </div>
      </main>

      <footer className="w-full border-t border-[#D8D1C2] bg-[#FBF9F4] py-4 text-center text-xs font-mono text-[#5C5A54]">
        ClaimMate · Multilingual Insurance Wallet
      </footer>

      {/* Global Ask Assistant Drawer */}
      <AskDrawer
        isOpen={isAskOpen}
        onClose={() => setIsAskOpen(false)}
        lang={lang}
      />
    </div>
  );
}
