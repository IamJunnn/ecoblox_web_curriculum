'use client';

import { useEffect } from 'react';
import { useChat } from '@/hooks/useChat';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';

interface ChatWindowProps {
  roomId: number;
  roomName: string;
  onlineStatus?: boolean;
}

export function ChatWindow({ roomId, roomName, onlineStatus }: ChatWindowProps) {
  const {
    messages,
    typingUsers,
    isJoined,
    isConnected,
    sendMessage,
    startTyping,
    stopTyping,
    markAsRead,
  } = useChat(roomId);

  // Mark messages as read when chat window is visible
  useEffect(() => {
    if (isJoined && messages.length > 0) {
      markAsRead();
    }
  }, [isJoined, messages.length, markAsRead]);

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Chat Header */}
      <div className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-green-600 font-bold">
              {roomName.charAt(0).toUpperCase()}
            </div>
            {onlineStatus !== undefined && (
              <div
                className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                  onlineStatus ? 'bg-green-400' : 'bg-gray-400'
                }`}
              ></div>
            )}
          </div>
          <div>
            <h2 className="font-semibold text-lg">{roomName}</h2>
            <p className="text-xs text-green-100">
              {!isConnected ? (
                'Connecting...'
              ) : !isJoined ? (
                'Joining chat...'
              ) : onlineStatus !== undefined ? (
                onlineStatus ? (
                  'Online'
                ) : (
                  'Offline'
                )
              ) : (
                'Active'
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isConnected ? (
            <div className="flex items-center gap-2 text-xs">
              <div className="w-2 h-2 bg-green-300 rounded-full animate-pulse"></div>
              <span>Connected</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-xs text-red-200">
              <div className="w-2 h-2 bg-red-300 rounded-full"></div>
              <span>Disconnected</span>
            </div>
          )}
        </div>
      </div>

      {/* Connection Status Warning */}
      {!isConnected && (
        <div className="bg-yellow-50 border-b border-yellow-200 px-4 py-2 text-sm text-yellow-800">
          <div className="flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-5 h-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
              />
            </svg>
            <span>
              Connection lost. Trying to reconnect...
            </span>
          </div>
        </div>
      )}

      {/* Messages Area */}
      <MessageList messages={messages} typingUsers={typingUsers} />

      {/* Message Input */}
      <MessageInput
        onSendMessage={sendMessage}
        onStartTyping={startTyping}
        onStopTyping={stopTyping}
        disabled={!isConnected || !isJoined}
      />
    </div>
  );
}
