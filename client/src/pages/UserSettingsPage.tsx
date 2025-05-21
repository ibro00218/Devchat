import { useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { 
  User, 
  LogOut, 
  Bell, 
  MessageSquare, 
  Mic, 
  Video, 
  Shield, 
  Languages, 
  Palette, 
  Code, 
  HelpCircle, 
  Activity
} from 'lucide-react';

export default function UserSettingsPage() {
  const [, navigate] = useLocation();
  const [activeSection, setActiveSection] = useState('my-account');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [currentTheme, setCurrentTheme] = useState('dark');
  const [fontSize, setFontSize] = useState(14);
  
  // Mock user data
  const user = {
    id: '123456789',
    username: 'devuser',
    email: 'user@example.com',
    avatar: 'https://github.com/shadcn.png',
    status: 'online',
    bio: 'Frontend developer specialized in React & TypeScript',
    theme: 'dark',
    notifications: {
      mentions: true,
      directMessages: true,
      teamMessages: true,
      sounds: true
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setAvatarFile(file);
    const reader = new FileReader();
    reader.onload = () => {
      setAvatarPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveChanges = () => {
    // Save user settings logic would go here
    console.log('Saving user settings');
    // Show success message
    setTimeout(() => {
      navigate('/');
    }, 1000);
  };

  // Render different content based on active section
  const renderContent = () => {
    switch(activeSection) {
      case 'my-account':
        return (
          <>
            <h1 className="text-2xl font-bold mb-4">My Account</h1>
            
            <div className="bg-[#2b2d31] rounded-lg p-4 mb-6">
              <div className="flex items-start">
                <div className="relative mr-4">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={avatarPreview || user.avatar} alt={user.username} />
                    <AvatarFallback>{user.username.substring(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="absolute bottom-0 right-0">
                    <label htmlFor="avatar-upload" className="cursor-pointer">
                      <div className="bg-[#5865f2] text-white p-1 rounded-full w-6 h-6 flex items-center justify-center">
                        +
                      </div>
                      <input 
                        id="avatar-upload" 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={handleAvatarChange}
                      />
                    </label>
                  </div>
                </div>
                
                <div className="flex-1">
                  <div className="bg-[#1e1f22] p-3 rounded-md">
                    <div className="grid grid-cols-[1fr_auto] gap-4 mb-3">
                      <div>
                        <p className="text-xs text-zinc-400 mb-1">USERNAME</p>
                        <p className="text-base font-medium">{user.username}</p>
                      </div>
                      <Button 
                        variant="outline" 
                        className="h-8 bg-[#4752c4] hover:bg-[#5865f2] border-none"
                        onClick={() => {
                          // Create an editable username field
                          const username = prompt("Enter new username:", user.username);
                          if (username && username.trim()) {
                            console.log(`Username updated to: ${username}`);
                            // In a real app, would update user state & call API
                          }
                        }}
                      >
                        Edit
                      </Button>
                    </div>
                    
                    <div>
                      <p className="text-xs text-zinc-400 mb-1">EMAIL</p>
                      <p className="text-base font-medium">{user.email}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-[#2b2d31] rounded-lg p-4 mb-6">
              <h2 className="font-medium mb-3">Password and Authentication</h2>
              <Button className="bg-[#4752c4] hover:bg-[#5865f2]">
                Change Password
              </Button>
            </div>
            
            <div className="bg-[#2b2d31] rounded-lg p-4 mb-6">
              <h2 className="font-medium mb-3 text-[#ed4245]">Delete Account</h2>
              <p className="text-zinc-400 text-sm mb-3">
                This will immediately delete your account and all personal data.
                This action cannot be undone.
              </p>
              <Button variant="destructive">
                Delete Account
              </Button>
            </div>
          </>
        );
        
      case 'profile':
        return (
          <>
            <h1 className="text-2xl font-bold mb-4">Profile</h1>
            
            <div className="bg-[#2b2d31] rounded-lg p-4 mb-6">
              <h2 className="font-medium mb-3">User Profile</h2>
              
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="display-name">Display Name</Label>
                  <Input 
                    id="display-name" 
                    defaultValue={user.username}
                    className="bg-[#1e1f22] border-[#3b3d43]"
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="bio">About Me</Label>
                  <Textarea 
                    id="bio" 
                    defaultValue={user.bio} 
                    rows={3}
                    className="bg-[#1e1f22] border-[#3b3d43] resize-none"
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="status">Status</Label>
                  <select 
                    id="status" 
                    defaultValue={user.status}
                    className="bg-[#1e1f22] border-[#3b3d43] p-2 rounded text-white"
                  >
                    <option value="online">Online</option>
                    <option value="idle">Idle</option>
                    <option value="dnd">Do Not Disturb</option>
                    <option value="invisible">Invisible</option>
                  </select>
                </div>
                
                <Button type="submit" className="bg-[#5865f2] hover:bg-[#4752c4]" onClick={handleSaveChanges}>
                  Save Changes
                </Button>
              </div>
            </div>
          </>
        );
        
      case 'notifications':
        return (
          <>
            <h1 className="text-2xl font-bold mb-4">Notifications</h1>
            
            <div className="bg-[#2b2d31] rounded-lg p-4 mb-6">
              <h2 className="font-medium mb-3">Notification Settings</h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Direct Messages</p>
                    <p className="text-sm text-zinc-400">Get notified when you receive a direct message</p>
                  </div>
                  <Switch defaultChecked={user.notifications.directMessages} />
                </div>
                
                <Separator className="bg-[#3b3d43]" />
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Team Messages</p>
                    <p className="text-sm text-zinc-400">Get notified about new messages in your teams</p>
                  </div>
                  <Switch defaultChecked={user.notifications.teamMessages} />
                </div>
                
                <Separator className="bg-[#3b3d43]" />
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Mentions</p>
                    <p className="text-sm text-zinc-400">Get notified when someone mentions you</p>
                  </div>
                  <Switch defaultChecked={user.notifications.mentions} />
                </div>
                
                <Separator className="bg-[#3b3d43]" />
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Sound Effects</p>
                    <p className="text-sm text-zinc-400">Play sounds for incoming messages and notifications</p>
                  </div>
                  <Switch defaultChecked={user.notifications.sounds} />
                </div>
              </div>
            </div>
          </>
        );
        
      case 'appearance':
        return (
          <>
            <h1 className="text-2xl font-bold mb-4">Appearance</h1>
            
            <div className="bg-[#2b2d31] rounded-lg p-4 mb-6">
              <h2 className="font-medium mb-3">Theme</h2>
              
              <div className="grid grid-cols-3 gap-3 mb-4">
                <div 
                  className={`bg-[#1e1f22] p-3 rounded cursor-pointer ${currentTheme === 'dark' ? 'border-2 border-[#5865f2]' : 'border border-[#3b3d43]'}`}
                  onClick={() => {
                    setCurrentTheme('dark');
                    // In a real app, would apply dark theme to the application
                    document.documentElement.classList.add('dark');
                    document.documentElement.classList.remove('light');
                    console.log('Dark theme applied');
                  }}
                >
                  <p className="font-medium">Dark</p>
                  <p className="text-xs text-zinc-400">Default dark theme</p>
                </div>
                
                <div 
                  className={`bg-[#ffffff] p-3 rounded text-black cursor-pointer ${currentTheme === 'light' ? 'border-2 border-[#5865f2]' : 'border border-[#3b3d43]'}`}
                  onClick={() => {
                    setCurrentTheme('light');
                    // In a real app, would apply light theme to the application
                    document.documentElement.classList.add('light');
                    document.documentElement.classList.remove('dark');
                    console.log('Light theme applied');
                  }}
                >
                  <p className="font-medium">Light</p>
                  <p className="text-xs text-zinc-600">Light theme</p>
                </div>
                
                <div 
                  className={`bg-[#313338] p-3 rounded cursor-pointer ${currentTheme === 'dim' ? 'border-2 border-[#5865f2]' : 'border border-[#3b3d43]'}`}
                  onClick={() => {
                    setCurrentTheme('dim');
                    // In a real app, would apply dim theme to the application
                    document.documentElement.classList.add('dim');
                    document.documentElement.classList.remove('light');
                    document.documentElement.classList.remove('dark');
                    console.log('Dim theme applied');
                  }}
                >
                  <p className="font-medium">Dim</p>
                  <p className="text-xs text-zinc-400">Softer dark theme</p>
                </div>
              </div>
              
              <div className="mt-6">
                <h3 className="font-medium mb-3">Font Size</h3>
                <div className="flex items-center space-x-2">
                  <span className="text-sm">Small</span>
                  <input 
                    type="range" 
                    min="12" 
                    max="20" 
                    value={fontSize}
                    onChange={(e) => {
                      const newSize = parseInt(e.target.value);
                      setFontSize(newSize);
                      // Apply font size to the document
                      document.documentElement.style.fontSize = `${newSize}px`;
                      console.log(`Font size changed to ${newSize}px`);
                    }}
                    className="flex-1"
                  />
                  <span className="text-sm">Large ({fontSize}px)</span>
                </div>
              </div>
            </div>
          </>
        );
        
      case 'accessibility':
        return (
          <>
            <h1 className="text-2xl font-bold mb-4">Accessibility</h1>
            
            <div className="bg-[#2b2d31] rounded-lg p-4 mb-6">
              <h2 className="font-medium mb-3">Visual Settings</h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Reduce Motion</p>
                    <p className="text-sm text-zinc-400">Reduces animation effects</p>
                  </div>
                  <Switch />
                </div>
                
                <Separator className="bg-[#3b3d43]" />
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">High Contrast</p>
                    <p className="text-sm text-zinc-400">Increases color contrast</p>
                  </div>
                  <Switch />
                </div>
              </div>
            </div>
          </>
        );
        
      case 'language':
        return (
          <>
            <h1 className="text-2xl font-bold mb-4">Language</h1>
            
            <div className="bg-[#2b2d31] rounded-lg p-4 mb-6">
              <h2 className="font-medium mb-3">App Language</h2>
              <select className="w-full bg-[#1e1f22] border-[#3b3d43] p-2 rounded text-white">
                <option value="en-US">English (United States)</option>
                <option value="es-ES">Español (España)</option>
                <option value="fr-FR">Français (France)</option>
                <option value="de-DE">Deutsch (Deutschland)</option>
                <option value="ja-JP">日本語 (日本)</option>
                <option value="ko-KR">한국어 (대한민국)</option>
                <option value="zh-CN">中文 (简体)</option>
              </select>
            </div>
          </>
        );
        
      case 'code-preferences':
        return (
          <>
            <h1 className="text-2xl font-bold mb-4">Code Preferences</h1>
            
            <div className="bg-[#2b2d31] rounded-lg p-4 mb-6">
              <h2 className="font-medium mb-3">Editor Settings</h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Tab Size</p>
                    <p className="text-sm text-zinc-400">Number of spaces per tab</p>
                  </div>
                  <select className="bg-[#1e1f22] border-[#3b3d43] p-1 rounded text-white w-16 text-center">
                    <option value="2">2</option>
                    <option value="4">4</option>
                    <option value="8">8</option>
                  </select>
                </div>
                
                <Separator className="bg-[#3b3d43]" />
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Default Language</p>
                    <p className="text-sm text-zinc-400">Default programming language for code blocks</p>
                  </div>
                  <select className="bg-[#1e1f22] border-[#3b3d43] p-1 rounded text-white w-32">
                    <option value="javascript">JavaScript</option>
                    <option value="typescript">TypeScript</option>
                    <option value="python">Python</option>
                    <option value="java">Java</option>
                    <option value="csharp">C#</option>
                  </select>
                </div>
                
                <Separator className="bg-[#3b3d43]" />
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Auto-formatting</p>
                    <p className="text-sm text-zinc-400">Automatically format code on paste</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                
                <Separator className="bg-[#3b3d43]" />
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Line Numbers</p>
                    <p className="text-sm text-zinc-400">Show line numbers in code blocks</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>
            </div>
          </>
        );
        
      case 'activity-status':
        return (
          <>
            <h1 className="text-2xl font-bold mb-4">Activity Status</h1>
            
            <div className="bg-[#2b2d31] rounded-lg p-4 mb-6">
              <h2 className="font-medium mb-3">Activity Settings</h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Display Current Activity</p>
                    <p className="text-sm text-zinc-400">Show others what code you're working on</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                
                <Separator className="bg-[#3b3d43]" />
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Display Current Project</p>
                    <p className="text-sm text-zinc-400">Show others which project you're working on</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>
            </div>
          </>
        );
        
      default:
        return <div>Select a setting from the sidebar</div>;
    }
  };

  return (
    <div className="flex h-screen bg-[#313338] text-white">
      {/* Sidebar */}
      <div className="w-60 bg-[#2b2d31] p-3 flex flex-col">
        <div className="flex-1 space-y-1">
          <div className="flex flex-col w-full bg-transparent h-auto space-y-1">
            <h2 className="text-xs text-zinc-400 font-semibold mb-1 px-2.5">USER SETTINGS</h2>
            
            <button
              className={`w-full justify-start flex gap-2 px-2.5 py-1.5 h-auto text-sm rounded-md ${
                activeSection === 'my-account' ? 'bg-[#3b3d43] text-white' : 'bg-transparent text-zinc-400 hover:bg-[#35373c] hover:text-zinc-200'
              }`}
              onClick={() => setActiveSection('my-account')}
            >
              <User className="h-4 w-4" />
              My Account
            </button>
            
            <button
              className={`w-full justify-start flex gap-2 px-2.5 py-1.5 h-auto text-sm rounded-md ${
                activeSection === 'profile' ? 'bg-[#3b3d43] text-white' : 'bg-transparent text-zinc-400 hover:bg-[#35373c] hover:text-zinc-200'
              }`}
              onClick={() => setActiveSection('profile')}
            >
              <User className="h-4 w-4" />
              Profile
            </button>
            
            <button
              className={`w-full justify-start flex gap-2 px-2.5 py-1.5 h-auto text-sm rounded-md ${
                activeSection === 'notifications' ? 'bg-[#3b3d43] text-white' : 'bg-transparent text-zinc-400 hover:bg-[#35373c] hover:text-zinc-200'
              }`}
              onClick={() => setActiveSection('notifications')}
            >
              <Bell className="h-4 w-4" />
              Notifications
            </button>

            <Separator className="my-2 bg-[#3b3d43]" />
            <h2 className="text-xs text-zinc-400 font-semibold mb-1 px-2.5">APP SETTINGS</h2>
            
            <button
              className={`w-full justify-start flex gap-2 px-2.5 py-1.5 h-auto text-sm rounded-md ${
                activeSection === 'appearance' ? 'bg-[#3b3d43] text-white' : 'bg-transparent text-zinc-400 hover:bg-[#35373c] hover:text-zinc-200'
              }`}
              onClick={() => setActiveSection('appearance')}
            >
              <Palette className="h-4 w-4" />
              Appearance
            </button>
            
            <button
              className={`w-full justify-start flex gap-2 px-2.5 py-1.5 h-auto text-sm rounded-md ${
                activeSection === 'accessibility' ? 'bg-[#3b3d43] text-white' : 'bg-transparent text-zinc-400 hover:bg-[#35373c] hover:text-zinc-200'
              }`}
              onClick={() => setActiveSection('accessibility')}
            >
              <HelpCircle className="h-4 w-4" />
              Accessibility
            </button>
            
            <button
              className={`w-full justify-start flex gap-2 px-2.5 py-1.5 h-auto text-sm rounded-md ${
                activeSection === 'language' ? 'bg-[#3b3d43] text-white' : 'bg-transparent text-zinc-400 hover:bg-[#35373c] hover:text-zinc-200'
              }`}
              onClick={() => setActiveSection('language')}
            >
              <Languages className="h-4 w-4" />
              Language
            </button>
            
            <Separator className="my-2 bg-[#3b3d43]" />
            <h2 className="text-xs text-zinc-400 font-semibold mb-1 px-2.5">CODE SETTINGS</h2>
            
            <button
              className={`w-full justify-start flex gap-2 px-2.5 py-1.5 h-auto text-sm rounded-md ${
                activeSection === 'code-preferences' ? 'bg-[#3b3d43] text-white' : 'bg-transparent text-zinc-400 hover:bg-[#35373c] hover:text-zinc-200'
              }`}
              onClick={() => setActiveSection('code-preferences')}
            >
              <Code className="h-4 w-4" />
              Code Preferences
            </button>
            
            <button
              className={`w-full justify-start flex gap-2 px-2.5 py-1.5 h-auto text-sm rounded-md ${
                activeSection === 'activity-status' ? 'bg-[#3b3d43] text-white' : 'bg-transparent text-zinc-400 hover:bg-[#35373c] hover:text-zinc-200'
              }`}
              onClick={() => setActiveSection('activity-status')}
            >
              <Activity className="h-4 w-4" />
              Activity Status
            </button>
          </div>
        </div>
        
        <Button variant="destructive" className="w-full mt-4" onClick={() => navigate('/')}>
          <LogOut className="h-4 w-4 mr-2" />
          Log Out
        </Button>
      </div>
      
      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {renderContent()}
      </div>
    </div>
  );
}