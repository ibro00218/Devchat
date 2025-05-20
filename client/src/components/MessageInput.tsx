import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { LANGUAGE_OPTIONS } from "@/types/chat";

interface MessageInputProps {
  onSendMessage: (text: string) => void;
  onSendCode: (code: string, language: string) => void;
}

export function MessageInput({ onSendMessage, onSendCode }: MessageInputProps) {
  const [message, setMessage] = useState("");
  const [isCodeMode, setIsCodeMode] = useState(false);
  const [language, setLanguage] = useState("javascript");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [message]);

  const handleSend = () => {
    if (!message.trim()) return;
    
    if (isCodeMode) {
      onSendCode(message, language);
    } else {
      onSendMessage(message);
    }
    
    setMessage("");
    setIsCodeMode(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Ctrl+Enter to send
    if (e.ctrlKey && e.key === 'Enter') {
      handleSend();
      e.preventDefault();
    }
    
    // ESC to cancel code mode
    if (e.key === 'Escape') {
      if (isCodeMode) {
        setIsCodeMode(false);
      }
      setMessage("");
    }
  };

  const toggleCodeMode = () => {
    setIsCodeMode(!isCodeMode);
  };

  return (
    <div className="p-4 border-t border-[#333333]">
      <div className="bg-[#252525] rounded-lg overflow-hidden">
        <div className="px-3 py-2 border-b border-[#333333] flex items-center space-x-2">
          <button 
            className={`hover:text-[#E1E1E1] ${isCodeMode ? 'text-[#4D84FF]' : 'text-[#A0A0A0]'}`}
            onClick={toggleCodeMode}
          >
            <span className="material-icons text-sm">code</span>
          </button>
          <button className="text-[#A0A0A0] hover:text-[#E1E1E1]">
            <span className="material-icons text-sm">attach_file</span>
          </button>
          <button className="text-[#A0A0A0] hover:text-[#E1E1E1]">
            <span className="material-icons text-sm">format_bold</span>
          </button>
          <button className="text-[#A0A0A0] hover:text-[#E1E1E1]">
            <span className="material-icons text-sm">format_italic</span>
          </button>
          <div className="text-[#A0A0A0] ml-auto text-xs">ESC to cancel, Ctrl+Enter to send</div>
        </div>
        
        <div className="max-h-60 overflow-y-auto">
          <Textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full p-3 bg-[#252525] text-[#E1E1E1] outline-none font-mono text-sm resize-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
            placeholder={isCodeMode ? "Enter code here..." : "Send a message..."}
            rows={3}
          />
        </div>
        
        <div className="px-3 py-2 flex justify-between items-center border-t border-[#333333]">
          <div className="flex space-x-2">
            {isCodeMode && (
              <Select
                value={language}
                onValueChange={setLanguage}
              >
                <SelectTrigger className="w-[150px] h-8 bg-[#1E1E1E] text-[#A0A0A0] text-xs px-2 py-1 rounded border border-[#333333]">
                  <SelectValue placeholder="Language" />
                </SelectTrigger>
                <SelectContent className="bg-[#252525] border-[#333333]">
                  {LANGUAGE_OPTIONS.map(option => (
                    <SelectItem 
                      key={option.value} 
                      value={option.value}
                      className="text-[#E1E1E1] text-xs"
                    >
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
          
          <Button 
            onClick={handleSend}
            disabled={!message.trim()}
            className="bg-[#4D84FF] hover:bg-blue-600 text-white px-4 py-1 rounded text-sm font-medium flex items-center h-8"
          >
            <span className="material-icons text-sm mr-1">send</span>
            Send
          </Button>
        </div>
      </div>
    </div>
  );
}
