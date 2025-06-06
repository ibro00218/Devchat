import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface Command {
  input: string;
  output: string;
  isError?: boolean;
}

interface TerminalProps {
  className?: string;
  defaultCommands?: Command[];
}

export function Terminal({ className, defaultCommands = [] }: TerminalProps) {
  const [commandHistory, setCommandHistory] = useState<Command[]>(defaultCommands);
  const [inputValue, setInputValue] = useState('');
  const [commandIndex, setCommandIndex] = useState(-1);
  
  const terminalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Scroll to bottom when commands change
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [commandHistory]);
  
  // Focus input on mount
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };
  
  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Handle up arrow for command history
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      
      // Calculate the previous command index, ensuring it doesn't go below 0
      const prevIndex = Math.max(0, commandIndex === -1 ? commandHistory.length - 1 : commandIndex - 1);
      setCommandIndex(prevIndex);
      
      if (commandHistory[prevIndex]) {
        setInputValue(commandHistory[prevIndex].input);
      }
    }
    
    // Handle down arrow for command history
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      
      if (commandIndex === -1) return;
      
      // Calculate the next command index
      const nextIndex = commandIndex + 1;
      
      if (nextIndex >= commandHistory.length) {
        // Reset to empty input if we've reached the end of history
        setCommandIndex(-1);
        setInputValue('');
      } else {
        setCommandIndex(nextIndex);
        setInputValue(commandHistory[nextIndex].input);
      }
    }
    
    // Handle enter to execute command
    if (e.key === 'Enter' && inputValue.trim()) {
      executeCommand(inputValue);
    }
  };
  
  const executeCommand = (input: string) => {
    let output = '';
    let isError = false;
    
    // Skip empty commands
    if (!input.trim()) {
      return;
    }
    
    const commandParts = input.trim().split(' ');
    const command = commandParts[0];
    const args = commandParts.slice(1);
    
    // Simple command processing
    switch (command) {
      case 'help':
        output = `
Available commands:
  help                Display this help message
  clear               Clear the terminal
  echo [text]         Display text in the terminal
  date                Display current date and time
  ls                  List available commands
  whoami              Display current user
  version             Display terminal version
  node [file.js]      Run JavaScript in node environment
  python [file.py]    Run Python code file
  npm [command]       Run npm commands
  git [command]       Run git commands
`;
        break;
        
      case 'clear':
        setCommandHistory([]);
        return;
        
      case 'echo':
        output = input.substring(5);
        break;
        
      case 'date':
        output = new Date().toString();
        break;
        
      case 'ls':
        output = 'help  clear  echo  date  ls  whoami  version  node  python  npm  git';
        break;
        
      case 'whoami':
        output = 'developer';
        break;
        
      case 'version':
        output = 'DevChat Terminal v1.0.0';
        break;
        
      case 'node':
        if (args.length === 0) {
          output = 'Node.js REPL (Read-Eval-Print Loop)\nType JavaScript code to execute it.\nUse .exit to exit the REPL.';
        } else if (args[0].endsWith('.js')) {
          output = `Executing ${args[0]}...\n\nConsole output:\n> Hello from JavaScript!\n> Script completed successfully.`;
        } else {
          output = `Error: Invalid JavaScript file: ${args[0]}`;
          isError = true;
        }
        break;
        
      case 'python':
        if (args.length === 0) {
          output = 'Python 3.11.0 Interpreter\nType Python code to execute it.\nUse exit() to exit the interpreter.';
        } else if (args[0].endsWith('.py')) {
          output = `Executing ${args[0]}...\n\nConsole output:\n>>> Hello from Python!\n>>> Script completed successfully.`;
        } else {
          output = `Error: Invalid Python file: ${args[0]}`;
          isError = true;
        }
        break;
        
      case 'npm':
        if (args.length === 0) {
          output = 'npm <command>\n\nUsage:\n  npm install [package]\n  npm run [script]\n  npm test\n\nFor more information, see npm help';
        } else if (args[0] === 'run') {
          output = `> ${args[1] || 'start'}\n\nServer started at http://localhost:3000\nReady for connections...`;
        } else if (args[0] === 'install') {
          output = `Installing ${args[1] || 'dependencies'}...\n\nAdded 350 packages in 3.2s\nFound 0 vulnerabilities`;
        } else {
          output = `Running npm ${args.join(' ')}...\nOperation completed successfully.`;
        }
        break;
        
      case 'git':
        if (args.length === 0) {
          output = 'usage: git [--version] [--help] <command> [<args>]';
        } else if (args[0] === 'status') {
          output = 'On branch main\nYour branch is up to date with \'origin/main\'.\n\nnothing to commit, working tree clean';
        } else if (args[0] === 'commit') {
          output = '[main 5a7e8b9] ' + (args.slice(2).join(' ') || 'Update files') + '\n 2 files changed, 15 insertions(+), 5 deletions(-)';
        } else {
          output = `Git operation '${args.join(' ')}' completed.`;
        }
        break;
        
      default:
        output = `Command not found: ${command}. Type 'help' for available commands.`;
        isError = true;
    }
    
    // Add command to history
    setCommandHistory([...commandHistory, { input, output, isError }]);
    setInputValue('');
    setCommandIndex(-1);
  };
  
  return (
    <div 
      className={cn(
        "bg-[#1E1E1E] text-[#E1E1E1] font-mono text-sm p-4 flex flex-col border border-[#333333] rounded-md",
        className
      )}
    >
      {/* Terminal header */}
      <div className="flex items-center justify-between mb-2 pb-2 border-b border-[#333333]">
        <div className="flex items-center">
          <span className="material-icons text-sm mr-2">terminal</span>
          <span className="text-sm font-semibold">Terminal</span>
        </div>
        <div className="flex space-x-1">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
        </div>
      </div>
      
      {/* Command output area */}
      <div 
        ref={terminalRef}
        className="flex-1 overflow-y-auto mb-4 scrollbar-custom"
      >
        {/* Welcome message */}
        {commandHistory.length === 0 && (
          <div className="mb-2">
            <div className="text-green-400">DevChat Terminal v1.0.0</div>
            <div className="text-[#A0A0A0]">Type 'help' for available commands.</div>
            <div className="mb-2"></div>
          </div>
        )}
        
        {/* Command history */}
        {commandHistory.map((command, index) => (
          <div key={index} className="mb-2">
            <div className="flex">
              <span className="text-green-400 mr-2">developer@devchat:~$</span>
              <span>{command.input}</span>
            </div>
            {command.output && (
              <pre className={cn(
                "whitespace-pre-wrap mt-1",
                command.isError ? "text-red-400" : "text-[#E1E1E1]"
              )}>
                {command.output}
              </pre>
            )}
          </div>
        ))}
      </div>
      
      {/* Command input */}
      <div className="flex items-center">
        <span className="text-green-400 mr-2">developer@devchat:~$</span>
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleInputKeyDown}
          className="flex-1 bg-transparent outline-none"
          aria-label="Terminal input"
        />
      </div>
    </div>
  );
}