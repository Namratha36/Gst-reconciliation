import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Network, UploadCloud, PieChart, Bot, ShieldCheck } from "lucide-react";

const steps = [
  {
    title: "Welcome to GraphGST AI",
    desc: "GraphGST AI helps businesses prevent GST losses, detect circular trading, and identify risky vendors using advanced Knowledge Graphs and Gemini AI.",
    icon: <Network className="w-16 h-16 text-primary" />,
  },
  {
    title: "Data Ingestion Pipeline",
    desc: "Start by uploading your GSTR-1, GSTR-2B, and GSTR-3B CSV files. Our engine automatically parses and cross-verifies millions of rows in seconds.",
    icon: <UploadCloud className="w-16 h-16 text-secondary" />,
  },
  {
    title: "Reconciliation Engine",
    desc: "Automatically detect missing invoices, GST mismatches, duplicate entries, and calculate exactly how much Input Tax Credit (ITC) is at risk.",
    icon: <ShieldCheck className="w-16 h-16 text-success" />,
  },
  {
    title: "Executive Dashboard",
    desc: "Monitor your compliance health with our Palantir-inspired enterprise dashboard. View KPI cards, risk charts, and vendor non-compliance scores.",
    icon: <PieChart className="w-16 h-16 text-warning" />,
  },
  {
    title: "AI GST Copilot",
    desc: "Ask our Gemini-powered assistant plain English questions like 'Which vendor is causing maximum ITC risk?' or 'How much ITC can I recover?'",
    icon: <Bot className="w-16 h-16 text-primary" />,
  },
];

export default function Onboarding() {
  const [currentStep, setCurrentStep] = useState(0);
  const navigate = useNavigate();

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      localStorage.setItem("onboarding_completed", "true");
      navigate("/dashboard");
    }
  };

  const handleSkip = () => {
    localStorage.setItem("onboarding_completed", "true");
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="max-w-2xl w-full">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-card border shadow-xl rounded-xl overflow-hidden relative"
        >
          {/* Progress Bar */}
          <div className="absolute top-0 left-0 h-1 bg-muted w-full">
            <motion.div 
              className="h-full bg-primary"
              initial={{ width: 0 }}
              animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>

          <div className="p-10 flex flex-col items-center text-center min-h-[400px] justify-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col items-center"
              >
                <div className="w-32 h-32 rounded-full bg-muted/50 flex items-center justify-center mb-8">
                  {steps[currentStep].icon}
                </div>
                <h1 className="text-3xl font-bold tracking-tight text-foreground mb-4">
                  {steps[currentStep].title}
                </h1>
                <p className="text-lg text-muted-foreground leading-relaxed max-w-lg">
                  {steps[currentStep].desc}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="bg-muted/30 p-6 flex items-center justify-between border-t">
            <Button variant="ghost" className="text-muted-foreground" onClick={handleSkip}>
              Skip Tour
            </Button>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => setCurrentStep(prev => prev - 1)}
                disabled={currentStep === 0}
              >
                Previous
              </Button>
              <Button onClick={handleNext} className="bg-primary text-primary-foreground min-w-[100px]">
                {currentStep === steps.length - 1 ? "Get Started" : "Next"}
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
