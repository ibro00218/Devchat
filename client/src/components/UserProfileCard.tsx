import { useState } from 'react';
import { User, UserProfile } from '@/types/chat';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { UserAvatar } from './UserAvatar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface UserProfileCardProps {
  user: User | UserProfile;
  isCurrentUser?: boolean;
  onSendMessage?: (userId: number) => void;
  onAddFriend?: (userId: number) => void;
  onRemoveFriend?: (userId: number) => void;
  onVoiceCall?: (userId: number) => void;
  onVideoCall?: (userId: number) => void;
  isFriend?: boolean;
  className?: string;
}

export function UserProfileCard({
  user,
  isCurrentUser = false,
  onSendMessage,
  onAddFriend,
  onRemoveFriend,
  onVoiceCall,
  onVideoCall,
  isFriend = false,
  className
}: UserProfileCardProps) {
  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false);
  
  const isUserProfile = (user: User | UserProfile): user is UserProfile => {
    return 'fullName' in user || 'location' in user || 'links' in user || 'skills' in user;
  };
  
  const profile = isUserProfile(user) ? user : undefined;
  
  const handleSendMessage = () => {
    if (onSendMessage) {
      onSendMessage(user.id);
      setIsProfileDialogOpen(false);
    }
  };
  
  const handleAddFriend = () => {
    if (onAddFriend) {
      onAddFriend(user.id);
    }
  };
  
  const handleRemoveFriend = () => {
    if (onRemoveFriend) {
      onRemoveFriend(user.id);
    }
  };
  
  const handleVoiceCall = () => {
    if (onVoiceCall) {
      onVoiceCall(user.id);
      setIsProfileDialogOpen(false);
    }
  };
  
  const handleVideoCall = () => {
    if (onVideoCall) {
      onVideoCall(user.id);
      setIsProfileDialogOpen(false);
    }
  };
  
  return (
    <>
      <Card className={cn("bg-[#252525] border-[#333333]", className)}>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <UserAvatar user={user} size="lg" />
              <div>
                <CardTitle className="text-[#E1E1E1]">{user.username}</CardTitle>
                <CardDescription className="text-[#A0A0A0]">#{user.tagNumber}</CardDescription>
              </div>
            </div>
            <Badge 
              variant="outline" 
              className={cn(
                "font-normal",
                user.status === 'online' && "bg-green-500/10 text-green-500 border-green-500/20",
                user.status === 'away' && "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
                user.status === 'offline' && "bg-gray-500/10 text-gray-500 border-gray-500/20",
              )}
            >
              {user.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-2 pb-4">
          {profile?.bio && (
            <p className="text-sm text-[#E1E1E1] mb-3">{profile.bio}</p>
          )}
          
          {profile?.skills && profile.skills.length > 0 && (
            <div className="mb-3">
              <p className="text-xs text-[#A0A0A0] mb-1">Skills</p>
              <div className="flex flex-wrap gap-1">
                {profile.skills.map((skill, index) => (
                  <Badge key={index} variant="secondary" className="bg-[#333333] text-[#A0A0A0]">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          
          <div className="text-xs text-[#A0A0A0]">
            <span className="flex items-center">
              <span className="material-icons text-sm mr-1">schedule</span>
              Joined {new Date(user.joinedAt).toLocaleDateString()}
            </span>
          </div>
        </CardContent>
        <CardFooter className="flex gap-2 pt-0">
          {!isCurrentUser && (
            <>
              <Button 
                variant="outline" 
                size="sm"
                className="bg-[#333333] text-[#E1E1E1] hover:bg-[#444444] border-[#444444]"
                onClick={handleSendMessage}
              >
                <span className="material-icons text-sm mr-1">chat</span>
                Message
              </Button>
              
              {isFriend ? (
                <Button 
                  variant="outline" 
                  size="sm"
                  className="bg-[#333333] text-red-400 hover:bg-red-500/20 hover:text-red-400 border-[#444444]"
                  onClick={handleRemoveFriend}
                >
                  <span className="material-icons text-sm mr-1">person_remove</span>
                  Remove
                </Button>
              ) : (
                <Button 
                  variant="outline" 
                  size="sm"
                  className="bg-[#333333] text-[#E1E1E1] hover:bg-[#444444] border-[#444444]"
                  onClick={handleAddFriend}
                >
                  <span className="material-icons text-sm mr-1">person_add</span>
                  Add
                </Button>
              )}
            </>
          )}
          
          <Button 
            variant="outline" 
            size="sm"
            className="ml-auto bg-[#333333] text-[#E1E1E1] hover:bg-[#444444] border-[#444444]"
            onClick={() => setIsProfileDialogOpen(true)}
          >
            <span className="material-icons text-sm">more_horiz</span>
          </Button>
        </CardFooter>
      </Card>
      
      {/* Full profile dialog */}
      <Dialog open={isProfileDialogOpen} onOpenChange={setIsProfileDialogOpen}>
        <DialogContent className="bg-[#252525] border-[#333333] max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[#E1E1E1] flex items-center gap-2">
              <UserAvatar user={user} />
              <div>
                {user.username}
                <span className="text-xs text-[#A0A0A0] ml-1">#{user.tagNumber}</span>
              </div>
            </DialogTitle>
            {profile?.fullName && (
              <DialogDescription className="text-[#A0A0A0]">
                {profile.fullName}
              </DialogDescription>
            )}
          </DialogHeader>
          
          <Tabs defaultValue="about" className="mt-4">
            <TabsList className="bg-[#1E1E1E] border-b border-[#333333]">
              <TabsTrigger value="about" className="data-[state=active]:bg-[#333333] data-[state=active]:text-[#E1E1E1]">
                About
              </TabsTrigger>
              <TabsTrigger value="connections" className="data-[state=active]:bg-[#333333] data-[state=active]:text-[#E1E1E1]">
                Connections
              </TabsTrigger>
              {profile?.links && profile.links.length > 0 && (
                <TabsTrigger value="links" className="data-[state=active]:bg-[#333333] data-[state=active]:text-[#E1E1E1]">
                  Links
                </TabsTrigger>
              )}
            </TabsList>
            
            <TabsContent value="about" className="py-4">
              {profile?.bio && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-[#E1E1E1] mb-1">Bio</h4>
                  <p className="text-sm text-[#A0A0A0]">{profile.bio}</p>
                </div>
              )}
              
              {profile?.location && (
                <div className="mb-4 flex items-center">
                  <span className="material-icons text-sm mr-2 text-[#A0A0A0]">location_on</span>
                  <span className="text-sm text-[#A0A0A0]">{profile.location}</span>
                </div>
              )}
              
              {profile?.skills && profile.skills.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-[#E1E1E1] mb-1">Skills</h4>
                  <div className="flex flex-wrap gap-1">
                    {profile.skills.map((skill, index) => (
                      <Badge key={index} variant="secondary" className="bg-[#333333] text-[#A0A0A0]">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="text-xs text-[#A0A0A0] mt-4">
                <div className="flex items-center mb-1">
                  <span className="material-icons text-sm mr-1">schedule</span>
                  Joined {new Date(user.joinedAt).toLocaleDateString()}
                </div>
                {user.role && (
                  <div className="flex items-center">
                    <span className="material-icons text-sm mr-1">badge</span>
                    Role: {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="connections" className="py-4">
              <p className="text-sm text-[#A0A0A0]">This user has no public connections.</p>
            </TabsContent>
            
            {profile?.links && profile.links.length > 0 && (
              <TabsContent value="links" className="py-4">
                <h4 className="text-sm font-medium text-[#E1E1E1] mb-2">Links</h4>
                <ul className="space-y-2">
                  {profile.links.map((link, index) => (
                    <li key={index} className="flex items-center">
                      <span className="material-icons text-sm mr-2 text-[#A0A0A0]">link</span>
                      <a 
                        href={link.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-sm text-[#4D84FF] hover:underline"
                      >
                        {link.title || link.url}
                      </a>
                    </li>
                  ))}
                </ul>
              </TabsContent>
            )}
          </Tabs>
          
          {!isCurrentUser && (
            <div className="flex justify-between mt-4">
              <div className="flex gap-2">
                <Button 
                  variant="outline"
                  size="sm"
                  className="bg-[#333333] text-[#E1E1E1] hover:bg-[#444444] border-[#444444]"
                  onClick={handleVoiceCall}
                >
                  <span className="material-icons text-sm mr-1">call</span>
                  Call
                </Button>
                
                <Button 
                  variant="outline"
                  size="sm"
                  className="bg-[#333333] text-[#E1E1E1] hover:bg-[#444444] border-[#444444]"
                  onClick={handleVideoCall}
                >
                  <span className="material-icons text-sm mr-1">videocam</span>
                  Video
                </Button>
              </div>
              
              <Button 
                className="bg-[#4D84FF] hover:bg-blue-600"
                size="sm"
                onClick={handleSendMessage}
              >
                <span className="material-icons text-sm mr-1">chat</span>
                Message
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}