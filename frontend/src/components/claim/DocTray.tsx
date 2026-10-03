import React from "react";
import { FileText, CheckCircle2, AlertCircle, Clock } from "lucide-react";

export interface DocItem {
  id: string;
  kind: string;
  name: string;
  status: "done" | "reading" | "issue";
  lang?: string;
}

export function DocTray({ documents }: { documents: DocItem[] }) {
  return (
    <div className="w-full bg-[#FBF9F4] border border-[#151513] shadow-[3px_3px_0_#151513] p-4 space-y-3">
      <div className="flex items-center justify-between border-b border-[#D8D1C2] pb-2">
        <span className="font-mono text-xs uppercase tracking-wider text-[#5C5A54] font-bold">
          EVIDENCE REPOSITORY ({documents.length})
        </span>
        <span className="font-mono text-[10px] text-[#1E6B45]">Page-Split OCR ✓</span>
      </div>

      <div className="space-y-2">
        {documents.map((doc) => (
          <div
            key={doc.id}
            className="flex items-center justify-between p-2.5 bg-[#F3EFE6] border border-[#D8D1C2] hover:border-[#151513] transition-colors rounded-xs group"
          >
            <div className="flex items-center gap-2.5 min-w-0 pr-2">
              <FileText className="w-4 h-4 text-[#5C5A54] flex-shrink-0" />
              <div className="truncate">
                <span className="font-sans text-xs font-semibold text-[#151513] block truncate">
                  {doc.name}
                </span>
                <span className="font-mono text-[10px] text-[#5C5A54] uppercase">
                  {doc.kind.replace("_", " ")} {doc.lang && `· ${doc.lang}`}
                </span>
              </div>
            </div>

            <div className="flex-shrink-0">
              {doc.status === "done" && (
                <span title="Digitised successfully">
                  <CheckCircle2 className="w-4 h-4 text-[#1E6B45]" />
                </span>
              )}
              {doc.status === "reading" && (
                <span title="Processing via DocAI...">
                  <Clock className="w-4 h-4 text-[#C98A0B] animate-spin" />
                </span>
              )}
              {doc.status === "issue" && (
                <span title="Issue detected">
                  <AlertCircle className="w-4 h-4 text-[#B3261E]" />
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
