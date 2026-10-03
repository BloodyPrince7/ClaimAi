"use client";
import React, { useState } from "react";
import { Volume2, Loader2, Square } from "lucide-react";

export function ListenButton({
  text,
  lang = "hi-IN",
  label = "Listen in Hindi"
}: {
  text: string;
  lang?: string;
  label?: string;
}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handlePlay = () => {
    if (isPlaying) {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      setIsPlaying(false);
      return;
    }

    if ('speechSynthesis' in window) {
      setIsLoading(true);
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang.startsWith("hi") ? "hi-IN" : "en-IN";
      utterance.onstart = () => {
        setIsLoading(false);
        setIsPlaying(true);
      };
      utterance.onend = () => {
        setIsPlaying(false);
      };
      utterance.onerror = () => {
        setIsLoading(false);
        setIsPlaying(false);
      };
      window.speechSynthesis.speak(utterance);
    } else {
      alert("Audio speech synthesis is not supported on this browser.");
    }
  };

  return (
    <button
      onClick={handlePlay}
      className={`inline-flex items-center gap-2 px-3 py-1.5 border border-[#151513] rounded-xs font-mono text-xs tracking-wide transition-all shadow-[2px_2px_0_#151513] ${
        isPlaying
          ? "bg-[#B3261E] text-[#FBF9F4]"
          : "bg-[#FBF9F4] text-[#151513] hover:bg-[#E9E4D8]"
      }`}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : isPlaying ? (
        <Square className="w-4 h-4 fill-current" />
      ) : (
        <Volume2 className="w-4 h-4 text-[#B3261E]" />
      )}
      <span>{isPlaying ? "STOP" : label}</span>
    </button>
  );
}
