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
  showLabels = false,
}) => {
  const [isCallDialogOpen, setIsCallDialogOpen] = useState(false);
  
  // Size classes
  const sizeClasses = {
    sm: {
      button: "h-7 w-7",
      icon: "h-3 w-3",
    },
    md: {
      button: "h-9 w-9",
      icon: "h-4 w-4",
    },
    lg: {
      button: "h-10 w-10",
      icon: "h-5 w-5",
    },
  };
  
  const buttonClass = sizeClasses[size].button;
  const iconClass = sizeClasses[size].icon;

  return (
    <>
      <div className="flex items-center space-x-2">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className={`${buttonClass} rounded-full bg-[#2b2d31] hover:bg-[#3b3d43] text-[#a0a0a0] hover:text-white`}
                onClick={() => setIsCallDialogOpen(true)}
              >
                <Phone className={iconClass} />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p className="text-xs">Voice Call</p>
            </TooltipContent>
          </Tooltip>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className={`${buttonClass} rounded-full bg-[#2b2d31] hover:bg-[#3b3d43] text-[#a0a0a0] hover:text-white`}
                onClick={() => setIsCallDialogOpen(true)}
              >
                <Video className={iconClass} />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p className="text-xs">Video Call</p>
            </TooltipContent>
          </Tooltip>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className={`${buttonClass} rounded-full bg-[#2b2d31] hover:bg-[#3b3d43] text-[#a0a0a0] hover:text-white`}
                onClick={() => setIsCallDialogOpen(true)}
              >
                <MonitorUp className={iconClass} />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p className="text-xs">Screen Share</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        {showLabels && (
          <div className="text-xs text-gray-400">
            Call {recipient.username}
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