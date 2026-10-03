import React from "react";
import { formatINR } from "@/lib/formatINR";

export function PayoutBar({
  billed,
  payable,
  deducted,
  uncertain = 0
}: {
  billed: number;
  payable: number;
  deducted: number;
  uncertain?: number;
}) {
  const total = billed > 0 ? billed : 1;
  const payPct = Math.min(100, Math.max(0, (payable / total) * 100));
  const dedPct = Math.min(100, Math.max(0, (deducted / total) * 100));
  const uncPct = Math.min(100, Math.max(0, (uncertain / total) * 100));

  return (
    <div className="w-full space-y-2">
      {/* Visual Stacked Bar */}
      <div className="w-full h-4 bg-[#E9E4D8] border border-[#151513] rounded-xs flex overflow-hidden shadow-[1px_1px_0_#151513]">
        {/* Payable segment */}
        <div
          style={{ width: `${payPct}%` }}
          className="bg-[#1E6B45] h-full transition-all duration-500 relative group"
          title={`Payable: ${formatINR(payable)} (${payPct.toFixed(1)}%)`}
        />
        {/* Deducted segment */}
        <div
          style={{ width: `${dedPct}%` }}
          className="bg-[#B3261E] h-full transition-all duration-500 relative group"
          title={`Deducted: ${formatINR(deducted)} (${dedPct.toFixed(1)}%)`}
        />
        {/* Uncertain segment */}
        {uncPct > 0 && (
          <div
            style={{ width: `${uncPct}%` }}
            className="bg-[#C98A0B] h-full transition-all duration-500 relative group"
            title={`Uncertain: ${formatINR(uncertain)} (${uncPct.toFixed(1)}%)`}
          />
        )}
      </div>

      {/* Legend below bar */}
      <div className="flex flex-wrap items-center justify-between text-xs font-mono text-[#5C5A54] pt-1">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 bg-[#1E6B45] rounded-xs inline-block" />
          <span>Payable: <strong className="text-[#151513] font-serif">{formatINR(payable)}</strong> ({payPct.toFixed(0)}%)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 bg-[#B3261E] rounded-xs inline-block" />
          <span>Deductions: <strong className="text-[#151513] font-serif">{formatINR(deducted)}</strong> ({dedPct.toFixed(0)}%)</span>
        </div>
        {uncertain > 0 && (
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 bg-[#C98A0B] rounded-xs inline-block" />
            <span>Needs Review: <strong className="text-[#151513] font-serif">{formatINR(uncertain)}</strong></span>
          </div>
        )}
      </div>
    </div>
  );
}
