import React, { useState } from 'react';
import { ChatWindow } from '@/components/ChatWindow';
import { Sidebar } from '@/components/Sidebar';
import { CallProvider } from '@/components/VideoCall/CallProvider';
import { User, Message, Group, CodeSnippet, GroupChannel } from '@/types/chat';
import { useChat } from '@/hooks/useChat';
import { useToast } from '@/hooks/use-toast';

export default function ChatAppWithCalls() {
  const { toast } = useToast();
  const {
    users,
    groups,
    channels,
    currentChat,
    currentChatEntity,
    currentChannel,
    messages: allMessages,
    activeCall,
    currentUser,
    selectChat,
    selectChannel,
    sendMessage,
    sendCodeSnippet,
    sendFileAttachments: sendAttachments,
    startCall: initiateCall,
    endCall,
    joinCall,
    toggleScreenSharing
  } = useChat();

  // Current open chat entity (user or group)
  const chatEntity = currentChat
    ? currentChat.type === 'user'
      ? users.find(user => user.id === currentChat.id)
      : groups.find(group => group.id === currentChat.id)
    : null;

  // Current chat messages - use the messages directly from the hook
  const chatMessages = allMessages;

  // For simplicity, let's assume all users are members if it's a group chat
  const groupMembers = currentChat?.type === 'group'
    ? users.filter(user => user.id !== currentUser.id)
    : [];

  const handleSendMessage = (text: string) => {
    if (!currentChat) return;
    
    // Use the updated sendMessage interface
    sendMessage(text);
  };

  const handleSendCode = (code: string, language: string) => {
    if (!currentChat) return;
    
    // Use the updated sendCodeSnippet interface
    sendCodeSnippet(code, language);
  };

  const handleSendAttachments = (files: File[]) => {
    if (!currentChat) return;

    // Send attachments using the updated interface
    sendAttachments(files);
    
    toast({
      title: 'Files sent',
      description: `${files.length} file${files.length !== 1 ? 's' : ''} sent successfully`,
    });
  };

  // Call handling functions
  const handleStartVoiceCall = () => {
    if (!currentChat || currentChat.type !== 'user') return;
    
    const recipient = users.find(user => user.id === currentChat.id);
    if (!recipient) return;
    
    initiateCall([recipient], 'audio');
  };

  const handleStartVideoCall = () => {
    if (!currentChat || currentChat.type !== 'user') return;
    
    const recipient = users.find(user => user.id === currentChat.id);
    if (!recipient) return;
    
    initiateCall([recipient], 'video');
  };

  const handleStartScreenShare = () => {
    if (!activeCall) return;
    
    toast({
      title: 'Screen sharing started',
      description: 'Your screen is now being shared with the call participants'
    });
  };

  return (
    <CallProvider currentUser={currentUser}>
      <div className="flex h-screen overflow-hidden bg-[#1A1A1A] text-white">
        {/* Sidebar with users and groups */}
        <Sidebar 
          friends={users.filter(user => user.id !== currentUser.id)}
          groups={groups}
          currentChat={currentChat}
          onSelectChat={(type, id) => {
            // Set current chat
          }}
          onNewParty={() => {
            // Create new group/party
          }}
        />
        
        {/* Main chat area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {chatEntity ? (
            <ChatWindow
              currentUser={chatEntity}
              isGroup={currentChat?.type === 'group'}
              messages={chatMessages}
              users={users}
              channels={currentGroupChannels}
              groupMembers={currentChat?.type === 'group' ? groupMembers.map(user => ({
                userId: user.id,
                role: 'member',
                joinedAt: new Date(),
                user
              })) : []}
              activeCall={activeCall}
              loggedInUser={currentUser}
              onSendMessage={handleSendMessage}
              onSendCode={handleSendCode}
              onSendAttachments={handleSendAttachments}
              onStartCall={handleStartVideoCall}
              onEndCall={endCall}
              onJoinCall={joinCall}
              onShareScreen={handleStartScreenShare}
            />
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <h2 className="text-xl font-semibold mb-2">Welcome to DevChat</h2>
                <p>Select a chat to start messaging</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </CallProvider>
  );
}