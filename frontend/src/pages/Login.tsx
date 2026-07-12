import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { authenticationService } from "@/services/authenticationService";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      toast.info("Authenticating...");
      await authenticationService.login({ email, password });
      toast.success("Login successful");
      navigate("/dashboard");
    } catch {
      toast.error("Login failed. Check credentials.");
    }
  };

  const handleDevAccess = () => {
    authenticationService.startDevSession();
    toast.success("Dev shell unlocked", {
      description: "No business data is mocked. Pages will stay empty until backend APIs return data.",
    });
    navigate("/dashboard");
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-sm shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">GraphGST AI</CardTitle>
          <CardDescription>Enter your email below to login to your account.</CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="m@example.com" required value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-2">
            <Button className="w-full" type="submit">Sign in</Button>
            <Button className="w-full" type="button" variant="outline" onClick={handleDevAccess}>
              Continue in Dev Shell
            </Button>
            <p className="text-xs text-center text-muted-foreground">
              Dev shell only unlocks navigation. It does not create vendors, cases, reports, alerts, invoices, graph data, or AI answers.
            </p>
            <div className="text-sm text-center text-muted-foreground mt-2">
              Don't have an account? <Link to="/register" className="underline font-semibold">Sign up</Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
