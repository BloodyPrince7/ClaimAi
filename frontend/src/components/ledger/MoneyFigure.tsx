import React from "react";
import { formatINR } from "@/lib/formatINR";

export function MoneyFigure({
  amount,
  size = "md",
  className = "",
  showDecimals = false,
  signColor = false
}: {
  amount: number;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  showDecimals?: boolean;
  signColor?: boolean;
}) {
  const formatted = formatINR(amount, showDecimals);

  let sizeClass = "text-xl";
  if (size === "sm") sizeClass = "text-base font-semibold";
  if (size === "md") sizeClass = "text-2xl font-bold";
  if (size === "lg") sizeClass = "text-4xl font-extrabold tracking-tight";
  if (size === "xl") sizeClass = "text-5xl md:text-6xl font-black tracking-tight";

  const colorClass = signColor 
    ? (amount > 0 ? "text-[#1E6B45]" : amount < 0 ? "text-[#B3261E]" : "text-[#151513]") 
    : "text-[#151513]";

  return (
    <span className={`font-serif tabular-nums ${sizeClass} ${colorClass} ${className}`}>
      {formatted}
    </span>
  );
}
