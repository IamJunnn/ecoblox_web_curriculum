import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  UseGuards,
  Request,
  ParseIntPipe,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ChatService } from './chat.service';

@Controller('chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(private chatService: ChatService) {}

  /**
   * Get all rooms for the current user
   * - Teachers get all their student rooms
   * - Students get their room with their teacher
   */
  @Get('rooms')
  async getRooms(@Request() req) {
    const user = req.user;

    if (user.role === 'teacher' || user.role === 'admin') {
      return this.chatService.getTeacherRooms(user.sub);
    } else if (user.role === 'student') {
      const room = await this.chatService.getStudentRoom(user.sub);
      return [room]; // Return as array for consistent frontend handling
    }

    return [];
  }

  /**
   * Get or create a direct room with a student (teachers only)
   */
  @Get('rooms/student/:studentId')
  async getOrCreateStudentRoom(
    @Request() req,
    @Param('studentId', ParseIntPipe) studentId: number,
  ) {
    const user = req.user;

    if (user.role !== 'teacher' && user.role !== 'admin') {
      throw new Error('Only teachers can access this endpoint');
    }

    return this.chatService.createOrGetDirectRoom(user.sub, studentId);
  }

  /**
   * Get message history for a room
   */
  @Get('rooms/:roomId/messages')
  async getMessages(
    @Request() req,
    @Param('roomId', ParseIntPipe) roomId: number,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    const user = req.user;
    const limitNum = limit ? parseInt(limit) : 50;
    const offsetNum = offset ? parseInt(offset) : 0;

    return this.chatService.getMessageHistory(roomId, user.sub, limitNum, offsetNum);
  }

  /**
   * Mark a room's messages as read
   */
  @Post('rooms/:roomId/read')
  async markAsRead(@Request() req, @Param('roomId', ParseIntPipe) roomId: number) {
    const user = req.user;
    return this.chatService.markAsRead(roomId, user.sub);
  }

  /**
   * Get total unread message count
   */
  @Get('unread-count')
  async getUnreadCount(@Request() req) {
    const user = req.user;
    const count = await this.chatService.getUnreadCount(user.sub);
    return { count };
  }

  /**
   * Get unread count for a specific room
   */
  @Get('rooms/:roomId/unread-count')
  async getRoomUnreadCount(
    @Request() req,
    @Param('roomId', ParseIntPipe) roomId: number,
  ) {
    const user = req.user;
    const count = await this.chatService.getRoomUnreadCount(roomId, user.sub);
    return { count };
  }

  /**
   * Get online status for a user
   */
  @Get('online-status/:userId')
  async getOnlineStatus(@Param('userId', ParseIntPipe) userId: number) {
    return this.chatService.getOnlineStatus(userId);
  }
}
