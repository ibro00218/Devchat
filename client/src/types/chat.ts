export type UserStatus = "online" | "away" | "offline";

export interface User {
  id: number;
  username: string;
  status: UserStatus;
  avatarInitial: string;
  avatarColor: string;
}

export interface Group {
  id: number;
  name: string;
  icon: string;
  color: string;
}

export interface CodeSnippet {
  language: string;
  code: string;
}

export interface Message {
  id: number;
  senderId: number;
  timestamp: Date;
  text?: string;
  codeSnippets?: CodeSnippet[];
}

export interface ChatState {
  users: User[];
  groups: Group[];
  currentChat: {
    type: "user" | "group";
    id: number;
  } | null;
  messages: Record<string, Message[]>;
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
  { value: "markdown", label: "Markdown" }
];
