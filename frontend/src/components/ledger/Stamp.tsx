import React from "react";

export type StampVariant = "payable" | "partial" | "deducted" | "needs-you" | "missing" | "approved" | "uncertain";

export function Stamp({ variant, text, className = "" }: { variant: StampVariant; text?: string; className?: string }) {
  let styleClass = "stamp-payable";
  let label = text || "PAYABLE";

  switch (variant) {
    case "payable":
      styleClass = "stamp-payable";
      label = text || "PAYABLE";
      break;
    case "partial":
      styleClass = "stamp-partial";
      label = text || "PARTIAL";
      break;
    case "deducted":
      styleClass = "stamp-deducted";
      label = text || "DEDUCTED";
      break;
    case "uncertain":
    case "needs-you":
      styleClass = "stamp-needs-you";
      label = text || "NEEDS YOU";
      break;
    case "missing":
      styleClass = "stamp-deducted";
      label = text || "MISSING";
      break;
    case "approved":
      styleClass = "stamp-approved";
      label = text || "APPROVED BY YOU";
      break;
  }

  return (
    <span className={`rubber-stamp ${styleClass} text-[10px] tracking-wider font-mono uppercase ${className}`}>
      {label}
    </span>
  );
}
