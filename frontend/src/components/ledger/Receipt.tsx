"use client";
import React from "react";
import { Stamp, StampVariant } from "./Stamp";
import { formatINR } from "@/lib/formatINR";

export interface LineItemView {
  id: string;
  line_id: string;
  description: string;
  date?: string;
  category: string;
  billed: number;
  payable: number;
  deducted: number;
  decision: "payable" | "partial" | "deducted" | "uncertain";
  rule_id: string;
  reason: string;
  calc?: string;
  citation?: {
    policy_id: string;
    clause: string;
    page: number;
    quote: string;
    verified: boolean;
  };
}

export function Receipt({
  lines,
  selectedLineId,
  onSelectLine,
  filter = "all"
}: {
  lines: LineItemView[];
  selectedLineId?: string | null;
  onSelectLine: (line: LineItemView) => void;
  filter?: "all" | "deducted" | "partial" | "payable";
}) {
  const filteredLines = lines.filter((l) => {
    if (filter === "all") return true;
    if (filter === "deducted") return l.decision === "deducted" || l.decision === "partial";
    if (filter === "partial") return l.decision === "partial";
    if (filter === "payable") return l.decision === "payable";
    return true;
  });

  return (
    <div className="w-full bg-[#FBF9F4] border border-[#151513] shadow-[4px_4px_0_#151513] relative overflow-hidden">
      {/* Top Perforated Rip Edge */}
      <div className="w-full h-3 border-b border-dashed border-[#D8D1C2] bg-[#E9E4D8]/40 flex items-center justify-between px-3">
        <span className="text-[9px] font-mono uppercase tracking-widest text-[#5C5A54]">
          CLAIM VOUCHER · BREAKUP LEDGER
        </span>
        <span className="text-[9px] font-mono text-[#5C5A54]">REF: AP-4881</span>
      </div>

      {/* Table Header */}
      <div className="grid grid-cols-12 gap-2 px-4 py-2 text-[11px] font-mono uppercase tracking-wider text-[#5C5A54] border-b border-[#D8D1C2] bg-[#F3EFE6]/60">
        <span className="col-span-6">Line Item & Category</span>
        <span className="col-span-2 text-right">Billed</span>
        <span className="col-span-2 text-right">Admissible</span>
        <span className="col-span-2 text-center">Status</span>
      </div>

      {/* Rows */}
      <div className="divide-y divide-[#D8D1C2]/60">
        {filteredLines.map((line) => {
          const isSelected = selectedLineId === line.line_id;
          return (
            <div
              key={line.id}
              onClick={() => onSelectLine(line)}
              className={`grid grid-cols-12 gap-2 px-4 py-3 cursor-pointer items-center transition-all ${
                isSelected
                  ? "bg-[#F3EFE6] shadow-[inset_3px_0_0_#B3261E]"
                  : "hover:bg-[#F3EFE6]/50"
              }`}
            >
              {/* Description & Category */}
              <div className="col-span-6 flex flex-col pr-2">
                <span className="font-serif font-bold text-sm text-[#151513] line-clamp-1">
                  {line.description}
                </span>
                <div className="flex items-center gap-2 text-[11px] text-[#5C5A54] mt-0.5">
                  <span className="font-mono uppercase bg-[#E9E4D8] px-1 py-0.2 rounded-xs text-[10px]">
                    {line.category.replace("_", " ")}
                  </span>
                  {line.citation && (
                    <span className="font-mono text-[#1E6B45] text-[10px] hover:underline">
                      📄 {line.citation.clause} (p.{line.citation.page})
                    </span>
                  )}
                </div>
              </div>

              {/* Billed */}
              <div className="col-span-2 text-right font-mono text-xs text-[#5C5A54]">
                {formatINR(line.billed)}
              </div>

              {/* Payable */}
              <div className="col-span-2 text-right font-mono text-sm font-bold text-[#151513]">
                {formatINR(line.payable)}
              </div>

              {/* Rubber Stamp */}
              <div className="col-span-2 flex justify-center">
                <Stamp variant={line.decision as StampVariant} text={line.decision.toUpperCase()} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Perforated Edge */}
      <div className="w-full h-3 border-t border-dashed border-[#D8D1C2] bg-[#E9E4D8]/40 flex items-center justify-between px-3">
        <span className="text-[9px] font-mono text-[#5C5A54]">END OF ADJUDICATED RECEIPT</span>
        <span className="text-[9px] font-mono text-[#5C5A54]">IRDAI SEC-42</span>
      </div>
    </div>
  );
}
