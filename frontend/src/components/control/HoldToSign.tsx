"use client";
import React, { useState, useRef, useEffect } from "react";
import { Check, Edit3 } from "lucide-react";

export function HoldToSign({
  onSigned,
  label = "Hold to sign & approve (1.2s)",
  signedLabel = "APPROVED BY YOU"
}: {
  onSigned: () => void;
  label?: string;
  signedLabel?: string;
}) {
  const [isHolding, setIsHolding] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isSigned, setIsSigned] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startHold = () => {
    if (isSigned) return;
    setIsHolding(true);
  };

  const endHold = () => {
    if (isSigned) return;
    setIsHolding(false);
    setProgress(0);
  };

  useEffect(() => {
    if (isHolding && !isSigned) {
      const startTime = Date.now();
      const interval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const currentProgress = Math.min(100, (elapsed / 1200) * 100);
        setProgress(currentProgress);

        if (currentProgress >= 100) {
          clearInterval(interval);
          setIsSigned(true);
          setIsHolding(false);
          onSigned();
        }
      }, 30);

      return () => clearInterval(interval);
    }
  }, [isHolding, isSigned, onSigned]);

  return (
    <div className="w-full flex flex-col items-center">
      {isSigned ? (
        <div className="w-full py-3 px-4 bg-[#1E6B45]/10 border-2 border-[#1E6B45] text-[#1E6B45] flex items-center justify-between shadow-[2px_2px_0_#1E6B45]">
          <div className="flex items-center gap-2">
            <Check className="w-5 h-5 stroke-[3]" />
            <span className="font-mono font-bold tracking-wider text-sm">{signedLabel}</span>
          </div>
          <span className="font-mono text-xs text-[#1E6B45]/80">DIGITALLY STAMPED · GATE APPROVED</span>
        </div>
      ) : (
        <div className="w-full relative">
          <button
            onMouseDown={startHold}
            onMouseUp={endHold}
            onMouseLeave={endHold}
            onTouchStart={startHold}
            onTouchEnd={endHold}
            className="w-full relative overflow-hidden py-3 px-4 bg-[#FBF9F4] border-2 border-[#151513] text-[#151513] font-mono text-xs uppercase tracking-wider font-bold shadow-[3px_3px_0_#151513] active:translate-x-0.5 active:translate-y-0.5 select-none cursor-pointer flex items-center justify-center gap-2"
          >
            {/* Ink Progress Bar Fill */}
            <div
              style={{ width: `${progress}%` }}
              className="absolute left-0 top-0 bottom-0 bg-[#B3261E] transition-all duration-75 opacity-90"
            />
            <div className={`relative z-10 flex items-center gap-2 ${progress > 40 ? "text-[#FBF9F4]" : "text-[#151513]"}`}>
              <Edit3 className="w-4 h-4" />
              <span>{isHolding ? `Signing... ${progress.toFixed(0)}%` : label}</span>
            </div>
          </button>
        </div>
      )}
    </div>
  );
}
