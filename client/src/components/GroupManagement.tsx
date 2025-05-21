import { useState } from 'react';
import { Group, User, GroupChannel, UserRole, GroupMember } from '@/types/chat';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UserAvatar } from './UserAvatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface GroupManagementProps {
  group: Group;
  members: (GroupMember & { user: User })[];
  channels: GroupChannel[];
  availableUsers: User[];
  currentUserId: number;
  onUpdateGroup: (updatedGroup: Partial<Group>) => void;
  onAddMember: (userId: number, role: UserRole) => void;
  onRemoveMember: (userId: number) => void;
  onUpdateMemberRole: (userId: number, role: UserRole) => void;
  onAddChannel: (channel: Omit<GroupChannel, 'id'>) => void;
  onRemoveChannel: (channelId: number) => void;
  onUpdateChannel: (channelId: number, updates: Partial<Omit<GroupChannel, 'id' | 'groupId'>>) => void;
}

export function GroupManagement({
  group,
  members,
  channels,
  availableUsers,
  currentUserId,
  onUpdateGroup,
  onAddMember,
  onRemoveMember,
  onUpdateMemberRole,
  onAddChannel,
  onRemoveChannel,
  onUpdateChannel
}: GroupManagementProps) {
  const [activeTab, setActiveTab] = useState('general');
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [isAddingChannel, setIsAddingChannel] = useState(false);
  
  // For adding members
  const [selectedUserId, setSelectedUserId] = useState<number | ''>('');
  const [selectedUserRole, setSelectedUserRole] = useState<UserRole>('member');
  
  // For adding channels
  const [newChannelName, setNewChannelName] = useState('');
  const [newChannelType, setNewChannelType] = useState<'text' | 'voice' | 'video'>('text');
  const [newChannelPrivate, setNewChannelPrivate] = useState(false);
  
  // Group edit state
  const [groupName, setGroupName] = useState(group.name);
  const [groupDescription, setGroupDescription] = useState(group.description || '');
  const [groupIcon, setGroupIcon] = useState(group.icon);
  const [groupColor, setGroupColor] = useState(group.color);
  const [groupPrivate, setGroupPrivate] = useState(group.isPrivate);
  
  // Check if current user is owner of the group
  const isOwner = group.ownerId === currentUserId;
  
  // Get current user's role
  const currentMember = members.find(member => member.userId === currentUserId);
  const isAdmin = isOwner || currentMember?.role === 'admin';
  
  // Get role badge color
  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return 'bg-red-700 text-white';
      case 'moderator':
        return 'bg-blue-700 text-white';
      case 'member':
        return 'bg-gray-700 text-white';
      case 'guest':
        return 'bg-gray-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };
  
  // Icons for channel types
  const getChannelTypeIcon = (type: string) => {
    switch (type) {
      case 'text':
        return 'tag';
      case 'voice':
        return 'mic';
      case 'video':
        return 'videocam';
      default:
        return 'tag';
    }
  };
  
  // Colors for group
  const colorOptions = [
    { value: 'bg-[#4D84FF]', label: 'Blue' },
    { value: 'bg-purple-700', label: 'Purple' },
    { value: 'bg-yellow-700', label: 'Yellow' },
    { value: 'bg-green-700', label: 'Green' },
    { value: 'bg-red-700', label: 'Red' },
    { value: 'bg-indigo-700', label: 'Indigo' },
    { value: 'bg-pink-700', label: 'Pink' },
    { value: 'bg-gray-700', label: 'Gray' },
  ];
  
  // Icons for group
  const iconOptions = [
    { value: 'groups', label: 'People' },
    { value: 'code', label: 'Code' },
    { value: 'terminal', label: 'Terminal' },
    { value: 'bug_report', label: 'Bug' },
    { value: 'school', label: 'School' },
    { value: 'sports_esports', label: 'Games' },
    { value: 'music_note', label: 'Music' },
    { value: 'work', label: 'Work' },
  ];
  
  // Handle save group changes
  const handleSaveGroupChanges = () => {
    onUpdateGroup({
      name: groupName,
      description: groupDescription,
      icon: groupIcon,
      color: groupColor,
      isPrivate: groupPrivate,
      updatedAt: new Date()
    });
  };
  
  // Handle add member
  const handleAddMember = () => {
    if (selectedUserId !== '' && selectedUserRole) {
      onAddMember(Number(selectedUserId), selectedUserRole);
      setIsAddingMember(false);
      setSelectedUserId('');
      setSelectedUserRole('member');
    }
  };
  
  // Handle add channel
  const handleAddChannel = () => {
    if (newChannelName.trim()) {
      onAddChannel({
        groupId: group.id,
        name: newChannelName.trim().toLowerCase().replace(/\s+/g, '-'),
        type: newChannelType,
        isPrivate: newChannelPrivate
      });
      setIsAddingChannel(false);
      setNewChannelName('');
      setNewChannelType('text');
      setNewChannelPrivate(false);
    }
  };
  
  return (
    <div className="bg-[#252525] text-[#E1E1E1] overflow-hidden">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full grid grid-cols-3 bg-[#1E1E1E]">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="members">Members</TabsTrigger>
          <TabsTrigger value="channels">Channels</TabsTrigger>
        </TabsList>
        
        {/* General Settings */}
        <TabsContent value="general" className="p-4">
          <div className="space-y-4">
            <div>
              <Label htmlFor="group-name">Group Name</Label>
              <Input 
                id="group-name" 
                value={groupName} 
                onChange={(e) => setGroupName(e.target.value)}
                disabled={!isAdmin}
                className="bg-[#1E1E1E] border-[#333333] text-[#E1E1E1]"
              />
            </div>
            
            <div>
              <Label htmlFor="group-description">Description</Label>
              <Textarea 
                id="group-description" 
                value={groupDescription} 
                onChange={(e) => setGroupDescription(e.target.value)}
                disabled={!isAdmin}
                className="bg-[#1E1E1E] border-[#333333] text-[#E1E1E1] resize-none h-20"
              />
            </div>
            
            <div>
              <Label>Icon</Label>
              <div className="grid grid-cols-4 gap-2 mt-1">
                {iconOptions.map(icon => (
                  <Button
                    key={icon.value}
                    type="button"
                    variant="outline"
                    className={`h-10 justify-center ${groupIcon === icon.value ? 'bg-[#333333] border-[#4D84FF]' : 'bg-[#1E1E1E] border-[#333333]'}`}
                    onClick={() => isAdmin && setGroupIcon(icon.value)}
                    disabled={!isAdmin}
                  >
                    <span className="material-icons text-sm mr-1">{icon.value}</span>
                    <span className="text-xs">{icon.label}</span>
                  </Button>
                ))}
              </div>
            </div>
            
            <div>
              <Label>Color</Label>
              <div className="grid grid-cols-4 gap-2 mt-1">
                {colorOptions.map(color => (
                  <Button
                    key={color.value}
                    type="button"
                    variant="outline"
                    className={`h-10 justify-center ${groupColor === color.value ? 'border-[#4D84FF]' : 'border-[#333333]'}`}
                    style={{
                      backgroundColor: groupColor === color.value ? undefined : '#1E1E1E',
                    }}
                    onClick={() => isAdmin && setGroupColor(color.value)}
                    disabled={!isAdmin}
                  >
                    <div className={`w-4 h-4 rounded-full mr-1 ${color.value}`}></div>
                    <span className="text-xs">{color.label}</span>
                  </Button>
                ))}
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch 
                id="group-private" 
                checked={groupPrivate}
                onCheckedChange={(checked) => isAdmin && setGroupPrivate(checked)}
                disabled={!isAdmin}
              />
              <Label htmlFor="group-private">Private Group</Label>
            </div>
            
            <div className="border-t border-[#333333] pt-4 flex justify-end">
              {isAdmin && (
                <Button 
                  onClick={handleSaveGroupChanges}
                  className="bg-[#4D84FF] hover:bg-blue-600 text-white"
                >
                  Save Changes
                </Button>
              )}
            </div>
          </div>
        </TabsContent>
        
        {/* Members Tab */}
        <TabsContent value="members" className="p-4">
          <div className="space-y-4">
            {isAdmin && (
              <div className="flex justify-end">
                <Dialog open={isAddingMember} onOpenChange={setIsAddingMember}>
                  <DialogTrigger asChild>
                    <Button className="bg-[#4D84FF] hover:bg-blue-600 text-white">
                      <span className="material-icons text-sm mr-1">person_add</span>
                      Add Member
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-[#252525] border-[#333333] text-[#E1E1E1]">
                    <DialogHeader>
                      <DialogTitle>Add Member</DialogTitle>
                    </DialogHeader>
                    
                    <div className="space-y-4 mt-2">
                      <div>
                        <Label htmlFor="user-select">Select User</Label>
                        <Select 
                          value={selectedUserId.toString()} 
                          onValueChange={(value) => setSelectedUserId(Number(value))}
                        >
                          <SelectTrigger className="bg-[#1E1E1E] border-[#333333] text-[#E1E1E1]">
                            <SelectValue placeholder="Select a user" />
                          </SelectTrigger>
                          <SelectContent className="bg-[#252525] border-[#333333] text-[#E1E1E1]">
                            {availableUsers.map(user => (
                              <SelectItem key={user.id} value={user.id.toString()}>
                                {user.username}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label>Role</Label>
                        <RadioGroup 
                          value={selectedUserRole} 
                          onValueChange={(value: UserRole) => setSelectedUserRole(value)}
                          className="mt-2 space-y-2"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem 
                              value="admin" 
                              id="role-admin"
                              className="border-[#333333]" 
                            />
                            <Label htmlFor="role-admin" className="font-normal">Admin</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem 
                              value="moderator" 
                              id="role-moderator"
                              className="border-[#333333]" 
                            />
                            <Label htmlFor="role-moderator" className="font-normal">Moderator</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem 
                              value="member" 
                              id="role-member"
                              className="border-[#333333]" 
                            />
                            <Label htmlFor="role-member" className="font-normal">Member</Label>
                          </div>
                        </RadioGroup>
                      </div>
                      
                      <div className="flex justify-end">
                        <Button 
                          onClick={handleAddMember}
                          disabled={selectedUserId === ''}
                          className="bg-[#4D84FF] hover:bg-blue-600 text-white"
                        >
                          Add Member
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            )}
            
            <div className="space-y-2">
              {members.map(member => (
                <div key={member.userId} className="bg-[#1E1E1E] rounded-md p-3 flex items-center justify-between">
                  <div className="flex items-center">
                    <UserAvatar user={member.user} />
                    <div className="ml-2">
                      <div className="text-sm font-medium">{member.user.username}</div>
                      <div className="text-xs text-[#A0A0A0] flex items-center">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] uppercase ${getRoleBadgeColor(member.role)}`}>
                          {member.role}
                        </span>
                        {member.userId === group.ownerId && (
                          <span className="ml-1 text-[10px] text-[#E1E1E1] bg-[#4D84FF] px-1.5 py-0.5 rounded uppercase">
                            Owner
                          </span>
                        )}
                        <span className="ml-1">
                          Joined {new Date(member.joinedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {isAdmin && member.userId !== currentUserId && member.userId !== group.ownerId && (
                    <div className="flex items-center space-x-2">
                      <Select 
                        defaultValue={member.role}
                        onValueChange={(value: UserRole) => onUpdateMemberRole(member.userId, value)}
                      >
                        <SelectTrigger className="h-8 bg-[#252525] border-[#333333] text-[#E1E1E1] w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-[#252525] border-[#333333] text-[#E1E1E1]">
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="moderator">Moderator</SelectItem>
                          <SelectItem value="member">Member</SelectItem>
                        </SelectContent>
                      </Select>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onRemoveMember(member.userId)}
                        className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-500/10"
                      >
                        <span className="material-icons text-sm">person_remove</span>
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </TabsContent>
        
        {/* Channels Tab */}
        <TabsContent value="channels" className="p-4">
          <div className="space-y-4">
            {isAdmin && (
              <div className="flex justify-end">
                <Dialog open={isAddingChannel} onOpenChange={setIsAddingChannel}>
                  <DialogTrigger asChild>
                    <Button className="bg-[#4D84FF] hover:bg-blue-600 text-white">
                      <span className="material-icons text-sm mr-1">add</span>
                      Add Channel
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-[#252525] border-[#333333] text-[#E1E1E1]">
                    <DialogHeader>
                      <DialogTitle>Add Channel</DialogTitle>
                    </DialogHeader>
                    
                    <div className="space-y-4 mt-2">
                      <div>
                        <Label htmlFor="channel-name">Channel Name</Label>
                        <Input 
                          id="channel-name" 
                          value={newChannelName} 
                          onChange={(e) => setNewChannelName(e.target.value)}
                          className="bg-[#1E1E1E] border-[#333333] text-[#E1E1E1]"
                          placeholder="general"
                        />
                      </div>
                      
                      <div>
                        <Label>Channel Type</Label>
                        <RadioGroup 
                          value={newChannelType} 
                          onValueChange={(value: 'text' | 'voice' | 'video') => setNewChannelType(value)}
                          className="mt-2 space-y-2"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem 
                              value="text" 
                              id="type-text"
                              className="border-[#333333]" 
                            />
                            <Label htmlFor="type-text" className="font-normal flex items-center">
                              <span className="material-icons text-sm mr-1">tag</span>
                              Text Channel
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem 
                              value="voice" 
                              id="type-voice"
                              className="border-[#333333]" 
                            />
                            <Label htmlFor="type-voice" className="font-normal flex items-center">
                              <span className="material-icons text-sm mr-1">mic</span>
                              Voice Channel
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem 
                              value="video" 
                              id="type-video"
                              className="border-[#333333]" 
                            />
                            <Label htmlFor="type-video" className="font-normal flex items-center">
                              <span className="material-icons text-sm mr-1">videocam</span>
                              Video Channel
                            </Label>
                          </div>
                        </RadioGroup>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Switch 
                          id="channel-private" 
                          checked={newChannelPrivate}
                          onCheckedChange={setNewChannelPrivate}
                        />
                        <Label htmlFor="channel-private">Private Channel</Label>
                      </div>
                      
                      <div className="flex justify-end">
                        <Button 
                          onClick={handleAddChannel}
                          disabled={!newChannelName.trim()}
                          className="bg-[#4D84FF] hover:bg-blue-600 text-white"
                        >
                          Create Channel
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            )}
            
            <Accordion type="multiple" className="space-y-2">
              {['text', 'voice', 'video'].map(type => {
                const typeChannels = channels.filter(channel => channel.type === type);
                if (typeChannels.length === 0) return null;
                
                return (
                  <AccordionItem 
                    key={type} 
                    value={type}
                    className="border-b-0"
                  >
                    <AccordionTrigger className="py-2 px-3 bg-[#1E1E1E] rounded-md hover:bg-[#252525] text-[#E1E1E1]">
                      <div className="flex items-center">
                        <span className="material-icons text-sm mr-1">
                          {getChannelTypeIcon(type)}
                        </span>
                        <span className="capitalize">{type} Channels</span>
                        <span className="ml-2 text-xs text-[#A0A0A0]">
                          ({typeChannels.length})
                        </span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pt-2 pb-0">
                      <div className="space-y-1 ml-4">
                        {typeChannels.map(channel => (
                          <div 
                            key={channel.id} 
                            className="py-2 px-3 bg-[#1E1E1E] rounded-md flex items-center justify-between"
                          >
                            <div className="flex items-center">
                              <span className="material-icons text-sm mr-1">
                                {getChannelTypeIcon(channel.type)}
                              </span>
                              <span>{channel.name}</span>
                              {channel.isPrivate && (
                                <span className="material-icons text-xs ml-1">lock</span>
                              )}
                            </div>
                            
                            {isAdmin && (
                              <div className="flex items-center space-x-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => onUpdateChannel(channel.id, { isPrivate: !channel.isPrivate })}
                                  className="h-7 w-7 p-0 text-[#A0A0A0] hover:text-[#E1E1E1] hover:bg-[#333333]"
                                >
                                  <span className="material-icons text-xs">
                                    {channel.isPrivate ? 'lock_open' : 'lock'}
                                  </span>
                                </Button>
                                
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => onRemoveChannel(channel.id)}
                                  className="h-7 w-7 p-0 text-red-500 hover:text-red-600 hover:bg-red-500/10"
                                >
                                  <span className="material-icons text-xs">delete</span>
                                </Button>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}