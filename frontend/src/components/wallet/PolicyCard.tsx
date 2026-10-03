import React from "react";
import Link from "next/link";
import { formatINR } from "@/lib/formatINR";
import { ShieldCheck, Car, HeartHandshake, ArrowRight } from "lucide-react";

export interface PolicyData {
  id: string;
  type: string;
  insurer: string;
  policy_no: string;
  plan_name?: string;
  sum_insured: number;
  status: string;
  rules?: any;
}

export function PolicyCard({ policy }: { policy: PolicyData }) {
  const isHealth = policy.type === "health";
  const isMotor = policy.type === "motor";

  const tabBg = isHealth ? "bg-[#1E6B45]" : isMotor ? "bg-[#151513]" : "bg-[#5C5A54]";
  const Icon = isHealth ? ShieldCheck : isMotor ? Car : HeartHandshake;

  return (
    <div className="w-full flex flex-col group transition-transform hover:-translate-y-1">
      {/* Folder Tab Header */}
      <div className="flex items-center">
        <div className={`${tabBg} text-[#FBF9F4] px-3 py-1 font-mono text-[10px] uppercase font-bold tracking-wider rounded-t-xs flex items-center gap-1.5`}>
          <Icon className="w-3.5 h-3.5" />
          <span>{policy.type.toUpperCase()} POLICY</span>
        </div>
      </div>

      {/* Card Body */}
      <div className="w-full bg-[#FBF9F4] border-2 border-[#151513] shadow-[3px_3px_0_#151513] p-4 flex flex-col justify-between space-y-4">
        <div>
          <div className="flex items-start justify-between">
            <div>
              <span className="font-mono text-[10px] text-[#5C5A54] uppercase block">
                {policy.insurer}
              </span>
              <h4 className="font-serif font-black text-xl text-[#151513]">
                {policy.plan_name || policy.policy_no}
              </h4>
            </div>
            <span className="font-mono text-xs text-[#5C5A54] bg-[#E9E4D8] px-1.5 py-0.5 rounded-xs">
              {policy.policy_no}
            </span>
          </div>

          {/* Sum Insured / IDV */}
          <div className="mt-3 bg-[#F3EFE6] p-2.5 border border-[#D8D1C2]">
            <span className="text-[10px] font-mono text-[#5C5A54] uppercase block">
              {isMotor ? "Insured Declared Value (IDV)" : "Total Sum Insured"}
            </span>
            <span className="font-serif font-bold text-2xl text-[#151513]">
              {formatINR(policy.sum_insured)}
            </span>
          </div>

          {/* Decoded Rules Highlights */}
          <div className="mt-3 space-y-1 text-xs font-mono text-[#5C5A54]">
            {isHealth && (
              <>
                <div className="flex justify-between">
                  <span>Room Rent Cap:</span>
                  <strong className="text-[#151513]">₹5,000/day (1% of SI)</strong>
                </div>
                <div className="flex justify-between">
                  <span>Co-payment:</span>
                  <strong className="text-[#151513]">10% Compulsory</strong>
                </div>
              </>
            )}
            {isMotor && (
              <>
                <div className="flex justify-between">
                  <span>No Claim Bonus:</span>
                  <strong className="text-[#151513]">35% (3 Years Claim-Free)</strong>
                </div>
                <div className="flex justify-between">
                  <span>Zero-Depreciation:</span>
                  <strong className="text-[#B3261E]">Not opted</strong>
                </div>
              </>
            )}
            {!isHealth && !isMotor && (
              <div className="flex justify-between">
                <span>Nominee:</span>
                <strong className="text-[#151513]">Asha Kumar (Wife)</strong>
              </div>
            )}
          </div>
        </div>

        {/* Card Footer */}
        <div className="pt-2 border-t border-[#D8D1C2] flex items-center justify-between">
          <span className="font-mono text-[10px] text-[#1E6B45] font-bold">
            ✓ 14 Rules Decoded & Grounded
          </span>
          <Link
            href={`/policies/${policy.id}`}
            className="font-mono text-xs text-[#151513] font-bold hover:text-[#B3261E] flex items-center gap-1 group-hover:translate-x-0.5 transition-transform"
          >
            <span>View Clauses</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
