import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Phone, Video, MonitorUp } from 'lucide-react';
import { CallDialog } from './CallDialog';
import { User } from '@/types/chat';

interface CallButtonsProps {
  recipient: User;
  size?: 'sm' | 'md' | 'lg';
  showLabels?: boolean;
}

export const CallButtons: React.FC<CallButtonsProps> = ({
  recipient,
  size = 'md',
  showLabels = false
}) => {
  const [isCallDialogOpen, setIsCallDialogOpen] = useState(false);
  const [callType, setCallType] = useState<'audio' | 'video'>('audio');
  
  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'h-8 w-8';
      case 'lg':
        return 'h-12 w-12';
      case 'md':
      default:
        return 'h-10 w-10';
    }
  };
  
  const getIconSize = () => {
    switch (size) {
      case 'sm':
        return 'h-4 w-4';
      case 'lg':
        return 'h-6 w-6';
      case 'md':
      default:
        return 'h-5 w-5';
    }
  };
  
  const handleVoiceCall = () => {
    setCallType('audio');
    setIsCallDialogOpen(true);
  };
  
  const handleVideoCall = () => {
    setCallType('video');
    setIsCallDialogOpen(true);
  };
  
  return (
    <>
      <div className="flex items-center gap-2">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={handleVoiceCall}
                variant="outline"
                size="icon"
                className={`${getSizeClasses()} rounded-full bg-[#3A3A3A] hover:bg-[#484848] border-none`}
                aria-label="Voice call"
              >
                <Phone className={getIconSize()} />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p className="text-xs">Voice call</p>
            </TooltipContent>
          </Tooltip>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={handleVideoCall}
                variant="outline"
                size="icon"
                className={`${getSizeClasses()} rounded-full bg-[#3A3A3A] hover:bg-[#484848] border-none`}
                aria-label="Video call"
              >
                <Video className={getIconSize()} />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p className="text-xs">Video call</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        {showLabels && (
          <div className="flex flex-col text-xs text-gray-400">
            <span>Call {recipient.username}</span>
          </div>
        )}
      </div>
      
      <CallDialog
        open={isCallDialogOpen}
        setOpen={setIsCallDialogOpen}
        recipient={recipient}
      />
    </>
  );
};