import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { User } from '@/types/chat';

// Define call session types
export type CallType = 'audio' | 'video';
export type CallStatus = 'idle' | 'calling' | 'connected' | 'ended';

// Interface for call participants
export interface CallParticipant {
  user: User;
  stream?: MediaStream;
  audio: boolean;
  video: boolean;
  screen: boolean;
}

// Interface for call context
interface CallContextType {
  callStatus: CallStatus;
  callType: CallType | null;
  participants: CallParticipant[];
  localStream: MediaStream | null;
  screenStream: MediaStream | null;
  isAudioEnabled: boolean;
  isVideoEnabled: boolean;
  isScreenSharing: boolean;
  activeParticipant: CallParticipant | null;
  initiateCall: (users: User[], type: CallType) => void;
  joinCall: (callId: string) => void;
  endCall: () => void;
  toggleAudio: () => void;
  toggleVideo: () => void;
  toggleScreenShare: () => void;
  setActiveParticipant: (participant: CallParticipant) => void;
}

// Create context with default values
const CallContext = createContext<CallContextType>({
  callStatus: 'idle',
  callType: null,
  participants: [],
  localStream: null,
  screenStream: null,
  isAudioEnabled: true,
  isVideoEnabled: true,
  isScreenSharing: false,
  activeParticipant: null,
  initiateCall: () => {},
  joinCall: () => {},
  endCall: () => {},
  toggleAudio: () => {},
  toggleVideo: () => {},
  toggleScreenShare: () => {},
  setActiveParticipant: () => {},
});

// Mock socket for demonstration
const createMockSocket = () => {
  const listeners: Record<string, Function[]> = {};
  
  return {
    emit: (event: string, data: any) => {
      console.log(`Emitted ${event}`, data);
      
      // Simulate call accepted after delay
      if (event === 'call-initiate') {
        setTimeout(() => {
          if (listeners['call-accepted']) {
            listeners['call-accepted'].forEach(callback => 
              callback({
                callId: 'mock-call-id',
                participants: data.participants
              })
            );
          }
        }, 1500);
      }
    },
    on: (event: string, callback: Function) => {
      if (!listeners[event]) {
        listeners[event] = [];
      }
      listeners[event].push(callback);
    },
    off: (event: string) => {
      delete listeners[event];
    }
  };
};

export const CallProvider: React.FC<{children: React.ReactNode, currentUser: User}> = ({ 
  children, 
  currentUser 
}) => {
  const [callStatus, setCallStatus] = useState<CallStatus>('idle');
  const [callType, setCallType] = useState<CallType | null>(null);
  const [participants, setParticipants] = useState<CallParticipant[]>([]);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [screenStream, setScreenStream] = useState<MediaStream | null>(null);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [activeParticipant, setActiveParticipant] = useState<CallParticipant | null>(null);
  
  // Mock socket for signaling
  const socketRef = useRef(createMockSocket());
  
  useEffect(() => {
    // Set up socket listeners
    const socket = socketRef.current;
    
    socket.on('call-incoming', (data: any) => {
      // Handle incoming call logic
      console.log('Incoming call', data);
    });
    
    socket.on('call-accepted', (data: any) => {
      setCallStatus('connected');
      console.log('Call accepted', data);
    });
    
    socket.on('call-rejected', () => {
      setCallStatus('ended');
      console.log('Call rejected');
    });
    
    socket.on('call-ended', () => {
      endCall();
      console.log('Call ended by other participant');
    });
    
    // Clean up listeners
    return () => {
      socket.off('call-incoming');
      socket.off('call-accepted');
      socket.off('call-rejected');
      socket.off('call-ended');
    };
  }, []);
  
  // Function to get user media
  const getUserMedia = async (type: CallType) => {
    try {
      const constraints = {
        audio: true,
        video: type === 'video',
      };
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      setLocalStream(stream);
      
      // Set initial states based on stream
      setIsAudioEnabled(true);
      setIsVideoEnabled(type === 'video');
      
      return stream;
    } catch (error) {
      console.error('Error getting user media:', error);
      return null;
    }
  };
  
  // Initiate a call with selected users
  const initiateCall = async (users: User[], type: CallType) => {
    try {
      // Get local media stream
      const stream = await getUserMedia(type);
      
      if (!stream) {
        console.error('Failed to get media stream');
        return;
      }
      
      // Create list of participants including current user
      const localParticipant: CallParticipant = {
        user: currentUser,
        stream,
        audio: true,
        video: type === 'video',
        screen: false,
      };
      
      const remoteParticipants: CallParticipant[] = users.map(user => ({
        user,
        audio: false,
        video: false,
        screen: false,
      }));
      
      const allParticipants = [localParticipant, ...remoteParticipants];
      setParticipants(allParticipants);
      setActiveParticipant(localParticipant);
      
      // Set call status and type
      setCallStatus('calling');
      setCallType(type);
      
      // Emit call initiation event to signaling server
      socketRef.current.emit('call-initiate', {
        participants: users.map(user => user.id),
        type,
      });
    } catch (error) {
      console.error('Error initiating call:', error);
    }
  };
  
  // Join an existing call
  const joinCall = async (callId: string) => {
    try {
      // Determine call type (would normally come from signaling)
      const type: CallType = 'video'; // Assuming video for demo
      
      // Get local media stream
      const stream = await getUserMedia(type);
      
      if (!stream) {
        console.error('Failed to get media stream');
        return;
      }
      
      // Set call status and type
      setCallStatus('connected');
      setCallType(type);
      
      // Add current user to participants
      const localParticipant: CallParticipant = {
        user: currentUser,
        stream,
        audio: true,
        video: type === 'video',
        screen: false,
      };
      
      setParticipants([localParticipant]);
      setActiveParticipant(localParticipant);
      
      // Emit join call event
      socketRef.current.emit('call-join', {
        callId,
      });
    } catch (error) {
      console.error('Error joining call:', error);
    }
  };
  
  // End current call
  const endCall = () => {
    // Stop all media streams
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
      setLocalStream(null);
    }
    
    if (screenStream) {
      screenStream.getTracks().forEach(track => track.stop());
      setScreenStream(null);
    }
    
    // Emit event to notify others
    socketRef.current.emit('call-end');
    
    // Reset call state
    setCallStatus('idle');
    setCallType(null);
    setParticipants([]);
    setActiveParticipant(null);
    setIsScreenSharing(false);
  };
  
  // Toggle audio mute state
  const toggleAudio = () => {
    if (localStream) {
      const audioTracks = localStream.getAudioTracks();
      const newState = !isAudioEnabled;
      
      audioTracks.forEach(track => {
        track.enabled = newState;
      });
      
      // Update participant info
      setParticipants(prev => 
        prev.map(p => 
          p.user.id === currentUser.id 
            ? { ...p, audio: newState } 
            : p
        )
      );
      
      setIsAudioEnabled(newState);
      
      // Notify other participants of mute state
      socketRef.current.emit('audio-toggle', {
        enabled: newState,
      });
    }
  };
  
  // Toggle video state
  const toggleVideo = () => {
    if (localStream) {
      const videoTracks = localStream.getVideoTracks();
      const newState = !isVideoEnabled;
      
      videoTracks.forEach(track => {
        track.enabled = newState;
      });
      
      // Update participant info
      setParticipants(prev => 
        prev.map(p => 
          p.user.id === currentUser.id 
            ? { ...p, video: newState } 
            : p
        )
      );
      
      setIsVideoEnabled(newState);
      
      // Notify other participants
      socketRef.current.emit('video-toggle', {
        enabled: newState,
      });
    }
  };
  
  // Toggle screen sharing
  const toggleScreenShare = async () => {
    try {
      // If already sharing screen, stop sharing
      if (isScreenSharing && screenStream) {
        screenStream.getTracks().forEach(track => track.stop());
        setScreenStream(null);
        setIsScreenSharing(false);
        
        // Update participant info
        setParticipants(prev => 
          prev.map(p => 
            p.user.id === currentUser.id 
              ? { ...p, screen: false } 
              : p
          )
        );
        
        // Notify other participants
        socketRef.current.emit('screen-share-end');
        return;
      }
      
      // Start screen sharing
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: false,
      });
      
      setScreenStream(stream);
      setIsScreenSharing(true);
      
      // Update participant info
      setParticipants(prev => 
        prev.map(p => 
          p.user.id === currentUser.id 
            ? { ...p, screen: true } 
            : p
        )
      );
      
      // Notify other participants
      socketRef.current.emit('screen-share-start');
      
      // Handle stream end (user stops sharing)
      stream.getVideoTracks()[0].onended = () => {
        setScreenStream(null);
        setIsScreenSharing(false);
        
        // Update participant info
        setParticipants(prev => 
          prev.map(p => 
            p.user.id === currentUser.id 
              ? { ...p, screen: false } 
              : p
          )
        );
        
        // Notify other participants
        socketRef.current.emit('screen-share-end');
      };
    } catch (error) {
      console.error('Error toggling screen share:', error);
    }
  };
  
  return (
    <CallContext.Provider
      value={{
        callStatus,
        callType,
        participants,
        localStream,
        screenStream,
        isAudioEnabled,
        isVideoEnabled,
        isScreenSharing,
        activeParticipant,
        initiateCall,
        joinCall,
        endCall,
        toggleAudio,
        toggleVideo,
        toggleScreenShare,
        setActiveParticipant,
      }}
    >
      {children}
    </CallContext.Provider>
  );
};

// Custom hook to use call context
export const useCall = () => useContext(CallContext);