import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calculator, TrendingUp } from "lucide-react";
import { simulationService } from "@/services/simulationService";
import { formatINR } from "@/services/format";
import type { SimulationScenario } from "@/types/domain";

export default function Simulator() {
  const [scenarios, setScenarios] = useState<SimulationScenario[]>([]);
  const [selectedScenarioId, setSelectedScenarioId] = useState("");
  const [simulation, setSimulation] = useState<SimulationScenario | null>(null);

  useEffect(() => {
    void simulationService.listScenarios().then((items) => {
      setScenarios(items);
      setSelectedScenarioId(items[0]?.id ?? "");
      setSimulation(items[0] ?? null);
    });
  }, []);

  const handleRunSimulation = async () => {
    if (!selectedScenarioId) return;
    setSimulation(await simulationService.runScenario(selectedScenarioId));
  };

  if (!simulation) {
    return (
      <div className="space-y-6 max-w-5xl mx-auto pb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">What-If ITC Recovery Simulator</h1>
          <p className="text-sm text-muted-foreground mt-1">No simulation scenarios returned by the backend.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">What-If ITC Recovery Simulator</h1>
        <p className="text-sm text-muted-foreground mt-1">Projection interface backed by scenario service outputs.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-6">
          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Scenario Builder</CardTitle>
              <CardDescription>Choose a backend-provided scenario to project recovery.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Target Scenario</label>
                <select
                  className="w-full h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                  value={selectedScenarioId}
                  onChange={(event) => setSelectedScenarioId(event.target.value)}
                >
                  {scenarios.map((scenario) => (
                    <option key={scenario.id} value={scenario.id}>{scenario.vendorName} - {scenario.action}</option>
                  ))}
                </select>
              </div>
              <div className="pt-4 border-t">
                <Button onClick={() => void handleRunSimulation()} className="w-full bg-primary text-white hover:bg-primary/90">
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
                If <strong>{simulation.vendorName}</strong> completes <strong>{simulation.action}</strong> for {simulation.invoicesFixed} invoice(s), recoverable ITC increases by <span className="text-success font-bold">{formatINR(simulation.recoveryAmount)}</span>.
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                This action will also improve the compliance score by {simulation.complianceBoost}%.
              </p>
            </CardContent>
          </Card>

          <div className="grid grid-cols-2 gap-4">
            <Card className="shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-medium text-muted-foreground uppercase">Recoverable ITC</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-success">+ {formatINR(simulation.recoveryAmount)}</div>
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
