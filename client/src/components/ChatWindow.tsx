import { useRef, useEffect } from "react";
import { User, Message, Group } from "@/types/chat";
import { UserAvatar } from "./UserAvatar";
import { CodeBlock } from "./CodeBlock";
import { MessageInput } from "./MessageInput";
import { format } from "date-fns";

interface ChatWindowProps {
  currentUser: User | Group | null;
  isGroup: boolean;
  messages: Message[];
  users: User[];
  onSendMessage: (text: string) => void;
  onSendCode: (code: string, language: string) => void;
}

export function ChatWindow({ 
  currentUser, 
  isGroup, 
  messages, 
  users, 
  onSendMessage, 
  onSendCode 
}: ChatWindowProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Find user by ID
  const getUserById = (id: number): User | undefined => {
    return users.find(user => user.id === id);
  };

  // Format timestamp
  const formatTime = (date: Date): string => {
    return format(date, "h:mm a");
  };

  if (!currentUser) {
    return (
      <div className="flex-1 flex flex-col bg-[#1E1E1E] overflow-hidden items-center justify-center">
        <div className="text-[#A0A0A0] text-lg">
          Select a conversation to start chatting
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-[#1E1E1E] overflow-hidden">
      {/* Chat header */}
      <div className="px-4 py-3 border-b border-[#333333] flex items-center justify-between">
        <div className="flex items-center">
          {isGroup ? (
            <div className={cn("w-8 h-8 rounded flex items-center justify-center text-white", (currentUser as Group).color)}>
              <span className="material-icons text-sm">{(currentUser as Group).icon}</span>
            </div>
          ) : (
            <UserAvatar user={currentUser as User} />
          )}
          <div className="ml-2">
            <div className="text-[#E1E1E1] font-medium">{isGroup ? (currentUser as Group).name : (currentUser as User).username}</div>
          </div>
        </div>
        <div>
          <button className="text-[#A0A0A0] hover:text-[#E1E1E1]">
            <span className="material-icons">more_horiz</span>
          </button>
        </div>
      </div>
      
      {/* Chat messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-custom">
        {messages.map(message => {
          const sender = getUserById(message.senderId);
          if (!sender) return null;
          
          return (
            <div key={message.id} className="flex items-start message-new">
              <UserAvatar user={sender} />
              <div className="ml-2 flex-1">
                <div className="flex items-baseline">
                  <div className="font-medium text-[#E1E1E1]">{sender.username}</div>
                  <div className="ml-2 text-xs text-[#A0A0A0]">{formatTime(message.timestamp)}</div>
                </div>
                
                {message.text && (
                  <div className="mt-1 rounded-lg bg-[#252525] p-3 text-[#E1E1E1]">
                    {message.text}
                  </div>
                )}
                
                {message.codeSnippets?.map((snippet, index) => (
                  <CodeBlock 
                    key={index} 
                    snippet={snippet} 
                    className="mt-1"
                  />
                ))}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Message input */}
      <MessageInput 
        onSendMessage={onSendMessage}
        onSendCode={onSendCode}
      />
    </div>
  );
}

// Helper for class names
const cn = (...args: any[]) => args.filter(Boolean).join(' ');
