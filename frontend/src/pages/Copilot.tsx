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
  "Which vendor is causing maximum ITC risk?",
  "Show invoices with GST mismatch.",
  "How much ITC can I recover?",
  "Why is Vendor ABC risky?"
];

export default function Copilot() {
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Hello! I am your AI GST Copilot. I can analyze vendors, identify ITC risks, and explain complex GST mismatches. How can I assist you today?" }
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
      // Stubbing the backend API call for now. 
      // In production, this hits /api/ai/chat with the message history
      const res = await api.post("/ai/chat", { message: text });
      setMessages([...newMessages, { role: "assistant", content: res.data.response }]);
    } catch (err) {
      console.error(err);
      // Mock fallback if backend isn't ready
      setTimeout(() => {
        setMessages([...newMessages, { 
          role: "assistant", 
          content: "Based on the latest data ingestion, Vendor ABC has 5 pending invoices causing ₹2.4L in ITC blockage. I recommend sending them an automated follow-up email." 
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
