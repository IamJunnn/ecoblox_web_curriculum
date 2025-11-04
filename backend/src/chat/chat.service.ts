import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ChatService {
  constructor(private prisma: PrismaService) {}

  /**
   * Create or get existing direct chat room between teacher and student
   */
  async createOrGetDirectRoom(teacherId: number, studentId: number) {
    // First check if student belongs to this teacher
    const student = await this.prisma.user.findUnique({
      where: { id: studentId },
    });

    if (!student || student.created_by_teacher_id !== teacherId) {
      throw new ForbiddenException('This student does not belong to you');
    }

    // Try to find existing room
    let room = await this.prisma.chatRoom.findUnique({
      where: {
        teacher_id_student_id: {
          teacher_id: teacherId,
          student_id: studentId,
        },
      },
      include: {
        participants: true,
        messages: {
          orderBy: { sent_at: 'desc' },
          take: 50,
        },
      },
    });

    // If no room exists, create one
    if (!room) {
      room = await this.prisma.chatRoom.create({
        data: {
          room_type: 'direct',
          teacher_id: teacherId,
          student_id: studentId,
          is_active: true,
        },
        include: {
          participants: true,
          messages: true,
        },
      });

      // Add both teacher and student as participants
      await this.prisma.chatParticipant.createMany({
        data: [
          { room_id: room.id, user_id: teacherId },
          { room_id: room.id, user_id: studentId },
        ],
      });
    }

    return room;
  }

  /**
   * Get a student's direct room with their teacher
   */
  async getStudentRoom(studentId: number) {
    const student = await this.prisma.user.findUnique({
      where: { id: studentId },
    });

    if (!student || !student.created_by_teacher_id) {
      throw new NotFoundException('Student has no assigned teacher');
    }

    return this.createOrGetDirectRoom(student.created_by_teacher_id, studentId);
  }

  /**
   * Get all rooms for a teacher (all students)
   */
  async getTeacherRooms(teacherId: number) {
    const rooms = await this.prisma.chatRoom.findMany({
      where: {
        teacher_id: teacherId,
        room_type: 'direct',
      },
      include: {
        participants: {
          include: {
            room: {
              include: {
                messages: {
                  orderBy: { sent_at: 'desc' },
                  take: 1,
                },
              },
            },
          },
        },
        messages: {
          orderBy: { sent_at: 'desc' },
          take: 1,
        },
      },
      orderBy: {
        last_message_at: 'desc',
      },
    });

    // Get student info for each room
    const roomsWithStudents = await Promise.all(
      rooms.map(async (room) => {
        if (!room.student_id) {
          return { ...room, student: null };
        }

        const student = await this.prisma.user.findUnique({
          where: { id: room.student_id },
          select: {
            id: true,
            name: true,
            email: true,
            last_active: true,
          },
        });

        return {
          ...room,
          student,
        };
      }),
    );

    return roomsWithStudents;
  }

  /**
   * Save a new message to the database
   */
  async saveMessage(
    roomId: number,
    senderId: number,
    message: string,
    messageType: string = 'text',
  ) {
    // Get sender info
    const sender = await this.prisma.user.findUnique({
      where: { id: senderId },
    });

    if (!sender) {
      throw new NotFoundException('Sender not found');
    }

    // Verify user is participant in room
    const participant = await this.prisma.chatParticipant.findUnique({
      where: {
        room_id_user_id: {
          room_id: roomId,
          user_id: senderId,
        },
      },
    });

    if (!participant) {
      throw new ForbiddenException('You are not a participant in this room');
    }

    // Create message
    const chatMessage = await this.prisma.chatMessage.create({
      data: {
        room_id: roomId,
        sender_id: senderId,
        sender_name: sender.name,
        sender_role: sender.role,
        message,
        message_type: messageType,
      },
    });

    // Update room's last_message_at
    await this.prisma.chatRoom.update({
      where: { id: roomId },
      data: { last_message_at: new Date() },
    });

    return chatMessage;
  }

  /**
   * Get message history for a room
   */
  async getMessageHistory(roomId: number, userId: number, limit = 50, offset = 0) {
    // Verify user is participant
    const participant = await this.prisma.chatParticipant.findUnique({
      where: {
        room_id_user_id: {
          room_id: roomId,
          user_id: userId,
        },
      },
    });

    if (!participant) {
      throw new ForbiddenException('You are not a participant in this room');
    }

    const messages = await this.prisma.chatMessage.findMany({
      where: {
        room_id: roomId,
        is_deleted: false,
      },
      orderBy: { sent_at: 'desc' },
      take: limit,
      skip: offset,
    });

    return messages.reverse(); // Return in chronological order
  }

  /**
   * Mark messages as read for a user in a room
   */
  async markAsRead(roomId: number, userId: number) {
    await this.prisma.chatParticipant.update({
      where: {
        room_id_user_id: {
          room_id: roomId,
          user_id: userId,
        },
      },
      data: {
        last_read_at: new Date(),
      },
    });

    return { success: true };
  }

  /**
   * Get unread message count for a user across all rooms
   */
  async getUnreadCount(userId: number) {
    const participations = await this.prisma.chatParticipant.findMany({
      where: { user_id: userId },
      include: {
        room: {
          include: {
            messages: {
              where: {
                sender_id: { not: userId },
              },
              orderBy: { sent_at: 'desc' },
              take: 1,
            },
          },
        },
      },
    });

    let totalUnread = 0;

    for (const participation of participations) {
      const unreadCount = await this.prisma.chatMessage.count({
        where: {
          room_id: participation.room_id,
          sender_id: { not: userId },
          sent_at: { gt: participation.last_read_at },
          is_deleted: false,
        },
      });
      totalUnread += unreadCount;
    }

    return totalUnread;
  }

  /**
   * Get unread count for a specific room
   */
  async getRoomUnreadCount(roomId: number, userId: number) {
    const participant = await this.prisma.chatParticipant.findUnique({
      where: {
        room_id_user_id: {
          room_id: roomId,
          user_id: userId,
        },
      },
    });

    if (!participant) {
      return 0;
    }

    return this.prisma.chatMessage.count({
      where: {
        room_id: roomId,
        sender_id: { not: userId },
        sent_at: { gt: participant.last_read_at },
        is_deleted: false,
      },
    });
  }

  /**
   * Update online status for a user
   */
  async updateOnlineStatus(userId: number, isOnline: boolean, socketId?: string) {
    await this.prisma.onlineStatus.upsert({
      where: { user_id: userId },
      update: {
        is_online: isOnline,
        last_seen: new Date(),
        socket_id: socketId,
      },
      create: {
        user_id: userId,
        is_online: isOnline,
        socket_id: socketId,
      },
    });
  }

  /**
   * Get online status for a user
   */
  async getOnlineStatus(userId: number) {
    return this.prisma.onlineStatus.findUnique({
      where: { user_id: userId },
    });
  }

  /**
   * Verify if user can access a room
   */
  async canAccessRoom(roomId: number, userId: number): Promise<boolean> {
    const participant = await this.prisma.chatParticipant.findUnique({
      where: {
        room_id_user_id: {
          room_id: roomId,
          user_id: userId,
        },
      },
    });

    return !!participant;
  }
}
