import { User, Group } from "@/types/chat";
import { UserAvatar } from "./UserAvatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SidebarProps {
  friends: User[];
  groups: Group[];
  currentChat: { type: "user" | "group"; id: number } | null;
  onSelectChat: (type: "user" | "group", id: number) => void;
  onNewParty: () => void;
}

export function Sidebar({ 
  friends, 
  groups, 
  currentChat, 
  onSelectChat, 
  onNewParty 
}: SidebarProps) {
  return (
    <div className="w-64 flex-shrink-0 bg-[#1A1A1A] border-r border-[#333333] flex flex-col h-full">
      {/* App title */}
      <div className="px-4 py-3 border-b border-[#333333] flex items-center">
        <h1 className="text-xl font-bold text-[#E1E1E1] flex items-center">
          <span className="material-icons mr-2 text-[#4D84FF]">code</span>
          DevChat
        </h1>
      </div>
      
      {/* Friends section */}
      <div className="p-4 overflow-y-auto scrollbar-custom">
        <h2 className="text-[#A0A0A0] text-sm uppercase font-semibold tracking-wider mb-2">
          Friends
        </h2>
        <div className="space-y-2">
          {friends.map(friend => (
            <div 
              key={friend.id}
              className={cn(
                "flex items-center p-2 rounded hover:bg-[#2A2A2A] cursor-pointer transition-colors",
                currentChat?.type === "user" && currentChat.id === friend.id ? "bg-[#333333]" : ""
              )}
              onClick={() => onSelectChat("user", friend.id)}
            >
              <UserAvatar user={friend} />
              <div className="ml-2">
                <div className={cn(
                  "font-medium",
                  friend.status === "online" ? "text-[#E1E1E1]" : "text-[#A0A0A0]"
                )}>
                  {friend.username}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Groups section */}
      <div className="p-4 overflow-y-auto scrollbar-custom">
        <h2 className="text-[#A0A0A0] text-sm uppercase font-semibold tracking-wider mb-2">
          Groups
        </h2>
        <div className="space-y-2">
          {groups.map(group => (
            <div 
              key={group.id}
              className={cn(
                "flex items-center p-2 rounded hover:bg-[#2A2A2A] cursor-pointer transition-colors",
                currentChat?.type === "group" && currentChat.id === group.id ? "bg-[#333333]" : ""
              )}
              onClick={() => onSelectChat("group", group.id)}
            >
              <div className={cn("w-8 h-8 rounded flex items-center justify-center text-white", group.color)}>
                <span className="material-icons text-sm">{group.icon}</span>
              </div>
              <div className="ml-2">
                <div className="text-[#A0A0A0] font-medium">{group.name}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* New Party button */}
      <div className="mt-auto p-4 border-t border-[#333333]">
        <Button 
          onClick={onNewParty}
          className="w-full flex items-center justify-center py-2 px-4 bg-[#1E1E1E] hover:bg-[#2A2A2A] rounded text-[#E1E1E1] transition-colors"
          variant="ghost"
        >
          <span className="material-icons mr-2 text-sm">add</span>
          New Party
        </Button>
      </div>
    </div>
  );
}
