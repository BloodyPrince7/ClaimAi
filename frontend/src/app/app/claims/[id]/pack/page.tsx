"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Header } from "@/components/brand/Header";
import { HoldToSign } from "@/components/control/HoldToSign";
import { Stamp } from "@/components/ledger/Stamp";
import { Download, FileText, ArrowLeft, CheckCircle2 } from "lucide-react";

export default function ClaimPackPage() {
  const params = useParams();
  const claimId = (params?.id as string) || "CLM-HEALTH-001";
  const [lang, setLang] = useState("hi-IN");
  const [isSigned, setIsSigned] = useState(false);

  const packIndex = [
    { num: "01", name: "IRDAI Claim Form Part A (Completed)", pages: "p. 1-2", status: "ok" },
    { num: "02", name: "Adjudication Summary & Clause Citations", pages: "p. 3", status: "ok" },
    { num: "03", name: "Hospital Final Bill & Detailed Itemisation", pages: "p. 4-7", status: "ok" },
    { num: "04", name: "Inpatient Pharmacy Bills & Receipts", pages: "p. 8-9", status: "ok" },
    { num: "05", name: "Pre-Hospital Diagnostic MRI Scan Report", pages: "p. 10", status: "ok" },
    { num: "06", name: "Hospital Consumables Annexure Breakdown", pages: "p. 11", status: "ok" }
  ];

  return (
    <div className="min-h-screen bg-[#F3EFE6] flex flex-col justify-between">
      <Header lang={lang} onSelectLang={setLang} onOpenAskDrawer={() => {}} />

      <main className="max-w-4xl mx-auto w-full px-6 py-8 flex-1 space-y-8">
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
              Gate 2 · Final Claim Pack & Digital Signing
            </h1>
            <p className="font-mono text-xs text-[#5C5A54] mt-1">
              Ref: {claimId} · Star Health Policy POL-HEALTH-001 · Ramesh Kumar
            </p>
          </div>
          <Stamp variant={isSigned ? "approved" : "needs-you"} text={isSigned ? "APPROVED BY YOU" : "NEEDS SIGNATURE"} />
        </div>

        {/* Claim Pack Preview Box */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          {/* Table of contents */}
          <div className="md:col-span-7 bg-[#FBF9F4] border-2 border-[#151513] p-5 shadow-[4px_4px_0_#151513] space-y-4">
            <div className="flex items-center justify-between border-b border-[#D8D1C2] pb-2">
              <span className="font-mono text-xs uppercase text-[#5C5A54] font-bold">
                DOCUMENT SUBMISSION PACK · TABLE OF CONTENTS
              </span>
              <span className="font-mono text-xs text-[#1E6B45] font-bold">
                11 Pages Compiled
              </span>
            </div>

            <div className="divide-y divide-[#D8D1C2]/60 text-xs font-mono">
              {packIndex.map((item) => (
                <div key={item.num} className="py-2.5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-[#B3261E] font-bold">{item.num}</span>
                    <span className="text-[#151513] font-sans">{item.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[#5C5A54]">{item.pages}</span>
                    <CheckCircle2 className="w-4 h-4 text-[#1E6B45]" />
                  </div>
                </div>
              ))}
            </div>

            <div className="p-3 bg-[#E9E4D8]/60 border border-[#D8D1C2] text-xs font-sans text-[#5C5A54] leading-relaxed">
              <strong>Human-in-control policy:</strong> ClaimMate never submits claims automatically to insurers. We assemble the complete legal pack with clause citations; you retain full control to submit or email it yourself.
            </div>
          </div>

          {/* Right Signature & Download Actions */}
          <div className="md:col-span-5 space-y-4">
            <div className="bg-[#FBF9F4] border-2 border-[#151513] p-5 shadow-[4px_4px_0_#151513] space-y-4">
              <span className="font-mono text-xs uppercase text-[#5C5A54] font-bold block">
                GATE 2 APPROVAL (1.2S PHYSICAL HOLD)
              </span>

              <p className="text-xs font-sans text-[#151513] leading-relaxed">
                By signing, you confirm that you have reviewed the 4 flags, verified the deduction arithmetic, and approved the completed IRDAI Part A claim summary.
              </p>

              <HoldToSign
                onSigned={() => setIsSigned(true)}
                label="Hold to sign & finalize pack (1.2s)"
                signedLabel="DIGITALLY SIGNED & VERIFIED"
              />

              {isSigned && (
                <div className="pt-3 border-t border-[#D8D1C2] space-y-2 animate-in fade-in">
                  <a
                    href={`http://localhost:8000/claims/${claimId}/form.pdf`}
                    target="_blank"
                    className="w-full py-2.5 px-3 bg-[#1E6B45] text-[#FBF9F4] font-mono text-xs uppercase font-bold tracking-wider border border-[#151513] shadow-[2px_2px_0_#151513] hover:bg-[#1E6B45]/90 flex items-center justify-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download IRDAI Form Part A</span>
                  </a>

                  <a
                    href={`http://localhost:8000/claims/${claimId}/pack.pdf`}
                    target="_blank"
                    className="w-full py-2.5 px-3 bg-[#151513] text-[#FBF9F4] font-mono text-xs uppercase font-bold tracking-wider border border-[#151513] shadow-[2px_2px_0_#151513] hover:bg-[#2C2B27] flex items-center justify-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Full Claim Bundle</span>
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <footer className="w-full border-t border-[#D8D1C2] bg-[#FBF9F4] py-4 text-center text-xs font-mono text-[#5C5A54]">
        ClaimMate · Official IRDAI Form Filler & Claim Pack Builder
      </footer>
    </div>
  );
}
