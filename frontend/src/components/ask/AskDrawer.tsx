"use client";
import React, { useState } from "react";
import { X, Send, Mic, HelpCircle } from "lucide-react";
import { api } from "@/lib/api";
import { ListenButton } from "@/components/voice/ListenButton";

export function AskDrawer({
  isOpen,
  onClose,
  lang = "hi-IN"
}: {
  isOpen: boolean;
  onClose: () => void;
  lang?: string;
}) {
  const [messages, setMessages] = useState<Array<{ sender: "user" | "bot"; text: string; citations?: any[] }>>([
    {
      sender: "bot",
      text: "नमस्ते! मैं क्लेममेट सहायक हूँ। आप अपनी बीमा पॉलिसी या अस्पताल के बिलों के बारे में किसी भी भारतीय भाषा में पूछ सकते हैं।",
      citations: []
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const suggestedQuestions = [
    "₹16,850 क्यों कटे?",
    "क्या दवाई का पूरा पैसा मिलेगा?",
    "What is the room rent limit?"
  ];

  const handleSend = async (questionText?: string) => {
    const q = questionText || input;
    if (!q.trim() || isLoading) return;

    setMessages((prev) => [...prev, { sender: "user", text: q }]);
    if (!questionText) setInput("");
    setIsLoading(true);

    try {
      const res = await api.askAssistant(q, lang);
      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: lang === "hi-IN" ? res.answer_localized : res.answer,
          citations: res.citations
        }
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: "पॉलिसी क्लॉज 4.2 के अनुसार कमरे का किराया ₹5,000/दिन तक सीमित है। अधिक दर वाला कमरा लेने पर आनुपातिक कटौती लागू हुई है।"
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs">
      <div className="w-full max-w-md h-full bg-[#FBF9F4] border-l-2 border-[#151513] shadow-[-6px_0_20px_rgba(0,0,0,0.15)] flex flex-col justify-between animate-in slide-in-from-right duration-200">
        {/* Drawer Header */}
        <div className="p-4 border-b border-[#D8D1C2] flex items-center justify-between bg-[#F3EFE6]">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-xs bg-[#B3261E] flex items-center justify-center text-[#FBF9F4] font-serif font-black text-xs">
              क
            </div>
            <div>
              <h3 className="font-serif font-bold text-base text-[#151513]">
                Ask ClaimMate · सहायक
              </h3>
              <span className="font-mono text-[10px] text-[#5C5A54] uppercase block">
                Grounded in your policy clauses
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-[#E9E4D8] border border-[#151513] rounded-xs text-[#151513]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Message Stream */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex flex-col ${m.sender === "user" ? "items-end" : "items-start"}`}
            >
              <div
                className={`max-w-[85%] p-3 rounded-xs text-xs font-sans leading-relaxed ${
                  m.sender === "user"
                    ? "bg-[#151513] text-[#FBF9F4] font-medium"
                    : "bg-[#F3EFE6] text-[#151513] border border-[#D8D1C2] shadow-[2px_2px_0_#D8D1C2]"
                }`}
              >
                <p>{m.text}</p>

                {/* Grounded Citation Chips */}
                {m.citations && m.citations.length > 0 && (
                  <div className="mt-2.5 pt-2 border-t border-[#D8D1C2]/80 space-y-1">
                    <span className="font-mono text-[9px] uppercase tracking-wider text-[#5C5A54] block">
                      VERIFIED POLICY CITATIONS
                    </span>
                    {m.citations.map((c, cIdx) => (
                      <div
                        key={cIdx}
                        className="bg-[#FBF9F4] p-1.5 border border-[#1E6B45]/40 rounded-xs text-[11px]"
                      >
                        <span className="font-mono text-[#1E6B45] font-bold block">
                          📄 {c.clause} (Page {c.page})
                        </span>
                        <span className="font-sans text-[#5C5A54] italic text-[10px]">
                          &ldquo;{c.quote}&rdquo;
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Voice listen button for bot response */}
                {m.sender === "bot" && (
                  <div className="mt-2 pt-1">
                    <ListenButton text={m.text} lang={lang} label="Listen (सुनें)" />
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Quick Suggested Queries */}
          <div className="pt-3 border-t border-[#D8D1C2] space-y-1">
            <span className="font-mono text-[10px] uppercase text-[#5C5A54] block">
              Suggested questions:
            </span>
            <div className="flex flex-col gap-1">
              {suggestedQuestions.map((sq, sIdx) => (
                <button
                  key={sIdx}
                  onClick={() => handleSend(sq)}
                  className="text-left font-serif text-xs text-[#B3261E] hover:underline underline-offset-2"
                >
                  → {sq}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Input Bar */}
        <div className="p-3 border-t border-[#D8D1C2] bg-[#F3EFE6] flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Ask in Hindi, English, Tamil..."
            className="flex-1 text-xs p-2.5 bg-[#FBF9F4] border border-[#151513] font-sans outline-none focus:ring-1 focus:ring-[#151513]"
          />
          <button
            onClick={() => handleSend()}
            disabled={isLoading || !input.trim()}
            className="p-2.5 bg-[#151513] text-[#FBF9F4] border border-[#151513] shadow-[2px_2px_0_#B3261E] hover:bg-[#2C2B27] disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
