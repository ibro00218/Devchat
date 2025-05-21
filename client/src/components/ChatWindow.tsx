import { useRef, useEffect, useState } from "react";
import { User, Message, Group, GroupChannel, FileAttachment as FileAttachmentType, CallSession } from "@/types/chat";
import { UserAvatar } from "./UserAvatar";
import { CodeBlock } from "./CodeBlock";
import { FileAttachment } from "./FileAttachment";
import { MessageInput } from "./MessageInput";
import { CodeEditor } from "./CodeEditor";
import { Terminal } from "./Terminal";
import { CallInterface } from "./CallInterface";
import { GroupManagement } from "./GroupManagement";
import { format, isToday, isYesterday } from "date-fns";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ChatWindowProps {
  currentUser: User | Group | null;
  isGroup: boolean;
  messages: Message[];
  users: User[];
  channels?: GroupChannel[];
  currentChannel?: GroupChannel | null;
  groupMembers?: Array<{ userId: number; role: string; joinedAt: Date; user: User }>;
  activeCall?: CallSession | null;
  loggedInUser: User;
  onSendMessage: (text: string) => void;
  onSendCode: (code: string, language: string) => void;
  onSendAttachments?: (files: File[]) => void;
  onStartCall?: (type: "audio" | "video") => void;
  onEndCall?: () => void;
  onJoinCall?: () => void;
  onShareScreen?: () => void;
  onToggleMute?: () => void;
  onToggleVideo?: () => void;
  onUpdateGroup?: (groupId: number, updates: Partial<Group>) => void;
  onSelectChannel?: (channelId: number) => void;
  onMessageReaction?: (messageId: number, emoji: string) => void;
  onEditMessage?: (messageId: number, newText: string) => void;
  onDeleteMessage?: (messageId: number) => void;
}

export function ChatWindow({ 
  currentUser, 
  isGroup, 
  messages, 
  users, 
  channels = [],
  currentChannel = null,
  groupMembers = [],
  activeCall = null,
  loggedInUser,
  onSendMessage, 
  onSendCode,
  onSendAttachments,
  onStartCall,
  onEndCall,
  onJoinCall,
  onShareScreen,
  onToggleMute,
  onToggleVideo,
  onUpdateGroup,
  onSelectChannel,
  onMessageReaction,
  onEditMessage,
  onDeleteMessage
}: ChatWindowProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [headerMenuOpen, setHeaderMenuOpen] = useState(false);
  const [isCodeEditorOpen, setIsCodeEditorOpen] = useState(false);
  const [isTerminalOpen, setIsTerminalOpen] = useState(false);
  const [editingMessageId, setEditingMessageId] = useState<number | null>(null);
  const [editMessageText, setEditMessageText] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<string>("chat");

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

  // Group messages by date
  const groupMessagesByDate = (messages: Message[]) => {
    const groups: { [key: string]: Message[] } = {};
    
    messages.forEach(message => {
      let dateKey;
      
      if (isToday(message.timestamp)) {
        dateKey = "Today";
      } else if (isYesterday(message.timestamp)) {
        dateKey = "Yesterday";
      } else {
        dateKey = format(message.timestamp, "MMMM d, yyyy");
      }
      
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      
      groups[dateKey].push(message);
    });
    
    return groups;
  };

  const messageGroups = groupMessagesByDate(messages);

  // Handle voice call
  const handleVoiceCall = () => {
    if (onStartCall) {
      onStartCall("audio");
    }
  };

  // Handle video call
  const handleVideoCall = () => {
    if (onStartCall) {
      onStartCall("video");
    }
  };

  // Handle screen share
  const handleScreenShare = () => {
    if (onShareScreen) {
      onShareScreen();
    }
  };

  // Handle editing message
  const handleEditMessage = (message: Message) => {
    setEditingMessageId(message.id);
    setEditMessageText(message.text || "");
  };

  // Handle saving edited message
  const handleSaveEditedMessage = () => {
    if (editingMessageId && onEditMessage) {
      onEditMessage(editingMessageId, editMessageText);
      setEditingMessageId(null);
    }
  };

  // Handle deleting message
  const handleDeleteMessage = (messageId: number) => {
    if (onDeleteMessage) {
      onDeleteMessage(messageId);
    }
  };

  // Handle adding reaction
  const handleAddReaction = (messageId: number, emoji: string) => {
    if (onMessageReaction) {
      onMessageReaction(messageId, emoji);
      setShowEmojiPicker(null);
    }
  };

  // Common emojis for reactions
  const commonEmojis = ["👍", "❤️", "😂", "🎉", "🚀", "👏", "🔥", "✅"];

  // Get current user's role in group
  const currentUserMember = isGroup 
    ? groupMembers.find(member => member.userId === loggedInUser.id) 
    : undefined;
  const isAdmin = currentUserMember?.role === "admin" || 
                 (isGroup && (currentUser as Group).ownerId === loggedInUser.id);

  // Handle channel selection
  const handleChannelSelect = (channelId: number) => {
    if (onSelectChannel) {
      onSelectChannel(channelId);
    }
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
            <div className="text-[#E1E1E1] font-medium">
              {isGroup ? (currentUser as Group).name : (currentUser as User).username}
              {currentChannel && (
                <span className="ml-2 text-[#A0A0A0] text-sm">
                  #{currentChannel.name}
                </span>
              )}
            </div>
            {isGroup && (currentUser as Group).description && (
              <div className="text-xs text-[#A0A0A0] truncate max-w-md">
                {(currentUser as Group).description}
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {!activeCall && (
            <>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-[#A0A0A0] hover:text-[#E1E1E1] hover:bg-[#333333]"
                      onClick={handleVoiceCall}
                    >
                      <span className="material-icons text-sm">call</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    <p className="text-xs">Voice Call</p>
                  </TooltipContent>
                </Tooltip>
                
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-[#A0A0A0] hover:text-[#E1E1E1] hover:bg-[#333333]"
                      onClick={handleVideoCall}
                    >
                      <span className="material-icons text-sm">videocam</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    <p className="text-xs">Video Call</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </>
          )}
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-[#A0A0A0] hover:text-[#E1E1E1] hover:bg-[#333333]"
                  onClick={() => setIsCodeEditorOpen(true)}
                >
                  <span className="material-icons text-sm">code</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p className="text-xs">Code Editor</p>
              </TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-[#A0A0A0] hover:text-[#E1E1E1] hover:bg-[#333333]"
                  onClick={() => setIsTerminalOpen(true)}
                >
                  <span className="material-icons text-sm">terminal</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p className="text-xs">Terminal</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-[#A0A0A0] hover:text-[#E1E1E1] hover:bg-[#333333]"
              onClick={() => setHeaderMenuOpen(!headerMenuOpen)}
            >
              <span className="material-icons text-sm">more_horiz</span>
            </Button>
            
            {headerMenuOpen && (
              <div className="absolute right-0 mt-1 bg-[#252525] border border-[#333333] rounded-md shadow-lg w-48 py-1 z-10">
                {isGroup && (
                  <GroupManagement
                    group={currentUser as Group}
                    // @ts-ignore: TS errors with type compatibility will be fixed in a full refactor
                    members={groupMembers.map(member => ({
                      ...member,
                      groupId: (currentUser as Group).id,
                    }))}
                    channels={channels}
                    availableUsers={users.filter(u => !groupMembers.some(m => m.userId === u.id))}
                    currentUserId={loggedInUser.id}
                    onUpdateGroup={(updates) => onUpdateGroup && onUpdateGroup((currentUser as Group).id, updates)}
                    onAddMember={(userId, role) => console.log("Add member", userId, role)}
                    onRemoveMember={(userId) => console.log("Remove member", userId)}
                    onUpdateMemberRole={(userId, role) => console.log("Update role", userId, role)}
                    onAddChannel={(channel) => console.log("Add channel", channel)}
                    onRemoveChannel={(channelId) => console.log("Remove channel", channelId)}
                    onUpdateChannel={(channelId, updates) => console.log("Update channel", channelId, updates)}
                  />
                )}
                
                {!isGroup && (
                  <>
                    <button
                      className="flex w-full items-center px-4 py-2 text-sm text-[#E1E1E1] hover:bg-[#333333]"
                      onClick={() => console.log("View profile")}
                    >
                      <span className="material-icons text-sm mr-2">person</span>
                      View Profile
                    </button>
                    
                    <button
                      className="flex w-full items-center px-4 py-2 text-sm text-[#E1E1E1] hover:bg-[#333333]"
                      onClick={() => console.log("Block user")}
                    >
                      <span className="material-icons text-sm mr-2">block</span>
                      Block User
                    </button>
                  </>
                )}
                
                <button
                  className="flex w-full items-center px-4 py-2 text-sm text-[#E1E1E1] hover:bg-[#333333]"
                  onClick={() => console.log("Search messages")}
                >
                  <span className="material-icons text-sm mr-2">search</span>
                  Search Messages
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Group channels */}
      {isGroup && channels.length > 0 && (
        <div className="flex items-center space-x-2 px-4 py-2 bg-[#1A1A1A] border-b border-[#333333] overflow-x-auto">
          {channels.map(channel => (
            <Button
              key={channel.id}
              variant="ghost"
              size="sm"
              className={cn(
                "h-8 px-3 text-sm rounded-full",
                currentChannel?.id === channel.id
                  ? "bg-[#333333] text-[#E1E1E1]" 
                  : "text-[#A0A0A0] hover:text-[#E1E1E1] hover:bg-[#252525]"
              )}
              onClick={() => handleChannelSelect(channel.id)}
            >
              <span className="material-icons text-sm mr-1">
                {channel.type === 'text' ? 'tag' : 
                 channel.type === 'voice' ? 'mic' : 'videocam'}
              </span>
              {channel.name}
              {channel.isPrivate && (
                <span className="material-icons text-xs ml-1">lock</span>
              )}
            </Button>
          ))}
          
          {isAdmin && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-[#A0A0A0] hover:text-[#E1E1E1] hover:bg-[#252525] flex-shrink-0"
              onClick={() => console.log("Add channel")}
            >
              <span className="material-icons text-sm">add</span>
            </Button>
          )}
        </div>
      )}
      
      {/* Active call banner */}
      {activeCall && (
        <div className="px-4 py-2 bg-[#252525] border-b border-[#333333] flex items-center justify-between">
          <div className="flex items-center">
            <span className="material-icons text-sm text-green-500 mr-2">
              {activeCall.type === 'audio' ? 'call' : 'videocam'}
            </span>
            <span className="text-[#E1E1E1] text-sm">
              {activeCall.type === 'audio' ? 'Voice' : 'Video'} call in progress • 
              <span className="text-[#A0A0A0] ml-1">
                {activeCall.participants.length} participants
              </span>
            </span>
          </div>
          
          <div className="flex space-x-2">
            {activeCall.participants.includes(loggedInUser.id) ? (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 bg-[#333333] text-[#E1E1E1] hover:bg-[#444444]"
                  onClick={() => onEndCall && onEndCall()}
                >
                  <span className="material-icons text-xs mr-1">call_end</span>
                  Leave Call
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 bg-[#333333] text-[#E1E1E1] hover:bg-[#444444]"
                  onClick={() => setActiveTab(activeTab === 'call' ? 'chat' : 'call')}
                >
                  <span className="material-icons text-xs mr-1">
                    {activeTab === 'call' ? 'chat' : 'visibility'}
                  </span>
                  {activeTab === 'call' ? 'Chat' : 'View Call'}
                </Button>
              </>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 bg-green-600 text-white hover:bg-green-700"
                onClick={() => onJoinCall && onJoinCall()}
              >
                <span className="material-icons text-xs mr-1">call</span>
                Join Call
              </Button>
            )}
          </div>
        </div>
      )}
      
      {/* Main content area with tabs for chat and call */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
        <TabsContent value="chat" className="flex-1 flex flex-col p-0 m-0 h-full overflow-hidden outline-none">
          {/* Chat messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-custom">
            {Object.entries(messageGroups).map(([dateKey, dateMessages]) => (
              <div key={dateKey} className="space-y-4">
                <div className="relative flex items-center py-2">
                  <div className="flex-grow border-t border-[#333333]"></div>
                  <span className="flex-shrink mx-4 text-xs text-[#A0A0A0]">{dateKey}</span>
                  <div className="flex-grow border-t border-[#333333]"></div>
                </div>
                
                {dateMessages.map(message => {
                  const sender = getUserById(message.senderId);
                  if (!sender) return null;
                  
                  return (
                    <div key={message.id} className="flex items-start message-new group">
                      <UserAvatar user={sender} />
                      <div className="ml-2 flex-1">
                        <div className="flex items-baseline">
                          <div className="font-medium text-[#E1E1E1]">{sender.username}</div>
                          <div className="ml-2 text-xs text-[#A0A0A0] flex items-center">
                            {formatTime(message.timestamp)}
                            {message.isEdited && (
                              <span className="ml-1 text-[10px] text-[#A0A0A0]">(edited)</span>
                            )}
                          </div>
                          
                          <div className="ml-auto hidden group-hover:flex items-center space-x-1">
                            {/* Message actions */}
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 w-6 p-0 text-[#A0A0A0] hover:text-[#E1E1E1] hover:bg-[#333333]"
                                    onClick={() => setShowEmojiPicker(message.id)}
                                  >
                                    <span className="material-icons text-xs">add_reaction</span>
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent side="top">
                                  <p className="text-xs">Add Reaction</p>
                                </TooltipContent>
                              </Tooltip>
                              
                              {message.senderId === loggedInUser.id && (
                                <>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-6 w-6 p-0 text-[#A0A0A0] hover:text-[#E1E1E1] hover:bg-[#333333]"
                                        onClick={() => handleEditMessage(message)}
                                      >
                                        <span className="material-icons text-xs">edit</span>
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent side="top">
                                      <p className="text-xs">Edit</p>
                                    </TooltipContent>
                                  </Tooltip>
                                  
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-6 w-6 p-0 text-[#A0A0A0] hover:text-red-400 hover:bg-red-500/10"
                                        onClick={() => handleDeleteMessage(message.id)}
                                      >
                                        <span className="material-icons text-xs">delete</span>
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent side="top">
                                      <p className="text-xs">Delete</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </>
                              )}
                            </TooltipProvider>
                          </div>
                        </div>
                        
                        {/* Emoji picker */}
                        {showEmojiPicker === message.id && (
                          <div className="absolute mt-1 bg-[#252525] border border-[#333333] rounded-md shadow-lg p-2">
                            <div className="flex flex-wrap gap-2">
                              {commonEmojis.map(emoji => (
                                <button
                                  key={emoji}
                                  className="hover:bg-[#333333] rounded p-1 text-lg"
                                  onClick={() => handleAddReaction(message.id, emoji)}
                                >
                                  {emoji}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {/* Message content */}
                        {editingMessageId === message.id ? (
                          <div className="mt-1 relative">
                            <textarea
                              value={editMessageText}
                              onChange={(e) => setEditMessageText(e.target.value)}
                              className="w-full p-3 bg-[#252525] text-[#E1E1E1] outline-none rounded-lg border border-[#4D84FF] resize-none"
                              rows={3}
                              autoFocus
                            />
                            <div className="absolute bottom-2 right-2 flex space-x-2">
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-7 px-2 text-[#E1E1E1] hover:bg-[#333333]"
                                onClick={() => setEditingMessageId(null)}
                              >
                                Cancel
                              </Button>
                              <Button
                                size="sm"
                                className="h-7 px-2 bg-[#4D84FF] hover:bg-blue-600 text-white"
                                onClick={handleSaveEditedMessage}
                              >
                                Save
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <>
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
                                editable={message.senderId === loggedInUser.id}
                              />
                            ))}
                            
                            {message.fileAttachments?.map((file, index) => (
                              <FileAttachment
                                key={index}
                                file={file}
                                className="mt-1"
                                onDelete={message.senderId === loggedInUser.id ? 
                                  () => console.log("Delete file", file.id) : undefined}
                              />
                            ))}
                          </>
                        )}
                        
                        {/* Message reactions */}
                        {message.reactions && message.reactions.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {message.reactions.map((reaction, index) => {
                              // Count occurrences of this emoji
                              const count = message.reactions?.filter(r => r.emoji === reaction.emoji).length || 0;
                              
                              // Only show each emoji once with its count
                              const uniqueEmojis = new Set(message.reactions?.map(r => r.emoji) || []);
                              if ([...uniqueEmojis][index] !== reaction.emoji) return null;
                              
                              return (
                                <button
                                  key={`${reaction.emoji}_${index}`}
                                  className={cn(
                                    "flex items-center space-x-1 py-0.5 px-1 rounded-md text-xs",
                                    "bg-[#333333] hover:bg-[#444444]",
                                    message.reactions?.some(r => r.userId === loggedInUser.id && r.emoji === reaction.emoji)
                                      ? "text-[#4D84FF]" : "text-[#E1E1E1]"
                                  )}
                                  onClick={() => handleAddReaction(message.id, reaction.emoji)}
                                >
                                  <span>{reaction.emoji}</span>
                                  <span>{count}</span>
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          
          {/* Message input */}
          <MessageInput 
            onSendMessage={onSendMessage}
            onSendCode={onSendCode}
            onSendAttachments={onSendAttachments}
            onVoiceCall={handleVoiceCall}
            onVideoCall={handleVideoCall}
            onScreenShare={handleScreenShare}
          />
        </TabsContent>
        
        <TabsContent value="call" className="flex-1 p-0 m-0 h-full overflow-hidden outline-none">
          {activeCall && (
            <CallInterface
              callSession={activeCall}
              currentUser={loggedInUser}
              participants={users.filter(u => activeCall.participants.includes(u.id))}
              onEndCall={() => onEndCall && onEndCall()}
              onToggleMute={() => onToggleMute && onToggleMute()}
              onToggleVideo={() => onToggleVideo && onToggleVideo()}
              onToggleScreenShare={() => onShareScreen && onShareScreen()}
              className="h-full"
            />
          )}
        </TabsContent>
      </Tabs>
      
      {/* Code Editor Dialog */}
      <Dialog open={isCodeEditorOpen} onOpenChange={setIsCodeEditorOpen}>
        <DialogContent className="max-w-[85vw] max-h-[90vh] bg-[#1E1E1E] border-[#333333] p-0 overflow-hidden">
          <CodeEditor
            initialLanguage="javascript"
            initialCode="// Write your code here..."
            onSave={(code, language) => {
              onSendCode(code, language);
              setIsCodeEditorOpen(false);
            }}
            onShare={(code, language) => {
              onSendCode(code, language);
              setIsCodeEditorOpen(false);
            }}
            className="rounded-none border-0 h-[80vh]"
          />
        </DialogContent>
      </Dialog>
      
      {/* Terminal Dialog */}
      <Dialog open={isTerminalOpen} onOpenChange={setIsTerminalOpen}>
        <DialogContent className="max-w-[85vw] max-h-[90vh] bg-[#1E1E1E] border-[#333333] p-0 overflow-hidden">
          <DialogHeader className="p-4 border-b border-[#333333]">
            <DialogTitle className="text-[#E1E1E1] flex items-center">
              <span className="material-icons text-sm mr-2">terminal</span>
              Terminal
            </DialogTitle>
          </DialogHeader>
          <Terminal className="h-[70vh] rounded-none border-0" />
        </DialogContent>
      </Dialog>
    </div>
  );
}
