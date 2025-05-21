import { useState } from 'react';
import { User, CallSession } from '@/types/chat';
import { UserAvatar } from './UserAvatar';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface CallInterfaceProps {
  callSession: CallSession;
  currentUser: User;
  participants: User[];
  onEndCall: () => void;
  onToggleMute: () => void;
  onToggleVideo: () => void;
  onToggleScreenShare: () => void;
  className?: string;
}

export function CallInterface({
  callSession,
  currentUser,
  participants,
  onEndCall,
  onToggleMute,
  onToggleVideo,
  onToggleScreenShare,
  className
}: CallInterfaceProps) {
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(callSession.isScreenSharing);
  const [activeSpeakerId, setActiveSpeakerId] = useState<number | null>(null);
  const [fullscreenUserId, setFullscreenUserId] = useState<number | null>(null);
  
  // Calculate grid layout based on participant count
  const getGridClass = () => {
    if (fullscreenUserId) return "";
    
    const count = participants.length;
    if (count === 1) return "grid-cols-1";
    if (count === 2) return "grid-cols-2";
    if (count <= 4) return "grid-cols-2 grid-rows-2";
    if (count <= 9) return "grid-cols-3 grid-rows-3";
    return "grid-cols-4 grid-rows-4";
  };
  
  // Handle mute toggle
  const handleToggleMute = () => {
    setIsMuted(!isMuted);
    onToggleMute();
  };
  
  // Handle video toggle
  const handleToggleVideo = () => {
    setIsVideoOff(!isVideoOff);
    onToggleVideo();
  };
  
  // Handle screen share toggle
  const handleToggleScreenShare = () => {
    setIsScreenSharing(!isScreenSharing);
    onToggleScreenShare();
  };
  
  // Handle participant click to make them fullscreen
  const handleParticipantClick = (participant: User) => {
    if (fullscreenUserId === participant.id) {
      // If already fullscreen, exit fullscreen
      setFullscreenUserId(null);
    } else {
      // Enter fullscreen for this participant
      setFullscreenUserId(participant.id);
    }
  };
  
  return (
    <div className={cn("flex flex-col bg-[#1A1A1A] h-full", className)}>
      {/* Call header */}
      <div className="p-4 border-b border-[#333333] flex items-center justify-between">
        <div className="flex items-center">
          <span className="material-icons text-green-500 mr-2">
            {callSession.type === 'audio' ? 'call' : 'videocam'}
          </span>
          <span className="text-[#E1E1E1] font-medium">
            {callSession.type === 'audio' ? 'Voice Call' : 'Video Call'} 
            <span className="ml-2 text-[#A0A0A0] text-sm">
              {new Date(callSession.startTime).toLocaleTimeString()} • 
              {participants.length} participants
            </span>
          </span>
        </div>
        
        <div>
          <Button
            variant="ghost"
            className="h-8 w-8 p-0 text-red-500 hover:bg-red-500/10 hover:text-red-600"
            onClick={onEndCall}
          >
            <span className="material-icons">call_end</span>
          </Button>
        </div>
      </div>
      
      {/* Call participants grid */}
      {fullscreenUserId ? (
        // Fullscreen mode
        <div className="flex-1 bg-[#1E1E1E] relative">
          {participants.map(participant => (
            participant.id === fullscreenUserId && (
              <div 
                key={participant.id}
                className="w-full h-full p-2 flex items-center justify-center relative"
                onClick={() => handleParticipantClick(participant)}
              >
                {/* Fullscreen participant video */}
                <div className={cn(
                  "w-full h-full flex items-center justify-center bg-[#252525] rounded-lg overflow-hidden",
                  participant.id === activeSpeakerId && "border-2 border-green-500"
                )}>
                  {isVideoOff && participant.id === currentUser.id ? (
                    <UserAvatar user={participant} size="lg" />
                  ) : (
                    <div className="bg-[#2A2A2A] w-full h-full flex items-center justify-center text-[#E1E1E1]">
                      {/* In a real app, this would be the video feed */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <UserAvatar user={participant} size="lg" />
                      </div>
                    </div>
                  )}
                  
                  {/* Participant name and status */}
                  <div className="absolute bottom-4 left-4 bg-black/60 px-2 py-1 rounded text-white text-sm flex items-center">
                    {participant.username}
                    {participant.id === currentUser.id && isMuted && (
                      <span className="material-icons text-xs text-red-500 ml-1">mic_off</span>
                    )}
                  </div>
                  
                  {/* Exit fullscreen button */}
                  <button 
                    className="absolute top-4 right-4 bg-black/60 rounded-full p-1.5"
                    onClick={() => setFullscreenUserId(null)}
                  >
                    <span className="material-icons text-white text-sm">fullscreen_exit</span>
                  </button>
                </div>
              </div>
            )
          ))}
          
          {/* Small thumbnails of other participants */}
          <div className="absolute bottom-4 right-4 flex space-x-2">
            {participants.filter(p => p.id !== fullscreenUserId).map(participant => (
              <div 
                key={participant.id}
                className="w-32 h-24 bg-[#252525] rounded-lg overflow-hidden border border-[#333333] cursor-pointer"
                onClick={() => handleParticipantClick(participant)}
              >
                <div className="w-full h-full flex items-center justify-center relative">
                  <UserAvatar user={participant} />
                  {participant.id === currentUser.id && isMuted && (
                    <span className="absolute bottom-1 right-1 material-icons text-xs text-red-500">
                      mic_off
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        // Grid mode
        <div className={cn(
          "flex-1 grid gap-2 p-2 bg-[#1E1E1E]",
          getGridClass()
        )}>
          {participants.map(participant => (
            <div 
              key={participant.id}
              className="relative rounded-lg overflow-hidden cursor-pointer"
              onClick={() => handleParticipantClick(participant)}
            >
              {/* Participant video */}
              <div className={cn(
                "w-full h-full flex items-center justify-center bg-[#252525]",
                participant.id === activeSpeakerId && "border-2 border-green-500"
              )}>
                {isVideoOff && participant.id === currentUser.id ? (
                  <UserAvatar user={participant} size="lg" />
                ) : (
                  <div className="bg-[#2A2A2A] w-full h-full flex items-center justify-center text-[#E1E1E1]">
                    {/* In a real app, this would be the video feed */}
                    <UserAvatar user={participant} size="lg" />
                  </div>
                )}
              </div>
              
              {/* Participant name and status */}
              <div className="absolute bottom-2 left-2 bg-black/60 px-2 py-1 rounded text-white text-sm flex items-center">
                {participant.username}
                {participant.id === currentUser.id && isMuted && (
                  <span className="material-icons text-xs text-red-500 ml-1">mic_off</span>
                )}
              </div>
              
              {/* Fullscreen button */}
              <button 
                className="absolute top-2 right-2 bg-black/60 rounded-full p-1.5"
                onClick={(e) => {
                  e.stopPropagation();
                  setFullscreenUserId(participant.id);
                }}
              >
                <span className="material-icons text-white text-sm">fullscreen</span>
              </button>
            </div>
          ))}
        </div>
      )}
      
      {/* Call controls */}
      <div className="p-4 border-t border-[#333333] flex items-center justify-center space-x-4">
        <Button
          variant="ghost"
          size="lg"
          className={cn(
            "h-12 w-12 rounded-full flex items-center justify-center",
            isMuted 
              ? "bg-red-500/20 text-red-500 hover:bg-red-500/30 hover:text-red-600" 
              : "bg-[#252525] text-[#E1E1E1] hover:bg-[#333333]"
          )}
          onClick={handleToggleMute}
        >
          <span className="material-icons">
            {isMuted ? 'mic_off' : 'mic'}
          </span>
        </Button>
        
        {callSession.type === 'video' && (
          <Button
            variant="ghost"
            size="lg"
            className={cn(
              "h-12 w-12 rounded-full flex items-center justify-center",
              isVideoOff 
                ? "bg-red-500/20 text-red-500 hover:bg-red-500/30 hover:text-red-600" 
                : "bg-[#252525] text-[#E1E1E1] hover:bg-[#333333]"
            )}
            onClick={handleToggleVideo}
          >
            <span className="material-icons">
              {isVideoOff ? 'videocam_off' : 'videocam'}
            </span>
          </Button>
        )}
        
        <Button
          variant="ghost"
          size="lg"
          className={cn(
            "h-12 w-12 rounded-full flex items-center justify-center",
            isScreenSharing 
              ? "bg-green-500/20 text-green-500 hover:bg-green-500/30 hover:text-green-600" 
              : "bg-[#252525] text-[#E1E1E1] hover:bg-[#333333]"
          )}
          onClick={handleToggleScreenShare}
        >
          <span className="material-icons">
            {isScreenSharing ? 'stop_screen_share' : 'screen_share'}
          </span>
        </Button>
        
        <Button
          variant="ghost"
          size="lg"
          className="h-12 w-12 rounded-full flex items-center justify-center bg-red-500 text-white hover:bg-red-600"
          onClick={onEndCall}
        >
          <span className="material-icons">call_end</span>
        </Button>
      </div>
    </div>
  );
}