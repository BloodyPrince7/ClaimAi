"use client";
import React, { useState } from "react";
import { X, Check, AlertTriangle, ArrowRight } from "lucide-react";
import { LineItemView } from "@/components/ledger/Receipt";
import { formatINR } from "@/lib/formatINR";
import { Stamp } from "@/components/ledger/Stamp";

export function ReviewPanel({
  line,
  onClose,
  onOverride
}: {
  line: LineItemView | null;
  onClose: () => void;
  onOverride: (lineId: string, newPayable: number, decision: "payable" | "deducted" | "partial", reason: string) => void;
}) {
  const [isDisputing, setIsDisputing] = useState(false);
  const [disputeComment, setDisputeComment] = useState("");

  if (!line) return null;

  const handleApprove = () => {
    onClose();
  };

  const handleFullApproval = () => {
    onOverride(line.line_id, line.billed, "payable", "Claimant marked line item 100% admissible");
    onClose();
  };

  const handleSubmitDispute = () => {
    onOverride(line.line_id, line.billed, "payable", disputeComment || "Disputed by claimant");
    setIsDisputing(false);
    onClose();
  };

  return (
    <div className="w-full bg-[#FBF9F4] border-2 border-[#151513] shadow-[4px_4px_0_#151513] p-5 flex flex-col space-y-4 relative">
      {/* Header */}
      <div className="flex items-start justify-between border-b border-[#D8D1C2] pb-3">
        <div className="pr-4">
          <div className="flex items-center gap-2 mb-1">
            <Stamp variant={line.decision} text={line.decision.toUpperCase()} />
            <span className="font-mono text-xs text-[#5C5A54] uppercase tracking-wider">
              Rule {line.rule_id}
            </span>
          </div>
          <h3 className="font-serif font-bold text-lg text-[#151513] leading-snug">
            {line.description}
          </h3>
        </div>
        <button
          onClick={onClose}
          className="p-1 hover:bg-[#E9E4D8] border border-[#151513] rounded-xs text-[#151513]"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Figures */}
      <div className="grid grid-cols-2 gap-3 bg-[#F3EFE6] p-3 border border-[#D8D1C2]">
        <div>
          <span className="text-[10px] font-mono uppercase text-[#5C5A54] block">Billed Amount</span>
          <span className="font-mono text-base font-bold text-[#151513]">{formatINR(line.billed)}</span>
        </div>
        <div>
          <span className="text-[10px] font-mono uppercase text-[#5C5A54] block">Payable / Admissible</span>
          <span className="font-mono text-base font-bold text-[#1E6B45]">{formatINR(line.payable)}</span>
        </div>
      </div>

      {/* WHY Section */}
      <div className="space-y-1">
        <span className="text-[11px] font-mono uppercase text-[#5C5A54] tracking-wider block">
          WHY · ADJUDICATION REASON
        </span>
        <p className="text-sm font-sans text-[#151513] bg-[#E9E4D8]/50 p-2.5 border-l-2 border-[#B3261E]">
          {line.reason}
        </p>
      </div>

      {/* Arithmetic Calculation if present */}
      {line.calc && (
        <div className="space-y-1">
          <span className="text-[11px] font-mono uppercase text-[#5C5A54] tracking-wider block">
            ARITHMETIC DERIVATION
          </span>
          <div className="font-mono text-xs bg-[#151513] text-[#FBF9F4] p-2 rounded-xs select-all">
            {line.calc}
          </div>
        </div>
      )}

      {/* Grounded Citation Section */}
      {line.citation && (
        <div className="space-y-1.5 pt-1">
          <span className="text-[11px] font-mono uppercase text-[#5C5A54] tracking-wider block">
            SOURCE CLAUSE CITATION (Page {line.citation.page})
          </span>
          <div className="bg-[#F3EFE6] border border-[#D8D1C2] p-2.5 rounded-xs text-xs font-sans text-[#151513] relative">
            <span className="bg-[#F6E27A] px-1 py-0.5 rounded-xs font-medium">
              &ldquo;{line.citation.quote}&rdquo;
            </span>
            <div className="mt-2 flex items-center justify-between text-[10px] font-mono text-[#5C5A54]">
              <span>Verified against policy text ✓</span>
              <span className="text-[#1E6B45] font-bold">{line.citation.clause}</span>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      {isDisputing ? (
        <div className="space-y-2 pt-2 border-t border-[#D8D1C2]">
          <label className="text-xs font-mono uppercase text-[#5C5A54] block">
            Reason for Dispute / Correction
          </label>
          <textarea
            value={disputeComment}
            onChange={(e) => setDisputeComment(e.target.value)}
            placeholder="e.g. Hospital confirmed this was medically essential emergency ICU..."
            className="w-full text-xs p-2 bg-[#FBF9F4] border border-[#151513] font-sans h-20 outline-none focus:ring-1 focus:ring-[#151513]"
          />
          <div className="flex gap-2">
            <button
              onClick={handleSubmitDispute}
              className="flex-1 py-2 bg-[#B3261E] text-[#FBF9F4] font-mono text-xs uppercase font-bold border border-[#151513] shadow-[2px_2px_0_#151513]"
            >
              Submit Dispute
            </button>
            <button
              onClick={() => setIsDisputing(false)}
              className="px-3 py-2 bg-[#E9E4D8] font-mono text-xs border border-[#151513]"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-2 pt-2 border-t border-[#D8D1C2]">
          <div className="flex gap-2">
            <button
              onClick={handleApprove}
              className="flex-1 py-2 bg-[#1E6B45] text-[#FBF9F4] font-mono text-xs uppercase font-bold border border-[#151513] shadow-[2px_2px_0_#151513] hover:bg-[#1E6B45]/90 flex items-center justify-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Looks Right</span>
            </button>
            <button
              onClick={() => setIsDisputing(true)}
              className="flex-1 py-2 bg-[#FBF9F4] text-[#B3261E] font-mono text-xs uppercase font-bold border border-[#151513] shadow-[2px_2px_0_#151513] hover:bg-[#E9E4D8] flex items-center justify-center gap-1.5"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Dispute Deduction</span>
            </button>
          </div>
          {line.decision !== "payable" && (
            <button
              onClick={handleFullApproval}
              className="w-full py-1.5 text-center font-mono text-[11px] text-[#5C5A54] hover:text-[#151513] underline"
            >
              Override: Mark 100% Payable ({formatINR(line.billed)})
            </button>
          )}
        </div>
      )}
    </div>
  );
}
