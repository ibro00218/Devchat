import { useState, useEffect, useCallback } from "react";
import { 
  ChatState, 
  User, 
  Group, 
  Message, 
  CodeSnippet, 
  FileAttachment, 
  GroupChannel, 
  CallSession, 
  MessageReaction,
  UserRole 
} from "@/types/chat";
import { useToast } from "@/hooks/use-toast";

// Initial mock data
const initialUsers: User[] = [
  { 
    id: 1, 
    username: "Iron3646",
    tagNumber: "1234",
    status: "online", 
    avatarInitial: "I", 
    avatarColor: "bg-emerald-700",
    joinedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // 30 days ago
  },
  { 
    id: 2, 
    username: "SkyCoder",
    tagNumber: "5678",
    status: "away", 
    avatarInitial: "S", 
    avatarColor: "bg-gray-700",
    joinedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000) // 20 days ago
  },
  { 
    id: 3, 
    username: "CodeMaster",
    tagNumber: "9012",
    status: "offline", 
    avatarInitial: "C", 
    avatarColor: "bg-gray-700",
    joinedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000) // 10 days ago
  }
];

const initialGroups: Group[] = [
  { 
    id: 1, 
    name: "Dev Team", 
    icon: "groups", 
    color: "bg-[#4D84FF]",
    description: "A team of awesome developers working on cool projects.",
    ownerId: 1,
    isPrivate: false,
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
  },
  { 
    id: 2, 
    name: "Python Devs", 
    icon: "terminal", 
    color: "bg-purple-700",
    description: "For Python enthusiasts and developers.",
    ownerId: 2,
    isPrivate: false,
    createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
  },
  { 
    id: 3, 
    name: "Bug Hunters", 
    icon: "bug_report", 
    color: "bg-yellow-700",
    description: "Finding and fixing bugs in open source projects.",
    ownerId: 3,
    isPrivate: true,
    createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
  }
];

const initialGroupMembers = [
  { userId: 1, groupId: 1, role: "admin" as UserRole, joinedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000) },
  { userId: 2, groupId: 1, role: "member" as UserRole, joinedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000) },
  { userId: 3, groupId: 1, role: "member" as UserRole, joinedAt: new Date(Date.now() - 13 * 24 * 60 * 60 * 1000) },
  
  { userId: 1, groupId: 2, role: "member" as UserRole, joinedAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000) },
  { userId: 2, groupId: 2, role: "admin" as UserRole, joinedAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000) },
  
  { userId: 2, groupId: 3, role: "member" as UserRole, joinedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000) },
  { userId: 3, groupId: 3, role: "admin" as UserRole, joinedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000) }
];

const initialChannels: GroupChannel[] = [
  { id: 1, groupId: 1, name: "general", type: "text", isPrivate: false },
  { id: 2, groupId: 1, name: "code-review", type: "text", isPrivate: false },
  { id: 3, groupId: 1, name: "team-calls", type: "voice", isPrivate: false },
  
  { id: 4, groupId: 2, name: "python-help", type: "text", isPrivate: false },
  { id: 5, groupId: 2, name: "projects", type: "text", isPrivate: false },
  
  { id: 6, groupId: 3, name: "bug-reports", type: "text", isPrivate: false },
  { id: 7, groupId: 3, name: "private-fixes", type: "text", isPrivate: true }
];

// Initial sample messages with reactions and file attachments
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
      ],
      isEdited: false
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
      ],
      reactions: [
        { userId: 1, emoji: "👍", timestamp: new Date(Date.now() - 3300000) }
      ],
      isEdited: false
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
      ],
      reactions: [
        { userId: 2, emoji: "🔥", timestamp: new Date(Date.now() - 2900000) },
        { userId: 3, emoji: "👏", timestamp: new Date(Date.now() - 2800000) }
      ],
      isEdited: false
    },
  ],
  "group_1": [
    {
      id: 4,
      senderId: 1,
      groupId: 1,
      channelId: 1,
      timestamp: new Date(Date.now() - 2500000),
      text: "Hey team, I've been working on a new feature. Check out this code:",
      codeSnippets: [
        {
          language: "javascript",
          code: "function fetchData() {\n  return fetch('/api/data')\n    .then(res => res.json())\n    .then(data => console.log(data))\n    .catch(err => console.error(err));\n}"
        }
      ],
      reactions: [
        { userId: 2, emoji: "👍", timestamp: new Date(Date.now() - 2400000) }
      ],
      isEdited: false
    },
    {
      id: 5,
      senderId: 2,
      groupId: 1,
      channelId: 1,
      timestamp: new Date(Date.now() - 2300000),
      text: "Looks good! Have you considered using async/await instead?",
      isEdited: false
    },
    {
      id: 6,
      senderId: 3,
      groupId: 1,
      channelId: 1,
      timestamp: new Date(Date.now() - 2200000),
      text: "Here's an async version:",
      codeSnippets: [
        {
          language: "javascript",
          code: "async function fetchData() {\n  try {\n    const res = await fetch('/api/data');\n    const data = await res.json();\n    console.log(data);\n  } catch (err) {\n    console.error(err);\n  }\n}"
        }
      ],
      fileAttachments: [
        {
          id: 1,
          name: "async-example.js",
          type: "application/javascript",
          size: 1024,
          url: "https://example.com/files/async-example.js",
          uploadedAt: new Date(Date.now() - 2200000)
        }
      ],
      reactions: [
        { userId: 1, emoji: "🚀", timestamp: new Date(Date.now() - 2100000) },
        { userId: 2, emoji: "🚀", timestamp: new Date(Date.now() - 2000000) }
      ],
      isEdited: false
    }
  ]
};

export function useChat() {
  const [chatState, setChatState] = useState<ChatState>({
    users: initialUsers,
    groups: initialGroups,
    channels: initialChannels,
    currentChat: { type: "user", id: 1 },
    messages: initialMessages,
    activeCall: null,
    currentUser: initialUsers[0], // Current logged-in user is Iron3646
    notifications: [],
    onlineUsers: new Set([1, 2]) // Users 1 and 2 are online
  });
  
  const { toast } = useToast();
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [groupMembersMap, setGroupMembersMap] = useState(
    initialGroupMembers.map(member => ({
      ...member,
      user: initialUsers.find(u => u.id === member.userId)!
    }))
  );
  const [currentChannel, setCurrentChannel] = useState<GroupChannel | null>(null);

  // Initialize WebSocket connection
  useEffect(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const ws = new WebSocket("wss://<https://devchat-server.onrender.com>/ws");
    
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

  // Update current channel when selecting a group
  useEffect(() => {
    if (chatState.currentChat?.type === 'group') {
      const groupId = chatState.currentChat.id;
      const groupChannels = chatState.channels.filter(c => c.groupId === groupId);
      
      if (groupChannels.length > 0) {
        setCurrentChannel(groupChannels[0]);
      } else {
        setCurrentChannel(null);
      }
    } else {
      setCurrentChannel(null);
    }
  }, [chatState.currentChat, chatState.channels]);

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

  // Select a channel
  const selectChannel = useCallback((channelId: number) => {
    const channel = chatState.channels.find(c => c.id === channelId);
    if (channel) {
      setCurrentChannel(channel);
    }
  }, [chatState.channels]);

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
      senderId: chatState.currentUser.id, // Current user ID
      timestamp: new Date(),
      text,
      isEdited: false
    };
    
    if (type === 'group' && currentChannel) {
      newMessage.groupId = id;
      newMessage.channelId = currentChannel.id;
    } else if (type === 'user') {
      newMessage.recipientId = id;
    }
    
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
  }, [chatState.currentChat, chatState.currentUser.id, currentChannel, isConnected, socket]);

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
      senderId: chatState.currentUser.id, // Current user ID
      timestamp: new Date(),
      codeSnippets: [codeSnippet],
      isEdited: false
    };
    
    if (type === 'group' && currentChannel) {
      newMessage.groupId = id;
      newMessage.channelId = currentChannel.id;
    } else if (type === 'user') {
      newMessage.recipientId = id;
    }
    
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
  }, [chatState.currentChat, chatState.currentUser.id, currentChannel, isConnected, socket]);

  // Send file attachments
  const sendFileAttachments = useCallback((files: File[]) => {
    if (!chatState.currentChat || files.length === 0) return;
    
    const { type, id } = chatState.currentChat;
    const chatKey = `${type}_${id}`;
    
    // Convert File objects to FileAttachment objects
    const fileAttachments: FileAttachment[] = files.map((file, index) => ({
      id: Date.now() + index,
      name: file.name,
      type: file.type,
      size: file.size,
      url: URL.createObjectURL(file),
      uploadedAt: new Date()
    }));
    
    const newMessage: Message = {
      id: Date.now(),
      senderId: chatState.currentUser.id,
      timestamp: new Date(),
      fileAttachments,
      isEdited: false
    };
    
    if (type === 'group' && currentChannel) {
      newMessage.groupId = id;
      newMessage.channelId = currentChannel.id;
    } else if (type === 'user') {
      newMessage.recipientId = id;
    }
    
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
    
    // In a real implementation, you would upload the files to a server here
    toast({
      title: "Files Attached",
      description: `${files.length} file(s) attached to the message`
    });
    
  }, [chatState.currentChat, chatState.currentUser.id, currentChannel, toast]);

  // Start a call
  const startCall = useCallback((type: "audio" | "video") => {
    if (!chatState.currentChat) return;
    
    const call: CallSession = {
      id: `call-${Date.now()}`,
      initiatorId: chatState.currentUser.id,
      participants: [chatState.currentUser.id],
      type,
      startTime: new Date(),
      isActive: true,
      isScreenSharing: false
    };
    
    if (chatState.currentChat.type === 'group') {
      call.groupId = chatState.currentChat.id;
      if (currentChannel) {
        call.channelId = currentChannel.id;
      }
    }
    
    setChatState(prev => ({
      ...prev,
      activeCall: call
    }));
    
    toast({
      title: `${type === 'audio' ? 'Voice' : 'Video'} Call Started`,
      description: "Call is now active"
    });
  }, [chatState.currentChat, chatState.currentUser.id, currentChannel, toast]);

  // End a call
  const endCall = useCallback(() => {
    setChatState(prev => {
      if (prev.activeCall) {
        return {
          ...prev,
          activeCall: {
            ...prev.activeCall,
            isActive: false,
            endTime: new Date()
          }
        };
      }
      return prev;
    });
    
    toast({
      title: "Call Ended",
      description: "Call has been terminated"
    });
  }, [toast]);

  // Join a call
  const joinCall = useCallback(() => {
    setChatState(prev => {
      if (prev.activeCall) {
        return {
          ...prev,
          activeCall: {
            ...prev.activeCall,
            participants: [...prev.activeCall.participants, chatState.currentUser.id]
          }
        };
      }
      return prev;
    });
  }, [chatState.currentUser.id]);

  // Toggle screen sharing
  const toggleScreenSharing = useCallback(() => {
    setChatState(prev => {
      if (prev.activeCall) {
        return {
          ...prev,
          activeCall: {
            ...prev.activeCall,
            isScreenSharing: !prev.activeCall.isScreenSharing
          }
        };
      }
      return prev;
    });
  }, []);

  // Create a new party (group)
  const createNewParty = useCallback(() => {
    const newGroupId = Math.max(...chatState.groups.map(g => g.id)) + 1;
    
    const newGroup: Group = {
      id: newGroupId,
      name: `New Party ${newGroupId}`,
      icon: "group_add",
      color: "bg-indigo-700",
      description: "A new group for collaboration",
      ownerId: chatState.currentUser.id,
      isPrivate: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // Create a general channel for the new group
    const newChannelId = Math.max(...chatState.channels.map(c => c.id)) + 1;
    const newChannel: GroupChannel = {
      id: newChannelId,
      groupId: newGroupId,
      name: "general",
      type: "text",
      isPrivate: false
    };
    
    // Add creator as admin
    const newGroupMember = {
      userId: chatState.currentUser.id,
      groupId: newGroupId,
      role: "admin" as UserRole,
      joinedAt: new Date(),
      user: chatState.currentUser
    };
    
    setChatState(prev => ({
      ...prev,
      groups: [...prev.groups, newGroup],
      channels: [...prev.channels, newChannel],
      currentChat: { type: "group", id: newGroupId }
    }));
    
    setGroupMembersMap(prev => [...prev, newGroupMember]);
    setCurrentChannel(newChannel);
    
    toast({
      title: "New Party Created",
      description: `${newGroup.name} has been created`,
    });
  }, [chatState.groups, chatState.channels, chatState.currentUser, toast]);

  // Add reaction to message
  const addMessageReaction = useCallback((messageId: number, emoji: string) => {
    if (!chatState.currentChat) return;
    
    const { type, id } = chatState.currentChat;
    const chatKey = `${type}_${id}`;
    
    const reaction: MessageReaction = {
      userId: chatState.currentUser.id,
      emoji,
      timestamp: new Date()
    };
    
    setChatState(prev => {
      const messages = prev.messages[chatKey] || [];
      const messageIndex = messages.findIndex(m => m.id === messageId);
      
      if (messageIndex === -1) return prev;
      
      const message = messages[messageIndex];
      const reactions = message.reactions || [];
      
      // Remove existing reaction with same emoji from same user
      const existingReactionIndex = reactions.findIndex(
        r => r.userId === chatState.currentUser.id && r.emoji === emoji
      );
      
      let newReactions;
      if (existingReactionIndex !== -1) {
        // Remove reaction if it already exists (toggle functionality)
        newReactions = [
          ...reactions.slice(0, existingReactionIndex),
          ...reactions.slice(existingReactionIndex + 1)
        ];
      } else {
        // Add new reaction
        newReactions = [...reactions, reaction];
      }
      
      const updatedMessage = {
        ...message,
        reactions: newReactions
      };
      
      const updatedMessages = [
        ...messages.slice(0, messageIndex),
        updatedMessage,
        ...messages.slice(messageIndex + 1)
      ];
      
      return {
        ...prev,
        messages: {
          ...prev.messages,
          [chatKey]: updatedMessages
        }
      };
    });
  }, [chatState.currentChat, chatState.currentUser.id]);

  // Edit message
  const editMessage = useCallback((messageId: number, newText: string) => {
    if (!chatState.currentChat) return;
    
    const { type, id } = chatState.currentChat;
    const chatKey = `${type}_${id}`;
    
    setChatState(prev => {
      const messages = prev.messages[chatKey] || [];
      const messageIndex = messages.findIndex(m => m.id === messageId);
      
      if (messageIndex === -1) return prev;
      
      const message = messages[messageIndex];
      
      // Only allow editing your own messages
      if (message.senderId !== chatState.currentUser.id) return prev;
      
      const updatedMessage = {
        ...message,
        text: newText,
        isEdited: true
      };
      
      const updatedMessages = [
        ...messages.slice(0, messageIndex),
        updatedMessage,
        ...messages.slice(messageIndex + 1)
      ];
      
      return {
        ...prev,
        messages: {
          ...prev.messages,
          [chatKey]: updatedMessages
        }
      };
    });
  }, [chatState.currentChat, chatState.currentUser.id]);

  // Delete message
  const deleteMessage = useCallback((messageId: number) => {
    if (!chatState.currentChat) return;
    
    const { type, id } = chatState.currentChat;
    const chatKey = `${type}_${id}`;
    
    setChatState(prev => {
      const messages = prev.messages[chatKey] || [];
      const messageIndex = messages.findIndex(m => m.id === messageId);
      
      if (messageIndex === -1) return prev;
      
      const message = messages[messageIndex];
      
      // Only allow deleting your own messages
      if (message.senderId !== chatState.currentUser.id) return prev;
      
      const updatedMessages = [
        ...messages.slice(0, messageIndex),
        ...messages.slice(messageIndex + 1)
      ];
      
      return {
        ...prev,
        messages: {
          ...prev.messages,
          [chatKey]: updatedMessages
        }
      };
    });
  }, [chatState.currentChat, chatState.currentUser.id]);

  // Update group
  const updateGroup = useCallback((groupId: number, updates: Partial<Group>) => {
    setChatState(prev => {
      const groupIndex = prev.groups.findIndex(g => g.id === groupId);
      
      if (groupIndex === -1) return prev;
      
      const group = prev.groups[groupIndex];
      const updatedGroup = {
        ...group,
        ...updates,
        updatedAt: new Date()
      };
      
      const updatedGroups = [
        ...prev.groups.slice(0, groupIndex),
        updatedGroup,
        ...prev.groups.slice(groupIndex + 1)
      ];
      
      return {
        ...prev,
        groups: updatedGroups
      };
    });
  }, []);

  // Get group members for current group
  const getCurrentGroupMembers = useCallback(() => {
    if (chatState.currentChat?.type !== 'group') return [];
    
    return groupMembersMap.filter(m => m.groupId === chatState.currentChat?.id);
  }, [chatState.currentChat, groupMembersMap]);

  return {
    users: chatState.users,
    groups: chatState.groups,
    channels: chatState.channels,
    currentChat: chatState.currentChat,
    currentChatEntity: getCurrentChatEntity(),
    currentChannel,
    messages: getCurrentMessages(),
    groupMembers: getCurrentGroupMembers(),
    activeCall: chatState.activeCall,
    currentUser: chatState.currentUser,
    selectChat,
    selectChannel,
    sendMessage,
    sendCodeSnippet,
    sendFileAttachments,
    startCall,
    endCall,
    joinCall,
    toggleScreenSharing,
    createNewParty,
    addMessageReaction,
    editMessage,
    deleteMessage,
    updateGroup,
    isConnected
  };
}
