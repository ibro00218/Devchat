import { WebSocketServer, WebSocket } from 'ws';
import { Server } from 'http';
import { storage } from './storage';

interface Client {
  userId: number;
  ws: WebSocket;
}

export class ChatSocketServer {
  private wss: WebSocketServer;
  private clients: Map<WebSocket, Client>;

  constructor(server: Server) {
    this.wss = new WebSocketServer({ server, path: '/ws' });
    this.clients = new Map();

    this.init();
  }

  private init() {
    this.wss.on('connection', (ws: WebSocket) => {
      console.log('Client connected');

      // Temporarily assign userId 1 (first user - would normally be from auth)
      this.clients.set(ws, { userId: 1, ws });

      ws.on('message', async (message: string) => {
        try {
          this.handleMessage(ws, message);
        } catch (error) {
          console.error('Error handling message:', error);
          ws.send(JSON.stringify({
            type: 'error',
            message: 'Failed to process message'
          }));
        }
      });

      ws.on('close', () => {
        console.log('Client disconnected');
        this.clients.delete(ws);
      });

      // Send user and group list on connect
      this.sendInitialData(ws);
    });
  }

  private async sendInitialData(ws: WebSocket) {
    try {
      const users = await storage.getUsers();
      const groups = await storage.getGroups();

      ws.send(JSON.stringify({
        type: 'init',
        data: {
          users: users.map(u => ({ 
            id: u.id, 
            username: u.username, 
            status: u.status,
            avatarInitial: u.avatarInitial,
            avatarColor: u.avatarColor
          })),
          groups
        }
      }));
    } catch (error) {
      console.error('Error sending initial data:', error);
    }
  }

  private async handleMessage(ws: WebSocket, rawMessage: string) {
    const client = this.clients.get(ws);
    if (!client) return;

    const message = JSON.parse(rawMessage);

    switch (message.type) {
      case 'message':
        await this.handleChatMessage(client, message);
        break;
      
      case 'status':
        await this.handleStatusChange(client, message);
        break;
        
      default:
        ws.send(JSON.stringify({
          type: 'error',
          message: 'Unknown message type'
        }));
    }
  }

  private async handleChatMessage(client: Client, message: any) {
    const { chatType, chatId, text, codeSnippets } = message.message;
    
    try {
      let savedMessage;
      
      if (chatType === 'user') {
        // Direct message
        savedMessage = await storage.createMessage({
          senderId: client.userId,
          recipientId: chatId,
          groupId: null,
          content: text || null,
          codeSnippets: codeSnippets || null
        });
      } else {
        // Group message
        savedMessage = await storage.createMessage({
          senderId: client.userId,
          recipientId: null,
          groupId: chatId,
          content: text || null,
          codeSnippets: codeSnippets || null
        });
      }
      
      // Broadcast to relevant clients
      this.broadcastMessage(savedMessage, chatType, chatId);
      
    } catch (error) {
      console.error('Error saving message:', error);
      client.ws.send(JSON.stringify({
        type: 'error',
        message: 'Failed to save message'
      }));
    }
  }

  private async handleStatusChange(client: Client, message: any) {
    const { status } = message;
    
    try {
      const user = await storage.updateUserStatus(client.userId, status);
      
      if (user) {
        // Broadcast status change to all clients
        this.broadcastToAll({
          type: 'status',
          userId: user.id,
          status: user.status
        });
      }
    } catch (error) {
      console.error('Error updating status:', error);
    }
  }

  private async broadcastMessage(message: any, chatType: string, chatId: number) {
    const receiverIds = new Set<number>();
    
    if (chatType === 'user') {
      // Direct message - send to sender and recipient
      receiverIds.add(message.senderId);
      if (message.recipientId) receiverIds.add(message.recipientId);
    } else {
      // Group message - send to all group members
      const members = await storage.getGroupMembers(chatId);
      members.forEach(member => receiverIds.add(member.userId));
    }
    
    // Get sender info to include in the message
    const sender = await storage.getUser(message.senderId);
    
    // Broadcast to all relevant clients
    for (const [ws, client] of this.clients.entries()) {
      if (receiverIds.has(client.userId)) {
        ws.send(JSON.stringify({
          type: 'message',
          message: {
            ...message,
            sender: {
              id: sender?.id,
              username: sender?.username,
              avatarInitial: sender?.avatarInitial,
              avatarColor: sender?.avatarColor
            },
            chatType,
            chatId
          }
        }));
      }
    }
  }

  private broadcastToAll(data: any) {
    for (const [ws] of this.clients.entries()) {
      ws.send(JSON.stringify(data));
    }
  }
}
