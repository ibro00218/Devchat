import { useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { CodeSnippet } from "@/types/chat";
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";
import { highlightCode } from "@/lib/prism";

interface CodeBlockProps {
  snippet: CodeSnippet;
  className?: string;
}

export function CodeBlock({ snippet, className }: CodeBlockProps) {
  const { copyToClipboard } = useCopyToClipboard();
  const codeRef = useRef<HTMLPreElement>(null);
  
  // Highlight code when component mounts or snippet changes
  useEffect(() => {
    if (codeRef.current) {
      codeRef.current.innerHTML = highlightCode(snippet.code, snippet.language);
    }
  }, [snippet.code, snippet.language]);

  return (
    <div className={cn("mt-1 relative rounded-lg overflow-hidden", className)}>
      <div className="text-xs flex items-center justify-between p-2 bg-[#333333] text-[#A0A0A0] font-mono">
        <span>{snippet.language.charAt(0).toUpperCase() + snippet.language.slice(1)}</span>
        <button 
          className="bg-[#1E1E1E] hover:bg-[#333333] text-[#A0A0A0] p-1 rounded text-xs flex items-center group"
          onClick={() => copyToClipboard(snippet.code)}
        >
          <span className="material-icons text-sm mr-1">content_copy</span>
          Copy
          <span className="absolute top-[-25px] right-0 bg-black/80 text-white px-2 py-1 rounded text-xs opacity-0 transition-opacity pointer-events-none group-hover:opacity-0">
            Copied!
          </span>
        </button>
      </div>
      <pre className="p-4 m-0 bg-[#252525] rounded-b-lg overflow-x-auto scrollbar-custom">
        <code ref={codeRef} className={`language-${snippet.language}`}></code>
      </pre>
    </div>
  );
}
