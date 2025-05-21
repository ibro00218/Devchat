import { useState } from 'react';
import { useLocation } from 'wouter';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Settings, LogOut, User, Bell, Moon, Sun } from 'lucide-react';
import { Switch } from '@/components/ui/switch';

export function UserSettingsButton() {
  const [, navigate] = useLocation();
  const [isDarkMode, setIsDarkMode] = useState(true);

  // Mock user data
  const user = {
    id: '123456789',
    username: 'devuser',
    email: 'user@example.com',
    avatar: 'https://github.com/shadcn.png',
    status: 'online'
  };

  const handleStatusChange = (status: string) => {
    console.log(`Status changed to: ${status}`);
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    // In a real app, you would also update your theme context/state
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className="flex items-center p-2 rounded-md hover:bg-[#3b3d43] cursor-pointer">
          <Avatar className="h-8 w-8 mr-2">
            <AvatarImage src={user.avatar} alt={user.username} />
            <AvatarFallback>{user.username.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col items-start">
            <span className="text-sm font-medium text-white">{user.username}</span>
            <span className="text-xs text-green-500">Online</span>
          </div>
        </div>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent className="w-56 bg-[#2b2d31] border-[#1e1f22] text-white" align="end">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium">{user.username}</p>
            <p className="text-xs text-zinc-400">{user.email}</p>
          </div>
        </DropdownMenuLabel>
        
        <DropdownMenuSeparator className="bg-[#3b3d43]" />
        
        <div className="px-2 py-1.5">
          <div className="text-xs font-semibold text-zinc-400 mb-1.5">STATUS</div>
          <div className="grid grid-cols-2 gap-1">
            <div 
              className="flex items-center gap-1.5 p-1.5 rounded hover:bg-[#3b3d43] cursor-pointer"
              onClick={() => handleStatusChange('online')}
            >
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <span className="text-xs">Online</span>
            </div>
            <div 
              className="flex items-center gap-1.5 p-1.5 rounded hover:bg-[#3b3d43] cursor-pointer"
              onClick={() => handleStatusChange('idle')}
            >
              <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
              <span className="text-xs">Idle</span>
            </div>
            <div 
              className="flex items-center gap-1.5 p-1.5 rounded hover:bg-[#3b3d43] cursor-pointer"
              onClick={() => handleStatusChange('dnd')}
            >
              <div className="w-2 h-2 rounded-full bg-red-500"></div>
              <span className="text-xs">Do Not Disturb</span>
            </div>
            <div 
              className="flex items-center gap-1.5 p-1.5 rounded hover:bg-[#3b3d43] cursor-pointer"
              onClick={() => handleStatusChange('invisible')}
            >
              <div className="w-2 h-2 rounded-full bg-gray-500"></div>
              <span className="text-xs">Invisible</span>
            </div>
          </div>
        </div>
        
        <DropdownMenuSeparator className="bg-[#3b3d43]" />
        
        <DropdownMenuItem 
          className="flex items-center gap-2 cursor-pointer hover:bg-[#3b3d43] focus:bg-[#3b3d43]"
          onClick={() => navigate('/settings')}
        >
          <Settings className="h-4 w-4" />
          <span>User Settings</span>
        </DropdownMenuItem>
        
        <DropdownMenuItem 
          className="flex items-center gap-2 cursor-pointer hover:bg-[#3b3d43] focus:bg-[#3b3d43]"
          onClick={() => navigate('/settings?tab=profile')}
        >
          <User className="h-4 w-4" />
          <span>Profile</span>
        </DropdownMenuItem>
        
        <DropdownMenuItem 
          className="flex items-center gap-2 cursor-pointer hover:bg-[#3b3d43] focus:bg-[#3b3d43]"
          onClick={() => navigate('/settings?tab=notifications')}
        >
          <Bell className="h-4 w-4" />
          <span>Notifications</span>
        </DropdownMenuItem>
        
        <DropdownMenuItem 
          className="flex items-center justify-between cursor-pointer hover:bg-[#3b3d43] focus:bg-[#3b3d43]"
          onClick={toggleDarkMode}
        >
          <div className="flex items-center gap-2">
            {isDarkMode ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            <span>Dark Mode</span>
          </div>
          <Switch checked={isDarkMode} />
        </DropdownMenuItem>
        
        <DropdownMenuSeparator className="bg-[#3b3d43]" />
        
        <DropdownMenuItem 
          className="flex items-center gap-2 text-[#ed4245] cursor-pointer hover:bg-[#3b3d43] focus:bg-[#3b3d43]"
          onClick={() => navigate('/login')}
        >
          <LogOut className="h-4 w-4" />
          <span>Log Out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}