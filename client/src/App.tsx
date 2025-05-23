import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import ChatApp from "@/pages/ChatApp";
import LoginPage from "@/pages/Login";
import UserSettingsPage from "@/pages/UserSettingsPage";

function Router() {
  const isAuthenticated = true;
  console.log("Rendering route. Auth:", isAuthenticated);
  return (
    <Switch>
      <Route path="/login" component={LoginPage} />
      <Route path="/settings" component={UserSettingsPage} />
      <Route path="/" component={isAuthenticated ? ChatApp : LoginPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <div className="bg-red-500 text-white p-4 text-xl">
          Tailwind is working!
        </div>
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
