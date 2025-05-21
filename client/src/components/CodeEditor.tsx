import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LANGUAGE_OPTIONS } from '@/types/chat';
import { Terminal } from './Terminal';
import { cn } from '@/lib/utils';
import { highlightCode } from '@/lib/prism';

interface CodeEditorProps {
  initialCode?: string;
  initialLanguage?: string;
  onSave?: (code: string, language: string) => void;
  onRun?: (code: string, language: string) => void;
  onShare?: (code: string, language: string) => void;
  className?: string;
}

export function CodeEditor({
  initialCode = '',
  initialLanguage = 'javascript',
  onSave,
  onRun,
  onShare,
  className
}: CodeEditorProps) {
  const [code, setCode] = useState(initialCode);
  const [language, setLanguage] = useState(initialLanguage);
  const [activeTab, setActiveTab] = useState<'editor' | 'terminal'>('editor');
  const [isSplitView, setIsSplitView] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [output, setOutput] = useState('');
  const [terminalVisible, setTerminalVisible] = useState(false);
  
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const editorContainerRef = useRef<HTMLDivElement>(null);

  // Set editor initial tab size
  useEffect(() => {
    if (editorRef.current) {
      // Set tab behavior to insert spaces
      editorRef.current.addEventListener('keydown', (e) => {
        if (e.key === 'Tab') {
          e.preventDefault();
          
          const start = editorRef.current!.selectionStart;
          const end = editorRef.current!.selectionEnd;
          
          // Insert 2 spaces for tab
          const newValue = code.substring(0, start) + '  ' + code.substring(end);
          setCode(newValue);
          
          // Move cursor to correct position after inserting spaces
          setTimeout(() => {
            editorRef.current!.selectionStart = editorRef.current!.selectionEnd = start + 2;
          }, 0);
        }
      });
    }
  }, [code]);

  // Set editor fullscreen mode
  useEffect(() => {
    const handleEscKeydown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };

    window.addEventListener('keydown', handleEscKeydown);
    return () => {
      window.removeEventListener('keydown', handleEscKeydown);
    };
  }, [isFullscreen]);

  const handleLanguageChange = (value: string) => {
    setLanguage(value);
  };

  const handleCodeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCode(e.target.value);
  };

  const handleSave = () => {
    if (onSave) {
      onSave(code, language);
    }
  };

  const handleRun = () => {
    if (onRun) {
      onRun(code, language);
    }
    
    // Mock execution for JavaScript code
    if (language === 'javascript') {
      try {
        // Using function constructor for safer eval (still not production safe)
        const result = new Function(`
          try {
            let console = {
              log: function(...args) {
                return args.map(arg => 
                  typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
                ).join(' ');
              }
            };
            let output = [];
            
            ${code}
            
            return output.join('\\n');
          } catch(e) {
            return "Error: " + e.message;
          }
        `)();
        
        setOutput(result || 'Code executed successfully with no output.');
      } catch (error) {
        setOutput(`Error: ${error instanceof Error ? error.message : String(error)}`);
      }
    } else {
      setOutput(`Running ${language} code is not supported in the browser environment.`);
    }
    
    setTerminalVisible(true);
    setActiveTab('terminal');
  };

  const handleShare = () => {
    if (onShare) {
      onShare(code, language);
    }
  };

  const handleToggleSplitView = () => {
    setIsSplitView(!isSplitView);
    if (!isSplitView) {
      setTerminalVisible(true);
    }
  };
  
  const getEditorTheme = () => {
    return {
      backgroundColor: '#1E1E1E',
      textColor: '#E1E1E1',
      lineNumberColor: '#858585',
      highlightLineColor: '#2A2A2A',
      selectionColor: 'rgba(77, 132, 255, 0.3)',
      cursorColor: '#CCCCCC'
    };
  };

  const editorTheme = getEditorTheme();

  return (
    <div
      className={cn(
        "border border-[#333333] rounded-md overflow-hidden bg-[#1E1E1E] flex flex-col",
        isFullscreen ? "fixed inset-0 z-50" : "relative",
        className
      )}
      ref={editorContainerRef}
    >
      {/* Editor header */}
      <div className="bg-[#252525] px-4 py-2 flex items-center justify-between border-b border-[#333333]">
        <div className="flex items-center">
          <span className="material-icons text-sm mr-2">code</span>
          <Select
            value={language}
            onValueChange={handleLanguageChange}
          >
            <SelectTrigger className="w-[150px] h-8 bg-[#1E1E1E] text-[#E1E1E1] border-[#333333] text-xs">
              <SelectValue placeholder="Select language" />
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
        </div>
        
        <div className="flex space-x-1">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="h-8 w-8 p-0 text-[#A0A0A0] hover:text-[#E1E1E1] hover:bg-[#333333]"
                  onClick={handleSave}
                >
                  <span className="material-icons text-sm">save</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p className="text-xs">Save</p>
              </TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="h-8 w-8 p-0 text-[#A0A0A0] hover:text-[#E1E1E1] hover:bg-[#333333]"
                  onClick={handleRun}
                >
                  <span className="material-icons text-sm">play_arrow</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p className="text-xs">Run</p>
              </TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="h-8 w-8 p-0 text-[#A0A0A0] hover:text-[#E1E1E1] hover:bg-[#333333]"
                  onClick={handleShare}
                >
                  <span className="material-icons text-sm">share</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p className="text-xs">Share</p>
              </TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className={`h-8 w-8 p-0 hover:bg-[#333333] ${
                    isSplitView ? 'text-[#4D84FF]' : 'text-[#A0A0A0] hover:text-[#E1E1E1]'
                  }`}
                  onClick={handleToggleSplitView}
                >
                  <span className="material-icons text-sm">splitscreen</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p className="text-xs">Toggle Split View</p>
              </TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="h-8 w-8 p-0 text-[#A0A0A0] hover:text-[#E1E1E1] hover:bg-[#333333]"
                  onClick={() => setIsFullscreen(!isFullscreen)}
                >
                  <span className="material-icons text-sm">
                    {isFullscreen ? 'fullscreen_exit' : 'fullscreen'}
                  </span>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p className="text-xs">{isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      {/* Editor and terminal container */}
      <div className={`flex-1 flex ${isSplitView ? 'flex-col' : 'flex-col'} overflow-hidden`}>
        {isSplitView ? (
          // Split view mode
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
            <div className="flex-1 min-h-[200px] md:min-h-0 overflow-hidden">
              <div className="h-full flex flex-col">
                <div className="flex-1 relative overflow-hidden">
                  <textarea
                    ref={editorRef}
                    value={code}
                    onChange={handleCodeChange}
                    className="w-full h-full p-4 bg-[#1E1E1E] text-[#E1E1E1] font-mono text-sm resize-none border-0 focus:outline-none scrollbar-custom"
                    spellCheck="false"
                    style={{
                      backgroundColor: editorTheme.backgroundColor,
                      color: editorTheme.textColor,
                      caretColor: editorTheme.cursorColor,
                    }}
                  />
                </div>
              </div>
            </div>
            
            <div className="border-t md:border-t-0 md:border-l border-[#333333] flex-1 min-h-[200px] md:min-h-0 overflow-hidden">
              <Terminal 
                className="h-full rounded-none border-0"
                defaultCommands={[
                  { input: 'node script.js', output: output || 'No output' }
                ]}
              />
            </div>
          </div>
        ) : (
          // Tab view mode
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'editor' | 'terminal')} className="flex-1 flex flex-col">
            <TabsList className="bg-[#252525] p-0 h-auto border-b border-[#333333]">
              <TabsTrigger 
                value="editor" 
                className={`px-4 py-1.5 ${activeTab === 'editor' ? 'bg-[#1E1E1E] text-[#E1E1E1]' : 'bg-[#252525] text-[#A0A0A0]'}`}
              >
                Editor
              </TabsTrigger>
              <TabsTrigger 
                value="terminal" 
                className={`px-4 py-1.5 ${activeTab === 'terminal' ? 'bg-[#1E1E1E] text-[#E1E1E1]' : 'bg-[#252525] text-[#A0A0A0]'}`}
              >
                Terminal
              </TabsTrigger>
            </TabsList>

            <TabsContent value="editor" className="flex-1 p-0 m-0 outline-none">
              <div className="h-full relative overflow-hidden">
                <textarea
                  ref={editorRef}
                  value={code}
                  onChange={handleCodeChange}
                  className="w-full h-full p-4 bg-[#1E1E1E] text-[#E1E1E1] font-mono text-sm resize-none border-0 focus:outline-none scrollbar-custom"
                  spellCheck="false"
                  style={{
                    backgroundColor: editorTheme.backgroundColor,
                    color: editorTheme.textColor,
                    caretColor: editorTheme.cursorColor,
                  }}
                />
              </div>
            </TabsContent>
            
            <TabsContent value="terminal" className="flex-1 p-0 m-0 outline-none">
              <Terminal 
                className="h-full rounded-none border-0"
                defaultCommands={[
                  { input: 'node script.js', output: output || 'No output' }
                ]}
              />
            </TabsContent>
          </Tabs>
        )}
      </div>
      
      {/* Editor footer */}
      <div className="bg-[#252525] px-3 py-1 border-t border-[#333333] flex items-center justify-between">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="sm"
            className="h-6 text-xs text-[#A0A0A0] hover:text-[#E1E1E1] hover:bg-[#333333]"
            onClick={handleRun}
          >
            <span className="material-icons text-xs mr-1">play_arrow</span>
            Run
          </Button>
        </div>
        
        <div className="text-[#A0A0A0] text-xs">
          Ln 1, Col 1
        </div>
      </div>
    </div>
  );
}