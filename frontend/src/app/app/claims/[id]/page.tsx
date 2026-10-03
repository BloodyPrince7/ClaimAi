"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Header } from "@/components/brand/Header";
import { AskDrawer } from "@/components/ask/AskDrawer";
import { MoneyFigure } from "@/components/ledger/MoneyFigure";
import { PayoutBar } from "@/components/ledger/PayoutBar";
import { Receipt, LineItemView } from "@/components/ledger/Receipt";
import { Stamp } from "@/components/ledger/Stamp";
import { DocTray } from "@/components/claim/DocTray";
import { ChecklistPanel } from "@/components/claim/ChecklistPanel";
import { AgentTicker } from "@/components/claim/AgentTicker";
import { ReviewPanel } from "@/components/control/ReviewPanel";
import { RulerSlider } from "@/components/sim/RulerSlider";
import { BalanceScale } from "@/components/sim/BalanceScale";
import { api } from "@/lib/api";
import { formatINR } from "@/lib/formatINR";
import { ArrowRight, Sliders, ShieldAlert, FileText, CheckCircle2 } from "lucide-react";

export default function ClaimWorkspacePage() {
  const params = useParams();
  const claimId = (params?.id as string) || "CLM-HEALTH-001";

  const [claimData, setClaimData] = useState<any>(null);
  const [lang, setLang] = useState("hi-IN");
  const [isAskOpen, setIsAskOpen] = useState(false);
  const [selectedLine, setSelectedLine] = useState<LineItemView | null>(null);
  const [receiptFilter, setReceiptFilter] = useState<"all" | "deducted" | "partial" | "payable">("all");
  const [activeSimTab, setActiveSimTab] = useState<"room_rent" | "motor_ncb">("room_rent");
  const [motorData, setMotorData] = useState<any>(null);

  useEffect(() => {
    api.getClaim(claimId).then((data) => {
      setClaimData(data);
      if (data.lines && data.lines.length > 0) {
        setSelectedLine(data.lines[0]);
      }
    });
    api.motorSim().then((m) => setMotorData(m));
  }, [claimId]);

  const handleLineOverride = async (
    lineId: string,
    newPayable: number,
    decision: "payable" | "deducted" | "partial",
    reason: string
  ) => {
    if (!claimData) return;
    const updatedLines = claimData.lines.map((l: LineItemView) => {
      if (l.line_id === lineId) {
        return {
          ...l,
          payable: newPayable,
          deducted: l.billed - newPayable,
          decision,
          reason
        };
      }
      return l;
    });

    const newPayableTotal = updatedLines.reduce((acc: number, l: any) => acc + l.payable, 0);
    const newDeductedTotal = updatedLines.reduce((acc: number, l: any) => acc + l.deducted, 0);

    setClaimData({
      ...claimData,
      total_payable: newPayableTotal,
      total_deducted: newDeductedTotal,
      lines: updatedLines
    });
  };

  const handleSimRentChange = async (rent: number) => {
    const res = await api.whatIfSim(claimId, rent);
    if (claimData) {
      setClaimData({
        ...claimData,
        total_payable: res.new_payable,
        total_deducted: claimData.total_billed - res.new_payable
      });
    }
  };

  if (!claimData) {
    return (
      <div className="min-h-screen bg-[#F3EFE6] flex items-center justify-center font-mono text-sm text-[#5C5A54]">
        Loading Claim Workspace...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F3EFE6] flex flex-col justify-between">
      <Header
        lang={lang}
        onSelectLang={setLang}
        onOpenAskDrawer={() => setIsAskOpen(true)}
      />

      <main className="max-w-7xl mx-auto w-full px-6 py-8 flex-1 space-y-8">
        {/* Workspace Title & Claim Identifiers */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b-2 border-[#151513] pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs uppercase tracking-wider text-[#B3261E] font-bold">
                GATE 1 · ADJUDICATION REVIEW CONSOLE
              </span>
              <Stamp variant="partial" text={claimData.status.toUpperCase()} />
            </div>
            <h1 className="font-serif font-black text-3xl md:text-4xl text-[#151513]">
              Health Claim · {claimData.patient_name}
            </h1>
            <p className="font-mono text-xs text-[#5C5A54] mt-1">
              Ref: {claimId} · Admitted {claimData.admitted_on} · Discharged {claimData.discharged_on} · Policy {claimData.policy_id}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href={`/app/claims/${claimId}/appeal`}
              className="px-4 py-2 bg-[#FBF9F4] text-[#B3261E] font-mono text-xs uppercase font-bold border-2 border-[#151513] shadow-[3px_3px_0_#151513] hover:bg-[#E9E4D8] transition-all"
            >
              Draft Appeal Letter
            </Link>
            <Link
              href={`/app/claims/${claimId}/pack`}
              className="px-5 py-2 bg-[#B3261E] text-[#FBF9F4] font-mono text-xs uppercase font-bold border-2 border-[#151513] shadow-[3px_3px_0_#151513] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[1px_1px_0_#151513] transition-all flex items-center gap-1.5"
            >
              <span>Approve & Sign Pack (Gate 2)</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* 3-Column Layout: Left (Docs) | Centre (Receipt & Sim) | Right (Margin & Checklist) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Documents Tray (3 cols) */}
          <div className="lg:col-span-3 space-y-6">
            <DocTray documents={claimData.documents || []} />
            <ChecklistPanel checklist={claimData.checklist || []} />
          </div>

          {/* Centre Column: Giant Payout, Receipt & Simulators (6 cols) */}
          <div className="lg:col-span-6 space-y-6">
            {/* Giant Payout Block */}
            <div className="bg-[#FBF9F4] border-2 border-[#151513] p-6 shadow-[4px_4px_0_#151513] space-y-4">
              <div className="flex items-baseline justify-between border-b border-[#D8D1C2] pb-3">
                <div>
                  <span className="font-mono text-xs uppercase tracking-wider text-[#5C5A54] block font-bold">
                    YOU SHOULD GET · कुल भुगतान योग्य
                  </span>
                  <MoneyFigure amount={claimData.total_payable} size="xl" />
                </div>
                <div className="text-right">
                  <span className="font-mono text-xs text-[#5C5A54] uppercase block">Total Billed</span>
                  <span className="font-mono text-lg font-bold text-[#151513]">
                    {formatINR(claimData.total_billed)}
                  </span>
                </div>
              </div>

              {/* Stacked Payout Bar */}
              <PayoutBar
                billed={claimData.total_billed}
                payable={claimData.total_payable}
                deducted={claimData.total_deducted}
                uncertain={claimData.total_uncertain}
              />
            </div>

            {/* Receipt Ledger Table */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs uppercase tracking-wider text-[#5C5A54] font-bold">
                  ITEMISED ADJUDICATION LEDGER ({claimData.lines.length} ITEMS)
                </span>
                {/* Filter chips */}
                <div className="flex gap-1.5 text-[11px] font-mono">
                  {(["all", "deducted", "partial", "payable"] as const).map((f) => (
                    <button
                      key={f}
                      onClick={() => setReceiptFilter(f)}
                      className={`px-2 py-0.5 rounded-xs border uppercase ${
                        receiptFilter === f
                          ? "bg-[#151513] text-[#FBF9F4] border-[#151513]"
                          : "bg-[#FBF9F4] text-[#5C5A54] border-[#D8D1C2] hover:bg-[#E9E4D8]"
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              <Receipt
                lines={claimData.lines}
                selectedLineId={selectedLine?.line_id}
                onSelectLine={(l) => setSelectedLine(l)}
                filter={receiptFilter}
              />
            </div>

            {/* Interactive Simulation Switcher */}
            <div className="space-y-3 pt-2">
              <div className="flex border-b border-[#151513] gap-2">
                <button
                  onClick={() => setActiveSimTab("room_rent")}
                  className={`px-3 py-1.5 font-mono text-xs uppercase font-bold tracking-wider rounded-t-xs border-t border-x ${
                    activeSimTab === "room_rent"
                      ? "bg-[#FBF9F4] border-[#151513] text-[#B3261E] -mb-px"
                      : "bg-[#E9E4D8]/50 text-[#5C5A54] border-transparent"
                  }`}
                >
                  Room Rent What-If Slider
                </button>
                <button
                  onClick={() => setActiveSimTab("motor_ncb")}
                  className={`px-3 py-1.5 font-mono text-xs uppercase font-bold tracking-wider rounded-t-xs border-t border-x ${
                    activeSimTab === "motor_ncb"
                      ? "bg-[#FBF9F4] border-[#151513] text-[#B3261E] -mb-px"
                      : "bg-[#E9E4D8]/50 text-[#5C5A54] border-transparent"
                  }`}
                >
                  Motor NCB Balance Scale
                </button>
              </div>

              {activeSimTab === "room_rent" ? (
                <RulerSlider onRentChange={handleSimRentChange} currentRent={8000} capLimit={5000} />
              ) : (
                <BalanceScale
                  estimateAmount={motorData?.estimate_amount}
                  netClaimPayable={motorData?.net_claim_payable}
                  ncbLoss3Years={motorData?.ncb_loss_3_years}
                  shouldClaim={motorData?.should_claim}
                  recommendation={motorData?.recommendation_text}
                  calcTable={motorData?.calc_table}
                />
              )}
            </div>
          </div>

          {/* Right Column: Selected Line Review & Margin Notes (3 cols) */}
          <div className="lg:col-span-3 space-y-6">
            {/* Review Panel for Selected Item */}
            {selectedLine ? (
              <ReviewPanel
                line={selectedLine}
                onClose={() => setSelectedLine(null)}
                onOverride={handleLineOverride}
              />
            ) : (
              <div className="bg-[#FBF9F4] border border-[#D8D1C2] p-4 text-center text-xs font-mono text-[#5C5A54]">
                Click any line item on the receipt to inspect policy clause citations and calculation logic.
              </div>
            )}

            {/* "You Might Have Missed" Feature Box */}
            <div className="bg-[#1E6B45]/10 border-2 border-[#1E6B45] p-4 shadow-[2px_2px_0_#1E6B45] space-y-2">
              <div className="flex items-center gap-1.5 text-[#1E6B45] font-mono font-bold text-xs uppercase">
                <CheckCircle2 className="w-4 h-4" />
                <span>UNLOCKED PRE/POST BENEFITS</span>
              </div>
              <p className="font-serif text-lg font-bold text-[#151513]">
                You recovered +₹12,400 you might have missed!
              </p>
              <p className="font-sans text-xs text-[#5C5A54] leading-relaxed">
                Pre-hospital MRI Scan (₹8,400) and post-discharge consultations (₹4,000) are fully covered under Clause 4.3.
              </p>
            </div>

            {/* Deadlines Box */}
            <div className="bg-[#FBF9F4] border border-[#151513] p-4 shadow-[3px_3px_0_#151513] space-y-2">
              <span className="font-mono text-xs uppercase text-[#5C5A54] font-bold block">
                STATUTORY CLAIM DEADLINES
              </span>
              <div className="space-y-2 text-xs font-mono">
                {claimData.deadlines?.map((dl: any) => (
                  <div key={dl.id} className="p-2 bg-[#F3EFE6] border border-[#D8D1C2] flex justify-between items-center">
                    <div>
                      <span className="font-bold text-[#151513] block">{dl.label}</span>
                      <span className="text-[#5C5A54] text-[10px]">{dl.due}</span>
                    </div>
                    <span className="font-bold text-[#B3261E]">{dl.urgency}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Live Monospace Ticker Tape at Bottom */}
      <AgentTicker claimId={claimId} />

      <AskDrawer
        isOpen={isAskOpen}
        onClose={() => setIsAskOpen(false)}
        lang={lang}
      />
    </div>
  );
}
