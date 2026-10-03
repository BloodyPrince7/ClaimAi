"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/brand/Header";
import { Seal } from "@/components/voice/Seal";
import { AskDrawer } from "@/components/ask/AskDrawer";
import { Stamp } from "@/components/ledger/Stamp";
import { api } from "@/lib/api";
import { formatINR } from "@/lib/formatINR";
import { ArrowRight, Edit3, Check, AlertCircle } from "lucide-react";

export default function IncidentPage() {
  const router = useRouter();
  const [lang, setLang] = useState("hi-IN");
  const [isAskOpen, setIsAskOpen] = useState(false);
  const [transcript, setTranscript] = useState("पापा का accident हुआ, 3 दिन hospital में थे");
  const [isEditingTranscript, setIsEditingTranscript] = useState(false);
  const [isTranscriptConfirmed, setIsTranscriptConfirmed] = useState(false);
  const [selectedPolicies, setSelectedPolicies] = useState<string[]>(["POL-HEALTH-001", "POL-MOTOR-002"]);
  const [isTriaging, setIsTriaging] = useState(false);
  const [triageResults, setTriageResults] = useState<any[]>([]);

  const handleVoiceComplete = async (text: string) => {
    setTranscript(text);
    setIsTriaging(true);
    try {
      const res = await api.triageIncident(text, lang);
      setTriageResults(res.matching_policies || []);
      setIsTranscriptConfirmed(true);
    } finally {
      setIsTriaging(false);
    }
  };

  const handleConfirmTranscript = async () => {
    setIsTriaging(true);
    try {
      const res = await api.triageIncident(transcript, lang);
      setTriageResults(res.matching_policies || []);
      setIsTranscriptConfirmed(true);
    } finally {
      setIsTriaging(false);
    }
  };

  const togglePolicy = (policyId: string) => {
    setSelectedPolicies((prev) =>
      prev.includes(policyId) ? prev.filter((p) => p !== policyId) : [...prev, policyId]
    );
  };

  const handleStartClaims = () => {
    router.push("/app/claims/CLM-HEALTH-001");
  };

  return (
    <div className="min-h-screen bg-[#F3EFE6] flex flex-col justify-between">
      <Header
        lang={lang}
        onSelectLang={setLang}
        onOpenAskDrawer={() => setIsAskOpen(true)}
      />

      <main className="max-w-4xl mx-auto w-full px-6 py-8 flex-1 space-y-8">
        {/* Header */}
        <div className="text-center space-y-2 border-b border-[#D8D1C2] pb-6">
          <span className="font-mono text-xs uppercase tracking-wider text-[#B3261E] font-bold">
            GATE 0 · INCIDENT INTAKE & TRIAGE
          </span>
          <h1 className="font-serif font-black text-3xl md:text-5xl text-[#151513]">
            What happened?
          </h1>
          <p className="font-serif text-lg text-[#5C5A54]">
            Speak in any Indian language, or type below.
          </p>
        </div>

        {/* The Seal Voice Intake */}
        <div className="bg-[#FBF9F4] border-2 border-[#151513] shadow-[4px_4px_0_#151513] p-6 flex flex-col items-center">
          <Seal onRecordingComplete={handleVoiceComplete} isProcessing={isTriaging} />

          {/* Transcript Box - A Human Gate */}
          <div className="w-full max-w-xl mt-6 p-4 bg-[#F3EFE6] border border-[#D8D1C2] rounded-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] uppercase text-[#5C5A54] font-bold">
                TRANSCRIPT (SAARAS V4 · HINGLISH)
              </span>
              <button
                onClick={() => setIsEditingTranscript(!isEditingTranscript)}
                className="font-mono text-[11px] text-[#B3261E] hover:underline flex items-center gap-1"
              >
                <Edit3 className="w-3 h-3" />
                <span>{isEditingTranscript ? "Done" : "Edit"}</span>
              </button>
            </div>

            {isEditingTranscript ? (
              <textarea
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
                className="w-full text-sm p-2 bg-[#FBF9F4] border border-[#151513] font-sans h-20 outline-none"
              />
            ) : (
              <p className="font-serif font-bold text-lg text-[#151513]">
                &ldquo;{transcript}&rdquo;
              </p>
            )}

            {!isTranscriptConfirmed && (
              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  onClick={handleConfirmTranscript}
                  disabled={isTriaging}
                  className="px-4 py-2 bg-[#151513] text-[#FBF9F4] font-mono text-xs uppercase font-bold tracking-wider hover:bg-[#2C2B27] flex items-center gap-1.5 shadow-[2px_2px_0_#B3261E]"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Yes, This is correct → Find Policies</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Triage Results Slips */}
        {(isTranscriptConfirmed || triageResults.length > 0) && (
          <div className="space-y-4 animate-in fade-in duration-300">
            <div className="flex items-center justify-between border-b-2 border-[#151513] pb-2">
              <span className="font-mono text-xs uppercase text-[#5C5A54] font-bold">
                TRIAGE RESULTS · 3 POLICIES MAY PAY
              </span>
              <span className="font-mono text-xs text-[#1E6B45] font-bold">
                Gate 0: Confirm claims to initiate
              </span>
            </div>

            <div className="space-y-3">
              {/* Slip 1: Health */}
              <div
                onClick={() => togglePolicy("POL-HEALTH-001")}
                className={`p-4 border-2 rounded-xs cursor-pointer transition-all flex items-start justify-between ${
                  selectedPolicies.includes("POL-HEALTH-001")
                    ? "bg-[#FBF9F4] border-[#151513] shadow-[4px_4px_0_#1E6B45]"
                    : "bg-[#F3EFE6] border-[#D8D1C2] opacity-75"
                }`}
              >
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={selectedPolicies.includes("POL-HEALTH-001")}
                    readOnly
                    className="mt-1 accent-[#1E6B45] w-4 h-4"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-[#1E6B45] uppercase">
                        Health Insurance
                      </span>
                      <span className="text-xs text-[#5C5A54]">· Star Health Optima</span>
                    </div>
                    <h4 className="font-serif font-black text-lg text-[#151513]">
                      Inpatient Hospitalisation & Surgery
                    </h4>
                    <p className="font-sans text-xs text-[#5C5A54] mt-1">
                      Covers hospital stay, doctor consultations, OT and pre/post-admission expenses.
                    </p>
                  </div>
                </div>

                <div className="text-right flex flex-col items-end">
                  <span className="font-mono text-xs text-[#5C5A54] uppercase">Est. Payout</span>
                  <span className="font-serif font-black text-xl text-[#1E6B45]">
                    ₹1,00,525
                  </span>
                  <Stamp variant="payable" text="15 DAYS DEADLINE" className="mt-1" />
                </div>
              </div>

              {/* Slip 2: Motor Personal Accident */}
              <div
                onClick={() => togglePolicy("POL-MOTOR-002")}
                className={`p-4 border-2 rounded-xs cursor-pointer transition-all flex items-start justify-between ${
                  selectedPolicies.includes("POL-MOTOR-002")
                    ? "bg-[#FBF9F4] border-[#151513] shadow-[4px_4px_0_#1E6B45]"
                    : "bg-[#F3EFE6] border-[#D8D1C2] opacity-75"
                }`}
              >
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={selectedPolicies.includes("POL-MOTOR-002")}
                    readOnly
                    className="mt-1 accent-[#1E6B45] w-4 h-4"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-[#151513] uppercase">
                        Motor Policy Add-on
                      </span>
                      <span className="text-xs text-[#5C5A54]">· HDFC ERGO</span>
                    </div>
                    <h4 className="font-serif font-black text-lg text-[#151513]">
                      Personal Accident Bodily Injury Cover
                    </h4>
                    <p className="font-sans text-xs text-[#5C5A54] mt-1">
                      Covers trauma allowance and hospital cash compensation for vehicular accident.
                    </p>
                  </div>
                </div>

                <div className="text-right flex flex-col items-end">
                  <span className="font-mono text-xs text-[#5C5A54] uppercase">Est. Payout</span>
                  <span className="font-serif font-black text-xl text-[#151513]">
                    ₹25,000
                  </span>
                  <Stamp variant="deducted" text="48 HRS URGENT" className="mt-1" />
                </div>
              </div>

              {/* Slip 3: Hidden Credit Card Cover */}
              <div
                onClick={() => togglePolicy("POL-CARD-003")}
                className={`p-4 border-2 rounded-xs cursor-pointer transition-all flex items-start justify-between ${
                  selectedPolicies.includes("POL-CARD-003")
                    ? "bg-[#FBF9F4] border-[#151513] shadow-[4px_4px_0_#1E6B45]"
                    : "bg-[#F3EFE6] border-[#D8D1C2] opacity-75"
                }`}
              >
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={selectedPolicies.includes("POL-CARD-003")}
                    readOnly
                    className="mt-1 accent-[#1E6B45] w-4 h-4"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-[#C98A0B] uppercase">
                        Hidden Credit Card Benefit
                      </span>
                      <span className="text-xs text-[#5C5A54]">· HDFC Regalia</span>
                    </div>
                    <h4 className="font-serif font-black text-lg text-[#151513]">
                      Complimentary Emergency Medical Cover
                    </h4>
                    <p className="font-sans text-xs text-[#5C5A54] mt-1">
                      Included with premium credit card: up to ₹50,000 emergency trauma hospitalisation.
                    </p>
                  </div>
                </div>

                <div className="text-right flex flex-col items-end">
                  <span className="font-mono text-xs text-[#5C5A54] uppercase">Est. Payout</span>
                  <span className="font-serif font-black text-xl text-[#C98A0B]">
                    ₹50,000
                  </span>
                  <Stamp variant="needs-you" text="OPTIONAL COVER" className="mt-1" />
                </div>
              </div>
            </div>

            {/* Launch Claim Workspace CTA */}
            <div className="pt-6 flex justify-end">
              <button
                onClick={handleStartClaims}
                disabled={selectedPolicies.length === 0}
                className="px-7 py-3.5 bg-[#B3261E] text-[#FBF9F4] font-mono font-bold text-sm uppercase tracking-wider border-2 border-[#151513] shadow-[4px_4px_0_#151513] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0_#151513] transition-all flex items-center gap-2 disabled:opacity-50"
              >
                <span>Initiate {selectedPolicies.length} Claim(s) →</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </main>

      <footer className="w-full border-t border-[#D8D1C2] bg-[#FBF9F4] py-4 text-center text-xs font-mono text-[#5C5A54]">
        ClaimMate Incident Triage · Multi-Claim Resolution Engine
      </footer>

      <AskDrawer
        isOpen={isAskOpen}
        onClose={() => setIsAskOpen(false)}
        lang={lang}
      />
    </div>
  );
}
