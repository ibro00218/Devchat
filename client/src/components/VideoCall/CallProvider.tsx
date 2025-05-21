import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { User } from '@/types/chat';
import { toast } from '@/hooks/use-toast';

// Define call session types
export type CallType = 'audio' | 'video';
export type CallStatus = 'idle' | 'calling' | 'connected' | 'ended';

interface CallSession {
  id: string;
  initiatorId: number;
  type: CallType;
  participants: User[];
  isScreenSharing: boolean;
  startTime: Date;
  isActive: boolean;
}

interface CallContextType {
  callStatus: CallStatus;
  currentCall: CallSession | null;
  incomingCall: { caller: User; type: CallType } | null;
  initiateCall: (recipients: User[], type: CallType) => void;
  acceptCall: () => void;
  rejectCall: () => void;
  endCall: () => void;
  toggleMute: () => void;
  toggleVideo: () => void;
  toggleScreenShare: () => void;
  isMuted: boolean;
  isVideoEnabled: boolean;
  isScreenSharing: boolean;
}

const CallContext = createContext<CallContextType | undefined>(undefined);

interface CallProviderProps {
  children: React.ReactNode;
  currentUser: User;
}

const generateCallId = () => Math.random().toString(36).substring(2, 15);

export function CallProvider({ children, currentUser }: CallProviderProps) {
  // Call state
  const [callStatus, setCallStatus] = useState<CallStatus>('idle');
  const [currentCall, setCurrentCall] = useState<CallSession | null>(null);
  const [incomingCall, setIncomingCall] = useState<{ caller: User; type: CallType } | null>(null);
  
  // Media state
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  
  // Mock connections
  const [mockConnections, setMockConnections] = useState<Record<string, boolean>>({});
  
  // Timeouts refs
  const callTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const mockIncomingCallTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (callTimeoutRef.current) {
        clearTimeout(callTimeoutRef.current);
      }
      if (mockIncomingCallTimeoutRef.current) {
        clearTimeout(mockIncomingCallTimeoutRef.current);
      }
    };
  }, []);
  
  // Mock incoming call for demo purposes
  const setupMockIncomingCall = () => {
    // Cancel any existing timeout
    if (mockIncomingCallTimeoutRef.current) {
      clearTimeout(mockIncomingCallTimeoutRef.current);
    }
    
    // Set a random timeout between 60-120 seconds for next mock incoming call
    // Longer period to be less intrusive during testing
    const timeout = Math.floor(Math.random() * 60000) + 60000;
    mockIncomingCallTimeoutRef.current = setTimeout(() => {
      // Only trigger if not in a call
      if (callStatus === 'idle') {
        const mockCallers = [
          {
            id: 500,
            username: 'CodeSage',
            tagNumber: '0042',
            status: 'online' as 'online',
            avatarInitial: 'C',
            avatarColor: '#4CAF50',
            joinedAt: new Date()
          },
          {
            id: 501,
            username: 'DevNinja',
            tagNumber: '1337',
            status: 'online' as 'online',
            avatarInitial: 'D',
            avatarColor: '#E91E63',
            joinedAt: new Date()
          },
          {
            id: 502,
            username: 'WebWizard',
            tagNumber: '2468',
            status: 'online' as 'online',
            avatarInitial: 'W',
            avatarColor: '#2196F3',
            joinedAt: new Date()
          }
        ];
        
        // Select a random caller
        const mockCaller = mockCallers[Math.floor(Math.random() * mockCallers.length)];
        
        // 50% chance of video or audio call
        const callType: CallType = Math.random() > 0.5 ? 'video' : 'audio';
        
        setIncomingCall({
          caller: mockCaller,
          type: callType
        });
        
        // Toast notification
        toast({
          title: `Incoming ${callType} call`,
          description: `${mockCaller.username} is calling you`,
          duration: 10000
        });
        
        // Auto reject after 20 seconds if not answered
        setTimeout(() => {
          if (incomingCall && callStatus === 'idle') {
            setIncomingCall(null);
            toast({
              title: 'Missed call',
              description: `You missed a call from ${mockCaller.username}`,
              variant: "destructive",
              duration: 5000
            });
          }
        }, 20000);
      }
      
      // Setup next mock call
      setupMockIncomingCall();
    }, timeout);
  };
  
  // Initiate call to recipients
  const initiateCall = (recipients: User[], type: CallType) => {
    if (callStatus !== 'idle') {
      toast({
        title: 'Call in progress',
        description: 'Please end your current call before starting a new one',
        variant: 'destructive'
      });
      return;
    }
    
    const callId = generateCallId();
    setCurrentCall({
      id: callId,
      initiatorId: currentUser.id,
      type,
      participants: recipients,
      isScreenSharing: false,
      startTime: new Date(),
      isActive: true
    });
    setCallStatus('calling');
    
    // Clear any previous timeouts
    if (callTimeoutRef.current) {
      clearTimeout(callTimeoutRef.current);
    }
    
    // Setup mock call accept/reject
    callTimeoutRef.current = setTimeout(() => {
      // Simulate 80% chance of call being accepted
      if (Math.random() < 0.8) {
        // Call accepted
        setCallStatus('connected');
        toast({
          title: 'Call connected',
          description: `${recipients.map(r => r.username).join(', ')} joined the call`,
        });
        
        // Setup mock connections
        const connections: Record<string, boolean> = {};
        recipients.forEach(recipient => {
          connections[recipient.id.toString()] = true;
        });
        setMockConnections(connections);
      } else {
        // Call rejected
        setCallStatus('ended');
        setCurrentCall(null);
        toast({
          title: 'Call ended',
          description: `${recipients.map(r => r.username).join(', ')} did not answer`,
          variant: 'destructive'
        });
      }
    }, 3000);
  };
  
  // Accept incoming call
  const acceptCall = () => {
    if (!incomingCall) return;
    
    const callId = generateCallId();
    setCurrentCall({
      id: callId,
      initiatorId: incomingCall.caller.id,
      type: incomingCall.type,
      participants: [incomingCall.caller],
      isScreenSharing: false,
      startTime: new Date(),
      isActive: true
    });
    
    setCallStatus('connected');
    setIncomingCall(null);
    
    // Setup mock connection
    setMockConnections({
      [incomingCall.caller.id.toString()]: true
    });
    
    toast({
      title: 'Call connected',
      description: `You joined ${incomingCall.caller.username}'s ${incomingCall.type} call`,
    });
  };
  
  // Reject incoming call
  const rejectCall = () => {
    if (!incomingCall) return;
    
    setIncomingCall(null);
    toast({
      title: 'Call rejected',
      description: `You declined ${incomingCall.caller.username}'s call`,
    });
  };
  
  // End current call
  const endCall = () => {
    if (callStatus !== 'idle') {
      setCallStatus('ended');
      
      // Small delay before resetting completely
      setTimeout(() => {
        setCallStatus('idle');
        setCurrentCall(null);
        setMockConnections({});
      }, 500);
      
      toast({
        title: 'Call ended',
        description: 'The call has been ended',
      });
    }
  };
  
  // Toggle mute
  const toggleMute = () => {
    setIsMuted(!isMuted);
    toast({
      title: isMuted ? 'Microphone unmuted' : 'Microphone muted',
      description: isMuted ? 'Others can now hear you' : 'Others cannot hear you',
    });
  };
  
  // Toggle video
  const toggleVideo = () => {
    setIsVideoEnabled(!isVideoEnabled);
    toast({
      title: isVideoEnabled ? 'Camera turned off' : 'Camera turned on',
      description: isVideoEnabled ? 'Others cannot see you' : 'Others can now see you',
    });
  };
  
  // Toggle screen share
  const toggleScreenShare = () => {
    if (currentCall) {
      // First update the state to reflect the new screen sharing status
      const newStatus = !isScreenSharing;
      setIsScreenSharing(newStatus);
      
      // Then update the call object with the new status
      setCurrentCall({
        ...currentCall,
        isScreenSharing: newStatus
      });
      
      // Provide meaningful feedback to the user
      toast({
        title: newStatus ? 'Screen sharing started' : 'Screen sharing stopped',
        description: newStatus 
          ? 'Others can now see your screen' 
          : 'You stopped sharing your screen',
        variant: newStatus ? "default" : "destructive"
      });
    } else {
      // Inform user they need an active call to share screen
      toast({
        title: 'No active call',
        description: 'You need to be in a call to share your screen',
        variant: "destructive"
      });
    }
  };
  
  // Initialize mock call system
  useEffect(() => {
    setupMockIncomingCall();
    
    return () => {
      if (mockIncomingCallTimeoutRef.current) {
        clearTimeout(mockIncomingCallTimeoutRef.current);
      }
    };
  }, []);
  
  const value = {
    callStatus,
    currentCall,
    incomingCall,
    initiateCall,
    acceptCall,
    rejectCall,
    endCall,
    toggleMute,
    toggleVideo,
    toggleScreenShare,
    isMuted,
    isVideoEnabled,
    isScreenSharing
  };
  
  return (
    <CallContext.Provider value={value}>
      {children}
    </CallContext.Provider>
  );
}

export function useCall() {
  const context = useContext(CallContext);
  if (context === undefined) {
    throw new Error('useCall must be used within a CallProvider');
  }
  return context;
}