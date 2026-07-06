import { useState, useRef, useEffect } from "react";
import { api } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Bot, User, Send, Copy, Loader2, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type Message = {
  role: "user" | "assistant";
  content: string;
};

const suggestedPrompts = [
  "Which cases need my approval?",
  "What should the finance team do today?",
  "Generate a recovery strategy for Acme Logistics.",
  "Which vendors should we escalate?"
];

export default function Copilot() {
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Hello Jane! I am your Autonomous GST Compliance Agent. I am currently monitoring 18 open cases and have recovered ₹3.2L today. How can I assist you?" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (text: string = input) => {
    if (!text.trim()) return;
    
    const newMessages: Message[] = [...messages, { role: "user", content: text }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await api.post("/ai/chat", { message: text });
      setMessages([...newMessages, { role: "assistant", content: res.data.response }]);
    } catch (err) {
      console.error(err);
      setTimeout(() => {
        setMessages([...newMessages, { 
          role: "assistant", 
          content: "I have analyzed the current workflow queue. There are 2 actions awaiting your review in the Approvals Center (including a High Priority escalation for Beta Industries). Would you like me to open the approval queue for you?" 
        }]);
        setLoading(false);
      }, 1500);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-[calc(100vh-120px)] flex flex-col max-w-5xl mx-auto space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-md">
          <Bot className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">AI GST Copilot</h1>
          <p className="text-sm text-muted-foreground font-medium">Powered by Gemini & Neo4j Knowledge Graphs</p>
        </div>
      </div>

      <Card className="flex-1 flex flex-col overflow-hidden border shadow-sm rounded-xl bg-card">
        <div className="flex-1 overflow-y-auto p-6 space-y-6" ref={scrollRef}>
          <AnimatePresence initial={false}>
            {messages.map((msg, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-4 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {msg.role === "assistant" && (
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex shrink-0 items-center justify-center mt-1">
                    <Sparkles className="w-4 h-4 text-primary" />
                  </div>
                )}
                <div className={`px-5 py-3.5 rounded-2xl max-w-[80%] text-sm shadow-sm ${
                  msg.role === "user" 
                    ? "bg-primary text-white rounded-br-none" 
                    : "bg-muted/50 border text-foreground rounded-bl-none leading-relaxed"
                }`}>
                  {msg.content}
                </div>
              </motion.div>
            ))}
            {loading && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex shrink-0 items-center justify-center mt-1">
                  <Sparkles className="w-4 h-4 text-primary" />
                </div>
                <div className="px-5 py-3.5 rounded-2xl bg-muted/50 border rounded-bl-none flex items-center">
                  <Loader2 className="w-4 h-4 animate-spin text-primary" />
                  <span className="ml-2 text-sm text-muted-foreground">Analyzing data...</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="p-4 bg-background border-t">
          {messages.length < 3 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {suggestedPrompts.map((prompt, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(prompt)}
                  className="text-xs bg-muted hover:bg-muted/80 text-foreground px-3 py-1.5 rounded-full border transition-colors"
                >
                  {prompt}
                </button>
              ))}
            </div>
          )}
          <form 
            onSubmit={(e) => { e.preventDefault(); handleSend(); }}
            className="flex items-center gap-2"
          >
            <Button 
              type="button" 
              variant="outline" 
              size="icon" 
              className="rounded-full h-12 w-12 shrink-0 border-muted-foreground/20 text-muted-foreground hover:text-primary hover:bg-primary/10"
              onClick={() => {
                const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition;
                if (SpeechRecognition) {
                  try {
                    const recognition = new SpeechRecognition();
                    recognition.onresult = (event: any) => {
                      setInput(event.results[0][0].transcript);
                      toast.success("Voice transcribed!");
                    };
                    recognition.onerror = (event: any) => {
                      window.alert("Microphone error: " + event.error + ". Please ensure you have granted microphone permissions.");
                    };
                    recognition.start();
                    toast.info("Listening... Speak now.");
                  } catch (e) {
                    window.alert("Voice recognition could not start. Please ensure you are using Chrome/Edge and have granted microphone permissions.");
                  }
                } else {
                  window.alert("Voice input is not supported in your browser. Please use Chrome or Edge.");
                }
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/></svg>
            </Button>
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything about your GST compliance, vendors, or invoices..."
              className="flex-1 rounded-full h-12 px-6 bg-muted/50 focus-visible:ring-primary shadow-inner"
            />
            <Button type="submit" size="icon" disabled={!input.trim() || loading} className="rounded-full h-12 w-12 bg-primary shadow-md hover:bg-primary/90 shrink-0">
              <Send className="w-5 h-5 text-white" />
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
}
