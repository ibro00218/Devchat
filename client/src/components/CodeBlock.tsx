import { useRef, useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { CodeSnippet } from "@/types/chat";
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";
import { highlightCode } from "@/lib/prism";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LANGUAGE_OPTIONS } from "@/types/chat";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

// Removing this function as we now use highlightCode from prism.ts

interface CodeBlockProps {
  snippet: CodeSnippet;
  className?: string;
  onLanguageChange?: (language: string) => void;
  editable?: boolean;
}

export function CodeBlock({ snippet, className, onLanguageChange, editable = false }: CodeBlockProps) {
  const { copyToClipboard } = useCopyToClipboard();
  const codeRef = useRef<HTMLPreElement>(null);
  const editableCodeRef = useRef<HTMLTextAreaElement>(null);
  const [copied, setCopied] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editableCode, setEditableCode] = useState(snippet.code);
  const [isFullscreenDialogOpen, setIsFullscreenDialogOpen] = useState(false);
  
  // Highlight code when component mounts or snippet changes
  useEffect(() => {
    if (codeRef.current && !isEditing) {
      try {
        // Use our custom syntax highlighter from prism.ts
        const highlighted = highlightCode(snippet.code, snippet.language);
        codeRef.current.innerHTML = highlighted;
      } catch (error) {
        console.error("Failed to highlight code:", error);
        // Fallback to plain text
        if (codeRef.current) {
          codeRef.current.textContent = snippet.code;
        }
      }
    }
    
    // Update editable code when snippet changes
    setEditableCode(snippet.code);
  }, [snippet.code, snippet.language, isEditing]);

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

  const handleEditableCodeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEditableCode(e.target.value);
  };

  const saveEditableCode = () => {
    if (onLanguageChange && editableCode !== snippet.code) {
      // This is a mock function - in real implementation you would 
      // save the changes to the snippet
      console.log("Saving code:", editableCode);
      setIsEditing(false);
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

  // Run code in console (mock implementation)
  const runCode = () => {
    try {
      if (snippet.language === 'javascript') {
        // eslint-disable-next-line no-eval
        eval(snippet.code);
      } else {
        console.log(`Running ${snippet.language} code is not supported in browser.`);
      }
    } catch (error) {
      console.error("Failed to run code:", error);
    }
  };

  return (
    <>
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
              <span className="px-2">{snippet.language.charAt(0).toUpperCase() + snippet.language.slice(1)}</span>
            )}
          </div>
          
          <div className="flex space-x-1">
            <TooltipProvider>
              {/* Fullscreen button */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <button 
                    className="bg-[#252525] hover:bg-[#333333] text-[#A0A0A0] p-1 rounded text-xs flex items-center"
                    onClick={() => setIsFullscreenDialogOpen(true)}
                  >
                    <span className="material-icons text-sm">fullscreen</span>
                  </button>
                </TooltipTrigger>
                <TooltipContent side="top">
                  <p className="text-xs">Fullscreen</p>
                </TooltipContent>
              </Tooltip>
              
              {/* Run code button for JavaScript */}
              {snippet.language === 'javascript' && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button 
                      className="bg-[#252525] hover:bg-[#333333] text-[#A0A0A0] p-1 rounded text-xs flex items-center"
                      onClick={runCode}
                    >
                      <span className="material-icons text-sm">play_arrow</span>
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    <p className="text-xs">Run code</p>
                  </TooltipContent>
                </Tooltip>
              )}
              
              {/* Download button */}
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
              
              {/* Edit button (if editable) */}
              {editable && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button 
                      className={`bg-[#252525] hover:bg-[#333333] ${isEditing ? 'text-[#4D84FF]' : 'text-[#A0A0A0]'} p-1 rounded text-xs flex items-center`}
                      onClick={() => setIsEditing(!isEditing)}
                    >
                      <span className="material-icons text-sm">{isEditing ? "check" : "edit"}</span>
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    <p className="text-xs">{isEditing ? "Save" : "Edit"}</p>
                  </TooltipContent>
                </Tooltip>
              )}
              
              {/* Copy button */}
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
        
        {/* Code display area */}
        {isEditing ? (
          <div className="relative">
            <textarea
              ref={editableCodeRef}
              value={editableCode}
              onChange={handleEditableCodeChange}
              className="p-4 m-0 bg-[#1E1E1E] text-[#E1E1E1] rounded-b-lg w-full h-auto min-h-[150px] font-mono text-sm leading-relaxed resize-none border-0 focus:outline-none scrollbar-custom"
              spellCheck="false"
            />
            <div className="absolute bottom-2 right-2">
              <Button 
                size="sm" 
                className="bg-[#4D84FF] hover:bg-blue-600 text-white"
                onClick={saveEditableCode}
              >
                Save
              </Button>
            </div>
          </div>
        ) : (
          <pre className="p-4 m-0 bg-[#1E1E1E] rounded-b-lg overflow-x-auto scrollbar-custom text-sm leading-relaxed min-h-[60px] max-h-[400px]">
            <code ref={codeRef} className={`language-${snippet.language}`}></code>
          </pre>
        )}
        
        {/* Floating action buttons */}
        {showActions && !isEditing && (
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
      
      {/* Fullscreen dialog */}
      <Dialog open={isFullscreenDialogOpen} onOpenChange={setIsFullscreenDialogOpen}>
        <DialogContent className="max-w-[90vw] max-h-[90vh] bg-[#1E1E1E] border-[#333333]">
          <DialogHeader>
            <DialogTitle className="text-[#E1E1E1] flex items-center">
              <span className="material-icons text-sm mr-2">code</span>
              {snippet.language.charAt(0).toUpperCase() + snippet.language.slice(1)} Code
            </DialogTitle>
          </DialogHeader>
          
          <div className="bg-[#1E1E1E] overflow-auto max-h-[70vh]">
            <pre className="p-4 m-0 bg-[#1E1E1E] overflow-x-auto scrollbar-custom text-sm leading-relaxed">
              <code 
                className={`language-${snippet.language}`} 
                dangerouslySetInnerHTML={{ 
                  __html: highlightCode(snippet.code, snippet.language) 
                }} 
              />
            </pre>
          </div>
          
          <div className="flex justify-end space-x-2 pt-2">
            <Button
              onClick={downloadCode}
              variant="outline"
              className="text-[#E1E1E1] border-[#333333] hover:bg-[#333333]"
            >
              <span className="material-icons text-sm mr-1">download</span>
              Download
            </Button>
            
            <Button
              onClick={handleCopy}
              className="bg-[#4D84FF] hover:bg-blue-600 text-white"
            >
              <span className="material-icons text-sm mr-1">content_copy</span>
              Copy code
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
