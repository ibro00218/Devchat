import React from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { User } from '@/types/chat';

interface UserAvatarProps {
  user: User;
  showStatus?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function UserAvatar({ 
  user, 
  showStatus = true, 
  size = "md", 
  className = ""
}: UserAvatarProps) {
  const getSizeClass = () => {
    switch (size) {
      case "sm": return "h-8 w-8";
      case "lg": return "h-16 w-16";
      case "md":
      default: return "h-10 w-10";
    }
  };
  
  const getStatusColor = () => {
    switch (user.status) {
      case "online": return "bg-green-500";
      case "away": return "bg-amber-500";
      case "offline": return "bg-gray-500";
      default: return "bg-gray-500";
    }
  };
  
  return (
    <div className={`relative ${className}`}>
      <Avatar className={`${getSizeClass()} border-2 border-[#2A2A2A]`}>
        <AvatarFallback 
          style={{ backgroundColor: user.avatarColor }} 
          className="text-white font-semibold"
        >
          {user.avatarInitial}
        </AvatarFallback>
      </Avatar>
      
      {showStatus && (
        <div 
          className={`absolute bottom-0 right-0 w-3 h-3 ${getStatusColor()} rounded-full border-2 border-[#1A1A1A]`}
        />
      )}
    </div>
  );
}