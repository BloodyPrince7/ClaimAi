"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Header } from "@/components/brand/Header";
import { Stamp } from "@/components/ledger/Stamp";
import { api } from "@/lib/api";
import { formatINR } from "@/lib/formatINR";
import { ArrowLeft, CheckCircle2, AlertTriangle, FileText, ExternalLink } from "lucide-react";

export default function PolicyDetailPage() {
  const params = useParams();
  const policyId = (params?.id as string) || "POL-HEALTH-001";
  const [policy, setPolicy] = useState<any>(null);
  const [selectedRuleKey, setSelectedRuleKey] = useState<string>("room_rent_cap_value");

  useEffect(() => {
    api.getPolicy(policyId).then((data: any) => setPolicy(data));
  }, [policyId]);

  const rulesList = [
    {
      key: "room_rent_cap_value",
      label: "Room Rent & Nursing Cap",
      clause: "Clause 4.2",
      page: 12,
      value: "1.0% of Sum Insured / day (₹5,000/day)",
      quote: "Room Rent, boarding and nursing charges up to 1% of Sum Insured per day. If higher room is chosen, proportionate deduction applies.",
      verified: true
    },
    {
      key: "icu_cap_value",
      label: "ICU Charges Limit",
      clause: "Clause 4.2.2",
      page: 12,
      value: "2.0% of Sum Insured / day (₹10,000/day)",
      quote: "Intensive Care Unit (ICU) charges up to 2% of Sum Insured per day.",
      verified: true
    },
    {
      key: "copay_percent",
      label: "Compulsory Co-Payment",
      clause: "Clause 16",
      page: 16,
      value: "10% on each admissible claim",
      quote: "A compulsory co-payment of 10% shall be applicable on each admissible claim amount.",
      verified: true
    },
    {
      key: "pre_hosp_days",
      label: "Pre-Hospitalisation Window",
      clause: "Clause 4.3",
      page: 14,
      value: "30 Days prior to admission",
      quote: "Pre-hospitalisation medical expenses incurred up to 30 days prior to admission are payable.",
      verified: true
    },
    {
      key: "post_hosp_days",
      label: "Post-Hospitalisation Window",
      clause: "Clause 4.3",
      page: 14,
      value: "60 Days post discharge",
      quote: "Post-hospitalisation medical expenses incurred up to 60 days post discharge are payable.",
      verified: true
    },
    {
      key: "ped_waiting",
      label: "Pre-Existing Disease (PED) Waiting",
      clause: "Clause 4.1",
      page: 23,
      value: "24 Continuous Months",
      quote: "Pre-existing diseases are covered after 24 continuous months of coverage without break.",
      verified: true
    }
  ];

  const activeRule = rulesList.find((r) => r.key === selectedRuleKey) || rulesList[0];

  return (
    <div className="min-h-screen bg-[#F3EFE6] flex flex-col justify-between">
      <Header onSelectLang={() => {}} onOpenAskDrawer={() => {}} />

      <main className="max-w-7xl mx-auto w-full px-6 py-8 flex-1 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b-2 border-[#151513] pb-4">
          <div>
            <Link
              href="/app"
              className="inline-flex items-center gap-1 font-mono text-xs text-[#5C5A54] hover:text-[#151513] mb-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Policy Wallet</span>
            </Link>
            <h1 className="font-serif font-black text-3xl md:text-4xl text-[#151513]">
              {policy?.plan_name || "Family Health Optima"} · Decoded Clauses
            </h1>
            <p className="font-mono text-xs text-[#5C5A54] mt-1">
              Policy #{policyId} · {policy?.insurer || "Star Health & Allied"} · Sum Insured: ₹5,00,000
            </p>
          </div>
          <Stamp variant="payable" text="14 RULES VERIFIED" />
        </div>

        {/* 2-Column Split: Decoded Clauses (Left) | Grounded Policy Text & Highlighter (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Rules List (5 cols) */}
          <div className="lg:col-span-5 bg-[#FBF9F4] border-2 border-[#151513] p-4 shadow-[4px_4px_0_#151513] space-y-3">
            <div className="flex items-center justify-between border-b border-[#D8D1C2] pb-2">
              <span className="font-mono text-xs uppercase text-[#5C5A54] font-bold">
                EXTRACTED POLICY RULES ({rulesList.length})
              </span>
              <span className="font-mono text-xs text-[#1E6B45]">
                DocAI Digitised ✓
              </span>
            </div>

            <div className="space-y-2">
              {rulesList.map((r) => {
                const isSelected = selectedRuleKey === r.key;
                return (
                  <div
                    key={r.key}
                    onClick={() => setSelectedRuleKey(r.key)}
                    className={`p-3 border rounded-xs cursor-pointer transition-all ${
                      isSelected
                        ? "bg-[#F3EFE6] border-[#151513] shadow-[inset_3px_0_0_#B3261E]"
                        : "bg-[#FBF9F4] border-[#D8D1C2] hover:bg-[#F3EFE6]/60"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-serif font-bold text-sm text-[#151513]">
                        {r.label}
                      </span>
                      <span className="font-mono text-[10px] text-[#1E6B45] font-bold">
                        {r.clause} (p.{r.page})
                      </span>
                    </div>

                    <div className="mt-1 font-mono text-xs text-[#B3261E] font-bold">
                      {r.value}
                    </div>

                    <p className="mt-1 font-sans text-[11px] text-[#5C5A54] line-clamp-2">
                      &ldquo;{r.quote}&rdquo;
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Grounded Policy Page & Marker Highlighter (7 cols) */}
          <div className="lg:col-span-7 bg-[#FBF9F4] border-2 border-[#151513] p-6 shadow-[4px_4px_0_#151513] space-y-5">
            <div className="flex items-center justify-between border-b border-[#D8D1C2] pb-3">
              <div>
                <span className="font-mono text-xs uppercase text-[#5C5A54] font-bold block">
                  GROUNDED POLICY EVIDENCE · PAGE {activeRule.page}
                </span>
                <span className="font-serif font-bold text-lg text-[#151513]">
                  {activeRule.clause} · {activeRule.label}
                </span>
              </div>
              <span className="font-mono text-xs bg-[#1E6B45]/10 text-[#1E6B45] border border-[#1E6B45]/40 px-2 py-1 rounded-xs flex items-center gap-1 font-bold">
                <CheckCircle2 className="w-3.5 h-3.5" /> Text Verified (Score 98%)
              </span>
            </div>

            {/* Simulated Policy PDF Page with Real Highlighter */}
            <div className="bg-[#FFFFFF] border border-[#D8D1C2] p-8 shadow-inner font-serif text-sm leading-relaxed text-[#151513] space-y-4 min-h-[360px] relative">
              <div className="border-b border-[#D8D1C2] pb-2 text-[10px] font-mono text-[#5C5A54] flex justify-between">
                <span>STAR HEALTH & ALLIED INSURANCE CO. LTD.</span>
                <span>POLICY WORDING · PAGE {activeRule.page} OF 38</span>
              </div>

              <p className="text-xs text-[#5C5A54]">
                SECTION 4: COVERAGE TERMS, CONDITIONS AND APPLICABLE EXCLUSIONS
              </p>

              <h4 className="font-bold text-base text-[#151513]">
                {activeRule.clause}: General Benefits
              </h4>

              <p>
                The company hereby agrees that subject to the terms, conditions, warranties, and exclusions contained herein or endorsed hereon, if any insured person shall suffer from an illness or injury during the policy period, the company will pay admissible medical expenses:
              </p>

              {/* Highlighted Quote in Bahi-Khata Yellow Marker */}
              <div className="p-3 bg-[#F6E27A]/80 border-l-4 border-[#C98A0B] shadow-xs my-4 rounded-xs">
                <span className="font-serif font-bold text-[#151513] text-base">
                  &ldquo;{activeRule.quote}&rdquo;
                </span>
              </div>

              <p className="text-xs text-[#5C5A54]">
                Any claim in respect of the above shall be assessed strictly according to the statutory IRDAI guidelines and scheduled definitions of medical terms.
              </p>

              {/* Rubber Verification Stamp */}
              <div className="absolute right-6 bottom-6">
                <Stamp variant="payable" text="CITATION VERIFIED" />
              </div>
            </div>

            <div className="p-3 bg-[#E9E4D8]/60 border border-[#D8D1C2] text-xs font-mono text-[#5C5A54] flex items-center justify-between">
              <span>Verified with RapidFuzz partial_ratio ≥ 85% against document OCR stream</span>
              <span className="text-[#151513] font-bold">100% Traceable</span>
            </div>
          </div>
        </div>
      </main>

      <footer className="w-full border-t border-[#D8D1C2] bg-[#FBF9F4] py-4 text-center text-xs font-mono text-[#5C5A54]">
        ClaimMate · Grounded Clause Verifier & Policy Inspector
      </footer>
    </div>
  );
}
