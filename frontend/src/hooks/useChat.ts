'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useSocket } from './useSocket';

export interface ChatMessage {
  id: number;
  room_id: number;
  sender_id: number;
  sender_name: string;
  sender_role: string;
  message: string;
  message_type: string;
  sent_at: string;
  is_deleted: boolean;
}

export interface TypingUser {
  userId: number;
  userName: string;
  isTyping: boolean;
}

export interface OnlineStatus {
  userId: number;
  userName: string;
  isOnline: boolean;
}

export function useChat(roomId: number | null) {
  const { socket, isConnected } = useSocket();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<OnlineStatus[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isJoined, setIsJoined] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Join room when roomId changes
  useEffect(() => {
    if (!socket || !isConnected || !roomId) {
      setIsJoined(false);
      return;
    }

    console.log(`[Chat] Joining room ${roomId}`);

    socket.emit('join_room', { roomId: roomId.toString() }, (response: any) => {
      if (response.success) {
        console.log(`[Chat] Successfully joined room ${roomId}`);
        setMessages(response.messages || []);
        setUnreadCount(response.unreadCount || 0);
        setIsJoined(true);
      } else {
        console.error(`[Chat] Failed to join room:`, response.message);
        setIsJoined(false);
      }
    });

    // Leave room on cleanup
    return () => {
      console.log(`[Chat] Leaving room ${roomId}`);
      socket.emit('leave_room', { roomId: roomId.toString() });
      setIsJoined(false);
      setMessages([]);
      setTypingUsers([]);
    };
  }, [socket, isConnected, roomId]);

  // Listen for new messages
  useEffect(() => {
    if (!socket || !isJoined) return;

    const handleMessageReceived = (message: ChatMessage) => {
      console.log('[Chat] Message received:', message);
      setMessages((prev) => [...prev, message]);

      // Play notification sound
      playNotificationSound();
    };

    socket.on('message_received', handleMessageReceived);

    return () => {
      socket.off('message_received', handleMessageReceived);
    };
  }, [socket, isJoined]);

  // Listen for typing indicators
  useEffect(() => {
    if (!socket || !isJoined) return;

    const handleUserTyping = (data: TypingUser) => {
      console.log('[Chat] User typing:', data);

      if (data.isTyping) {
        setTypingUsers((prev) => {
          const exists = prev.find((u) => u.userId === data.userId);
          if (exists) return prev;
          return [...prev, data];
        });
      } else {
        setTypingUsers((prev) => prev.filter((u) => u.userId !== data.userId));
      }
    };

    socket.on('user_typing', handleUserTyping);

    return () => {
      socket.off('user_typing', handleUserTyping);
    };
  }, [socket, isJoined]);

  // Listen for online status changes
  useEffect(() => {
    if (!socket) return;

    const handleUserOnline = (data: OnlineStatus) => {
      console.log('[Chat] User online:', data);
      setOnlineUsers((prev) => {
        const filtered = prev.filter((u) => u.userId !== data.userId);
        return [...filtered, { ...data, isOnline: true }];
      });
    };

    const handleUserOffline = (data: OnlineStatus) => {
      console.log('[Chat] User offline:', data);
      setOnlineUsers((prev) => {
        const filtered = prev.filter((u) => u.userId !== data.userId);
        return [...filtered, { ...data, isOnline: false }];
      });
    };

    socket.on('user_online', handleUserOnline);
    socket.on('user_offline', handleUserOffline);

    return () => {
      socket.off('user_online', handleUserOnline);
      socket.off('user_offline', handleUserOffline);
    };
  }, [socket]);

  // Send message
  const sendMessage = useCallback(
    (message: string) => {
      if (!socket || !isJoined || !roomId || !message.trim()) return;

      console.log('[Chat] Sending message:', message);

      socket.emit(
        'send_message',
        {
          roomId: roomId.toString(),
          message: message.trim(),
          messageType: 'text',
        },
        (response: any) => {
          if (!response.success) {
            console.error('[Chat] Failed to send message:', response.message);
          }
        }
      );
    },
    [socket, isJoined, roomId]
  );

  // Start typing indicator
  const startTyping = useCallback(() => {
    if (!socket || !isJoined || !roomId) return;

    socket.emit('typing_start', { roomId: roomId.toString() });

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Auto-stop typing after 3 seconds
    typingTimeoutRef.current = setTimeout(() => {
      stopTyping();
    }, 3000);
  }, [socket, isJoined, roomId]);

  // Stop typing indicator
  const stopTyping = useCallback(() => {
    if (!socket || !isJoined || !roomId) return;

    socket.emit('typing_stop', { roomId: roomId.toString() });

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
  }, [socket, isJoined, roomId]);

  // Mark messages as read
  const markAsRead = useCallback(() => {
    if (!socket || !isJoined || !roomId) return;

    socket.emit('mark_as_read', { roomId: roomId.toString() }, (response: any) => {
      if (response.success) {
        setUnreadCount(0);
      }
    });
  }, [socket, isJoined, roomId]);

  // Get unread count
  const getUnreadCount = useCallback(() => {
    if (!socket || !isConnected) return;

    socket.emit('get_unread_count', {}, (response: any) => {
      if (response.success) {
        setUnreadCount(response.count);
      }
    });
  }, [socket, isConnected]);

  // Play notification sound
  const playNotificationSound = () => {
    try {
      const audio = new Audio('/notification.mp3');
      audio.volume = 0.3;
      audio.play().catch((err) => console.log('Audio play failed:', err));
    } catch (err) {
      console.log('Notification sound not available');
    }
  };

  return {
    messages,
    typingUsers,
    onlineUsers,
    unreadCount,
    isJoined,
    isConnected,
    sendMessage,
    startTyping,
    stopTyping,
    markAsRead,
    getUnreadCount,
  };
}
