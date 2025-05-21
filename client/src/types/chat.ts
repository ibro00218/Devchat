export type UserStatus = "online" | "away" | "offline";

export type UserRole = "admin" | "moderator" | "member" | "guest";

// Tag format: username#1234
export interface User {
  id: number;
  username: string;
  tagNumber: string; // 4-digit number for user identification (username#1234)
  status: UserStatus;
  avatarInitial: string;
  avatarColor: string;
  bio?: string;
  email?: string;
  role?: UserRole;
  joinedAt: Date;
}

export interface UserProfile extends User {
  fullName?: string;
  location?: string;
  links?: { title: string; url: string }[];
  skills?: string[];
}

export interface GroupMember {
  userId: number;
  groupId: number;
  role: UserRole;
  joinedAt: Date;
}

export interface Group {
  id: number;
  name: string;
  icon: string;
  color: string;
  description?: string;
  ownerId: number;
  isPrivate: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface GroupChannel {
  id: number;
  groupId: number;
  name: string;
  type: "text" | "voice" | "video";
  isPrivate: boolean;
}

export interface CodeSnippet {
  language: string;
  code: string;
}

export interface FileAttachment {
  id: number;
  name: string;
  type: string; // MIME type
  size: number; // in bytes
  url: string;
  thumbnailUrl?: string;
  uploadedAt: Date;
}

export interface Message {
  id: number;
  senderId: number;
  recipientId?: number;
  groupId?: number;
  channelId?: number;
  timestamp: Date;
  text?: string;
  codeSnippets?: CodeSnippet[];
  fileAttachments?: FileAttachment[];
  reactions?: MessageReaction[];
  isEdited: boolean;
  replyToId?: number; // For thread replies
}

export interface MessageReaction {
  userId: number;
  emoji: string;
  timestamp: Date;
}

export interface CallSession {
  id: string;
  initiatorId: number;
  participants: number[];
  type: "audio" | "video";
  startTime: Date;
  endTime?: Date;
  isActive: boolean;
  groupId?: number;
  channelId?: number;
  isScreenSharing: boolean;
}

export interface ChatState {
  users: User[];
  groups: Group[];
  channels: GroupChannel[];
  currentChat: {
    type: "user" | "group";
    id: number;
    channelId?: number;
  } | null;
  messages: Record<string, Message[]>;
  activeCall: CallSession | null;
  currentUser: User;
  notifications: Notification[];
  onlineUsers: Set<number>;
}

export interface Notification {
  id: number;
  userId: number;
  type: "message" | "friend_request" | "group_invite" | "mention" | "reaction";
  senderName: string;
  content: string;
  timestamp: Date;
  read: boolean;
  linkTo?: string;
}

export type LanguageOption = {
  value: string;
  label: string;
};

export const LANGUAGE_OPTIONS: LanguageOption[] = [
  { value: "javascript", label: "JavaScript" },
  { value: "typescript", label: "TypeScript" },
  { value: "python", label: "Python" },
  { value: "java", label: "Java" },
  { value: "csharp", label: "C#" },
  { value: "cpp", label: "C++" },
  { value: "go", label: "Go" },
  { value: "ruby", label: "Ruby" },
  { value: "rust", label: "Rust" },
  { value: "php", label: "PHP" },
  { value: "html", label: "HTML" },
  { value: "css", label: "CSS" },
  { value: "json", label: "JSON" },
  { value: "sql", label: "SQL" },
  { value: "shell", label: "Shell/Bash" },
  { value: "xml", label: "XML" },
  { value: "markdown", label: "Markdown" },
  { value: "yaml", label: "YAML" },
  { value: "jsx", label: "JSX" },
  { value: "tsx", label: "TSX" },
  { value: "swift", label: "Swift" },
  { value: "kotlin", label: "Kotlin" },
  { value: "dart", label: "Dart" },
  { value: "c", label: "C" }
];
