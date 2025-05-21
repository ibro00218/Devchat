import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useCall, CallParticipant } from './CallProvider';
import { UserAvatar } from '../UserAvatar';
import { Mic, MicOff, Video, VideoOff, Monitor, PhoneOff, 
        Maximize2, Minimize2, Users, ChevronLeft, ChevronRight } from 'lucide-react';

interface VideoElementProps {
  stream: MediaStream | null;
  muted: boolean;
  className?: string;
}

const VideoElement: React.FC<VideoElementProps> = ({ stream, muted, className }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  
  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);
  
  return (
    <div className={`relative overflow-hidden bg-[#1a1a1a] rounded-lg ${className}`}>
      {stream ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={muted}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <div className="text-[#666] text-sm">No video</div>
        </div>
      )}
    </div>
  );
};

interface ParticipantViewProps {
  participant: CallParticipant;
  isLocal: boolean;
  onClick: () => void;
  isActive: boolean;
}

const ParticipantView: React.FC<ParticipantViewProps> = ({ 
  participant, 
  isLocal, 
  onClick, 
  isActive 
}) => {
  return (
    <div 
      className={`relative cursor-pointer transition-all duration-200 ${
        isActive ? 'border-2 border-[#5865F2]' : 'border border-[#333]'
      }`}
      onClick={onClick}
    >
      <VideoElement 
        stream={participant.stream || null} 
        muted={isLocal}
        className="w-full h-full"
      />
      
      <div className="absolute bottom-2 left-2 flex items-center space-x-2">
        <UserAvatar 
          user={participant.user} 
          size="sm" 
          className="border-2 border-[#1a1a1a]" 
        />
        <span className="text-xs font-medium bg-black/50 px-2 py-1 rounded">
          {participant.user.username} {isLocal && '(You)'}
        </span>
      </div>
      
      <div className="absolute bottom-2 right-2 flex space-x-1">
        {!participant.audio && (
          <div className="bg-red-500 rounded-full p-1">
            <MicOff size={12} />
          </div>
        )}
        {!participant.video && (
          <div className="bg-red-500 rounded-full p-1">
            <VideoOff size={12} />
          </div>
        )}
        {participant.screen && (
          <div className="bg-green-500 rounded-full p-1">
            <Monitor size={12} />
          </div>
        )}
      </div>
    </div>
  );
};

interface CallInterfaceProps {
  className?: string;
  onClose?: () => void;
}

export const CallInterface: React.FC<CallInterfaceProps> = ({ 
  className,
  onClose
}) => {
  const {
    callStatus,
    callType,
    participants,
    localStream,
    screenStream,
    isAudioEnabled,
    isVideoEnabled,
    isScreenSharing,
    activeParticipant,
    endCall,
    toggleAudio,
    toggleVideo,
    toggleScreenShare,
    setActiveParticipant,
  } = useCall();
  
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showParticipants, setShowParticipants] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Handle fullscreen toggle
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };
  
  // Handle call ending
  const handleEndCall = () => {
    endCall();
    if (onClose) {
      onClose();
    }
  };
  
  // Local participant
  const localParticipant = participants.find(p => 
    p.user.id === (activeParticipant?.user.id)
  );
  
  // If call is not active, don't render anything
  if (callStatus === 'idle' || !localParticipant) {
    return null;
  }
  
  return (
    <div 
      ref={containerRef}
      className={`bg-[#1a1a1a] flex flex-col h-full rounded-lg overflow-hidden ${className}`}
    >
      {/* Main video area */}
      <div className="flex-1 flex">
        {/* Main video display */}
        <div className="flex-1 relative overflow-hidden">
          {/* Active participant video or screen share */}
          {activeParticipant && (
            <VideoElement 
              stream={isScreenSharing && activeParticipant.user.id === localParticipant.user.id 
                ? screenStream 
                : activeParticipant.stream || null}
              muted={activeParticipant.user.id === localParticipant.user.id}
              className="w-full h-full"
            />
          )}
          
          {/* Status indicators */}
          {callStatus === 'calling' && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
              <div className="text-center">
                <div className="text-lg font-semibold mb-2">Calling...</div>
                <div className="flex justify-center space-x-2">
                  <div className="animate-pulse bg-green-500 rounded-full h-3 w-3"></div>
                  <div className="animate-pulse bg-green-500 rounded-full h-3 w-3 animation-delay-200"></div>
                  <div className="animate-pulse bg-green-500 rounded-full h-3 w-3 animation-delay-400"></div>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Participants sidebar */}
        {showParticipants && participants.length > 1 && (
          <div className="w-64 border-l border-[#333] bg-[#1E1E1E] p-2 flex flex-col">
            <div className="text-sm font-medium mb-2 px-2 flex justify-between items-center">
              <span>Participants ({participants.length})</span>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={() => setShowParticipants(false)}
              >
                <ChevronRight size={16} />
              </Button>
            </div>
            
            <div className="space-y-2 overflow-y-auto flex-1">
              {participants.map(participant => (
                <ParticipantView
                  key={participant.user.id}
                  participant={participant}
                  isLocal={participant.user.id === localParticipant.user.id}
                  onClick={() => setActiveParticipant(participant)}
                  isActive={activeParticipant?.user.id === participant.user.id}
                />
              ))}
            </div>
          </div>
        )}
        
        {/* Collapsed participants toggle */}
        {!showParticipants && (
          <div className="border-l border-[#333] bg-[#1E1E1E] p-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={() => setShowParticipants(true)}
            >
              <ChevronLeft size={16} />
            </Button>
          </div>
        )}
      </div>
      
      {/* Call controls */}
      <div className="bg-[#0f0f0f] px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="text-sm font-medium text-white">
            {callType === 'video' ? 'Video Call' : 'Voice Call'}
          </div>
          
          <div className="text-xs text-gray-400">
            {callStatus === 'connected' 
              ? `${participants.length} participant${participants.length !== 1 ? 's' : ''}` 
              : callStatus}
          </div>
        </div>
        
        <div className="flex space-x-4">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className={`rounded-full h-10 w-10 ${!isAudioEnabled ? 'bg-red-500 hover:bg-red-600' : 'bg-[#333] hover:bg-[#444]'}`}
                  onClick={toggleAudio}
                >
                  {isAudioEnabled ? <Mic size={18} /> : <MicOff size={18} />}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">
                <p className="text-xs">{isAudioEnabled ? 'Mute' : 'Unmute'}</p>
              </TooltipContent>
            </Tooltip>
            
            {callType === 'video' && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`rounded-full h-10 w-10 ${!isVideoEnabled ? 'bg-red-500 hover:bg-red-600' : 'bg-[#333] hover:bg-[#444]'}`}
                    onClick={toggleVideo}
                  >
                    {isVideoEnabled ? <Video size={18} /> : <VideoOff size={18} />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top">
                  <p className="text-xs">{isVideoEnabled ? 'Turn off camera' : 'Turn on camera'}</p>
                </TooltipContent>
              </Tooltip>
            )}
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className={`rounded-full h-10 w-10 ${isScreenSharing ? 'bg-green-500 hover:bg-green-600' : 'bg-[#333] hover:bg-[#444]'}`}
                  onClick={toggleScreenShare}
                >
                  <Monitor size={18} />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">
                <p className="text-xs">{isScreenSharing ? 'Stop sharing' : 'Share screen'}</p>
              </TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="rounded-full h-10 w-10 bg-[#333] hover:bg-[#444]"
                  onClick={toggleFullscreen}
                >
                  {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">
                <p className="text-xs">{isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}</p>
              </TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="rounded-full h-10 w-10 bg-red-500 hover:bg-red-600"
                  onClick={handleEndCall}
                >
                  <PhoneOff size={18} />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">
                <p className="text-xs">End call</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            className="text-xs text-gray-400"
            onClick={() => setShowParticipants(!showParticipants)}
          >
            <Users size={16} className="mr-1" />
            Participants ({participants.length})
          </Button>
        </div>
      </div>
    </div>
  );
};