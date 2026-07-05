import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, ShieldCheck, Network, Activity, BarChart, Users, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";

export default function Landing() {
  return (
    <div className="min-h-screen bg-background flex flex-col font-sans selection:bg-primary/30">
      {/* Enterprise Navbar */}
      <header className="bg-background border-b sticky top-0 z-50">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <div className="font-bold text-lg text-foreground tracking-tight flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-md">
              <Network className="w-4 h-4 text-white" />
            </div>
            GraphGST AI
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">Features</a>
            <a href="#solutions" className="hover:text-foreground transition-colors">Solutions</a>
            <a href="#customers" className="hover:text-foreground transition-colors">Customers</a>
            <a href="#pricing" className="hover:text-foreground transition-colors">Pricing</a>
          </nav>
          <div className="flex items-center gap-4">
            <Link to="/login" className="hidden sm:block">
              <Button variant="ghost" size="sm" className="font-medium">Sign In</Button>
            </Link>
            <Link to="/dashboard">
              <Button size="sm" className="bg-primary text-white shadow-md hover:bg-primary/90">
                Launch Platform
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col">
        <section className="py-24 px-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/5 via-background to-background" />
          <div className="container mx-auto max-w-6xl flex flex-col items-center text-center relative z-10">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-6 border border-primary/20 shadow-sm"
            >
              <ShieldCheck className="w-4 h-4" />
              Enterprise-Grade GST Compliance
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-5xl md:text-7xl font-bold tracking-tight text-foreground leading-[1.1] max-w-4xl"
            >
              The intelligence layer for your <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">supply chain</span>.
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-lg text-muted-foreground max-w-2xl mt-6 leading-relaxed"
            >
              GraphGST AI helps CFOs and auditors instantly detect circular trading, reconcile millions of invoices, and automatically recover blocked Input Tax Credit (ITC) using Knowledge Graphs and Explainable AI.
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex items-center gap-4 pt-10"
            >
              <Link to="/dashboard">
                <Button className="h-12 px-8 bg-primary text-white shadow-xl hover:bg-primary/90 text-base">
                  Start Free Trial <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
              <Link to="/onboarding">
                <Button variant="outline" className="h-12 px-8 text-base shadow-sm bg-background border-border hover:bg-muted">
                  View Interactive Tour
                </Button>
              </Link>
            </motion.div>
          </div>
        </section>

        {/* Features Grid */}
        <section id="features" className="py-24 bg-muted/30 border-y">
          <div className="container mx-auto px-6 max-w-6xl">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-foreground">Everything you need to scale compliance</h2>
              <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">Built for high-volume enterprises dealing with millions of GSTR lines monthly.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  icon: Network,
                  title: "Structural Risk Mapping",
                  desc: "Utilize Neo4j graph databases to traverse deep supply chain layers and expose hidden vendor linkages and circular trading rings."
                },
                {
                  icon: Activity,
                  title: "Automated Reconciliation",
                  desc: "Ingest GSTR-1, 2B, and 3B returns to systematically identify missing invoices and value variances in seconds."
                },
                {
                  icon: BarChart,
                  title: "What-If Simulator",
                  desc: "Simulate the financial impact of vendor corrections before they happen to optimize your ITC recovery strategies."
                },
                {
                  icon: Users,
                  title: "Vendor Intelligence",
                  desc: "Automatically score your suppliers based on their historic GST compliance and filing behavior."
                },
                {
                  icon: ShieldCheck,
                  title: "Audit Compliance Logging",
                  desc: "Maintain a strict, immutable audit trail of all detected anomalies and system interventions for tax authorities."
                },
                {
                  icon: CheckCircle,
                  title: "AI GST Copilot",
                  desc: "Chat directly with your tax data using our Gemini-powered AI to get instant answers and draft compliance notices."
                }
              ].map((f, i) => (
                <CardItem key={i} {...f} />
              ))}
            </div>
          </div>
        </section>

        {/* Solutions Section */}
        <section id="solutions" className="py-24 px-6 border-b">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-foreground">Built for modern finance teams</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              <div className="space-y-4">
                <h3 className="text-xl font-bold border-l-4 border-primary pl-4">For CFOs</h3>
                <p className="text-muted-foreground leading-relaxed">Protect your working capital by automatically recovering blocked ITC. Use predictive risk models to avoid doing business with non-compliant vendors.</p>
              </div>
              <div className="space-y-4">
                <h3 className="text-xl font-bold border-l-4 border-secondary pl-4">For Tax Auditors</h3>
                <p className="text-muted-foreground leading-relaxed">Instantly generate executive compliance reports and investigate circular trading rings using our interactive knowledge graph visualizations.</p>
              </div>
              <div className="space-y-4">
                <h3 className="text-xl font-bold border-l-4 border-success pl-4">For Compliance Ops</h3>
                <p className="text-muted-foreground leading-relaxed">Automate the tedious process of sending non-compliance notices to thousands of vendors with our AI-drafted smart email pipelines.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Customers Section */}
        <section id="customers" className="py-24 bg-muted/30 border-b">
          <div className="container mx-auto px-6 max-w-6xl text-center">
            <h2 className="text-2xl font-bold text-foreground mb-12">Trusted by fast-growing enterprises</h2>
            <div className="flex flex-wrap justify-center gap-12 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
              <div className="text-2xl font-black tracking-tighter">ACME LOGISTICS</div>
              <div className="text-2xl font-black tracking-tighter font-serif">GlobalTech</div>
              <div className="text-2xl font-black tracking-tighter italic">NEXUS</div>
              <div className="text-2xl font-black tracking-tighter">Apex Mfg.</div>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-24 px-6">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-foreground">Transparent pricing for every scale</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="p-8 rounded-xl border bg-card">
                <h3 className="font-semibold text-lg mb-2">Growth</h3>
                <div className="text-3xl font-bold mb-6">₹14,999<span className="text-sm font-normal text-muted-foreground">/mo</span></div>
                <ul className="space-y-3 text-sm text-muted-foreground mb-8">
                  <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-primary" /> Up to 50,000 invoices</li>
                  <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-primary" /> Standard Reconciliation</li>
                  <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-primary" /> Email Support</li>
                </ul>
                <Button variant="outline" className="w-full">Start 14-Day Trial</Button>
              </div>
              <div className="p-8 rounded-xl border-2 border-primary bg-card shadow-lg relative transform md:-translate-y-4">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary text-white text-xs font-bold px-3 py-1 rounded-full">MOST POPULAR</div>
                <h3 className="font-semibold text-lg mb-2">Enterprise</h3>
                <div className="text-3xl font-bold mb-6">₹49,999<span className="text-sm font-normal text-muted-foreground">/mo</span></div>
                <ul className="space-y-3 text-sm text-muted-foreground mb-8">
                  <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-primary" /> Unlimited invoices</li>
                  <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-primary" /> Graph Fraud Detection</li>
                  <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-primary" /> AI GST Copilot</li>
                </ul>
                <Button className="w-full bg-primary text-white">Get Started</Button>
              </div>
              <div className="p-8 rounded-xl border bg-card">
                <h3 className="font-semibold text-lg mb-2">Custom</h3>
                <div className="text-3xl font-bold mb-6">Volume Pricing</div>
                <ul className="space-y-3 text-sm text-muted-foreground mb-8">
                  <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-primary" /> Dedicated Account Manager</li>
                  <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-primary" /> Custom ERP Integrations</li>
                  <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-primary" /> 24/7 Phone Support</li>
                </ul>
                <Button variant="outline" className="w-full">Contact Sales</Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Enterprise Footer */}
      <footer className="bg-foreground text-slate-300 py-16 border-t border-slate-800">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
            <div className="col-span-2">
              <div className="font-bold text-lg text-white flex items-center gap-2 mb-4">
                <div className="w-6 h-6 rounded bg-primary flex items-center justify-center">
                  <Network className="w-3 h-3 text-white" />
                </div>
                GraphGST AI
              </div>
              <p className="text-sm text-slate-400 max-w-sm mb-6 leading-relaxed">
                The next-generation intelligence platform for enterprise GST reconciliation and automated fraud detection.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><a href="#" className="hover:text-white transition-colors">Reconciliation</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Graph Explorer</a></li>
                <li><a href="#" className="hover:text-white transition-colors">AI Copilot</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Resources</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API Reference</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Case Studies</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-500">
            <p>© 2026 GraphGST AI Inc. All rights reserved.</p>
            <div className="flex gap-4">
              <a href="#" className="hover:text-white transition-colors">Twitter</a>
              <a href="#" className="hover:text-white transition-colors">LinkedIn</a>
              <a href="#" className="hover:text-white transition-colors">GitHub</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function CardItem({ icon: Icon, title, desc }: any) {
  return (
    <div className="p-6 rounded-xl border bg-card shadow-sm hover:shadow-md transition-shadow">
      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-6">
        <Icon className="w-6 h-6 text-primary" />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-3">{title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
    </div>
  );
}
