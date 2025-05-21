import React, { useEffect, useState } from 'react';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { User } from '@/types/chat';
import { UserAvatar } from '../UserAvatar';
import { CallType, useCall } from './CallProvider';
import { Mic, Video, Phone, PhoneOff } from 'lucide-react';
import { CallInterface } from './CallInterface';

interface IncomingCallProps {
  caller: User;
  callType: CallType;
  onAccept: () => void;
  onReject: () => void;
}

const IncomingCall: React.FC<IncomingCallProps> = ({
  caller,
  callType,
  onAccept,
  onReject
}) => {
  const [ringing, setRinging] = useState(0);
  
  // Simulate ringing animation
  useEffect(() => {
    const interval = setInterval(() => {
      setRinging(prev => (prev + 1) % 3);
    }, 500);
    
    return () => clearInterval(interval);
  }, []);
  
  return (
    <div className="flex flex-col items-center">
      <UserAvatar user={caller} size="lg" className="h-24 w-24 mb-4" />
      
      <h3 className="text-xl font-medium">{caller.username}</h3>
      <p className="text-sm text-gray-400 mb-4">
        Incoming {callType === 'video' ? 'video' : 'voice'} call
      </p>
      
      <div className="flex justify-center space-x-2 mb-4">
        <div className={`w-2 h-2 rounded-full ${ringing === 0 ? 'bg-green-500' : 'bg-gray-500'}`}></div>
        <div className={`w-2 h-2 rounded-full ${ringing === 1 ? 'bg-green-500' : 'bg-gray-500'}`}></div>
        <div className={`w-2 h-2 rounded-full ${ringing === 2 ? 'bg-green-500' : 'bg-gray-500'}`}></div>
      </div>
      
      <div className="flex space-x-4">
        <Button 
          variant="outline" 
          className="rounded-full w-12 h-12 flex items-center justify-center bg-red-500 hover:bg-red-600 border-0"
          onClick={onReject}
        >
          <PhoneOff className="h-5 w-5" />
        </Button>
        
        <Button 
          variant="outline" 
          className="rounded-full w-12 h-12 flex items-center justify-center bg-green-500 hover:bg-green-600 border-0"
          onClick={onAccept}
        >
          {callType === 'video' ? <Video className="h-5 w-5" /> : <Phone className="h-5 w-5" />}
        </Button>
      </div>
    </div>
  );
};

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
  const { 
    callStatus, 
    callType,
    initiateCall,
    endCall
  } = useCall();
  
  const [showIncomingCall, setShowIncomingCall] = useState(false);
  const [incomingCaller, setIncomingCaller] = useState<User | null>(null);
  const [incomingCallType, setIncomingCallType] = useState<CallType | null>(null);
  
  // Handle dialog close
  const handleClose = () => {
    if (callStatus !== 'idle') {
      endCall();
    }
    setOpen(false);
    if (onClose) {
      onClose();
    }
  };
  
  // Handle call initiation
  const handleInitiateCall = (type: CallType) => {
    if (recipient) {
      initiateCall([recipient], type);
    }
  };
  
  // Handle incoming call acceptance
  const handleAcceptCall = () => {
    setShowIncomingCall(false);
    // Accept call logic would be here
  };
  
  // Handle incoming call rejection
  const handleRejectCall = () => {
    setShowIncomingCall(false);
    // Reject call logic would be here
  };
  
  // Mock logic for simulating incoming calls
  useEffect(() => {
    // Uncomment this to simulate incoming calls (for demo only)
    /*
    if (open && callStatus === 'idle' && !showIncomingCall) {
      const timeout = setTimeout(() => {
        setIncomingCaller({
          id: "123",
          username: "incominguser",
          email: "incoming@example.com",
          status: "online",
          createdAt: new Date()
        });
        setIncomingCallType('video');
        setShowIncomingCall(true);
      }, 3000);
      
      return () => clearTimeout(timeout);
    }
    */
  }, [open, callStatus, showIncomingCall]);
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[90vw] sm:max-h-[90vh] h-[600px] p-0 bg-[#1a1a1a] border-[#333] overflow-hidden">
        {callStatus === 'idle' && !showIncomingCall && recipient && (
          <div className="flex flex-col items-center justify-center h-full p-6">
            <DialogHeader className="mb-6 text-center">
              <DialogTitle className="text-2xl">Call {recipient.username}</DialogTitle>
              <DialogDescription>
                Choose your call type
              </DialogDescription>
            </DialogHeader>
            
            <UserAvatar user={recipient} size="lg" className="h-24 w-24 mb-6" />
            
            <div className="flex space-x-6">
              <Button 
                variant="outline" 
                className="flex flex-col items-center p-6 h-auto border-[#333] hover:bg-[#2a2a2a]"
                onClick={() => handleInitiateCall('audio')}
              >
                <Mic className="h-8 w-8 mb-2" />
                <span>Voice Call</span>
              </Button>
              
              <Button 
                variant="outline" 
                className="flex flex-col items-center p-6 h-auto border-[#333] hover:bg-[#2a2a2a]"
                onClick={() => handleInitiateCall('video')}
              >
                <Video className="h-8 w-8 mb-2" />
                <span>Video Call</span>
              </Button>
            </div>
          </div>
        )}
        
        {showIncomingCall && incomingCaller && incomingCallType && (
          <div className="flex flex-col items-center justify-center h-full p-6">
            <DialogHeader className="mb-6 text-center">
              <DialogTitle className="text-xl">Incoming Call</DialogTitle>
            </DialogHeader>
            
            <IncomingCall 
              caller={incomingCaller}
              callType={incomingCallType}
              onAccept={handleAcceptCall}
              onReject={handleRejectCall}
            />
          </div>
        )}
        
        {(callStatus === 'calling' || callStatus === 'connected') && (
          <CallInterface onClose={handleClose} />
        )}
      </DialogContent>
    </Dialog>
  );
};