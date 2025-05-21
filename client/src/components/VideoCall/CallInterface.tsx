import React, { useState, useEffect } from 'react';
import { User, CallSession } from '@/types/chat';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { CallStatus, useCall } from './CallProvider';
import { Mic, MicOff, Video, VideoOff, PhoneOff, MonitorUp, MonitorDown } from 'lucide-react';

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
  className = ''
}: CallInterfaceProps) {
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const { callStatus } = useCall();
  
  // Mock video/audio streams with colored divs for each participant
  const participantColors = [
    'bg-blue-700',
    'bg-emerald-700',
    'bg-violet-700',
    'bg-amber-700',
    'bg-pink-700'
  ];

  // Update call duration timer
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    
    if (callStatus === 'connected') {
      timer = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    }
    
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [callStatus]);
  
  // Format duration as mm:ss
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };
  
  // Handle call controls
  const handleToggleMute = () => {
    setIsMuted(!isMuted);
    onToggleMute();
  };
  
  const handleToggleVideo = () => {
    setIsVideoOff(!isVideoOff);
    onToggleVideo();
  };
  
  const handleToggleScreenShare = () => {
    setIsScreenSharing(!isScreenSharing);
    onToggleScreenShare();
  };
  
  const handleEndCall = () => {
    onEndCall();
  };

  // Generate mock user for testing if needed
  const mockUser: User = {
    id: 999,
    username: "devuser",
    tagNumber: "1234",
    status: "online",
    avatarInitial: "D",
    avatarColor: "#4285F4",
    joinedAt: new Date()
  };
  
  // Layout depends on number of participants
  const getGridClass = () => {
    const count = participants.length + 1; // +1 for current user
    if (count <= 2) return 'grid-cols-1';
    if (count <= 4) return 'grid-cols-2';
    return 'grid-cols-3';
  };
  
  const handleParticipantClick = (participant: User) => {
    // Toggle focus on participant
    console.log('Focusing on:', participant.username);
  };

  return (
    <div className={`flex flex-col h-full bg-[#1A1A1A] rounded-lg overflow-hidden ${className}`}>
      {/* Call header with status and duration */}
      <div className="bg-[#252525] p-3 flex items-center justify-between">
        <div className="flex items-center">
          <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
          <span className="text-sm font-medium text-white">
            {callSession.type === 'video' ? 'Video Call' : 'Voice Call'}
          </span>
        </div>
        <div className="text-sm text-gray-400">{formatDuration(callDuration)}</div>
      </div>
      
      {/* Participants video grid */}
      <div className={`flex-1 grid ${getGridClass()} gap-2 p-2 bg-[#121212]`}>
        {/* Current user video */}
        <div 
          className={`relative rounded-lg overflow-hidden ${isVideoOff ? 'bg-[#2A2A2A]' : 'bg-[#2D3748]'} flex items-center justify-center`}
          style={{ aspectRatio: '16/9' }}
        >
          {isVideoOff ? (
            <div className="flex flex-col items-center justify-center">
              <Avatar className="h-20 w-20 mb-2">
                <AvatarFallback className="bg-blue-700 text-white text-xl">
                  {currentUser.avatarInitial}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm text-gray-300">{currentUser.username}</span>
            </div>
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-blue-800 to-blue-600"></div>
          )}
          
          {/* User label */}
          <div className="absolute bottom-2 left-2 bg-black bg-opacity-60 px-2 py-1 rounded text-xs flex items-center">
            {isMuted && <MicOff className="w-3 h-3 mr-1 text-red-500" />}
            <span>{currentUser.username} (You)</span>
          </div>
        </div>
        
        {/* Other participants */}
        {participants.map((participant, index) => (
          <div 
            key={participant.id}
            className={`relative rounded-lg overflow-hidden ${participantColors[index % participantColors.length]} cursor-pointer`}
            style={{ aspectRatio: '16/9' }}
            onClick={() => handleParticipantClick(participant)}
          >
            {isScreenSharing && index === 0 ? (
              <div className="absolute inset-0 bg-[#1E1E1E] flex items-center justify-center">
                <div className="text-center">
                  <MonitorUp className="h-10 w-10 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm text-gray-300">Screen being shared</p>
                </div>
              </div>
            ) : (
              <>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={participant.avatarUrl} alt={participant.username} />
                    <AvatarFallback className={`text-white text-xl ${participantColors[index % participantColors.length]}`}>
                      {participant.avatarInitial}
                    </AvatarFallback>
                  </Avatar>
                </div>
                
                {/* Participant label */}
                <div className="absolute bottom-2 left-2 bg-black bg-opacity-60 px-2 py-1 rounded text-xs">
                  <span>{participant.username}</span>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
      
      {/* Call controls */}
      <div className="bg-[#252525] p-3 flex items-center justify-center space-x-4">
        <Button 
          onClick={handleToggleMute}
          variant="outline"
          size="icon"
          className={`rounded-full w-10 h-10 ${isMuted ? 'bg-red-600 hover:bg-red-700' : 'bg-[#3A3A3A] hover:bg-[#484848]'}`}
        >
          {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
        </Button>
        
        {callSession.type === 'video' && (
          <Button 
            onClick={handleToggleVideo}
            variant="outline"
            size="icon"
            className={`rounded-full w-10 h-10 ${isVideoOff ? 'bg-red-600 hover:bg-red-700' : 'bg-[#3A3A3A] hover:bg-[#484848]'}`}
          >
            {isVideoOff ? <VideoOff className="h-5 w-5" /> : <Video className="h-5 w-5" />}
          </Button>
        )}
        
        <Button 
          onClick={handleToggleScreenShare}
          variant="outline"
          size="icon"
          className={`rounded-full w-10 h-10 ${isScreenSharing ? 'bg-green-600 hover:bg-green-700' : 'bg-[#3A3A3A] hover:bg-[#484848]'}`}
        >
          {isScreenSharing ? <MonitorDown className="h-5 w-5" /> : <MonitorUp className="h-5 w-5" />}
        </Button>
        
        <Button 
          onClick={handleEndCall}
          variant="destructive"
          size="icon"
          className="rounded-full w-10 h-10 bg-red-600 hover:bg-red-700"
        >
          <PhoneOff className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}