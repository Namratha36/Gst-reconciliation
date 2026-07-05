import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calculator, TrendingUp, TrendingDown, ArrowRight } from "lucide-react";

export default function Simulator() {
  const [simulation, setSimulation] = useState({
    selectedVendor: "Vendor ABC",
    invoicesFixed: 5,
    recoveryAmount: 240000,
    complianceBoost: 12
  });

  const handleRunSimulation = () => {
    // Randomize to simulate backend logic for the UI
    const randomRecovery = Math.floor(Math.random() * (500000 - 50000 + 1) + 50000);
    const randomBoost = Math.floor(Math.random() * (25 - 5 + 1) + 5);
    setSimulation({
      ...simulation,
      recoveryAmount: randomRecovery,
      complianceBoost: randomBoost
    });
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">What-If ITC Recovery Simulator</h1>
        <p className="text-sm text-muted-foreground mt-1">Simulate the financial impact of fixing vendor mismatches.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-6">
          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Scenario Builder</CardTitle>
              <CardDescription>Adjust variables to project recovery.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Target Vendor</label>
                <select 
                  className="w-full h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                  onChange={(e) => setSimulation({...simulation, selectedVendor: e.target.value})}
                >
                  <option value="Vendor ABC">Vendor ABC (High Risk)</option>
                  <option value="Vendor XYZ">Vendor XYZ (Medium Risk)</option>
                  <option value="Apex Mfg">Apex Manufacturing (High Risk)</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Action</label>
                <select className="w-full h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary">
                  <option>Correct Pending Invoices</option>
                  <option>File Missing GSTR-1</option>
                  <option>Hold Payments</option>
                </select>
              </div>
              <div className="pt-4 border-t">
                <Button onClick={handleRunSimulation} className="w-full bg-primary text-white hover:bg-primary/90">
                  <Calculator className="w-4 h-4 mr-2" />
                  Run Simulation
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2 space-y-6">
          <Card className="shadow-sm border-l-4 border-l-secondary bg-secondary/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center text-secondary">
                <TrendingUp className="w-4 h-4 mr-2" />
                Projected Outcome
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg text-foreground font-medium leading-relaxed">
                If <strong>{simulation.selectedVendor}</strong> files their pending {simulation.invoicesFixed} invoices, your recoverable ITC increases by <span className="text-success font-bold">₹{(simulation.recoveryAmount).toLocaleString()}</span>.
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                This action will also improve your overall compliance score by {simulation.complianceBoost}%.
              </p>
            </CardContent>
          </Card>

          <div className="grid grid-cols-2 gap-4">
            <Card className="shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-medium text-muted-foreground uppercase">Recoverable ITC</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-success">+ ₹{(simulation.recoveryAmount / 100000).toFixed(2)}L</div>
              </CardContent>
            </Card>
            <Card className="shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-medium text-muted-foreground uppercase">Risk Reduction</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">- {simulation.complianceBoost}%</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
