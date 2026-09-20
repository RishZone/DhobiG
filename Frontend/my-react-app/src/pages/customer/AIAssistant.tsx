import { useEffect, useRef, useState } from "react";
import { Bot, Send, Sparkles } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { api, type ChatMessage } from "../../lib/api";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { cn } from "../../lib/utils";

const SUGGESTIONS = [
  "How much does suit dry cleaning cost?",
  "Book a pickup for tomorrow at 10 AM",
  "How should I clean a silk saree?",
  "What happens if clothes are damaged?",
  "Do you offer same-day delivery?",
];

const AGENT_LABELS: Record<string, string> = {
  booking_agent: "Booking Agent",
  tracking_agent: "Tracking Agent",
  pricing_agent: "Pricing Agent",
  recommendation_agent: "Recommendation Agent",
  rag_agent: "Knowledge Base",
};

export default function AIAssistant() {
  const { user } = useAuth();
  const [sessionId] = useState(() => `session-${Date.now()}`);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      message:
        "Hi! I'm the DhobiG AI Assistant. I can quote prices, book pickups, track orders, and answer fabric-care or policy questions. What do you need?",
    },
  ]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function send(text?: string) {
    const message = (text ?? input).trim();
    if (!message || sending) return;
    if (!user) {
      setMessages((prev) => [
        ...prev,
        { role: "user", message },
        { role: "assistant", message: "Please log in first so I can look up your orders and book on your behalf." },
      ]);
      setInput("");
      return;
    }

    setMessages((prev) => [...prev, { role: "user", message }]);
    setInput("");
    setSending(true);
    try {
      const res = await api.post("/chat", { session_id: sessionId, message });
      setMessages((prev) => [...prev, { role: "assistant", message: res.data.reply, agent_used: res.data.agent_used }]);
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", message: "Sorry, something went wrong. Please try again." }]);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="container-page flex flex-col py-10" style={{ minHeight: "calc(100vh - 4rem)" }}>
      <div className="mb-4 flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white">
          <Bot size={20} />
        </span>
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink">AI Assistant</h1>
          <p className="text-sm text-ink/60">Powered by RAG + a LangGraph multi-agent router</p>
        </div>
      </div>

      <div className="flex flex-1 flex-col rounded-xl2 border border-ink/10 bg-white shadow-card">
        <div className="flex-1 space-y-4 overflow-y-auto p-5" style={{ maxHeight: "56vh" }}>
          {messages.map((m, i) => (
            <div key={i} className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}>
              <div
                className={cn(
                  "max-w-[80%] whitespace-pre-line rounded-2xl px-4 py-2.5 text-sm",
                  m.role === "user" ? "bg-primary text-white" : "bg-base text-ink"
                )}
              >
                {m.message}
                {m.agent_used && (
                  <div className="mt-1.5 flex items-center gap-1 text-[10px] font-medium uppercase tracking-wide text-ink/40">
                    <Sparkles size={10} />
                    {AGENT_LABELS[m.agent_used] || m.agent_used}
                  </div>
                )}
              </div>
            </div>
          ))}
          {sending && <div className="text-xs text-ink/40">Assistant is thinking...</div>}
          <div ref={bottomRef} />
        </div>

        <div className="border-t border-ink/10 p-4">
          <div className="mb-3 flex flex-wrap gap-2">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => send(s)}
                className="rounded-full border border-ink/10 bg-base px-3 py-1 text-xs text-ink/60 hover:border-primary hover:text-primary"
              >
                {s}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              placeholder="Ask about pricing, bookings, tracking, or fabric care..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
            />
            <Button onClick={() => send()} disabled={sending}>
              <Send size={16} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
