'use client';

import { useState, useEffect } from 'react';
import { ChatWindow } from '@/components/chat/ChatWindow';
import { apiClient } from '@/lib/api/client';
import useAuthStore from '@/store/authStore';

interface Student {
  id: number;
  name: string;
  email: string;
  last_active?: Date;
}

interface ChatRoom {
  id: number;
  student?: Student;
  messages: any[];
  last_message_at: Date | null;
}

export default function TeacherChatPage() {
  const { user } = useAuthStore();
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<ChatRoom | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch chat rooms
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get('/chat/rooms');
        setRooms(response.data);

        // Auto-select first room
        if (response.data.length > 0 && !selectedRoom) {
          setSelectedRoom(response.data[0]);
        }
      } catch (err: any) {
        console.error('Failed to fetch chat rooms:', err);
        setError(err.response?.data?.message || 'Failed to load chat rooms');
      } finally {
        setLoading(false);
      }
    };

    if (user?.role === 'teacher' || user?.role === 'admin') {
      fetchRooms();
    }
  }, [user]);

  const formatLastActive = (date?: Date) => {
    if (!date) return 'Never';
    const now = new Date();
    const lastActive = new Date(date);
    const diffMs = now.getTime() - lastActive.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading chat rooms...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700">{error}</p>
        </div>
      </div>
    );
  }

  if (rooms.length === 0) {
    return (
      <div className="container mx-auto p-6">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="text-6xl mb-4">💬</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            No Students Yet
          </h2>
          <p className="text-gray-600">
            You don't have any students assigned yet. Add students to start chatting!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Chat with Students</h1>
        <p className="text-gray-600">
          Select a student to start chatting
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6" style={{ height: 'calc(100vh - 240px)' }}>
        {/* Student List Sidebar */}
        <div className="lg:col-span-1 bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-3">
            <h2 className="font-semibold">Students ({rooms.length})</h2>
          </div>

          <div className="overflow-y-auto" style={{ height: 'calc(100% - 56px)' }}>
            {rooms.map((room) => (
              <button
                key={room.id}
                onClick={() => setSelectedRoom(room)}
                className={`w-full px-4 py-4 border-b hover:bg-gray-50 transition-colors text-left ${
                  selectedRoom?.id === room.id ? 'bg-green-50 border-l-4 border-green-500' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                      {room.student?.name?.charAt(0).toUpperCase() || '?'}
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-gray-800 truncate">
                      {room.student?.name || 'Unknown Student'}
                    </div>
                    <div className="text-xs text-gray-500 truncate">
                      {room.student?.email || 'No email'}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      Last active: {formatLastActive(room.student?.last_active)}
                    </div>
                  </div>

                  {selectedRoom?.id === room.id && (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                      stroke="currentColor"
                      className="w-5 h-5 text-green-500"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M8.25 4.5l7.5 7.5-7.5 7.5"
                      />
                    </svg>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Chat Window */}
        <div className="lg:col-span-3">
          {selectedRoom ? (
            <ChatWindow
              roomId={selectedRoom.id}
              roomName={selectedRoom.student?.name || 'Unknown Student'}
            />
          ) : (
            <div className="h-full bg-white rounded-lg shadow-lg flex items-center justify-center">
              <div className="text-center">
                <div className="text-6xl mb-4">👈</div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  Select a student
                </h3>
                <p className="text-gray-500">
                  Choose a student from the list to start chatting
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
