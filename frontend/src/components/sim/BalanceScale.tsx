"use client";
import React from "react";
import { formatINR } from "@/lib/formatINR";
import { Stamp } from "@/components/ledger/Stamp";

export function BalanceScale({
  estimateAmount = 24400,
  netClaimPayable = 18400,
  ncbLoss3Years = 11400,
  shouldClaim = true,
  recommendation = "Claim Recommended: You will recover ₹18,400 from insurer, exceeding your 3-year NCB loss of ₹11,400 by ₹7,000.",
  calcTable = []
}: {
  estimateAmount?: number;
  netClaimPayable?: number;
  ncbLoss3Years?: number;
  shouldClaim?: boolean;
  recommendation?: string;
  calcTable?: Array<{ item: string; amount: number; type: string }>;
}) {
  // Angle for the beam: tilts toward heavier side
  const diff = netClaimPayable - ncbLoss3Years;
  const tiltAngle = shouldClaim ? -6 : 6;

  return (
    <div className="w-full bg-[#FBF9F4] border-2 border-[#151513] shadow-[4px_4px_0_#151513] p-5 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#D8D1C2] pb-3">
        <div>
          <span className="font-mono text-xs uppercase tracking-wider text-[#5C5A54] block font-bold">
            MOTOR CLAIM · NO-CLAIM BONUS CALCULATOR
          </span>
          <h3 className="font-serif font-black text-2xl text-[#151513]">
            Should I file a claim?
          </h3>
        </div>
        <Stamp
          variant={shouldClaim ? "payable" : "deducted"}
          text={shouldClaim ? "CLAIM RECOMMENDED" : "DON'T CLAIM"}
        />
      </div>

      {/* The Physical Scale Diagram */}
      <div className="relative w-full py-6 flex flex-col items-center">
        {/* Tilting Beam */}
        <div
          style={{ transform: `rotate(${tiltAngle}deg)` }}
          className="w-full max-w-md h-2 bg-[#151513] relative transition-transform duration-700 flex items-center justify-between"
        >
          {/* Fulcrum indicator */}
          <div className="absolute left-1/2 -top-3 -translate-x-1/2 w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-b-[14px] border-b-[#B3261E]" />

          {/* Left Pan: You Get */}
          <div className="absolute -left-4 top-4 flex flex-col items-center text-center w-36">
            <div className="w-0.5 h-6 bg-[#151513]" />
            <div className="bg-[#F3EFE6] border-2 border-[#1E6B45] p-3 shadow-[2px_2px_0_#1E6B45] w-full">
              <span className="font-mono text-[10px] uppercase text-[#1E6B45] block font-bold">
                YOU GET (NET)
              </span>
              <span className="font-serif font-black text-xl text-[#1E6B45]">
                {formatINR(netClaimPayable)}
              </span>
              <span className="text-[9px] font-mono text-[#5C5A54] block mt-0.5">
                After dep & ₹1,000 ded.
              </span>
            </div>
          </div>

          {/* Right Pan: You Lose in NCB */}
          <div className="absolute -right-4 top-4 flex flex-col items-center text-center w-36">
            <div className="w-0.5 h-6 bg-[#151513]" />
            <div className="bg-[#F3EFE6] border-2 border-[#B3261E] p-3 shadow-[2px_2px_0_#B3261E] w-full">
              <span className="font-mono text-[10px] uppercase text-[#B3261E] block font-bold">
                YOU LOSE (NCB)
              </span>
              <span className="font-serif font-black text-xl text-[#B3261E]">
                {formatINR(ncbLoss3Years)}
              </span>
              <span className="text-[9px] font-mono text-[#5C5A54] block mt-0.5">
                Over next 3 renewals
              </span>
            </div>
          </div>
        </div>

        {/* Base Pillar */}
        <div className="w-6 h-12 bg-[#D8D1C2] border-x border-[#151513] mt-2" />
        <div className="w-24 h-2 bg-[#151513]" />
      </div>

      {/* Decision Summary */}
      <div className={`p-4 border-l-4 ${shouldClaim ? "border-[#1E6B45] bg-[#1E6B45]/5" : "border-[#B3261E] bg-[#B3261E]/5"}`}>
        <p className="font-sans text-sm text-[#151513] font-medium leading-relaxed">
          {recommendation}
        </p>
      </div>

      {/* Breakdown Ledger */}
      {calcTable && calcTable.length > 0 && (
        <div className="border border-[#D8D1C2] bg-[#F3EFE6] p-3">
          <span className="font-mono text-[11px] uppercase tracking-wider text-[#5C5A54] block mb-2 font-bold">
            HOW WE CALCULATED (DETERMINISTIC MOTOR TARIFF)
          </span>
          <div className="space-y-1 divide-y divide-[#D8D1C2]/60">
            {calcTable.map((row, idx) => (
              <div key={idx} className="flex justify-between items-center py-1.5 text-xs font-mono">
                <span className="text-[#151513]">{row.item}</span>
                <span className={`font-bold ${row.amount > 0 ? "text-[#151513]" : "text-[#B3261E]"}`}>
                  {formatINR(row.amount)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
