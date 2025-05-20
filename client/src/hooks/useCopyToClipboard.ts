import { useState, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";

export function useCopyToClipboard() {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const copyToClipboard = useCallback(
    async (text: string) => {
      if (!navigator.clipboard) {
        toast({
          title: "Copy failed",
          description: "Clipboard API not available in this browser",
          variant: "destructive",
        });
        return false;
      }

      try {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        
        toast({
          title: "Copied!",
          description: "Code copied to clipboard",
          duration: 2000,
        });
        
        setTimeout(() => {
          setCopied(false);
        }, 2000);
        
        return true;
      } catch (error) {
        console.error("Failed to copy text: ", error);
        
        toast({
          title: "Copy failed",
          description: "Could not copy text to clipboard",
          variant: "destructive",
        });
        
        return false;
      }
    },
    [toast]
  );

  return { copied, copyToClipboard };
}
