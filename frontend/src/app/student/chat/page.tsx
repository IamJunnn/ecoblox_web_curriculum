'use client';

import { useState, useEffect } from 'react';
import { ChatWindow } from '@/components/chat/ChatWindow';
import apiClient from '@/lib/api/client';
import useAuthStore from '@/store/authStore';
import { Lightbulb, MessageCircle } from 'lucide-react';
import { ROLE_COLORS } from '@/lib/theme';

interface ChatRoom {
  id: number;
  teacher?: {
    id: number;
    name: string;
    email: string;
  };
  messages: any[];
}

export default function StudentChatPage() {
  const { user } = useAuthStore();
  const [room, setRoom] = useState<ChatRoom | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch student's chat room
  useEffect(() => {
    const fetchRoom = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get('/chat/rooms');

        if (response.data && response.data.length > 0) {
          setRoom(response.data[0]); // Students only have one room
        } else {
          setError('No chat room available. Please contact your teacher.');
        }
      } catch (err: any) {
        console.error('Failed to fetch chat room:', err);
        setError(err.response?.data?.message || 'Failed to load chat room');
      } finally {
        setLoading(false);
      }
    };

    if (user?.role === 'student') {
      fetchRoom();
    }
  }, [user]);

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading chat...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <MessageCircle className="w-16 h-16 mx-auto mb-4 text-yellow-500" />
          <h2 className="text-xl font-bold text-gray-800 mb-2">Chat Not Available</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="container mx-auto p-6">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <MessageCircle className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            No Chat Room Available
          </h2>
          <p className="text-gray-600">
            Your teacher hasn't set up a chat room yet. Please wait or contact your teacher.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col container mx-auto px-4 py-6">
      <div className="mb-4 flex-shrink-0">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Chat with Your Teacher
        </h1>
        <p className="text-gray-600">
          Ask questions and get help from your teacher
        </p>
      </div>

      <div className="flex-1 overflow-hidden min-h-0">
        <ChatWindow
          roomId={room.id}
          roomName={room.teacher?.name || 'Your Teacher'}
        />
      </div>
    </div>
  );
}
