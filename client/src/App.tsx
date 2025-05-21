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
  // For demo purposes, let's assume the user is authenticated
  const isAuthenticated = true;
  
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
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
