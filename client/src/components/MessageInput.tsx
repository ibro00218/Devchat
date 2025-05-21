import { useState, useEffect, useRef, ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { FileAttachment, LANGUAGE_OPTIONS } from "@/types/chat";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";

interface MessageInputProps {
  onSendMessage: (text: string) => void;
  onSendCode: (code: string, language: string) => void;
  onSendAttachments?: (files: File[]) => void;
  onVoiceCall?: () => void;
  onVideoCall?: () => void;
  onScreenShare?: () => void;
}

export function MessageInput({ 
  onSendMessage, 
  onSendCode, 
  onSendAttachments, 
  onVoiceCall,
  onVideoCall,
  onScreenShare
}: MessageInputProps) {
  const [message, setMessage] = useState("");
  const [isCodeMode, setIsCodeMode] = useState(false);
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);
  const [language, setLanguage] = useState("javascript");
  const [files, setFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isAttachDialogOpen, setIsAttachDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("message");
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 300)}px`;
    }
  }, [message]);

  const handleSend = () => {
    if (!message.trim() && files.length === 0) return;
    
    if (isCodeMode && message.trim()) {
      onSendCode(message, language);
    } else if (message.trim()) {
      onSendMessage(message);
    }
    
    // Handle file attachments
    if (files.length > 0 && onSendAttachments) {
      // Mock upload progress
      setIsUploading(true);
      const interval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev === null) return 0;
          if (prev >= 100) {
            clearInterval(interval);
            setIsUploading(false);
            setTimeout(() => setUploadProgress(null), 500);
            return 100;
          }
          return prev + 10;
        });
      }, 200);
      
      onSendAttachments(files);
      setFiles([]);
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
    
    // ESC to cancel code mode or clear message
    if (e.key === 'Escape') {
      if (isCodeMode) {
        setIsCodeMode(false);
      } else {
        setMessage("");
      }
    }
  };

  const toggleCodeMode = () => {
    setIsCodeMode(!isCodeMode);
    setActiveTab(isCodeMode ? "message" : "code");
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFiles = Array.from(e.target.files);
      
      // Check total size (limit to 50MB for example)
      const totalSize = selectedFiles.reduce((sum, file) => sum + file.size, 0);
      if (totalSize > 50 * 1024 * 1024) {
        toast({
          title: "Files too large",
          description: "Total file size must be under 50MB",
          variant: "destructive"
        });
        return;
      }
      
      setFiles(prev => [...prev, ...selectedFiles]);
      
      // Reset the input so the same file can be selected again
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const openFileDialog = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="p-2 border-t border-[#333333]">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-[#252525] p-0 h-auto">
          <TabsTrigger 
            value="message" 
            className={`px-3 py-1.5 ${activeTab === 'message' ? 'bg-[#333333] text-[#E1E1E1]' : 'text-[#A0A0A0]'}`}
            onClick={() => setIsCodeMode(false)}
          >
            Message
          </TabsTrigger>
          <TabsTrigger 
            value="code" 
            className={`px-3 py-1.5 ${activeTab === 'code' ? 'bg-[#333333] text-[#E1E1E1]' : 'text-[#A0A0A0]'}`}
            onClick={() => setIsCodeMode(true)}
          >
            Code
          </TabsTrigger>
        </TabsList>

        <div className="bg-[#252525] rounded-lg overflow-hidden mt-2">
          {/* Toolbar */}
          <div className="px-3 py-2 border-b border-[#333333] flex items-center space-x-2">
            <TooltipProvider>
              {/* Code button */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <button 
                    className={`p-1.5 rounded hover:bg-[#333333] ${isCodeMode ? 'text-[#4D84FF]' : 'text-[#A0A0A0]'}`}
                    onClick={toggleCodeMode}
                  >
                    <span className="material-icons text-sm">code</span>
                  </button>
                </TooltipTrigger>
                <TooltipContent side="top">
                  <p className="text-xs">Code block</p>
                </TooltipContent>
              </Tooltip>
              
              {/* File attachment button */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <button 
                    className="p-1.5 rounded text-[#A0A0A0] hover:bg-[#333333] hover:text-[#E1E1E1]"
                    onClick={openFileDialog}
                  >
                    <span className="material-icons text-sm">attach_file</span>
                  </button>
                </TooltipTrigger>
                <TooltipContent side="top">
                  <p className="text-xs">Attach files</p>
                </TooltipContent>
              </Tooltip>
              
              {/* Terminal/Console Button */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <button className="p-1.5 rounded text-[#A0A0A0] hover:bg-[#333333] hover:text-[#E1E1E1]">
                    <span className="material-icons text-sm">terminal</span>
                  </button>
                </TooltipTrigger>
                <TooltipContent side="top">
                  <p className="text-xs">Terminal</p>
                </TooltipContent>
              </Tooltip>
              
              {/* Voice and Video Call Buttons */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <button 
                    className="p-1.5 rounded text-[#A0A0A0] hover:bg-[#333333] hover:text-[#E1E1E1]"
                    onClick={onVoiceCall}
                    aria-label="Start voice call"
                  >
                    <span className="material-icons text-sm">call</span>
                  </button>
                </TooltipTrigger>
                <TooltipContent side="top">
                  <p className="text-xs">Voice call</p>
                </TooltipContent>
              </Tooltip>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <button 
                    className="p-1.5 rounded text-[#A0A0A0] hover:bg-[#333333] hover:text-[#E1E1E1]"
                    onClick={onVideoCall}
                    aria-label="Start video call"
                  >
                    <span className="material-icons text-sm">videocam</span>
                  </button>
                </TooltipTrigger>
                <TooltipContent side="top">
                  <p className="text-xs">Video call</p>
                </TooltipContent>
              </Tooltip>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <button 
                    className="p-1.5 rounded text-[#A0A0A0] hover:bg-[#333333] hover:text-[#E1E1E1]"
                    onClick={onScreenShare}
                    aria-label="Share screen"
                  >
                    <span className="material-icons text-sm">screen_share</span>
                  </button>
                </TooltipTrigger>
                <TooltipContent side="top">
                  <p className="text-xs">Share screen</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <div className="text-[#A0A0A0] ml-auto text-xs">ESC to cancel, Ctrl+Enter to send</div>
          </div>
          
          {/* Input area */}
          <div className="max-h-60 overflow-y-auto">
            <Textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              className={`w-full p-3 bg-[#252525] text-[#E1E1E1] outline-none ${isCodeMode ? 'font-mono' : 'font-sans'} text-sm resize-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0`}
              placeholder={isCodeMode ? "Enter code here..." : "Send a message..."}
              rows={3}
            />
          </div>
          
          {/* Hidden file input */}
          <input 
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            multiple
          />
          
          {/* File attachments preview */}
          {files.length > 0 && (
            <div className="px-3 py-2 border-t border-[#333333]">
              <div className="text-xs text-[#A0A0A0] mb-2">Attachments ({files.length})</div>
              <div className="flex flex-wrap gap-2">
                {files.map((file, index) => (
                  <div key={index} className="flex items-center bg-[#1E1E1E] rounded p-1 pr-2">
                    <span className="material-icons text-[#A0A0A0] text-sm mr-1">
                      {file.type.startsWith('image/') ? 'image' : 
                       file.type.startsWith('video/') ? 'movie' : 
                       file.type.startsWith('audio/') ? 'audio_file' : 'description'}
                    </span>
                    <span className="text-xs text-[#E1E1E1] truncate max-w-[100px]">{file.name}</span>
                    <span className="text-xs text-[#A0A0A0] ml-1">({formatFileSize(file.size)})</span>
                    <button 
                      className="ml-2 text-[#A0A0A0] hover:text-[#E1E1E1]"
                      onClick={() => removeFile(index)}
                    >
                      <span className="material-icons text-sm">close</span>
                    </button>
                  </div>
                ))}
              </div>
              
              {isUploading && uploadProgress !== null && (
                <div className="mt-2">
                  <Progress value={uploadProgress} className="h-1" />
                </div>
              )}
            </div>
          )}
          
          {/* Bottom toolbar */}
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
                  <SelectContent className="bg-[#2D2D2D] border-[#3E3E3E]">
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
              disabled={(!message.trim() && files.length === 0) || isUploading}
              className="bg-[#4D84FF] hover:bg-blue-600 text-white px-4 py-1 rounded text-sm font-medium flex items-center h-8"
            >
              <span className="material-icons text-sm mr-1">send</span>
              Send
            </Button>
          </div>
        </div>
      </Tabs>
    </div>
  );
}
