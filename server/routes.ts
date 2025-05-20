import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { ChatSocketServer } from "./socket";
import { z } from "zod";
import { 
  insertUserSchema, 
  insertGroupSchema, 
  insertGroupMemberSchema,
  insertMessageSchema, 
  codeSnippetSchema 
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);
  
  // Initialize WebSocket server
  new ChatSocketServer(httpServer);
  
  // API Routes
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
  });
  
  // User routes
  app.get('/api/users', async (req, res) => {
    try {
      const users = await storage.getUsers();
      res.json(users.map(user => ({
        id: user.id,
        username: user.username,
        status: user.status,
        avatarInitial: user.avatarInitial,
        avatarColor: user.avatarColor
      })));
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch users' });
    }
  });
  
  app.get('/api/users/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid user ID' });
      }
      
      const user = await storage.getUser(id);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      res.json({
        id: user.id,
        username: user.username,
        status: user.status,
        avatarInitial: user.avatarInitial,
        avatarColor: user.avatarColor
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch user' });
    }
  });
  
  // Group routes
  app.get('/api/groups', async (req, res) => {
    try {
      const groups = await storage.getGroups();
      res.json(groups);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch groups' });
    }
  });
  
  app.post('/api/groups', async (req, res) => {
    try {
      const result = insertGroupSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: 'Invalid group data', details: result.error });
      }
      
      const group = await storage.createGroup(result.data);
      res.status(201).json(group);
    } catch (error) {
      res.status(500).json({ error: 'Failed to create group' });
    }
  });
  
  app.get('/api/groups/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid group ID' });
      }
      
      const group = await storage.getGroup(id);
      if (!group) {
        return res.status(404).json({ error: 'Group not found' });
      }
      
      res.json(group);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch group' });
    }
  });
  
  app.get('/api/groups/:id/members', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid group ID' });
      }
      
      const members = await storage.getGroupMembers(id);
      
      // Get user details for each member
      const memberDetails = await Promise.all(
        members.map(async (member) => {
          const user = await storage.getUser(member.userId);
          return {
            id: member.id,
            userId: member.userId,
            username: user?.username,
            isAdmin: member.isAdmin,
            avatarInitial: user?.avatarInitial,
            avatarColor: user?.avatarColor
          };
        })
      );
      
      res.json(memberDetails);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch group members' });
    }
  });
  
  // Message routes
  app.get('/api/messages/direct/:userId', async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const recipientId = parseInt(req.query.recipientId as string);
      
      if (isNaN(userId) || isNaN(recipientId)) {
        return res.status(400).json({ error: 'Invalid user ID' });
      }
      
      const messages = await storage.getDirectMessages(userId, recipientId);
      res.json(messages);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch direct messages' });
    }
  });
  
  app.get('/api/messages/group/:groupId', async (req, res) => {
    try {
      const groupId = parseInt(req.params.groupId);
      
      if (isNaN(groupId)) {
        return res.status(400).json({ error: 'Invalid group ID' });
      }
      
      const messages = await storage.getGroupMessages(groupId);
      res.json(messages);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch group messages' });
    }
  });
  
  app.post('/api/messages', async (req, res) => {
    try {
      const messageSchema = insertMessageSchema
        .refine(
          data => (data.recipientId !== null && data.groupId === null) || 
                  (data.recipientId === null && data.groupId !== null),
          { message: "Either recipientId or groupId must be provided, but not both" }
        );
      
      const result = messageSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: 'Invalid message data', details: result.error });
      }
      
      const message = await storage.createMessage(result.data);
      res.status(201).json(message);
    } catch (error) {
      res.status(500).json({ error: 'Failed to create message' });
    }
  });

  return httpServer;
}
