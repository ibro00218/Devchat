import { cn } from "@/lib/utils";
import { User, UserStatus } from "@/types/chat";

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
  className 
}: UserAvatarProps) {
  // Map size to dimensions
  const sizeMap = {
    sm: "w-6 h-6 text-xs",
    md: "w-8 h-8 text-sm",
    lg: "w-10 h-10 text-base"
  };

  // Map status to colors and classes
  const statusMap: Record<UserStatus, { bg: string, animation?: string }> = {
    online: { bg: "bg-[#10B981]", animation: "status-online" },
    away: { bg: "bg-[#F59E0B]" },
    offline: { bg: "bg-[#9CA3AF]" }
  };

  const statusClasses = statusMap[user.status];

  return (
    <div className={cn("relative", className)}>
      <div 
        className={cn(
          "rounded-full flex items-center justify-center text-white font-medium", 
          sizeMap[size],
          user.avatarColor
        )}
      >
        {user.avatarInitial}
      </div>
      
      {showStatus && (
        <div 
          className={cn(
            "absolute bottom-0 right-0 rounded-full border-2 border-[#1A1A1A]",
            statusClasses.bg,
            statusClasses.animation,
            size === "sm" ? "w-2 h-2" : "w-3 h-3"
          )}
        />
      )}
    </div>
  );
}
