import { Sidebar } from "@/components/Sidebar";
import { ChatWindow } from "@/components/ChatWindow";
import { useChat } from "@/hooks/useChat";

export default function ChatApp() {
  const { 
    users, 
    groups, 
    currentChat, 
    currentChatEntity,
    messages, 
    selectChat, 
    sendMessage, 
    sendCodeSnippet,
    createNewParty
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
        onSendMessage={sendMessage}
        onSendCode={sendCodeSnippet}
      />
    </div>
  );
}
