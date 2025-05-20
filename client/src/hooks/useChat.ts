import { useState, useEffect, useCallback } from "react";
import { ChatState, User, Group, Message, CodeSnippet } from "@/types/chat";
import { useToast } from "@/hooks/use-toast";

// Initial mock data
const initialUsers: User[] = [
  { 
    id: 1, 
    username: "Iron3646", 
    status: "online", 
    avatarInitial: "I", 
    avatarColor: "bg-emerald-700" 
  },
  { 
    id: 2, 
    username: "SkyCoder", 
    status: "away", 
    avatarInitial: "S", 
    avatarColor: "bg-gray-700" 
  },
  { 
    id: 3, 
    username: "CodeMaster", 
    status: "offline", 
    avatarInitial: "C", 
    avatarColor: "bg-gray-700" 
  }
];

const initialGroups: Group[] = [
  { id: 1, name: "Dev Team", icon: "groups", color: "bg-[#4D84FF]" },
  { id: 2, name: "Python Devs", icon: "terminal", color: "bg-purple-700" },
  { id: 3, name: "Bug Hunters", icon: "bug_report", color: "bg-yellow-700" }
];

// Initial sample messages
const initialMessages = {
  "user_1": [
    {
      id: 1,
      senderId: 1,
      timestamp: new Date(Date.now() - 3600000),
      codeSnippets: [
        {
          language: "javascript",
          code: "const sum = (a, b) => a + b;\nconsole.log(sum(2, 3));"
        }
      ]
    },
    {
      id: 2,
      senderId: 2,
      timestamp: new Date(Date.now() - 3400000),
      text: "Nice! I like how you're using arrow functions. Here's a Python version:",
      codeSnippets: [
        {
          language: "python",
          code: "def sum(a, b):\n    return a + b\n    \nprint(sum(2, 3))"
        }
      ]
    },
    {
      id: 3,
      senderId: 1,
      timestamp: new Date(Date.now() - 3000000),
      text: "Here's how we could do it in TypeScript with strong typing:",
      codeSnippets: [
        {
          language: "typescript",
          code: "const sum = (a: number, b: number): number => a + b;\nconsole.log(sum(2, 3)); // 5"
        }
      ]
    },
  ]
};

export function useChat() {
  const [chatState, setChatState] = useState<ChatState>({
    users: initialUsers,
    groups: initialGroups,
    currentChat: { type: "user", id: 1 },
    messages: initialMessages
  });
  
  const { toast } = useToast();
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  // Initialize WebSocket connection
  useEffect(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const ws = new WebSocket(`${protocol}//${window.location.host}/ws`);
    
    ws.onopen = () => {
      setIsConnected(true);
      setSocket(ws);
    };
    
    ws.onclose = () => {
      setIsConnected(false);
      setSocket(null);
    };
    
    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      toast({
        title: "Connection Error",
        description: "Could not connect to chat server",
        variant: "destructive",
      });
    };
    
    // Cleanup on unmount
    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  }, [toast]);

  // Handle incoming WebSocket messages
  useEffect(() => {
    if (!socket) return;
    
    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        if (data.type === 'message') {
          setChatState(prev => {
            const chatKey = `${data.message.chatType}_${data.message.chatId}`;
            const messages = prev.messages[chatKey] || [];
            
            return {
              ...prev,
              messages: {
                ...prev.messages,
                [chatKey]: [...messages, data.message]
              }
            };
          });
        }
      } catch (error) {
        console.error('Error processing message:', error);
      }
    };
  }, [socket]);

  // Select a chat
  const selectChat = useCallback((type: "user" | "group", id: number) => {
    setChatState(prev => ({
      ...prev,
      currentChat: { type, id }
    }));
  }, []);

  // Get current chat messages
  const getCurrentMessages = useCallback(() => {
    if (!chatState.currentChat) return [];
    
    const { type, id } = chatState.currentChat;
    const chatKey = `${type}_${id}`;
    
    return chatState.messages[chatKey] || [];
  }, [chatState.currentChat, chatState.messages]);

  // Get current chat entity (user or group)
  const getCurrentChatEntity = useCallback(() => {
    if (!chatState.currentChat) return null;
    
    const { type, id } = chatState.currentChat;
    if (type === "user") {
      return chatState.users.find(user => user.id === id) || null;
    } else {
      return chatState.groups.find(group => group.id === id) || null;
    }
  }, [chatState.currentChat, chatState.users, chatState.groups]);

  // Send a text message
  const sendMessage = useCallback((text: string) => {
    if (!chatState.currentChat) return;
    
    const { type, id } = chatState.currentChat;
    const chatKey = `${type}_${id}`;
    
    const newMessage: Message = {
      id: Date.now(),
      senderId: 1, // Current user ID
      timestamp: new Date(),
      text
    };
    
    setChatState(prev => {
      const messages = prev.messages[chatKey] || [];
      
      return {
        ...prev,
        messages: {
          ...prev.messages,
          [chatKey]: [...messages, newMessage]
        }
      };
    });
    
    // Send to server if connected
    if (isConnected && socket) {
      socket.send(JSON.stringify({
        type: 'message',
        message: {
          ...newMessage,
          chatType: type,
          chatId: id
        }
      }));
    }
  }, [chatState.currentChat, isConnected, socket]);

  // Send a code snippet
  const sendCodeSnippet = useCallback((code: string, language: string) => {
    if (!chatState.currentChat) return;
    
    const { type, id } = chatState.currentChat;
    const chatKey = `${type}_${id}`;
    
    const codeSnippet: CodeSnippet = {
      language,
      code
    };
    
    const newMessage: Message = {
      id: Date.now(),
      senderId: 1, // Current user ID
      timestamp: new Date(),
      codeSnippets: [codeSnippet]
    };
    
    setChatState(prev => {
      const messages = prev.messages[chatKey] || [];
      
      return {
        ...prev,
        messages: {
          ...prev.messages,
          [chatKey]: [...messages, newMessage]
        }
      };
    });
    
    // Send to server if connected
    if (isConnected && socket) {
      socket.send(JSON.stringify({
        type: 'message',
        message: {
          ...newMessage,
          chatType: type,
          chatId: id
        }
      }));
    }
  }, [chatState.currentChat, isConnected, socket]);

  // Create a new party (group)
  const createNewParty = useCallback(() => {
    const newGroupId = Math.max(...chatState.groups.map(g => g.id)) + 1;
    
    const newGroup: Group = {
      id: newGroupId,
      name: `New Party ${newGroupId}`,
      icon: "group_add",
      color: "bg-indigo-700"
    };
    
    setChatState(prev => ({
      ...prev,
      groups: [...prev.groups, newGroup],
      currentChat: { type: "group", id: newGroupId }
    }));
    
    toast({
      title: "New Party Created",
      description: `${newGroup.name} has been created`,
    });
  }, [chatState.groups, toast]);

  return {
    users: chatState.users,
    groups: chatState.groups,
    currentChat: chatState.currentChat,
    currentChatEntity: getCurrentChatEntity(),
    messages: getCurrentMessages(),
    selectChat,
    sendMessage,
    sendCodeSnippet,
    createNewParty,
    isConnected
  };
}
