'use client';

import { useEffect, useRef } from 'react';
import { MessageCircle } from 'lucide-react';
import { ChatMessage, TypingUser } from '@/hooks/useChat';
import useAuthStore from '@/store/authStore';
import { ROLE_COLORS } from '@/lib/theme';

interface MessageListProps {
  messages: ChatMessage[];
  typingUsers: TypingUser[];
}

export function MessageList({ messages, typingUsers }: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuthStore();

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typingUsers]);

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();

    if (isToday) {
      return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
      });
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      });
    }
  };

  const isMyMessage = (message: ChatMessage) => {
    return user?.id === message.sender_id;
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'teacher':
        return 'text-white';
      case 'admin':
        return 'bg-red-100 text-red-700';
      case 'student':
        return 'text-white';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getRoleBadgeStyle = (role: string) => {
    switch (role) {
      case 'teacher':
        return { backgroundColor: ROLE_COLORS.teacher.primary };
      case 'student':
        return { backgroundColor: ROLE_COLORS.student.primary };
      default:
        return {};
    }
  };

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center">
          <MessageCircle className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            No messages yet
          </h3>
          <p className="text-sm text-gray-500">
            Start the conversation by sending a message below
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto p-4 space-y-4">
      {messages.map((message) => {
        const isOwn = isMyMessage(message);
        const bgColor = isOwn
          ? user?.role === 'student'
            ? ROLE_COLORS.student.primary
            : ROLE_COLORS.teacher.primary
          : '#F3F4F6';

        return (
          <div
            key={message.id}
            className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[70%] min-w-0 ${
                isOwn
                  ? 'text-white rounded-l-2xl rounded-tr-2xl'
                  : 'text-gray-800 rounded-r-2xl rounded-tl-2xl'
              } p-3 shadow-sm`}
              style={{ backgroundColor: bgColor }}
            >
              {/* Sender info (only for received messages) */}
              {!isOwn && (
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-sm">
                    {message.sender_name}
                  </span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${getRoleBadgeColor(
                      message.sender_role
                    )}`}
                    style={getRoleBadgeStyle(message.sender_role)}
                  >
                    {message.sender_role}
                  </span>
                </div>
              )}

              {/* Message content */}
              <p className="text-sm whitespace-pre-wrap break-words" style={{ overflowWrap: 'anywhere' }}>
                {message.message}
              </p>

              {/* Timestamp */}
              <div
                className={`text-xs mt-1 ${
                  isOwn ? 'text-white opacity-80' : 'text-gray-500'
                }`}
              >
                {formatTimestamp(message.sent_at)}
              </div>
            </div>
          </div>
        );
      })}

      {/* Typing indicators */}
      {typingUsers.length > 0 && (
        <div className="flex justify-start">
          <div className="bg-gray-100 rounded-2xl p-3 shadow-sm">
            <div className="flex items-center gap-2">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                <span
                  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: '0.2s' }}
                ></span>
                <span
                  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: '0.4s' }}
                ></span>
              </div>
              <span className="text-xs text-gray-600">
                {typingUsers[0].userName} is typing...
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Auto-scroll anchor */}
      <div ref={messagesEndRef} />
    </div>
  );
}
