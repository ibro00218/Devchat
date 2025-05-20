import { 
  users, 
  groups, 
  groupMembers, 
  messages, 
  type User, 
  type Group, 
  type GroupMember, 
  type Message, 
  type InsertUser, 
  type InsertGroup, 
  type InsertGroupMember, 
  type InsertMessage,
  type CodeSnippet
} from "@shared/schema";

// Storage interface
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserStatus(id: number, status: string): Promise<User | undefined>;
  getUsers(): Promise<User[]>;
  
  // Group operations
  getGroup(id: number): Promise<Group | undefined>;
  createGroup(group: InsertGroup): Promise<Group>;
  updateGroup(id: number, group: Partial<InsertGroup>): Promise<Group | undefined>;
  getGroups(): Promise<Group[]>;
  getUserGroups(userId: number): Promise<Group[]>;
  
  // Group member operations
  addUserToGroup(groupMember: InsertGroupMember): Promise<GroupMember>;
  removeUserFromGroup(groupId: number, userId: number): Promise<boolean>;
  getGroupMembers(groupId: number): Promise<GroupMember[]>;
  
  // Message operations
  getMessage(id: number): Promise<Message | undefined>;
  createMessage(message: InsertMessage): Promise<Message>;
  getUserMessages(userId: number): Promise<Message[]>;
  getDirectMessages(userId: number, recipientId: number): Promise<Message[]>;
  getGroupMessages(groupId: number): Promise<Message[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private groups: Map<number, Group>;
  private groupMembers: Map<number, GroupMember>;
  private messages: Map<number, Message>;
  
  private userId: number;
  private groupId: number;
  private groupMemberId: number;
  private messageId: number;
  
  constructor() {
    this.users = new Map();
    this.groups = new Map();
    this.groupMembers = new Map();
    this.messages = new Map();
    
    this.userId = 1;
    this.groupId = 1;
    this.groupMemberId = 1;
    this.messageId = 1;
    
    // Initialize with some sample data
    this.initializeSampleData();
  }
  
  private initializeSampleData() {
    // Sample users
    const user1: User = {
      id: this.userId++,
      username: "Iron3646",
      password: "password123",
      avatarInitial: "I",
      avatarColor: "bg-emerald-700",
      status: "online",
      createdAt: new Date()
    };
    
    const user2: User = {
      id: this.userId++,
      username: "SkyCoder",
      password: "password123",
      avatarInitial: "S",
      avatarColor: "bg-gray-700",
      status: "away",
      createdAt: new Date()
    };
    
    const user3: User = {
      id: this.userId++,
      username: "CodeMaster",
      password: "password123",
      avatarInitial: "C",
      avatarColor: "bg-gray-700",
      status: "offline",
      createdAt: new Date()
    };
    
    this.users.set(user1.id, user1);
    this.users.set(user2.id, user2);
    this.users.set(user3.id, user3);
    
    // Sample groups
    const group1: Group = {
      id: this.groupId++,
      name: "Dev Team",
      icon: "groups",
      color: "bg-[#4D84FF]",
      createdAt: new Date()
    };
    
    const group2: Group = {
      id: this.groupId++,
      name: "Python Devs",
      icon: "terminal",
      color: "bg-purple-700",
      createdAt: new Date()
    };
    
    const group3: Group = {
      id: this.groupId++,
      name: "Bug Hunters",
      icon: "bug_report",
      color: "bg-yellow-700",
      createdAt: new Date()
    };
    
    this.groups.set(group1.id, group1);
    this.groups.set(group2.id, group2);
    this.groups.set(group3.id, group3);
    
    // Sample group members
    this.addUserToGroup({
      groupId: group1.id,
      userId: user1.id,
      isAdmin: true
    });
    
    this.addUserToGroup({
      groupId: group1.id,
      userId: user2.id,
      isAdmin: false
    });
    
    this.addUserToGroup({
      groupId: group2.id,
      userId: user1.id,
      isAdmin: false
    });
    
    // Sample messages
    const jsCodeSnippet: CodeSnippet = {
      language: "javascript",
      code: "const sum = (a, b) => a + b;\nconsole.log(sum(2, 3));"
    };
    
    const pythonCodeSnippet: CodeSnippet = {
      language: "python",
      code: "def sum(a, b):\n    return a + b\n    \nprint(sum(2, 3))"
    };
    
    const tsCodeSnippet: CodeSnippet = {
      language: "typescript",
      code: "const sum = (a: number, b: number): number => a + b;\nconsole.log(sum(2, 3)); // 5"
    };
    
    // User 1 sends code to user 2
    this.createMessage({
      senderId: user1.id,
      recipientId: user2.id,
      codeSnippets: [jsCodeSnippet],
      content: null,
      groupId: null
    });
    
    // User 2 replies
    this.createMessage({
      senderId: user2.id,
      recipientId: user1.id,
      content: "Nice! I like how you're using arrow functions. Here's a Python version:",
      codeSnippets: [pythonCodeSnippet],
      groupId: null
    });
    
    // User 1 sends another code
    this.createMessage({
      senderId: user1.id,
      recipientId: user2.id,
      content: "Here's how we could do it in TypeScript with strong typing:",
      codeSnippets: [tsCodeSnippet],
      groupId: null
    });
  }
  
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }
  
  async createUser(userInsert: InsertUser): Promise<User> {
    const id = this.userId++;
    const user: User = { ...userInsert, id, createdAt: new Date() };
    this.users.set(id, user);
    return user;
  }
  
  async updateUserStatus(id: number, status: string): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    user.status = status;
    this.users.set(id, user);
    return user;
  }
  
  async getUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }
  
  // Group operations
  async getGroup(id: number): Promise<Group | undefined> {
    return this.groups.get(id);
  }
  
  async createGroup(groupInsert: InsertGroup): Promise<Group> {
    const id = this.groupId++;
    const group: Group = { ...groupInsert, id, createdAt: new Date() };
    this.groups.set(id, group);
    return group;
  }
  
  async updateGroup(id: number, groupUpdate: Partial<InsertGroup>): Promise<Group | undefined> {
    const group = this.groups.get(id);
    if (!group) return undefined;
    
    const updatedGroup: Group = { ...group, ...groupUpdate };
    this.groups.set(id, updatedGroup);
    return updatedGroup;
  }
  
  async getGroups(): Promise<Group[]> {
    return Array.from(this.groups.values());
  }
  
  async getUserGroups(userId: number): Promise<Group[]> {
    const memberEntries = Array.from(this.groupMembers.values())
      .filter(gm => gm.userId === userId);
    
    return memberEntries.map(gm => 
      this.groups.get(gm.groupId)
    ).filter((group): group is Group => group !== undefined);
  }
  
  // Group member operations
  async addUserToGroup(groupMemberInsert: InsertGroupMember): Promise<GroupMember> {
    const id = this.groupMemberId++;
    const groupMember: GroupMember = { 
      ...groupMemberInsert, 
      id, 
      createdAt: new Date()
    };
    this.groupMembers.set(id, groupMember);
    return groupMember;
  }
  
  async removeUserFromGroup(groupId: number, userId: number): Promise<boolean> {
    const entries = Array.from(this.groupMembers.entries());
    const memberEntry = entries.find(
      ([, gm]) => gm.groupId === groupId && gm.userId === userId
    );
    
    if (memberEntry) {
      this.groupMembers.delete(memberEntry[0]);
      return true;
    }
    
    return false;
  }
  
  async getGroupMembers(groupId: number): Promise<GroupMember[]> {
    return Array.from(this.groupMembers.values())
      .filter(gm => gm.groupId === groupId);
  }
  
  // Message operations
  async getMessage(id: number): Promise<Message | undefined> {
    return this.messages.get(id);
  }
  
  async createMessage(messageInsert: InsertMessage): Promise<Message> {
    const id = this.messageId++;
    const message: Message = { ...messageInsert, id, createdAt: new Date() };
    this.messages.set(id, message);
    return message;
  }
  
  async getUserMessages(userId: number): Promise<Message[]> {
    return Array.from(this.messages.values())
      .filter(m => 
        m.senderId === userId || 
        m.recipientId === userId
      );
  }
  
  async getDirectMessages(userId: number, recipientId: number): Promise<Message[]> {
    return Array.from(this.messages.values())
      .filter(m => 
        (m.senderId === userId && m.recipientId === recipientId) ||
        (m.senderId === recipientId && m.recipientId === userId)
      )
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }
  
  async getGroupMessages(groupId: number): Promise<Message[]> {
    return Array.from(this.messages.values())
      .filter(m => m.groupId === groupId)
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }
}

export const storage = new MemStorage();
