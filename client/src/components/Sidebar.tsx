import { useState } from "react";
import { User, Group, GroupChannel } from "@/types/chat";
import { UserAvatar } from "./UserAvatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from "@/components/ui/accordion";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter 
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

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
  const [expandedSections, setExpandedSections] = useState<string[]>(["direct-messages"]);
  const [isAddFriendDialogOpen, setIsAddFriendDialogOpen] = useState(false);
  const [newFriendUsername, setNewFriendUsername] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // Filter friends and groups based on search query
  const filteredFriends = friends.filter(
    friend => friend.username.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const filteredGroups = groups.filter(
    group => group.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Sort friends by status (online first)
  const sortedFriends = [...filteredFriends].sort((a, b) => {
    if (a.status === "online" && b.status !== "online") return -1;
    if (a.status !== "online" && b.status === "online") return 1;
    return a.username.localeCompare(b.username);
  });

  // Group categories
  const communityGroups = filteredGroups.filter(group => !group.isPrivate);
  const teamGroups = filteredGroups.filter(group => group.isPrivate);

  // Handle adding a new friend
  const handleAddFriend = () => {
    console.log(`Adding friend: ${newFriendUsername}`);
    setNewFriendUsername("");
    setIsAddFriendDialogOpen(false);
    // In a real app, this would call an API to add a friend
  };

  return (
    <div className="w-72 flex-shrink-0 bg-[#1A1A1A] border-r border-[#333333] flex flex-col h-full">
      {/* App title */}
      <div className="px-4 py-3 border-b border-[#333333] flex items-center justify-between">
        <h1 className="text-xl font-bold text-[#E1E1E1] flex items-center">
          <span className="material-icons mr-2 text-[#4D84FF]">code</span>
          DevChat
        </h1>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 rounded-full bg-[#252525] hover:bg-[#333333]"
              >
                <span className="material-icons text-sm text-[#A0A0A0]">settings</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs">Settings</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      
      {/* Search Bar */}
      <div className="px-4 py-2 border-b border-[#333333]">
        <div className="relative">
          <span className="absolute inset-y-0 left-2 flex items-center text-[#A0A0A0]">
            <span className="material-icons text-sm">search</span>
          </span>
          <Input 
            type="text"
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-[#252525] border-[#333333] text-[#E1E1E1] pl-8 h-8"
          />
        </div>
      </div>
      
      {/* Collapsible Sections */}
      <div className="flex-1 overflow-y-auto scrollbar-custom">
        <Accordion
          type="multiple"
          value={expandedSections}
          onValueChange={setExpandedSections}
          className="border-none"
        >
          {/* Direct Messages Section */}
          <AccordionItem value="direct-messages" className="border-none">
            <div className="flex items-center justify-between px-4 py-2">
              <AccordionTrigger className="hover:no-underline p-0 flex-1">
                <h2 className="text-[#A0A0A0] text-sm uppercase font-semibold tracking-wider">
                  Direct Messages
                </h2>
              </AccordionTrigger>
              <Dialog open={isAddFriendDialogOpen} onOpenChange={setIsAddFriendDialogOpen}>
                <DialogTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-6 w-6 p-0 rounded-sm hover:bg-[#2A2A2A]"
                  >
                    <span className="material-icons text-[#A0A0A0] text-sm">add</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-[#252525] border-[#333333] text-[#E1E1E1]">
                  <DialogHeader>
                    <DialogTitle>Add Friend</DialogTitle>
                  </DialogHeader>
                  <div className="py-4">
                    <Label htmlFor="username" className="text-[#E1E1E1]">Friend's Username</Label>
                    <Input 
                      id="username" 
                      value={newFriendUsername}
                      onChange={(e) => setNewFriendUsername(e.target.value)}
                      placeholder="Enter username#1234"
                      className="mt-2 bg-[#1E1E1E] border-[#333333] text-[#E1E1E1]"
                    />
                  </div>
                  <DialogFooter>
                    <Button 
                      onClick={handleAddFriend}
                      className="bg-[#4D84FF] hover:bg-blue-600 text-white"
                    >
                      Add Friend
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
            <AccordionContent className="pt-0 pb-0">
              <div className="space-y-1 px-2">
                {sortedFriends.map(friend => (
                  <div 
                    key={friend.id}
                    className={cn(
                      "flex items-center p-2 rounded hover:bg-[#2A2A2A] cursor-pointer transition-colors",
                      currentChat?.type === "user" && currentChat.id === friend.id ? "bg-[#333333]" : ""
                    )}
                    onClick={() => onSelectChat("user", friend.id)}
                  >
                    <UserAvatar user={friend} />
                    <div className="ml-2 flex-1 min-w-0">
                      <div className="flex items-center">
                        <div className={cn(
                          "font-medium truncate",
                          friend.status === "online" ? "text-[#E1E1E1]" : "text-[#A0A0A0]"
                        )}>
                          {friend.username}
                        </div>
                        <div className="ml-1 text-xs text-[#A0A0A0]">#{friend.tagNumber}</div>
                      </div>
                    </div>
                    {friend.status === "online" && (
                      <div className="h-2 w-2 rounded-full bg-green-500"></div>
                    )}
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
          
          {/* Voice Channels Section */}
          <AccordionItem value="voice-channels" className="border-none">
            <div className="flex items-center justify-between px-4 py-2">
              <AccordionTrigger className="hover:no-underline p-0 flex-1">
                <h2 className="text-[#A0A0A0] text-sm uppercase font-semibold tracking-wider flex items-center">
                  <span className="material-icons text-sm mr-1">mic</span> Voice Channels
                </h2>
              </AccordionTrigger>
            </div>
            <AccordionContent className="pt-0 pb-0">
              <div className="space-y-1 px-2">
                {groups.map(group => {
                  // Find voice channels for this group
                  const voiceChannels = [{id: 1, name: "General", type: "voice", isActive: true}];
                  
                  if (voiceChannels.length === 0) return null;
                  
                  return (
                    <div key={`voice-${group.id}`} className="mb-2">
                      <div className="px-2 py-1 text-xs text-[#A0A0A0] font-medium">{group.name}</div>
                      {voiceChannels.map(channel => (
                        <div 
                          key={channel.id}
                          className="flex items-center p-2 rounded hover:bg-[#2A2A2A] cursor-pointer transition-colors"
                          onClick={() => onSelectChat("group", group.id)}
                        >
                          <span className="material-icons text-[#A0A0A0] text-sm mr-2">volume_up</span>
                          <div className="text-[#A0A0A0] text-sm">{channel.name}</div>
                          {channel.isActive && (
                            <div className="ml-auto rounded-full px-2 py-0.5 bg-green-500/20 text-green-400 text-xs font-medium">
                              Live
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            </AccordionContent>
          </AccordionItem>
          
          {/* Communities Section */}
          <AccordionItem value="communities" className="border-none">
            <div className="flex items-center justify-between px-4 py-2">
              <AccordionTrigger className="hover:no-underline p-0 flex-1">
                <h2 className="text-[#A0A0A0] text-sm uppercase font-semibold tracking-wider flex items-center">
                  <span className="material-icons text-sm mr-1">public</span> Communities
                </h2>
              </AccordionTrigger>
            </div>
            <AccordionContent className="pt-0 pb-0">
              <div className="space-y-1 px-2">
                {communityGroups.map(group => (
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
                      <div className="text-[#E1E1E1] font-medium">{group.name}</div>
                    </div>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
          
          {/* Teams Section */}
          <AccordionItem value="teams" className="border-none">
            <div className="flex items-center justify-between px-4 py-2">
              <AccordionTrigger className="hover:no-underline p-0 flex-1">
                <h2 className="text-[#A0A0A0] text-sm uppercase font-semibold tracking-wider flex items-center">
                  <span className="material-icons text-sm mr-1">groups</span> Teams
                </h2>
              </AccordionTrigger>
            </div>
            <AccordionContent className="pt-0 pb-0">
              <div className="space-y-1 px-2">
                {teamGroups.map(group => (
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
                      <div className="text-[#E1E1E1] font-medium">{group.name}</div>
                    </div>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
      
      {/* User Profile Section */}
      <div className="p-3 border-t border-[#333333] bg-[#171717] flex items-center justify-between">
        <div className="flex items-center">
          <UserAvatar user={friends[0]} size="sm" />
          <div className="ml-2">
            <div className="text-[#E1E1E1] text-sm font-medium">{friends[0].username}</div>
            <div className="text-[#A0A0A0] text-xs flex items-center">
              <div className="h-2 w-2 rounded-full bg-green-500 mr-1"></div>
              Online
            </div>
          </div>
        </div>
        
        <div className="flex space-x-1">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 w-8 p-0 rounded-full bg-[#252525] hover:bg-[#333333]"
                >
                  <span className="material-icons text-sm text-[#A0A0A0]">mic</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">
                <p className="text-xs">Mute</p>
              </TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 w-8 p-0 rounded-full bg-[#252525] hover:bg-[#333333]"
                >
                  <span className="material-icons text-sm text-[#A0A0A0]">headset</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">
                <p className="text-xs">Headset</p>
              </TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 w-8 p-0 rounded-full bg-[#252525] hover:bg-[#333333]"
                >
                  <span className="material-icons text-sm text-[#A0A0A0]">settings</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">
                <p className="text-xs">User Settings</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
      
      {/* Create New Party Dialog */}
      <Dialog>
        <DialogTrigger asChild>
          <Button 
            onClick={(e) => {
              e.stopPropagation(); // Prevent dialog from closing
              onNewParty();
            }}
            className="mx-3 mb-3 flex items-center justify-center py-2 px-4 bg-[#4D84FF] hover:bg-blue-600 rounded text-white transition-colors"
          >
            <span className="material-icons mr-2 text-sm">add</span>
            Create New Party
          </Button>
        </DialogTrigger>
      </Dialog>
    </div>
  );
}
