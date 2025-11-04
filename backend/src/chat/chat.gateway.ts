import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UseGuards } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ChatService } from './chat.service';
import { SendMessageDto } from './dto/send-message.dto';
import { JoinRoomDto } from './dto/join-room.dto';
import { TypingDto } from './dto/typing.dto';

interface AuthenticatedSocket extends Socket {
  user?: {
    sub: number;
    email: string;
    name: string;
    role: string;
  };
}

@WebSocketGateway({
  namespace: '/chat',
  cors: {
    origin: [
      'http://localhost:3000',
      'http://localhost:3001',
      process.env.FRONTEND_URL,
    ].filter(Boolean),
    credentials: true,
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(
    private chatService: ChatService,
    private jwtService: JwtService,
  ) {}

  async handleConnection(client: AuthenticatedSocket) {
    try {
      // Extract token from handshake
      const token = client.handshake.auth.token || client.handshake.headers.authorization?.split(' ')[1];

      if (!token) {
        client.disconnect();
        return;
      }

      // Verify JWT token
      const payload = this.jwtService.verify(token);
      client.user = payload;

      // Update online status
      await this.chatService.updateOnlineStatus(payload.sub, true, client.id);

      // Notify relevant rooms that user is online
      this.server.emit('user_online', {
        userId: payload.sub,
        userName: payload.name,
      });

      console.log(`Client connected: ${payload.name} (${payload.email})`);
    } catch (error) {
      console.error('Connection error:', error.message);
      client.disconnect();
    }
  }

  async handleDisconnect(client: AuthenticatedSocket) {
    if (client.user) {
      // Update online status
      await this.chatService.updateOnlineStatus(client.user.sub, false);

      // Notify relevant rooms that user is offline
      this.server.emit('user_offline', {
        userId: client.user.sub,
        userName: client.user.name,
      });

      console.log(`Client disconnected: ${client.user.name}`);
    }
  }

  @SubscribeMessage('join_room')
  async handleJoinRoom(
    @MessageBody() data: JoinRoomDto,
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    try {
      if (!client.user) {
        return { success: false, message: 'Unauthorized' };
      }

      const roomId = parseInt(data.roomId);

      // Verify user can access this room
      const canAccess = await this.chatService.canAccessRoom(roomId, client.user.sub);
      if (!canAccess) {
        return { success: false, message: 'Access denied to this room' };
      }

      // Join the Socket.IO room
      client.join(`room_${roomId}`);

      // Get message history
      const messages = await this.chatService.getMessageHistory(roomId, client.user.sub);

      // Get unread count for this room
      const unreadCount = await this.chatService.getRoomUnreadCount(roomId, client.user.sub);

      return {
        success: true,
        messages,
        unreadCount,
      };
    } catch (error) {
      console.error('Join room error:', error.message);
      return { success: false, message: error.message };
    }
  }

  @SubscribeMessage('leave_room')
  async handleLeaveRoom(
    @MessageBody() data: JoinRoomDto,
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    const roomId = parseInt(data.roomId);
    client.leave(`room_${roomId}`);
    return { success: true };
  }

  @SubscribeMessage('send_message')
  async handleSendMessage(
    @MessageBody() data: SendMessageDto,
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    try {
      if (!client.user) {
        return { success: false, message: 'Unauthorized' };
      }

      const roomId = parseInt(data.roomId);

      // Save message to database
      const message = await this.chatService.saveMessage(
        roomId,
        client.user.sub,
        data.message,
        data.messageType || 'text',
      );

      // Broadcast message to all participants in the room
      this.server.to(`room_${roomId}`).emit('message_received', {
        ...message,
        sent_at: message.sent_at.toISOString(),
      });

      return { success: true, message };
    } catch (error) {
      console.error('Send message error:', error.message);
      return { success: false, message: error.message };
    }
  }

  @SubscribeMessage('typing_start')
  async handleTypingStart(
    @MessageBody() data: TypingDto,
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    if (!client.user) return;

    const roomId = parseInt(data.roomId);

    // Broadcast to others in the room (not sender)
    client.to(`room_${roomId}`).emit('user_typing', {
      userId: client.user.sub,
      userName: client.user.name,
      isTyping: true,
    });

    return { success: true };
  }

  @SubscribeMessage('typing_stop')
  async handleTypingStop(
    @MessageBody() data: TypingDto,
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    if (!client.user) return;

    const roomId = parseInt(data.roomId);

    // Broadcast to others in the room (not sender)
    client.to(`room_${roomId}`).emit('user_typing', {
      userId: client.user.sub,
      userName: client.user.name,
      isTyping: false,
    });

    return { success: true };
  }

  @SubscribeMessage('mark_as_read')
  async handleMarkAsRead(
    @MessageBody() data: JoinRoomDto,
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    try {
      if (!client.user) {
        return { success: false, message: 'Unauthorized' };
      }

      const roomId = parseInt(data.roomId);
      await this.chatService.markAsRead(roomId, client.user.sub);

      return { success: true };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  @SubscribeMessage('get_unread_count')
  async handleGetUnreadCount(@ConnectedSocket() client: AuthenticatedSocket) {
    try {
      if (!client.user) {
        return { success: false, message: 'Unauthorized' };
      }

      const count = await this.chatService.getUnreadCount(client.user.sub);

      return { success: true, count };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }
}
