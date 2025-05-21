import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { User } from '@/types/chat';
import { UserAvatar } from '../UserAvatar';
import { CallType, useCall } from './CallProvider';
import { Mic, Video, Phone, PhoneOff } from 'lucide-react';
import { CallInterface } from './CallInterface';

// Component for displaying an incoming call notification
interface IncomingCallProps {
  caller: User;
  callType: CallType;
  onAccept: () => void;
  onReject: () => void;
}

function IncomingCall({ caller, callType, onAccept, onReject }: IncomingCallProps) {
  return (
    <div className="flex flex-col items-center gap-4 py-4">
      <div className="relative">
        <UserAvatar user={caller} size="lg" />
        <div className="absolute bottom-0 right-0 bg-green-500 border-2 border-[#1A1A1A] rounded-full p-1">
          {callType === 'video' ? (
            <Video className="h-4 w-4 text-white" />
          ) : (
            <Mic className="h-4 w-4 text-white" />
          )}
        </div>
      </div>
      
      <div className="text-center">
        <h3 className="text-lg font-medium text-white">Incoming {callType} call</h3>
        <p className="text-sm text-gray-400">from {caller.username}</p>
      </div>
      
      <div className="flex gap-4 mt-2">
        <Button 
          onClick={onReject} 
          variant="destructive"
          size="sm"
          className="rounded-full"
        >
          <PhoneOff className="h-4 w-4 mr-2" />
          Decline
        </Button>
        
        <Button 
          onClick={onAccept} 
          className="bg-green-600 hover:bg-green-700 text-white rounded-full"
          size="sm"
        >
          <Phone className="h-4 w-4 mr-2" />
          Accept
        </Button>
      </div>
    </div>
  );
}

// Main call dialog component
interface CallDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  recipient?: User;
  onClose?: () => void;
}

export const CallDialog: React.FC<CallDialogProps> = ({
  open,
  setOpen,
  recipient,
  onClose
}) => {
  const [callInitiated, setCallInitiated] = useState(false);
  const { 
    incomingCall, 
    currentCall, 
    callStatus, 
    initiateCall, 
    acceptCall, 
    rejectCall, 
    endCall,
    toggleMute,
    toggleVideo,
    toggleScreenShare
  } = useCall();
  
  // Handle initiating a call
  const handleInitiateCall = (type: CallType) => {
    if (recipient) {
      initiateCall([recipient], type);
      setCallInitiated(true);
    }
  };
  
  // Handle call end/close
  const handleClose = () => {
    if (callStatus !== 'idle') {
      endCall();
    }
    setCallInitiated(false);
    setOpen(false);
    if (onClose) onClose();
  };
  
  // Handle accepting an incoming call
  const handleAcceptCall = () => {
    acceptCall();
    setCallInitiated(true);
  };
  
  // Handle rejecting an incoming call
  const handleRejectCall = () => {
    rejectCall();
    setOpen(false);
  };

  // Determine what to show in the dialog based on call state
  const renderDialogContent = () => {
    // Show incoming call UI
    if (incomingCall && !callInitiated) {
      return (
        <IncomingCall 
          caller={incomingCall.caller} 
          callType={incomingCall.type} 
          onAccept={handleAcceptCall} 
          onReject={handleRejectCall} 
        />
      );
    }
    
    // Show active call interface
    if (currentCall) {
      return (
        <div className="h-[500px]">
          <CallInterface 
            callSession={{
              id: currentCall.id,
              type: currentCall.type,
              isScreenSharing: currentCall.isScreenSharing
            }}
            currentUser={{
              id: 1,
              username: "You",
              tagNumber: "0000",
              status: "online",
              avatarInitial: "Y",
              avatarColor: "#4285F4",
              joinedAt: new Date()
            }}
            participants={currentCall.participants}
            onEndCall={handleClose}
            onToggleMute={toggleMute}
            onToggleVideo={toggleVideo}
            onToggleScreenShare={toggleScreenShare}
          />
        </div>
      );
    }
    
    // Show initial call options if we have a recipient
    if (recipient) {
      return (
        <div className="flex flex-col items-center gap-6 py-6">
          <UserAvatar user={recipient} size="lg" />
          
          <div className="text-center">
            <h3 className="text-lg font-medium text-white">{recipient.username}</h3>
            <p className="text-sm text-gray-400">Start a call</p>
          </div>
          
          <div className="flex gap-6 mt-2">
            <Button 
              onClick={() => handleInitiateCall('audio')}
              variant="outline"
              size="lg"
              className="rounded-full w-14 h-14 flex items-center justify-center bg-[#3A3A3A] hover:bg-[#484848]"
            >
              <Mic className="h-6 w-6" />
            </Button>
            
            <Button 
              onClick={() => handleInitiateCall('video')}
              variant="outline"
              size="lg"
              className="rounded-full w-14 h-14 flex items-center justify-center bg-[#3A3A3A] hover:bg-[#484848]"
            >
              <Video className="h-6 w-6" />
            </Button>
          </div>
        </div>
      );
    }
    
    // Fallback - should never happen
    return (
      <div className="p-4 text-center text-gray-500">
        <p>No call information available</p>
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent 
        className={`bg-[#1E1E1E] border border-[#333333] text-white p-0 overflow-hidden max-w-md ${
          currentCall ? 'w-[600px] max-w-[90vw]' : ''
        }`}
        onInteractOutside={(e) => {
          // Prevent closing the dialog by clicking outside when in a call
          if (currentCall || incomingCall) {
            e.preventDefault();
          }
        }}
        onEscapeKeyDown={(e) => {
          // Prevent closing the dialog with escape key when in a call
          if (currentCall || incomingCall) {
            e.preventDefault();
          }
        }}
      >
        {!currentCall && (
          <DialogHeader className="bg-[#252525] px-4 py-3">
            <DialogTitle className="text-white text-lg">
              {incomingCall ? 'Incoming Call' : (recipient ? 'Call ' + recipient.username : 'Call')}
            </DialogTitle>
          </DialogHeader>
        )}
        
        {renderDialogContent()}
      </DialogContent>
    </Dialog>
  );
};