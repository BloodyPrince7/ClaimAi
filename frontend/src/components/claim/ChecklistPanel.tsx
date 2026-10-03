import React from "react";
import { Check, X, AlertCircle } from "lucide-react";

export interface ChecklistItem {
  id: string;
  label: string;
  status: "ok" | "missing" | "invalid";
  reason?: string | null;
}

export function ChecklistPanel({ checklist }: { checklist: ChecklistItem[] }) {
  return (
    <div className="w-full bg-[#FBF9F4] border border-[#151513] shadow-[3px_3px_0_#151513] p-4 space-y-3">
      <div className="flex items-center justify-between border-b border-[#D8D1C2] pb-2">
        <span className="font-mono text-xs uppercase tracking-wider text-[#5C5A54] font-bold">
          CLAIM PACK CHECKLIST
        </span>
        <span className="font-mono text-[10px] text-[#5C5A54]">IRDAI Mandatory</span>
      </div>

      <div className="space-y-2">
        {checklist.map((item) => (
          <div
            key={item.id}
            className={`p-2.5 border rounded-xs text-xs ${
              item.status === "ok"
                ? "bg-[#1E6B45]/5 border-[#1E6B45]/40"
                : item.status === "invalid"
                ? "bg-[#C98A0B]/10 border-[#C98A0B]"
                : "bg-[#B3261E]/5 border-[#B3261E]"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-sans font-medium text-[#151513]">
                {item.label}
              </span>
              <div className="flex-shrink-0 ml-2">
                {item.status === "ok" && (
                  <span className="font-mono text-[10px] uppercase font-bold text-[#1E6B45] flex items-center gap-1">
                    <Check className="w-3.5 h-3.5 stroke-[3]" /> OK
                  </span>
                )}
                {item.status === "invalid" && (
                  <span className="font-mono text-[10px] uppercase font-bold text-[#C98A0B] flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" /> ACTION REQ.
                  </span>
                )}
                {item.status === "missing" && (
                  <span className="font-mono text-[10px] uppercase font-bold text-[#B3261E] flex items-center gap-1">
                    <X className="w-3.5 h-3.5 stroke-[3]" /> MISSING
                  </span>
                )}
              </div>
            </div>

            {item.reason && (
              <p className="mt-1 text-[11px] text-[#5C5A54] font-sans">
                {item.reason}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
