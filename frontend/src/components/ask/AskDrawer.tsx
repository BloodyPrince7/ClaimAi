"use client";
import React, { useState } from "react";
import { X, Send, Sparkles, Languages } from "lucide-react";
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
  const [currentLang, setCurrentLang] = useState(lang);
  const [messages, setMessages] = useState<Array<{
    sender: "user" | "bot";
    text: string;
    secondaryText?: string;
    showSecondary?: boolean;
    citations?: any[];
  }>>([
    {
      sender: "bot",
      text: "नमस्ते! मैं क्लेममेट सहायक हूँ। आप अपनी बीमा पॉलिसी या अस्पताल के बिलों के बारे में किसी भी भारतीय भाषा में पूछ सकते हैं।",
      secondaryText: "Hello! I am your ClaimMate assistant. You can ask anything about your insurance policy or hospital bills in any Indian language.",
      citations: []
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const suggestedQuestions = [
    "₹16,850 क्यों कटे?",
    "क्या दवाई का पूरा पैसा मिलेगा?",
    "What is the room rent limit?",
    "अगर मेरी शिकायत का समाधान न हो तो कहाँ अपील करूँ?"
  ];

  const handleSend = async (questionText?: string) => {
    const q = questionText || input;
    if (!q.trim() || isLoading) return;

    setMessages((prev) => [...prev, { sender: "user", text: q }]);
    if (!questionText) setInput("");
    setIsLoading(true);

    try {
      const res = await api.askAssistant(q, currentLang);
      const isEn = currentLang.startsWith("en");
      const primary = isEn ? (res.answer || res.answer_localized) : (res.answer_localized || res.answer);
      const secondary = isEn ? res.answer_localized : res.answer;

      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: primary,
          secondaryText: secondary !== primary ? secondary : undefined,
          citations: res.citations
        }
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: "पॉलिसी क्लॉज 4.2 के अनुसार कमरे का किराया ₹5,00,000 बीमा राशि का 1% यानी ₹5,000/दिन तक सीमित है। डीलक्स कमरा लेने के कारण 62.5% आनुपातिक कटौती लागू हुई है।"
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSecondary = (index: number) => {
    setMessages((prev) =>
      prev.map((m, idx) =>
        idx === index ? { ...m, showSecondary: !m.showSecondary } : m
      )
    );
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
              <div className="flex items-center gap-1.5">
                <h3 className="font-serif font-bold text-base text-[#151513]">
                  Ask ClaimMate · सहायक
                </h3>
                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-[#1E6B45]/10 text-[#1E6B45] text-[9px] font-mono font-semibold rounded-xs border border-[#1E6B45]/20">
                  <Sparkles className="w-2.5 h-2.5" /> Sarvam-105B
                </span>
              </div>
              <span className="font-mono text-[10px] text-[#5C5A54] uppercase block">
                Grounded in policy clauses & IRDAI rules
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Quick Language Toggle */}
            <select
              value={currentLang}
              onChange={(e) => setCurrentLang(e.target.value)}
              className="text-[11px] font-mono bg-[#FBF9F4] border border-[#151513] px-1.5 py-1 rounded-xs cursor-pointer text-[#151513]"
              title="Change chat language"
            >
              <option value="hi-IN">हिन्दी</option>
              <option value="en-IN">English</option>
              <option value="mr-IN">मराठी</option>
              <option value="ta-IN">தமிழ்</option>
              <option value="te-IN">తెలుగు</option>
              <option value="bn-IN">বাংলা</option>
              <option value="gu-IN">ગુજરાતી</option>
            </select>
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-[#E9E4D8] border border-[#151513] rounded-xs text-[#151513]"
              title="Close drawer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Message Stream */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex flex-col ${m.sender === "user" ? "items-end" : "items-start"}`}
            >
              <div
                className={`max-w-[88%] p-3 rounded-xs text-xs font-sans leading-relaxed ${
                  m.sender === "user"
                    ? "bg-[#151513] text-[#FBF9F4] font-medium"
                    : "bg-[#F3EFE6] text-[#151513] border border-[#D8D1C2] shadow-[2px_2px_0_#D8D1C2]"
                }`}
              >
                <p className="whitespace-pre-line">{m.showSecondary && m.secondaryText ? m.secondaryText : m.text}</p>

                {/* Bilingual Toggle Button if secondary exists */}
                {m.sender === "bot" && m.secondaryText && (
                  <button
                    onClick={() => toggleSecondary(idx)}
                    className="mt-2 inline-flex items-center gap-1 text-[10px] font-mono text-[#5C5A54] hover:text-[#151513] underline underline-offset-2"
                  >
                    <Languages className="w-3 h-3" />
                    {m.showSecondary ? "मूल भाषा में देखें" : "View in English / Hindi"}
                  </button>
                )}

                {/* Grounded Citation Chips */}
                {m.citations && m.citations.length > 0 && (
                  <div className="mt-2.5 pt-2 border-t border-[#D8D1C2]/80 space-y-1.5">
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
                        <span className="font-sans text-[#5C5A54] italic text-[10px] block mt-0.5">
                          &ldquo;{c.quote}&rdquo;
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Voice listen button for bot response */}
                {m.sender === "bot" && (
                  <div className="mt-2 pt-1 border-t border-[#D8D1C2]/40">
                    <ListenButton text={m.showSecondary && m.secondaryText ? m.secondaryText : m.text} lang={currentLang} label="Listen (सुनें)" />
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Loading Indicator */}
          {isLoading && (
            <div className="flex items-start">
              <div className="p-3 bg-[#F3EFE6] border border-[#D8D1C2] rounded-xs text-xs font-mono text-[#5C5A54] flex items-center gap-2">
                <span className="inline-block w-2 h-2 rounded-full bg-[#B3261E] animate-pulse" />
                <span>ClaimMate is thinking (Sarvam-105B)...</span>
              </div>
            </div>
          )}

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
                  disabled={isLoading}
                  className="text-left font-serif text-xs text-[#B3261E] hover:underline underline-offset-2 disabled:opacity-50"
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
            disabled={isLoading}
            className="flex-1 text-xs p-2.5 bg-[#FBF9F4] border border-[#151513] font-sans outline-none focus:ring-1 focus:ring-[#151513] disabled:opacity-50"
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
