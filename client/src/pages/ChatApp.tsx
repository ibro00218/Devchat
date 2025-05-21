import { Sidebar } from "@/components/Sidebar";
import { ChatWindow } from "@/components/ChatWindow";
import { useChat } from "@/hooks/useChat";

export default function ChatApp() {
  const { 
    users, 
    groups, 
    channels,
    currentChat, 
    currentChatEntity,
    currentChannel,
    messages, 
    groupMembers, 
    activeCall,
    currentUser,
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
    updateGroup
  } = useChat();

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar 
        friends={users}
        groups={groups}
        currentChat={currentChat}
        onSelectChat={selectChat}
        onNewParty={createNewParty}
      />
      
      <ChatWindow 
        currentUser={currentChatEntity}
        isGroup={currentChat?.type === "group"}
        messages={messages}
        users={users}
        channels={channels}
        currentChannel={currentChannel}
        groupMembers={groupMembers}
        activeCall={activeCall}
        loggedInUser={currentUser}
        onSendMessage={sendMessage}
        onSendCode={sendCodeSnippet}
        onSendAttachments={sendFileAttachments}
        onStartCall={startCall}
        onEndCall={endCall}
        onJoinCall={joinCall}
        onShareScreen={toggleScreenSharing}
        onToggleMute={() => console.log("Toggle mute")}
        onToggleVideo={() => console.log("Toggle video")}
        onUpdateGroup={updateGroup}
        onSelectChannel={selectChannel}
        onMessageReaction={addMessageReaction}
        onEditMessage={editMessage}
        onDeleteMessage={deleteMessage}
      />
    </div>
  );
}
