import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Bot, Send, Loader2, Sparkles, Mic } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { copilotService } from "@/services/copilotService";
import type { ConversationMessage } from "@/types/domain";

const suggestedPrompts = [
  "Which cases need my approval?",
  "What should the finance team do today?",
  "Which vendors should we escalate?",
  "How much ITC is at risk?"
];

const backendUnavailableMessage = "Copilot backend is not connected. Connect `/api/ai/context` and `/api/ai/chat` to answer from real finance compliance context.";

export default function Copilot() {
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    void copilotService.getConversation().then((conversation) => setMessages(conversation.messages));
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (text: string = input) => {
    if (!text.trim()) return;

    const question = text.trim();
    const userMessage: ConversationMessage = {
      id: `MSG-${Date.now()}-USER`,
      role: "user",
      content: question,
      createdAt: new Date().toISOString(),
    };
    const streamingMessage: ConversationMessage = {
      id: `MSG-${Date.now()}-ASSISTANT`,
      role: "assistant",
      content: "",
      createdAt: new Date().toISOString(),
    };

    setMessages((current) => [...current, userMessage, streamingMessage]);
    setInput("");
    setLoading(true);

    try {
      const context = await copilotService.buildContext();
      const hasContext = context.invoices.length > 0 || context.vendors.length > 0 || context.cases.length > 0 || context.actions.length > 0 || context.approvals.length > 0 || Boolean(context.graphSummary || context.riskSummary);
      if (!hasContext) {
        throw new Error("Missing backend context");
      }

      const finalMessage = await copilotService.streamAnswer({ question, context }, (tokenizedContent) => {
        setMessages((current) => current.map((message) => message.id === streamingMessage.id ? { ...message, content: tokenizedContent } : message));
      });

      setMessages((current) => current.map((message) => message.id === streamingMessage.id ? { ...finalMessage, id: streamingMessage.id } : message));
    } catch {
      setMessages((current) => current.map((message) => message.id === streamingMessage.id ? { ...message, content: backendUnavailableMessage } : message));
      toast.error("Copilot backend is not connected");
    } finally {
      setLoading(false);
    }
  };

  const handleVoice = () => {
    type SpeechRecognitionConstructor = new () => {
      onresult: ((event: SpeechRecognitionEvent) => void) | null;
      onerror: (() => void) | null;
      start: () => void;
    };
    const speechWindow = window as Window & {
      SpeechRecognition?: SpeechRecognitionConstructor;
      webkitSpeechRecognition?: SpeechRecognitionConstructor;
    };
    const SpeechRecognition = speechWindow.SpeechRecognition ?? speechWindow.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error("Voice input is not supported in this browser");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.onresult = (event: SpeechRecognitionEvent) => {
      setInput(event.results[0][0].transcript);
      toast.success("Voice transcribed");
    };
    recognition.onerror = () => toast.error("Microphone input failed");
    recognition.start();
    toast.info("Listening...");
  };

  return (
    <div className="h-[calc(100vh-120px)] flex flex-col max-w-5xl mx-auto space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-md">
          <Bot className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">AI GST Copilot</h1>
          <p className="text-sm text-muted-foreground font-medium">Finance compliance assistant using invoice, vendor, case, graph, risk, action, and approval context.</p>
        </div>
      </div>

      <Card className="flex-1 flex flex-col overflow-hidden border shadow-sm rounded-lg bg-card">
        <div className="flex-1 overflow-y-auto p-6 space-y-6" ref={scrollRef}>
          {messages.length === 0 && (
            <div className="h-full flex items-center justify-center text-center text-sm text-muted-foreground p-6">
              Copilot is ready for backend context. It will not answer until real invoice, vendor, case, graph, risk, action, and approval data is returned.
            </div>
          )}
          <AnimatePresence initial={false}>
            {messages.map((message) => (
              <motion.div key={message.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`flex gap-4 ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                {message.role === "assistant" && (
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex shrink-0 items-center justify-center mt-1">
                    <Sparkles className="w-4 h-4 text-primary" />
                  </div>
                )}
                <div className={`px-5 py-3.5 rounded-2xl max-w-[85%] text-sm shadow-sm ${message.role === "user" ? "bg-primary text-white rounded-br-none" : "bg-muted/50 border text-foreground rounded-bl-none leading-relaxed"}`}>
                  {message.content || <Loader2 className="w-4 h-4 animate-spin text-primary" />}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <div className="p-4 bg-background border-t">
          {messages.length < 3 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {suggestedPrompts.map((prompt) => (
                <button key={prompt} onClick={() => void handleSend(prompt)} className="text-xs bg-muted hover:bg-muted/80 text-foreground px-3 py-1.5 rounded-full border transition-colors">
                  {prompt}
                </button>
              ))}
            </div>
          )}
          <form onSubmit={(event) => { event.preventDefault(); void handleSend(); }} className="flex items-center gap-2">
            <Button type="button" variant="outline" size="icon" className="rounded-full h-12 w-12 shrink-0 border-muted-foreground/20 text-muted-foreground hover:text-primary hover:bg-primary/10" onClick={handleVoice}>
              <Mic className="w-5 h-5" />
            </Button>
            <Input value={input} onChange={(event) => setInput(event.target.value)} placeholder="Ask about vendors, invoices, cases, approvals, graph risk, or actions..." className="flex-1 rounded-full h-12 px-6 bg-muted/50 focus-visible:ring-primary shadow-inner" />
            <Button type="submit" size="icon" disabled={!input.trim() || loading} className="rounded-full h-12 w-12 bg-primary shadow-md hover:bg-primary/90 shrink-0">
              {loading ? <Loader2 className="w-5 h-5 text-white animate-spin" /> : <Send className="w-5 h-5 text-white" />}
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
}
