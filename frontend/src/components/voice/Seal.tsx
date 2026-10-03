"use client";
import React, { useState, useEffect, useRef } from "react";
import { Mic, Square } from "lucide-react";

export function Seal({
  onRecordingComplete,
  isProcessing = false
}: {
  onRecordingComplete: (text: string) => void;
  isProcessing?: boolean;
}) {
  const [isRecording, setIsRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Animate live ink waveform on canvas
  useEffect(() => {
    let animId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let step = 0;
    const drawWave = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.beginPath();
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = "#151513";

      const width = canvas.width;
      const height = canvas.height;
      const mid = height / 2;

      ctx.moveTo(0, mid);
      for (let x = 0; x < width; x++) {
        const amplitude = isRecording ? 10 * Math.sin(x * 0.08 + step) * Math.cos(step * 0.5) : 1;
        ctx.lineTo(x, mid + amplitude);
      }
      ctx.stroke();

      step += 0.08;
      animId = requestAnimationFrame(drawWave);
    };

    drawWave();
    return () => cancelAnimationFrame(animId);
  }, [isRecording]);

  const toggleRecord = () => {
    if (!isRecording) {
      setIsRecording(true);
      setSeconds(0);
      timerRef.current = setInterval(() => {
        setSeconds((s) => {
          if (s >= 29) {
            stopRecord();
            return 30;
          }
          return s + 1;
        });
      }, 1000);
    } else {
      stopRecord();
    }
  };

  const stopRecord = () => {
    setIsRecording(false);
    if (timerRef.current) clearInterval(timerRef.current);
    // Transcribe simulated or real
    setTimeout(() => {
      onRecordingComplete("पापा का accident हुआ, 3 दिन hospital में थे");
    }, 400);
  };

  const progressPercent = (seconds / 30) * 100;

  return (
    <div className="flex flex-col items-center justify-center p-4">
      {/* The Wax Seal Button */}
      <div className="relative w-32 h-32 flex items-center justify-center">
        {/* 30-second Timer Ring */}
        <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none" viewBox="0 0 120 120">
          <circle
            cx="60"
            cy="60"
            r="54"
            className="stroke-[#D8D1C2]"
            strokeWidth="2"
            fill="transparent"
          />
          <circle
            cx="60"
            cy="60"
            r="54"
            className="stroke-[#B3261E] transition-all duration-300"
            strokeWidth="3"
            strokeDasharray="339.29"
            strokeDashoffset={339.29 - (progressPercent / 100) * 339.29}
            strokeLinecap="round"
            fill="transparent"
          />
        </svg>

        {/* Seal Button */}
        <button
          onClick={toggleRecord}
          disabled={isProcessing}
          className={`w-24 h-24 rounded-full border-2 border-[#151513] flex flex-col items-center justify-center transition-all ${
            isRecording
              ? "bg-[#B3261E] text-[#FBF9F4] scale-95 shadow-[inset_0_2px_4px_rgba(0,0,0,0.4)]"
              : "bg-[#FBF9F4] text-[#151513] hover:bg-[#E9E4D8] shadow-[3px_3px_0_#151513] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[1px_1px_0_#151513]"
          }`}
        >
          {isRecording ? (
            <Square className="w-8 h-8 fill-current" />
          ) : (
            <Mic className="w-8 h-8" />
          )}
          <span className="text-[10px] font-mono tracking-widest uppercase mt-1">
            {isRecording ? "TAP STOP" : "HOLD SEAL"}
          </span>
        </button>
      </div>

      {/* Live Waveform Canvas */}
      <div className="w-64 h-8 mt-3 flex items-center justify-center border-b border-[#D8D1C2]">
        <canvas ref={canvasRef} width={240} height={32} className="w-full h-full" />
      </div>

      {/* Timer text */}
      <div className="font-mono text-xs text-[#5C5A54] mt-2">
        {isRecording ? (
          <span className="text-[#B3261E] font-bold">
            REC 00:{seconds < 10 ? `0${seconds}` : seconds} / 00:30
          </span>
        ) : isProcessing ? (
          <span className="animate-pulse">Transcribing via Saaras v4...</span>
        ) : (
          "Tap to speak in any Indian language"
        )}
      </div>
    </div>
  );
}
