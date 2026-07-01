import { FallbackProps } from "react-error-boundary";
import { Button } from "@/components/ui/button";
import { AlertOctagon, RefreshCcw, Home } from "lucide-react";
import { Link } from "react-router-dom";

export default function ErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center text-destructive mb-6">
        <AlertOctagon className="w-8 h-8" />
      </div>
      <h1 className="text-2xl font-bold mb-2">Something went wrong</h1>
      <p className="text-muted-foreground max-w-md mb-8">
        We encountered an unexpected error while trying to load this view. 
        <br />
        <span className="text-xs mt-2 block font-mono text-destructive/70 bg-destructive/5 p-2 rounded">
          {error.message}
        </span>
      </p>
      
      <div className="flex gap-4">
        <Button onClick={resetErrorBoundary} className="gap-2">
          <RefreshCcw className="w-4 h-4" /> Try Again
        </Button>
        <Link to="/dashboard">
          <Button variant="outline" className="gap-2" onClick={resetErrorBoundary}>
            <Home className="w-4 h-4" /> Go to Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
}
