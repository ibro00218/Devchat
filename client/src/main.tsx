import { createRoot } from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { StrictMode } from "react";
import App from "./App";
import './App.css'
import "./index.css";
import { Toaster } from "@/components/ui/toaster";

// Custom syntax highlighting styles added via JS

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
      <Toaster />
    </QueryClientProvider>
  </StrictMode>
);
