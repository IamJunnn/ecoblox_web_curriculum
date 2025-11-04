# Live Chat Implementation Guide

## Overview
Real-time chat system between teachers and their students using Socket.io

### Features
- ✅ Teacher can chat with all their students (group chat)
- ✅ Teacher can chat with individual students (direct message)
- ✅ Students can only chat with their teacher
- ✅ Real-time message delivery
- ✅ Online/offline status
- ✅ Typing indicators
- ✅ Unread message counts
- ✅ Message history
- ✅ Persistent storage in database

---

## Step 1: Install Socket.io

Run these commands:

```bash
cd backend
npm install socket.io @nestjs/platform-socket.io
npm install --save-dev @types/socket.io

cd ../frontend
npm install socket.io-client
```

---

## Step 2: Apply Database Migration

```bash
cd backend
npx prisma migrate dev --name add_chat_system
```

---

## Architecture

### Room Types
1. **teacher_class** - Group chat (Teacher + all their students)
2. **direct** - Direct message (Teacher + 1 student)

### Flow Example:
```
Teacher A has students: a, b, c

Rooms created:
- Room 1: teacher_class (Teacher A + students a,b,c)
- Room 2: direct (Teacher A + student a)
- Room 3: direct (Teacher A + student b)
- Room 4: direct (Teacher A + student c)
```

### Security Rules:
- Students can ONLY join rooms with their teacher
- Students CANNOT chat with other students
- Teachers can ONLY access their own students
- All messages are validated server-side

---

## Implementation Files

### Backend Files to Create:
1. `backend/src/chat/chat.gateway.ts` - Socket.io WebSocket gateway
2. `backend/src/chat/chat.service.ts` - Chat business logic
3. `backend/src/chat/chat.module.ts` - Chat module
4. `backend/src/chat/chat.controller.ts` - REST API for chat history
5. `backend/src/chat/dto/*.ts` - Data transfer objects

### Frontend Files to Create:
1. `frontend/src/hooks/useSocket.ts` - Socket.io hook
2. `frontend/src/components/chat/ChatWindow.tsx` - Main chat UI
3. `frontend/src/components/chat/MessageList.tsx` - Message display
4. `frontend/src/components/chat/MessageInput.tsx` - Send messages
5. `frontend/src/app/teacher/chat/page.tsx` - Teacher chat page
6. `frontend/src/app/student/chat/page.tsx` - Student chat page

---

## Socket Events

### Client → Server
- `join_room` - Join a chat room
- `send_message` - Send a message
- `typing_start` - User started typing
- `typing_stop` - User stopped typing
- `mark_as_read` - Mark messages as read

### Server → Client
- `message_received` - New message
- `user_online` - User came online
- `user_offline` - User went offline
- `user_typing` - Someone is typing
- `room_joined` - Successfully joined room
- `error` - Error occurred

---

## Usage Examples

### Teacher: View All Rooms
```typescript
// Shows:
// 1. Group Chat (All Students) - 3 students
// 2. Student A (Direct)
// 3. Student B (Direct)
// 4. Student C (Direct)
```

### Student: View Rooms
```typescript
// Shows only:
// 1. Chat with Teacher (can be group or direct)
```

---

## Next Steps After Files Are Created

1. Update `app.module.ts` to import ChatModule
2. Configure CORS for Socket.io
3. Add chat icon/button to teacher and student dashboards
4. Test with multiple browser windows

---

## Testing Plan

1. Open teacher dashboard in one browser
2. Open student A in another browser
3. Send messages both ways
4. Verify real-time delivery
5. Check database for message persistence
6. Test typing indicators
7. Test online/offline status

---

Would you like me to create all the implementation files now?
