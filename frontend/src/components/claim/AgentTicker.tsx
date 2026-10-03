"use client";
import React, { useEffect, useState, useRef } from "react";
import { Terminal, ChevronUp, ChevronDown } from "lucide-react";

export interface TickerLog {
  ts: string;
  agent: string;
  level: "info" | "warn" | "error";
  message: string;
}

const DEFAULT_LOGS: TickerLog[] = [
  { ts: "10:42:01", agent: "Language Agent", level: "info", message: "Transcribed Hindi incident note: 'पापा का accident हुआ, 3 दिन hospital में थे'." },
  { ts: "10:42:03", agent: "Doc AI (Vision 1.5)", level: "info", message: "Digitising hospital bills with 10-page preservation chunking..." },
  { ts: "10:42:05", agent: "Evidence Extractor", level: "info", message: "Extracted 7 line items across final bill, pharmacy Rx, and MRI scan." },
  { ts: "10:42:07", agent: "Policy Decoder", level: "info", message: "Verified citations: Clause 4.2 (Room Rent Limit), Clause 16 (Co-pay 10%)." },
  { ts: "10:42:09", agent: "Adjudicator (Python)", level: "info", message: "Calculated room-rent ratio (62.5%) and proportionate surgical deductions." },
  { ts: "10:42:11", agent: "Checklist Agent", level: "warn", message: "Flagged: Doctor signature missing on Discharge Summary Page 2." }
];

export function AgentTicker({ claimId }: { claimId?: string }) {
  const [logs, setLogs] = useState<TickerLog[]>(DEFAULT_LOGS);
  const [isExpanded, setIsExpanded] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // Try to connect to real SSE if available
    const url = `http://localhost:8000/claims/${claimId || "CLM-HEALTH-001"}/events`;
    let eventSource: EventSource | null = null;
    try {
      eventSource = new EventSource(url);
      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.message) {
            setLogs((prev) => [...prev, data]);
          }
        } catch {}
      };
      eventSource.onerror = () => {
        eventSource?.close();
      };
    } catch {}

    return () => {
      eventSource?.close();
    };
  }, [claimId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div className="w-full bg-[#151513] text-[#FBF9F4] border-t-2 border-[#151513] font-mono text-xs shadow-[0_-2px_10px_rgba(0,0,0,0.1)] transition-all">
      {/* Bar Header */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="px-4 py-2 flex items-center justify-between cursor-pointer hover:bg-[#2C2B27]"
      >
        <div className="flex items-center gap-2">
          <Terminal className="w-3.5 h-3.5 text-[#4FB585] animate-pulse" />
          <span className="font-bold text-[11px] uppercase tracking-wider text-[#A19D93]">
            TICKER TAPE · LIVE MULTI-AGENT EXECUTION FEED
          </span>
          <span className="text-[10px] text-[#4FB585] bg-[#4FB585]/20 px-1.5 py-0.5 rounded-xs">
            ACTIVE ({logs.length} EVENTS)
          </span>
        </div>
        <div className="flex items-center gap-1 text-[11px] text-[#A19D93]">
          <span>{isExpanded ? "Collapse" : "Expand roll"}</span>
          {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
        </div>
      </div>

      {/* Expanded Log Roll or Compact Strip */}
      <div
        ref={scrollRef}
        className={`px-4 pb-3 divide-y divide-[#2C2B27] overflow-y-auto transition-all ${
          isExpanded ? "max-h-56" : "max-h-8"
        }`}
      >
        {(isExpanded ? logs : logs.slice(-1)).map((log, idx) => (
          <div key={idx} className="py-1 flex items-start gap-3">
            <span className="text-[#A19D93] text-[10px] whitespace-nowrap">{log.ts}</span>
            <span className="text-[#E5533F] font-bold text-[10px] whitespace-nowrap uppercase">
              [{log.agent}]
            </span>
            <span
              className={`text-[11px] ${
                log.level === "warn" ? "text-[#E8B23A]" : "text-[#ECE7DC]"
              }`}
            >
              {log.message}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
