import { useRef, useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { CodeSnippet } from "@/types/chat";
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";
import { highlightCode } from "@/lib/prism";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LANGUAGE_OPTIONS } from "@/types/chat";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface CodeBlockProps {
  snippet: CodeSnippet;
  className?: string;
  onLanguageChange?: (language: string) => void;
}

export function CodeBlock({ snippet, className, onLanguageChange }: CodeBlockProps) {
  const { copyToClipboard } = useCopyToClipboard();
  const codeRef = useRef<HTMLPreElement>(null);
  const [copied, setCopied] = useState(false);
  const [showActions, setShowActions] = useState(false);
  
  // Highlight code when component mounts or snippet changes
  useEffect(() => {
    if (codeRef.current) {
      try {
        codeRef.current.innerHTML = highlightCode(snippet.code, snippet.language);
      } catch (error) {
        console.error("Failed to highlight code:", error);
        // Fallback to plain text with escaping
        if (codeRef.current) {
          codeRef.current.textContent = snippet.code;
        }
      }
    }
  }, [snippet.code, snippet.language]);

  const handleCopy = async () => {
    const success = await copyToClipboard(snippet.code);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleLanguageChange = (language: string) => {
    if (onLanguageChange) {
      onLanguageChange(language);
    }
  };

  // Download code as file
  const downloadCode = () => {
    const blob = new Blob([snippet.code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `code-snippet.${snippet.language}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div 
      className={cn("mt-1 relative rounded-lg overflow-hidden border border-[#333333]", className)}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div className="text-xs flex items-center justify-between p-2 bg-[#2D2D2D] text-[#A0A0A0] font-mono">
        <div className="flex items-center space-x-2">
          {onLanguageChange ? (
            <Select
              value={snippet.language}
              onValueChange={handleLanguageChange}
            >
              <SelectTrigger className="h-6 w-[120px] bg-[#252525] border-[#3E3E3E] text-xs">
                <SelectValue placeholder="Language" />
              </SelectTrigger>
              <SelectContent className="bg-[#2D2D2D] border-[#3E3E3E] text-[#E1E1E1]">
                {LANGUAGE_OPTIONS.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <span>{snippet.language.charAt(0).toUpperCase() + snippet.language.slice(1)}</span>
          )}
        </div>
        
        <div className="flex space-x-1">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button 
                  className="bg-[#252525] hover:bg-[#333333] text-[#A0A0A0] p-1 rounded text-xs flex items-center"
                  onClick={downloadCode}
                >
                  <span className="material-icons text-sm">download</span>
                </button>
              </TooltipTrigger>
              <TooltipContent side="top">
                <p className="text-xs">Download</p>
              </TooltipContent>
            </Tooltip>
            
            <Tooltip open={copied}>
              <TooltipTrigger asChild>
                <button 
                  className="bg-[#252525] hover:bg-[#333333] text-[#A0A0A0] p-1 rounded text-xs flex items-center"
                  onClick={handleCopy}
                >
                  <span className="material-icons text-sm">{copied ? "check" : "content_copy"}</span>
                </button>
              </TooltipTrigger>
              <TooltipContent side="top">
                <p className="text-xs">{copied ? "Copied!" : "Copy code"}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
      
      <pre className="p-4 m-0 bg-[#1E1E1E] rounded-b-lg overflow-x-auto scrollbar-custom text-sm leading-relaxed">
        <code ref={codeRef} className={`language-${snippet.language}`}></code>
      </pre>
      
      {showActions && (
        <div className="absolute bottom-2 right-2 flex space-x-1 opacity-80">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button 
                  className="bg-[#252525] hover:bg-[#333333] text-[#A0A0A0] p-1 rounded text-xs flex items-center"
                  onClick={handleCopy}
                >
                  <span className="material-icons text-sm">content_copy</span>
                </button>
              </TooltipTrigger>
              <TooltipContent side="top">
                <p className="text-xs">Copy code</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      )}
    </div>
  );
}
