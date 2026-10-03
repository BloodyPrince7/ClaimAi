"use client";
import React, { useState } from "react";
import { formatINR } from "@/lib/formatINR";

export function RulerSlider({
  onRentChange,
  currentRent = 8000,
  capLimit = 5000
}: {
  onRentChange: (rent: number) => void;
  currentRent?: number;
  capLimit?: number;
}) {
  const [rent, setRent] = useState(currentRent);

  const handleChange = (newVal: number) => {
    setRent(newVal);
    onRentChange(newVal);
  };

  const roomCategories = [
    { name: "Twin Sharing", rent: 4000 },
    { name: "Single Private", rent: 5000 },
    { name: "Deluxe Room", rent: 8000 },
    { name: "Super Deluxe / Suite", rent: 12000 }
  ];

  return (
    <div className="w-full bg-[#FBF9F4] border border-[#151513] shadow-[3px_3px_0_#151513] p-4 space-y-4">
      <div className="flex items-center justify-between border-b border-[#D8D1C2] pb-2">
        <span className="font-mono text-xs uppercase tracking-wider text-[#5C5A54] font-bold">
          WHAT-IF SIMULATION · ROOM RENT RULER
        </span>
        <span className="font-mono text-xs text-[#1E6B45] font-bold">
          Policy Cap: {formatINR(capLimit)}/day
        </span>
      </div>

      {/* Numerical readout */}
      <div className="flex items-baseline justify-between">
        <div>
          <span className="text-xs font-mono text-[#5C5A54] block">SIMULATED ROOM TARIFF</span>
          <span className="font-serif font-black text-3xl text-[#151513]">
            {formatINR(rent)}
            <span className="text-sm font-mono font-normal text-[#5C5A54]"> / day</span>
          </span>
        </div>
        <div className="text-right">
          <span className="text-xs font-mono text-[#5C5A54] block">ELIGIBILITY RATIO</span>
          <span className={`font-mono font-bold text-lg ${rent <= capLimit ? "text-[#1E6B45]" : "text-[#B3261E]"}`}>
            {rent <= capLimit ? "100% (No cut)" : `${((capLimit / rent) * 100).toFixed(1)}%`}
          </span>
        </div>
      </div>

      {/* Slider */}
      <div className="space-y-1">
        <input
          type="range"
          min="2000"
          max="14000"
          step="500"
          value={rent}
          onChange={(e) => handleChange(Number(e.target.value))}
          className="w-full accent-[#B3261E] cursor-ew-resize"
        />
        {/* Ruler tick marks */}
        <div className="flex justify-between text-[10px] font-mono text-[#5C5A54] pt-1">
          <span>₹2k</span>
          <span>₹4k</span>
          <span className="text-[#1E6B45] font-bold">▲ ₹5k (Limit)</span>
          <span>₹8k</span>
          <span>₹11k</span>
          <span>₹14k</span>
        </div>
      </div>

      {/* Preset Room Category Buttons */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 pt-1">
        {roomCategories.map((cat) => (
          <button
            key={cat.name}
            onClick={() => handleChange(cat.rent)}
            className={`py-1.5 px-2 border border-[#151513] rounded-xs font-mono text-[11px] text-center transition-all ${
              rent === cat.rent
                ? "bg-[#151513] text-[#FBF9F4] font-bold shadow-[2px_2px_0_#B3261E]"
                : "bg-[#F3EFE6] text-[#151513] hover:bg-[#E9E4D8]"
            }`}
          >
            <div>{cat.name}</div>
            <div className="text-[10px] text-[#5C5A54]">{formatINR(cat.rent)}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
